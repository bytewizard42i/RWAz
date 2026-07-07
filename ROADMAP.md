# RWAz Roadmap

Phased build. Each phase depends on the DIDz root layer providing the entity
registry and lifecycle status it reuses.

## Phase 0, Design (current)

- README, architecture, division-of-labor docs
- Align with `DIDZ_AGENTICDID_IMPLEMENTATION_PLAN.md` (three-branch model)
- No Compact contracts yet

## Phase 1, Ownership core

- `RWADIDz` / `ObjectDIDz` entity types confirmed in DIDz root
- `TitleCredential` (current owner, transferable)
- Ownership transfer circuit (DIDz unchanged, credential moves)
- `ProvenanceRecord` append-only history
- Validate all Compact via Midnight MCP `skipZk` before committing

## Phase 2, Encumbrances

- Lien, insurance, inspection, warranty, escrow credentials
- Transfer guard: block/allow transfer based on encumbrance state
- ZK proofs: "lien-free," "currently insured," etc.

## Phase 3, Fractional ownership

- Share registry over a single `RWADIDz`
- Prove "owns at least N shares" without revealing totals
- Distribution / redemption flows

## Phase 4, Custody and recovery

- Custodian / controller relationships
- Governed recovery for stolen/fraudulent titles (reuse `recovery-core`)
- Controlled asset migration (no silent encumbrance migration)

## Phase 5, Regulatory profiles

- Credential schemas per asset class (vehicles, real estate, securities-style
  tokenized RWAs)
- Selective-disclosure audit access for regulators

## Consumers to wire as phases land

- `SilentLedger`, `equineProData`, `petProData`, `DownMan`, `safeHealthData`
