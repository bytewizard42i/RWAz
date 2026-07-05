# Division of Labor: DIDz root vs RWAz

The single most important design rule for RWAz is that it must **not** duplicate
the shared identity primitives. This document draws the exact line.

## DIDz root owns (thin, shared by all branches)

- The `ObjectDIDz` / `RWADIDz` **entity types** in the Entity Registry
- **Lifecycle status** and its governed transitions (active, sold, destroyed,
  lost, seized, retired, superseded, archived)
- The generic **Credential Registry** and credential status/revocation machinery
- The generic **Issuer Registry** (who may issue what, scoped and revocable)
- Shared cryptographic primitives via `midnight-modules`: entity registry,
  merkle-membership, commitment-nullifier, access-control, recovery-core

## RWAz owns (the heavy, asset-specific machinery)

- **Ownership as a transferable credential** (`TitleCredential`) and the transfer
  circuit that moves it without touching the asset's `DIDz`
- **Encumbrance credentials**: lien, insurance, inspection, warranty, escrow
- **Provenance**: append-only chain of title/custody history bound to the asset
- **Fractional ownership / tokenization**: many ownership shares over one
  underlying `RWADIDz`, with a share registry
- **Custody and controller** relationships specific to assets
- **Asset-specific regulatory** logic (securities-style rules for tokenized RWAs)

## The test for "which repo does this belong in?"

Ask: *would humans, agents, and organizations also need this?*

- If yes, it is a shared primitive and belongs in **DIDz root** (or
  `midnight-modules`).
- If it only makes sense for an object or asset (ownership, lien, provenance,
  fractionalization), it belongs in **RWAz**.

## Import direction

```text
midnight-modules  ->  DIDz root  ->  RWAz
```

RWAz depends on DIDz root and `midnight-modules`. Nothing in DIDz root depends on
RWAz. This keeps the root layer branch-agnostic, exactly as it is for AgenticDID.
