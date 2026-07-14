# Pruning and Archival Design

## Keeping the Chain Manageable and Sustainable as DIDzMonolith Scales

**Status**: Design proposal
**Author**: John M.P. Santi, EnterpriseZK Labs LLC
**Date**: July 13, 2026
**Scope**: HelixCTW data plane, Midnight on-chain state, DIDzMonolith ecosystem

---

## 1. The Problem

Every blockchain faces the same arithmetic: state grows monotonically, node
resources do not. DIDzMonolith makes this sharper than most because the
ecosystem is designed to scale to millions of identities, assets, and
attestations across 30+ products. Consider the trajectory:

- **DIDzRegistry**: Every identity ever minted stays in the `dids` Set forever.
  The contract explicitly says "NOTHING is ever removed from this set." Status
  changes (deceased, dissolved, destroyed) are tombstones on permanent records,
  not deletions. The `attestation_commitment` Map retains every attestation slot,
  including revoked and expired ones, as an audit trail.
- **RWAz**: Every object ever registered stays in `registered_objects` forever.
  Retired objects move to `retired_objects` but the identity, provenance head,
  and transfer count remain readable.
- **HelixCTW CockroachDB**: The hot index accumulates ownership histories,
  compliance records, document indices, agent memory, and vector embeddings for
  every entity and asset that ever existed. At scale, this is the real volume
  problem. A single complex RWA with 50 years of transfer history, 200
  compliance checks, and 30 attached documents could carry megabytes of
  metadata across multiple tables.
- **Filecoin**: Cold storage grows too, but Filecoin is designed for this. The
  economic model (storage deals, PoRep/PoSt) handles petabyte-scale growth
  natively. Filecoin is not the bottleneck.

The bottleneck is twofold: **on-chain state bloat** on Midnight (affecting node
operators, sync times, proof generation costs) and **hot index bloat** in
CockroachDB (affecting query performance, storage costs, and operational
complexity).

---

## 2. What Midnight Allows Us to Prune Directly

### 2.1 The Hard Constraint

Midnight is a blockchain. Its core guarantee is immutability. Compact's ledger
types (`Set`, `Map`, `Counter`) are persistent state that survives across
transactions. The language provides `.insert()` and `.remove()` operations on
Sets and Maps, but the architectural philosophy of DIDzMonolith, encoded in
DIDzRegistry rule 2, is that **identity is permanent and deletion is never the
right answer for an audit-critical registry**.

However, there is a distinction between:

- **Contract-level state** (our DIDzRegistry, RWAz, etc.) which we control and
  choose to keep permanent
- **Protocol-level state** (nullifier sets, spent commitments, transaction
  proofs) which Midnight's protocol could theoretically prune at the node level

### 2.2 Protocol-Level Pruning (Future, Not Our Decision)

Midnight uses a UTXO-based model with shielded and unshielded state. Like all
ZK chains, it maintains nullifier sets to prevent double-spends. These
nullifier sets grow forever. Protocol-level pruning of ancient nullifiers
(after all referencing commitments are provably spent and past any dispute
window) is a known research direction in ZK blockchain design, but it is the
Midnight Foundation's decision, not ours.

**What we can do**: Advocate for it. If Midnight ever implements epoch-based
nullifier pruning (similar to how some ZK chains garbage-collect nullifiers
older than N epochs), DIDzMonolith benefits automatically. This document
focuses on what we control.

### 2.3 Contract-Level State We Could Theoretically Remove

Compact provides `.remove()` on Sets and Maps. We *could* remove expired
attestation slots, revoked grant records, or retired object entries from our
contracts. We choose not to, for three reasons:

1. **Audit integrity**: Removing on-chain state breaks the ability to verify
   historical claims. "This DIDz carried this attestation at this time" must
   be provable forever for compliance (SOC 2, HIPAA, MiCA all require it).
2. **The DIDz philosophy**: Identity is permanent. Death is a status, not a
   deletion. This is a design principle, not a technical limitation.
3. **Provenance continuity**: RWAz provenance chains are rolling hash heads.
   Removing intermediate state would break the chain of custody verification.

**Conclusion**: We do not prune Midnight on-chain state at the contract level.
The chain is the permanent record. We prune the *information layer* instead.

---

## 3. The HelixCTW Effective Pruning Strategy

### 3.1 The Core Insight

If we cannot prune the blockchain, we can prune the *information* that makes
the blockchain useful. HelixCTW already enforces the **Reconstructibility
Rule**: CockroachDB is a cache of truth, not the truth. Every row is derivable
from Midnight on-chain state plus Filecoin CIDs. This means CockroachDB rows
are *redundant by construction*. They exist for query speed, not for truth.

**Effective pruning** means: move dead data from the hot cache to cold storage,
replace it with a minimal pointer, and keep the on-chain commitment as the
permanent anchor that proves the archive is authentic.

### 3.2 What Qualifies as "Dead"

An entity or artifact is eligible for archival pruning when it reaches a
**terminal or inactive state** and has passed a **retention window** (configurable
per data class, with compliance-mandated minimums):

| Data Class | Terminal Trigger | Retention Window | Rationale |
|---|---|---|---|
| DIDz, human | Status 2 (deceased) | 7 years (estate settlement, tax law) | IRS, probate, estate disputes |
| DIDz, organization | Status 3 (dissolved) | 7 years (corporate dissolution) | Regulatory wind-down |
| DIDz, object | Status 4 (destroyed) | 3 years (insurance claims) | Claim filing windows |
| RWAz object | `retire_object` called | 3 years (salvage, insurance) | Same |
| Attestation | Expired (epoch > expiry) | 1 year (re-issuance gap) | Grace period for renewal |
| Attestation | Revoked | 2 years (dispute window) | Legal challenge window |
| AgenticDID grant | Expired or revoked | 1 year (audit cycle) | SOC 2 audit trail |
| Agent memory | Session ended + 90 days | 90 days (operational) | Debugging, dispute resolution |
| Compliance record | Associated entity terminal | Matches entity window | Co-pruned with entity |

**Nothing is pruned before its retention window expires.** The retention
window is the compliance-mandated minimum time the data must remain
immediately accessible in the hot index. After the window, the data is
archived.

### 3.3 The Archival Process

When a data class passes its retention window in a terminal state, the
HelixCTW Gateway executes the following archival circuit:

```
ARCHIVAL PROCESS (per entity or artifact)

1. COLLECT
   Gather all CockroachDB rows associated with this entity:
     - ownership_history rows
     - compliance_records rows
     - document_index rows
     - credentials rows
     - agent_memory rows
     - vector embeddings
     - any product-specific extension tables

2. BUNDLE
   Serialize the rows into a single archive bundle (JSON, Parquet, or
   CBOR, TBD based on size). Include:
     - All row data
     - The Midnight block reference at archival time
     - The entity's on-chain commitment (for cross-verification)
     - The provenance head (for RWAz objects)
     - A manifest listing every table and row count

3. ENCRYPT
   Client-side encrypt the bundle with AES-256-GCM using a key derived
   from the entity's DIDz secret (for self-retrieval) or a designated
   archival authority key (for compliance retrieval).

4. COMMIT
   Compute: archive_commitment = H("helix:archive:v1", entity_id,
     H(encrypted_bundle), archival_timestamp)
   This commitment is the cryptographic fingerprint of the archive.

5. STORE
   Upload the encrypted bundle to Filecoin via a storage deal.
   Record the Filecoin CID.

6. TOMBSTONE
   In CockroachDB, replace all detailed rows for this entity with a single
   tombstone row in a new `archival_tombstones` table:

     entity_id          BYTES       -- the DIDz id or RWAz object_id
     entity_type        STRING      -- 'didz_human', 'rwaz_object', etc.
     terminal_status    UINT        -- 2/3/4 for DIDz, 'retired' for RWAz
     archive_commitment BYTES       -- H(archive bundle) for verification
     filecoin_cid       STRING      -- durable retrieval pointer
     archived_at        TIMESTAMPTZ -- when the archival happened
     archived_by        STRING      -- gateway session / admin key
     retention_until    TIMESTAMPTZ -- when even the tombstone can be
                                      -- removed (optional, see §6)

7. DROP
   Delete the original detailed rows from CockroachDB hot tables.
   The tombstone is now the only hot-layer evidence that this entity
   ever existed, plus whatever Midnight holds on-chain (which is
   permanent and minimal).

8. ANCHOR (optional, for maximum verifiability)
   Submit the archive_commitment to Midnight as an attestation on the
   entity's DIDz or RWAz record:
     attest_to_did(did_id, "archive:v1", archive_commitment, far_future)
   This creates an on-chain proof that the archive exists and what its
   hash is, without revealing the archive contents.
```

### 3.4 The Tombstone Table

```sql
CREATE TABLE IF NOT EXISTS archival_tombstones (
  entity_id          BYTES PRIMARY KEY,    -- DIDz id or RWAz object_id
  entity_type        STRING NOT NULL,       -- 'didz_human', 'rwaz_object', ...
  terminal_status    INT4 NOT NULL,         -- 2=deceased, 3=dissolved, 4=destroyed, 5=retired
  archive_commitment BYTES NOT NULL,        -- H(archive bundle), verifiable against Filecoin
  filecoin_cid       STRING NOT NULL,       -- durable retrieval pointer
  encryption_key_ref STRING,                -- reference to key holder (DIDz commitment or authority)
  archived_at        TIMESTAMPTZ NOT DEFAULT now(),
  archived_by        STRING NOT NULL,       -- gateway session id / admin key commitment
  retention_until    TIMESTAMPTZ,           -- when even the tombstone may expire (optional)
  reinstated         BOOL NOT DEFAULT false, -- set true if data was restored to hot layer
  reinstated_at      TIMESTAMPTZ            -- when reinstatement happened, if any
);

CREATE INDEX IF NOT EXISTS idx_tombstone_type
  ON archival_tombstones (entity_type, terminal_status);
CREATE INDEX IF NOT EXISTS idx_tombstone_archived
  ON archival_tombstones (archived_at);
```

A tombstone row is approximately 200 bytes. The detailed rows it replaces
could be megabytes. This is the compression ratio: **megabytes to 200 bytes**,
with zero loss of verifiability.

---

## 4. Reinstatement (Research and Recovery)

### 4.1 When Reinstatement Is Needed

- **Legal discovery**: A court orders production of records for a deceased
  person's estate, 10 years after death.
- **Audit**: SOC 2 or HIPAA auditor needs to verify a compliance check that
  was run on a now-dissolved organization.
- **Insurance claim**: A destroyed object's salvage records are needed for a
  late-filed claim.
- **Historical research**: A genealogist or journalist needs provenance for a
  historical asset.
- **Reactivation edge case**: A suspended DIDz (status 1) that was incorrectly
  marked terminal, needs full data restored to support an appeal.

### 4.2 The Reinstatement Process

```
REINSTATEMENT PROCESS

1. LOCATE
   Query archival_tombstones by entity_id. Get the Filecoin CID and
   archive_commitment.

2. AUTHORIZE
   Check DIDzM authority: does the caller have the right to reinstate?
   - The entity's original owner (if still alive/active)
   - A registered status authority (court order, vital records)
   - A registry admin (dispute resolution)
   - A compliance auditor (read-only reinstatement, no write-back)

3. FETCH
   Retrieve the encrypted bundle from Filecoin using the CID.
   Filecoin retrieval markets serve this; latency is seconds to minutes
   depending on the storage deal's hot-cache tier.

4. VERIFY (three-way check)
   a. Compute H(encrypted_bundle). Compare to archive_commitment in the
      tombstone. Must match.
   b. Verify archive_commitment against the on-chain Midnight attestation
      (if §3.3 step 8 was performed). Must match.
   c. Verify the entity_id in the bundle matches the entity_id in the
      tombstone and the on-chain registry. Must match.

   If all three match: the archive is authentic, unmodified, and belongs
   to the right entity. If any fail: data integrity breach, halt and
   investigate.

5. DECRYPT
   Decrypt the bundle using the key referenced by encryption_key_ref.
   For self-retrieval: the entity's DIDz secret (via ZK proof of control).
   For authority retrieval: the designated archival authority key.
   For audit: a time-limited decryption grant via AgenticDID scoped grant.

6. RECONSTRUCT
   Parse the bundle manifest. Re-insert the rows into CockroachDB hot
   tables. The data is now queryable again.

7. MARK
   Set reinstated=true and reinstated_at=now() in the tombstone.
   Optionally: if the reinstatement is permanent (not just a read-only
   audit), remove the tombstone and keep the detailed rows.
```

### 4.3 Read-Only vs. Full Reinstatement

Not every reinstatement needs to write data back to the hot index:

- **Read-only reinstatement** (audits, legal discovery, research): The bundle
  is fetched, verified, decrypted, and the data is presented to the authorized
  caller. It is NOT written back to CockroachDB. The tombstone stays. This is
  the equivalent of pulling a file from a filing cabinet, reading it, and
  putting it back.

- **Full reinstatement** (appeals, error correction, reactivation): The data
  is written back to CockroachDB hot tables. The tombstone is either removed
  (data is live again) or updated to reflect the reinstatement. This is the
  equivalent of un-archiving a record and returning it to active duty.

---

## 5. The Commitment Hash as the Universal Anchor

The archive_commitment is the linchpin of the entire design. It serves three
roles simultaneously:

### 5.1 On Midnight (Permanent Truth)

The original entity registration commitment is already on-chain and permanent.
If we perform §3.3 step 8 (the optional on-chain anchoring), the
archive_commitment is also on-chain as an attestation. This means:

- The chain proves the entity existed (registration commitment, permanent)
- The chain proves the entity reached a terminal state (status change, permanent)
- The chain proves an archive was created (archive attestation, permanent)

Three on-chain facts, each a few bytes, that together guarantee: **this entity
lived, it died, and its records are stored here and have this hash.**

### 5.2 In CockroachDB (Hot Pointer)

The tombstone row stores the archive_commitment alongside the Filecoin CID.
This is the queryable pointer. A search for "what happened to DIDz X?" hits
the tombstone, sees the terminal status, sees the archive commitment, and
knows exactly where to look and what hash to expect.

### 5.3 In Filecoin (Cold Reality)

The encrypted bundle on Filecoin, when fetched and decrypted, must produce a
hash that matches the archive_commitment. Filecoin's PoRep and PoSt guarantee
the bytes persist. The commitment guarantees they are the right bytes.

### 5.4 The Verification Chain

```
Midnight on-chain commitment (permanent, immutable)
        |
        | matches
        v
CockroachDB tombstone archive_commitment (hot, queryable)
        |
        | matches
        v
Filecoin encrypted bundle H(bundle) (cold, durable)
        |
        | decrypts to
        v
Original detailed data (reconstructed on demand)
```

No link in this chain can be broken without detection. This is the same
pattern HelixCTW already uses for live data (the reconstructibility rule),
extended to archived data.

---

## 6. Tombstone Expiry (Optional Second-Stage Pruning)

Tombstones are tiny (200 bytes each), but at extreme scale (billions of
entities over decades), even tombstones accumulate. The `retention_until`
field allows a second stage of pruning:

- **Stage 1**: Detailed rows archived to Filecoin, tombstone replaces them
  in CockroachDB. (The primary mechanism described above.)
- **Stage 2**: After the tombstone's own retention period expires (e.g., 50
  years for a deceased human, 25 years for a dissolved org), the tombstone
  itself is removed from CockroachDB.

After Stage 2, the only remaining evidence is:
- The Midnight on-chain state (registration, status, archive attestation)
- The Filecoin bundle (durable, content-addressed)

The on-chain commitment is the permanent anchor. Someone who knows the
entity_id can still find the Filecoin CID by checking the on-chain archive
attestation, fetch the bundle, verify it, and reconstruct. The tombstone was
a convenience, not a necessity. **The chain outlives the cache.**

This second stage is optional and should only be enabled when CockroachDB
storage pressure genuinely warrants it. For most deployments, Stage 1 is
sufficient.

---

## 7. What NEVER Gets Pruned

These items are permanent by design and are never candidates for archival
pruning at any stage:

| Item | Where It Lives | Why It Stays |
|---|---|---|
| DIDz identity (the id itself) | Midnight `dids` Set | Permanent identity, rule 2 |
| DIDz lifecycle status | Midnight `did_status` Map | Public fact, verifiers need it |
| RWAz object identity | Midnight `registered_objects` Set | Permanent, like a VIN |
| RWAz retired flag | Midnight `retired_objects` Set | Terminal status, permanent |
| RWAz provenance head | Midnight `provenance_head` Map | Chain of custody, permanent |
| Archive attestation | Midnight `attestation_commitment` Map | Proves archive exists |
| Archive commitment | Midnight (if §3.3 step 8) | Proves archive hash |
| Tombstone row | CockroachDB `archival_tombstones` | Pointer to archive (until Stage 2) |
| Filecoin archive bundle | Filecoin | Durable cold storage, PoRep/PoSt |

The pattern: **Midnight holds the permanent facts. Filecoin holds the
permanent bytes. CockroachDB holds the temporary convenience.** Everything
in CockroachDB is reconstructible from the other two layers.

---

## 8. Interaction with Compliance Frameworks

### 8.1 Retention Windows Are Compliance-Driven

The retention windows in section 3.2 are not arbitrary. They are driven by
the five compliance frameworks mapped in the DIDzMonolith Regulatory
Compliance Deep Dive:

- **HIPAA**: Requires 6 years of audit logs. safeHealthData records for
  deceased patients must remain accessible for the standard medical record
  retention period (varies by state, typically 7-10 years post-death).
- **SOC 2**: Requires demonstrating historical controls. Compliance records
  for dissolved organizations should survive at least one full audit cycle
  (typically 1 year) after dissolution.
- **MiCA**: Transaction records for CASP operations must be retained 5 years
  after cessation of activity. RWAz and CareToCoin records fall here.
- **PCI DSS**: If any pruned entity processed cardholder data, the
  tokenization records must survive per PCI Req 10 (1 year online, 3.5 years
  archived).
- **ISO 27001**: Annex A.5.34 requires data retention and disposal
  procedures. This pruning design IS that procedure, formalized.

### 8.2 Pruning Is Not Destruction

A critical compliance distinction: **archival pruning is not data
destruction.** The data is moved from hot storage to cold storage with a
verifiable commitment hash. It remains retrievable, verifiable, and
auditable. This satisfies compliance requirements for "retention" even when
the data is no longer in the hot query index.

True data destruction (which some privacy regulations grant as a "right to
erasure") would require: removing the on-chain commitment (impossible on
Midnight without protocol changes), destroying the Filecoin bundle (requires
intentional deal cancellation), and removing the tombstone. This is a
separate process, governed by a separate policy, and is outside the scope of
this document. The DIDz philosophy is that identity is permanent, so true
erasure is only for non-identity data (agent memory, conversation logs,
embeddings), never for the identity record itself.

---

## 9. Implementation Phasing

### Phase 1: Tombstone Infrastructure (HelixCTW v2.1)

- Add `archival_tombstones` table to CockroachDB schema
- Implement the COLLECT and BUNDLE steps in the HelixCTW Gateway
- Implement TOMBSTONE creation and row dropping
- Filecoin storage deals for archive bundles (reuse existing Filecoin
  integration)
- No automatic triggering; archival is a manual admin operation

### Phase 2: Automated Archival (HelixCTW v2.2)

- Watch Midnight on-chain status changes (terminal statuses trigger archival
  countdown)
- Retention window timers (CockroachDB scheduled jobs)
- Automatic archival when windows expire
- Optional on-chain archive attestation (§3.3 step 8)

### Phase 3: Reinstatement API (HelixCTW v2.3)

- Gateway endpoint: `POST /archive/reinstate` with DIDzM authorization
- Three-way verification (tombstone, on-chain, Filecoin)
- Read-only reinstatement for audits
- Full reinstatement for appeals/reactivation
- Audit log of every reinstatement (who, what, when, why)

### Phase 4: Tombstone Expiry (HelixCTW v3.0)

- Stage 2 pruning (tombstone removal after extended retention)
- On-chain-only retrieval path (find CID from Midnight attestation, skip
  tombstone)
- Garbage collection of orphaned Filecoin deals (bundles whose tombstones
  are expired AND whose on-chain attestations are past any possible
  retrieval need)

---

## 10. Open Questions

1. **Midnight protocol pruning**: Has the Midnight Foundation discussed
   nullifier set pruning or state expiry at the protocol level? If so, what
   is the timeline? This would complement our application-level pruning.

2. **Filecoin deal longevity**: Standard Filecoin storage deals have finite
   durations. For archives that must survive decades, we need either
   renewable deals (FVM-automated) or a Filecoin permanent storage
   mechanism. What is the recommended pattern for multi-decade Filecoin
   persistence?

3. **Encryption key escrow**: If a deceased person's DIDz secret is lost
   (the whole point of death), who holds the key to decrypt their archive?
   Options: (a) a designated archival authority, (b) social recovery
   (midnight-modules/recovery-core m-of-n), (c) a key escrow service, (d)
   the archive is encrypted to a court/auditor key instead. This needs a
   policy decision.

4. **Cross-entity archival**: If a DIDz is archived, should all RWAz objects
   they owned also be archived? Or should objects remain live (they may have
   been transferred to a new owner before the DIDz died)? The answer is
   probably "objects are independent, they have their own lifecycle," but
   this needs explicit handling in the archival process.

5. **Selective archival**: Can we archive some data classes for an entity
   but not others? For example, archive agent memory and conversation logs
   (operational, short retention) but keep compliance records hot (longer
   retention). This is likely the right approach but adds complexity to the
   tombstone schema (multiple tombstones per entity, one per data class).

6. **Midnight on-chain anchoring cost**: Is the optional step 8 (submitting
   the archive_commitment as an on-chain attestation) worth the DUST cost?
   For high-value entities (large organizations, significant RWAs), probably
   yes. For every individual DIDz, probably not. This suggests a tiered
   approach: on-chain anchoring for high-value, tombstone-only for standard.

---

## 11. Summary

```
THE PRUNING EQUATION

  Hot data (CockroachDB)     -- megabytes per entity, queryable, expensive
        |
        | archival pruning (terminal + retention window)
        v
  Tombstone (CockroachDB)    -- 200 bytes per entity, queryable, cheap
  + Archive (Filecoin)       -- megabytes per entity, durable, cold
  + Commitment (Midnight)    -- 32 bytes per entity, permanent, immutable

  Reinstatement: tombstone -> Filecoin -> verify -> CockroachDB
  Research:      tombstone -> Filecoin -> verify -> read (no write-back)
  Audit trail:   Midnight commitment -> tombstone -> Filecoin -> truth
```

The chain is the anchor. The tombstone is the pointer. Filecoin is the vault.
CockroachDB is the cache. When the cache gets too full, we move dead data to
the vault and leave a pointer. The anchor never moves. The data is never
lost. The system stays manageable.

This is effective pruning: not deleting truth, but relocating convenience.

---

*Part of the DIDzMonolith ecosystem. HelixCTW is the data plane. Midnight is
the trust plane. This document lives at `HelixCTW/docs/PRUNING_AND_ARCHIVAL_DESIGN.md`.*
