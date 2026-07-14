# RWAz Architecture

## Position in the DIDz stack

```text
DIDz Root Protocol  ........  universal identity + lifecycle status
├── AgenticDID .............  autonomous agents: scoped/attenuated authority
└── RWAz .................... objects + real-world assets: ownership + provenance
```

RWAz is a branch, not a fork. It reuses the DIDz root registries and adds an
ownership and provenance layer on top.

## Core separation

```text
Asset identity   = permanent   (RWADIDz / ObjectDIDz)  -> lives in DIDz root
Ownership        = transferable (TitleCredential)      -> lives in RWAz
Encumbrances     = attachable   (lien/insurance/...)    -> lives in RWAz
Provenance       = append-only  (title/custody history) -> lives in RWAz
Lifecycle status = mutable      (active/sold/destroyed)  -> lives in DIDz root
```

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
