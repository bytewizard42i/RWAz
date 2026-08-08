# RWAz Architecture

> **Midnight technical rule:** Validate Compact and SDK statements against the [DIDzM technical reference policy](../../DIDzMonolith-docs/midnight/MIDNIGHT_TECHNICAL_REFERENCE_POLICY.md).

> **Canonical alignment, July 13, 2026:** RWAz is the object and real-world-asset
> engine in the four-engine DIDzM system. This document defines its intended
> boundaries and invariants. Items under open questions remain design work. A
> compiler result or structural interface test is not equivalent to security
> review, end-to-end behavior, testnet deployment, or production readiness.

## Position in the DIDz stack

```text
DIDzM
├── DIDz .......... root identity, issuer trust, credentials, lifecycle
├── AgenticDID .... agent identity, bounded authority, delegation
├── RWAz .......... asset identity, ownership, encumbrance, provenance
└── HelixCTW ...... private data orchestration and query (data layer)
```

RWAz consumes DIDz root registries and shared modules, then adds the ownership
and provenance semantics that belong to this engine. It does not redefine DIDz,
AgenticDID, or HelixCTW.

## Core separation

```text
Asset identity   = permanent   (RWADIDz / ObjectDIDz)  -> lives in DIDz root
Ownership        = transferable (TitleCredential)      -> lives in RWAz
Encumbrances     = attachable   (lien/insurance/...)    -> lives in RWAz
Provenance       = append-only  (title/custody history) -> lives in RWAz
Lifecycle status = mutable      (active/sold/destroyed)  -> lives in DIDz root
```

## Planned NIGHTGATE adapter boundary

The planned `@didz/adapter-nightgate` may translate an already-authorized RWAz
operation to the pinned NIGHTGATE CAP/OData service and carry the resulting
evidence back through existing kernel seams. NIGHTGATE-MCP may expose a curated
Ai tool surface over that service.

Neither component is an engine, registry, title authority, ownership authority,
or policy engine. RWAz contracts remain authoritative for ownership,
encumbrance, custody, and provenance. A NIGHTGATE bearer grant is a transport
credential only; it is not a title credential, ownership proof, DID control
proof, or AgenticDID authorization proof.

OData projections must apply row-level authorization before disclosure. Never
place wallet seeds, private keys, bearer tokens, title documents, private
evidence, or ZK witnesses in source, examples, fixtures, logs, telemetry, or
MCP prompts. Treat public contract keys, arguments, disclosed fields, and
transaction metadata as public ledger inputs unless a verified proof path
establishes otherwise.

## Registries RWAz adds

```text
RWAz
├── Ownership Registry
│   ├── TitleCredential (current owner, transferable)
│   ├── transfer circuit (owner A -> owner B, DIDz unchanged)
│   └── FractionalShareRegistry (many shares over one RWADIDz)
├── Encumbrance Registry
│   ├── LienCredential
│   ├── InsuranceCredential
│   ├── InspectionCredential
│   ├── WarrantyCredential
│   └── EscrowCredential
├── Provenance Registry
│   └── append-only title/custody chain bound to the asset DIDz
└── Custody Registry
    └── controller / custodian relationships
```

## Privacy model

RWAz inherits Midnight's ZK model. A holder should be able to prove ownership or
an encumbrance state without revealing unrelated data:

```text
Prove: "I am the current owner of asset X"           without revealing full history
Prove: "This asset is lien-free"                     without revealing the owner
Prove: "I own at least N fractional shares of X"      without revealing total holdings
```

This mirrors the single-bit proof-of-authority pattern already used in
AgenticDID (`assert_authorized`), applied to ownership instead of delegated
authority.

## Ownership transfer, the central circuit

The defining operation. Transferring ownership must:

1. Verify the caller holds the current `TitleCredential` (ZK).
2. Verify no blocking encumbrance (e.g. active lien without release).
3. Issue a new `TitleCredential` to the new owner.
4. Append a `ProvenanceRecord` entry.
5. Leave the asset `DIDz` and its identity untouched.

The asset's identity is invariant across an unlimited number of transfers. Only
the credential changes. This is the "VIN stays, title changes" invariant.

## Fraud, loss, and recovery

RWAz reuses the DIDz root fraud/recovery model:

- A stolen or fraudulently transferred title is corrected through governed
  recovery, not by burning the asset `DIDz`.
- Asset migration (on fraud/recovery) may move ownership and history after policy
  checks; it must not silently move encumbrances that would harm a lienholder.

## Open design questions

- Should fractional shares themselves be `RWADIDz` sub-entities, or pure
  credentials? (Leaning credentials with a share registry, to avoid entity
  explosion.)
- How much provenance is public vs held in private state with selective reveal?
- Which regulatory profiles (securities, real estate, vehicles) get first-class
  credential schemas first?
