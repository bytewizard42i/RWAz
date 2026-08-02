# RWAz Roadmap

Phased build. Each phase depends on the DIDz root layer providing the entity
registry and lifecycle status it reuses.

## Phase 0, Design ✅ (complete)

- README, architecture, division-of-labor docs
- Align with `DIDZ_AGENTICDID_IMPLEMENTATION_PLAN.md` (three-branch model)

## Phase 1, Ownership core ✅ (complete — TestWired Aug 2, 2026)

> `rwa_registry.compact` (6 circuits) + `rwa_credentials.compact`
> (5 circuits) compile clean on compactc 0.31.1 (7/7 structural tests,
> full ZK keys). `rwa_registry` was the FIRST DIDzMonolith contract ever
> deployed to a live Midnight network: localnet deploy + `register_object`
> + ZK `assert_i_own`, all chain-confirmed with real proofs, served
> through the didz-kernel ObjectProvider seam (`@didz/adapter-midnight`).
> Stage: TestWired (localnet) — see
> `DIDzMonolith-docs/standards/BUILD_STAGES.md`.

## Phase 1 (original scope, for reference)

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

- `SilentLedger`, `equineProData`, `petProData`, `LegacyKey`, `safeHealthData`
