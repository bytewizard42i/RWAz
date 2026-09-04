# RWAz vs the Regulated Token Standards (ERC-3643 / CIP-0113)

> **Source**: Blockenfy / Cardano Ambassadors / UZH, *"CIP-0113 vs ERC-3643 — A
> Technical, Commercial, and Regulatory Analysis"* (Aug 2026). Full aggregation and
> the DIDzM-wide implications live in
> [`DIDzMonolith-docs/compliance/RWA_CIP-0113_vs_ERC-3643_DIDZM_IMPLICATIONS.md`](../../DIDzMonolith-docs/compliance/RWA_CIP-0113_vs_ERC-3643_DIDZM_IMPLICATIONS.md).
> This document is the **RWAz engine view**: what the two incumbent regulated-token
> standards do, what regulators demonstrably require of a registry, and where
> `rwa_registry.compact` / `rwa_credentials.compact` stand today.
>
> **Evidence label**: `rwa_registry` is TestWired on Midnight localnet
> (`BUILD_STAGES.md`). Everything under "Proposed" below is design only. Validate
> any Compact sketch with midnight-expert / Kapa `skipZk` before saving it as code.
> RWAz does **not** implement CIP-0113 or ERC-3643 and this document does not claim
> compatibility with either.

---

## 1. Why RWAz should care

RWAz's stated regulatory surface is "securities-style rules for tokenized RWAs"
(README) and ROADMAP Phase 5 is "Regulatory profiles". Until now that was a placeholder.
The paper supplies, from production experience under Spain's CNMV and Argentina's CNV,
the **actual list of functions a regulator expects a tokenized-security registry to
have**, and the one function that decided real adoption (regulator co-signature). RWAz
is a registry. We can score ourselves.

The paper also, without meaning to, describes our differentiator: it never mentions
privacy or zero-knowledge. Both standards publish holder identities (ERC-3643 Identity
Registry), freezes, denylists and seizures as public ledger facts. RWAz already keeps
owners as key commitments and proves ownership in ZK (`assert_i_own`).

---

## 2. The two standards in one table (registry-relevant parts only)

| Concern | ERC-3643 (T-REX) | CIP-0113 (Cardano) | RWAz today |
|---|---|---|---|
| Asset identity | The token contract address | Token policy id registered in the on-chain Registry | `registered_objects` — permanent object id (the "VIN") |
| Holder identity | wallet → ONCHAINID in Identity Registry (public) | unique stake credential per holder (public) | `current_owner` key commitment `H("midnight:mm:pk:", sk)` — pseudonymous |
| Who may transfer | Compliance Contract modules decide, per transfer | Sub-standard (stake validator) decides, once per tx via Withdraw Zero | current owner only, blocked if lien active |
| KYC gate on recipient | IR: recipient must have required claims from Trusted Issuers | KYC Token / KYC Token Extended (MPF allowlist) sub-standards | **none** — any key commitment can receive |
| AML denylist | CountryRestrictList + IR | freeze-and-seize / Security Token BaFin denylists | **none** |
| Freeze holder | Agent-role `freeze` | freeze-and-seize sub-standard | **none** (lien blocks transfer but is owner-granted, not authority-imposed) |
| Seize / forced transfer | `forcedTransfer` | Issuer Control Script | **none** — only the owner can move title |
| Recovery (lost wallet) | `recoveryAddress` to a new verified wallet | Issuer Control Script | **none** in contract; README defers to DIDz governed recovery |
| Global pause | `pause` / `unpause` | Issuer Control Script (not packaged) | **none** |
| Jurisdiction rules | CountryAllowList / CountryRestrictList | feasible, no audited module | **none** |
| Supply / balance caps | SupplyLimit, MaxBalance modules | custom sub-standard | n/a (v1 is whole-object title; fractional shares are Phase 3) |
| Lock-ups | TimeTransfersLimits | custom sub-standard | **none** |
| Regulator co-signature | EIP-712 extension (Blockenfy, production, Spain) | **none** | **none** — but see §4, this is our receipt model |
| Provenance / audit | Event logs | Ledger history | `provenance_head` rolling hash + `transfer_count` — verifiable without publishing owners |
| Encumbrance (lien) | not native (would be a module) | not native | `active_encumbrance_holder`, lienholder-only release — **RWAz is ahead here** |
| Admin role model | Agent roles on token | Issuer Control Script; BaFin sub-standard roles Admin/Minter/Burner/Pauser/Blacklister/Verifier | none; AgenticDID scoped grants are the intended home |
| Deployment | T-REX Factory, one tx | manual, no factory yet | didz-kernel single-tx localnet deploy |

---

## 3. The regulator's checklist scored against `rwa_registry.compact`

The paper §7.5 lists what appears "across regulated tokenization regimes in Argentina,
Spain, and comparable markets". Score: ✅ have, 🟡 partial, ❌ missing.

| # | Requirement | Score | Notes |
|---|---|---|---|
| 1 | Investor identification (KYC) before a transfer is honored | ❌ | `transfer_ownership` takes any `new_owner_public_key`. Needs a recipient-eligibility check. KYCz owns the proof; RWAz owns the gate. |
| 2 | AML restrictions (denylist) | ❌ | Needs a committed denylist + ZK non-membership, or an issuer/authority-maintained `frozen_holders` set. |
| 3 | Asset freezing by competent authority | ❌ | Lien is owner-granted. A freeze must be imposable by an *authority* key, not the owner, and must block transfer/retire. |
| 4 | Regulatory co-signature for sensitive operations | ❌ | See §4. This is the paper's #1 adoption blocker for CIP-0113 and would be ours in any ERIR-style market. |
| 5 | Recovery and forced transfer (court order, inheritance, lost wallet) | ❌ | Only the current owner can call `transfer_ownership`. Need a governed `force_transfer` path. LegacyKey is the estate consumer. |
| 6 | Jurisdictional restrictions | ❌ | Needs a per-asset country policy + a KYCz `country_allowed` predicate. |
| 7 | Global token pause | ❌ | Needs a per-asset `paused` flag settable by the issuer/authority role that every state-changing circuit checks. |
| 8 | Nominative ownership (registrar knows who holds it) | 🟡 | On-chain we have a commitment, not a name — which is the *privacy feature*. Nominative requirement is met if the registrar (issuer/trustee/ERIR) holds the commitment→DIDz mapping under selective disclosure (`AUTHORITY_TIERS_DATA_ACCESS.md`). Must be documented as such. |
| 9 | Official registry role (ERIR or equivalent) | 🟡 | RWAz *is* a registry of record; what is missing is a first-class **registrar role** with its own key(s) and receipts. Argentina has no ERIR role, Spain requires one. |
| — | Provenance / audit trail | ✅ | `provenance_head` chain + `transfer_count`. Better than both standards for privacy (history verifiable off-chain against one head). |
| — | Encumbrance (lien) | ✅ | Neither standard has it natively. Keep and generalize. |
| — | Terminal lifecycle (destroyed) | ✅ | `retire_object`; mirrors DIDz "destruction is a status". |

Honest summary: **RWAz is a clean ownership-and-provenance core with zero
authority-imposed controls.** Everything a regulator uses to *intervene* (freeze,
seize, pause, forced transfer, co-sign, deny) is absent. That is expected for Phase 1
and it is exactly what Phase 5 must add.

---

## 4. Regulatory co-signature is the receipt model — design it that way

Blockenfy's ONYZE extension: burn, transfer, freeze, pause, unpause need a valid
ERIR signature over an EIP-712 typed payload; mint does not. The ERIR can also revoke
authorizations or reverse within contract parameters. The regulator becomes an
**on-chain co-signer** and every authorized op leaves "an immutable, traceable, and
auditable record".

That is `AUTHORITY_IS_A_RECEIPT.md` verbatim: authority is a specific signed checkable
statement that *this* action was permitted, produced at the moment of the act, kept
forever, verifiable by anyone, including when the answer was no.

Design consequences for RWAz Phase 5:

1. **The regulator is one more signer on the Action Receipt**, not a special-case
   assert. Specify the `regulator_cosign` policy against
   `DIDzMonolith-docs/standards/RECEIPT_AUTHORITY_SPEC.md`.
2. **Refusal is a receipt too.** An ERIR that declines a transfer must produce the
   same receipt shape with `decision = refused`. The paper's model only records
   approvals; ours records both — an advantage in supervision.
3. **Payload convention.** The paper says Cardano lacks a canonical typed-payload
   convention (EIP-712 analogue). We should define the receipt payload as
   chain-agnostic bytes: `H(domain, asset_id, op_code, from_commitment,
   to_commitment, nonce, valid_until)`. Whether verified by Compact, Aiken or
   Solidity, the *receipt format is ours*.
4. **Privacy edge.** On Midnight, the contract can verify that a valid regulator
   signature exists over the payload while the regulator identity, counterparties and
   payload fields stay in private state; the ledger shows only "op X on asset Y was
   regulator-approved". Verify the exact signature-verification primitives available
   in current Compact with midnight-expert before committing to ed25519 vs Schnorr.
5. **Operational pieces the paper flags** (key custody, availability inside the tx
   validity window, revocation) belong in the Receipt Authority Spec's signer
   lifecycle, not in the contract.

---

## 5. Proposed Phase 5 shape (design only)

### 5.1 Pluggable policy set per asset, not hard-coded guards

Both incumbents won with pluggability (ERC-3643 modules; CIP-0113 sub-standards
registered in the on-chain Registry). Blockenfy stresses clients "adjust regulatory
rules during the token's lifecycle" without redeploying. RWAz should register a
**policy set** per object at `register_object` time (and allow the issuer role to
amend it with a receipt):

```text
AssetPolicy (per object id)
├── require_recipient_kyc        : Boolean
├── require_recipient_country_ok : Boolean   (policy id -> allow/deny list commitment)
├── require_regulator_cosign     : Bitmask   (which ops: transfer|freeze|retire|force|pause)
├── lockup_until_epoch           : Uint<64>
├── paused                       : Boolean
└── authority_keys               : issuer / registrar / regulator key commitments
```

### 5.2 New authority-imposed circuits

| Circuit | Caller | Effect |
|---|---|---|
| `freeze_holder(object_id)` / `unfreeze_holder` | issuer or regulator key | blocks transfer/retire for that object; produces receipt |
| `force_transfer(object_id, new_owner, receipt)` | registrar key with regulator cosign | moves title without owner signature; extends provenance with a `forced` domain tag so history shows it was not consensual |
| `pause_asset(object_id)` / `unpause_asset` | issuer key (+ cosign if policy says) | global stop for corporate events / supervision |
| `set_policy(object_id, policy)` | issuer key (+ cosign) | amend policy set; receipt |
| `transfer_ownership` (amended) | owner | additionally checks `!paused`, `!frozen`, lockup, recipient KYC proof (KYCz), country policy, and regulator receipt when required |

### 5.3 Recipient eligibility via KYCz, not inside RWAz

ERC-3643 separates identity (IR) from the token. We do the same: RWAz must not store
KYC facts. The transfer circuit consumes a **KYCz assertion** (ZK: "recipient
commitment passed KYC with a trusted issuer; country ∈ policy") — see
`KYCz/docs/IDENTITY_REGISTRY_PATTERNS_ERC-3643_CIP-0113.md` for the proposed
interface. Follow Blockenfy's lesson: the simplest profile must be a **platform-local
allowlist** (merkle membership from `midnight-modules`), with portable DIDz credentials
as an *upgrade*, or we inherit the ONCHAINID adoption barrier.

### 5.4 Fractional shares (Phase 3) inherit the same policies

The paper's showcase use case — fleet tokens with USD 1 minimum, thousands of
micro-holders, hundreds of transfers per distribution cycle — is a Phase 3 share
registry with Phase 5 policies. Design Phase 3 so the policy set is per *asset*, and
shares inherit it, exactly as CIP-0113 attaches one sub-standard per token policy.
Also note MaxBalance / SupplyLimit as share-level policies.

---

## 6. Relationship to the two standards (what we may honestly claim)

- RWAz is **not** a CIP-0113 sub-standard and not an ERC-3643 module. Midnight is a
  partner chain; RWAz contracts run on Midnight.
- RWAz **can** be positioned as the **privacy-preserving registry of record and
  compliance oracle** for tokens that live on Cardano (CIP-0113) or an EVM
  (ERC-3643): identity, KYC status, encumbrances and regulator approvals are held in
  Midnight private state and exported as ZK proofs / receipts the token's compliance
  layer consumes. This is the paper's own "hybrid strategy" with DIDzM as the shared
  compliance plane.
- Open question for midnight-expert / Kapa: does Midnight offer a per-spend hook on
  shielded tokens analogous to CIP-0113's `programmable_logic_global`? If yes, a
  Midnight-native regulated token profile becomes Phase 5b. If no, RWAz remains a
  registry + oracle. Record the answer in `DIDzMonolith-docs/midnight/MIDNIGHT_CURRENT_SCHEMA.md`.

---

## 7. Jurisdiction notes that shape RWAz profiles

- **Argentina (CNV, Title XXII, sandbox to 31 Dec 2027)**: technology-neutral. The
  instrument (Financial Trust / ON / FCIC) is what is regulated; the token is an
  additional digital representation. A pure DLT provider is not a VASP. Offering docs
  must describe the standard's features and the provider's track record — a
  `REGULATORY_PROFILE_ARGENTINA.md` with our audit evidence would be the deliverable.
  Independent technology audit is mandatory. No ERIR role → co-signature is optional
  there.
- **Spain (CNMV / ERIR)**: tokenized securities are MiFID II, not MiCA. ERIR must
  register and can demand co-signature. All ERIRs run ERC-3643. RWAz's only path is
  as the compliance/receipt layer an ERIR could accept, not as the token.
- **Germany / Switzerland**: CIP-0113's *Security Token BaFin* sub-standard targets
  eWpG and CO Art. 973e with roles Admin/Minter/Burner/Pauser/Blacklister/Verifier —
  a ready-made role list for the AgenticDID scoped-grant profile of an RWAz issuer.
- **Brazil (CVM Res. 175, DREX)**: highest volume; ERC-3643 present; note only.

---

## 8. Use-case requirement matrix (from paper §9) → RWAz phases

| Use case | Requirements named by the paper | RWAz phase |
|---|---|---|
| Pre-construction real estate (FF) | KYC-only transfers, lock-up during construction, programmatic distributions, freeze/seize on court order | 5 (KYC gate, lockup, freeze), 3 (distributions) |
| Developed real estate fractionalization | KYC, freeze/seize, rental distribution to many holders, forced transfer / recovery after lost wallet or succession | 3 + 5 + LegacyKey |
| Vehicle fleet, USD 1 minimum | thousands of micro-holders, hundreds of transfers per cycle, fee sensitivity | 3 (share registry) — throughput/fee model to be measured on Midnight |
| Luxury assets / sports economic rights (Spain) | ERIR framework, regulator co-signature | 5 (cosign) |

---

## 9. Action items for this repo

1. Before Phase 2 implementation: decide per-asset **policy set** vs hard-coded
   asserts (this doc recommends the policy set).
2. Add ROADMAP Phase 5 detail (done in this commit) and keep this doc as its spec
   seed.
3. Sketch `freeze_holder`, `force_transfer`, `pause_asset`, `set_policy` and the
   amended `transfer_ownership` in Compact; validate with `skipZk`; do not commit
   uncompiled sketches as contracts.
4. Write the regulator-cosign policy against `RECEIPT_AUTHORITY_SPEC.md`.
5. Ask midnight-expert / Kapa the per-spend-hook question (§6).
