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

> Expanded Sept 4, 2026 from the regulator checklist in the Blockenfy / Cardano
> Ambassadors paper *CIP-0113 vs ERC-3643*. Spec seed and gap scoring:
> `docs/REGULATED_TOKEN_STANDARDS_CIP-0113_ERC-3643.md`. Design only until the
> circuits compile and are `skipZk`-validated.

- Credential schemas per asset class (vehicles, real estate, securities-style
  tokenized RWAs)
- Selective-disclosure audit access for regulators
- Per-asset **policy set** registered at `register_object` (pluggable, like
  ERC-3643 modules / CIP-0113 sub-standards), not hard-coded asserts
- Authority-imposed controls a securities regulator expects:
  - recipient KYC gate (consumes a KYCz assertion; RWAz stores no KYC facts)
  - AML denylist / `freeze_holder` / `unfreeze_holder` (issuer or regulator key)
  - `force_transfer` for court orders, inheritance, lost wallet (registrar +
    regulator cosign; provenance tagged `forced`) — LegacyKey consumer
  - `pause_asset` / `unpause_asset` (corporate events, supervision)
  - jurisdictional allow/deny policy (KYCz `country_allowed` predicate)
  - lock-up until epoch (pre-construction real estate)
- **Regulator co-signature as an Action Receipt signer**, specified against
  `DIDzMonolith-docs/standards/RECEIPT_AUTHORITY_SPEC.md`; refusal produces the
  same receipt shape. This was the single feature that unlocked ERIR adoption in
  Spain for ERC-3643 and is absent from CIP-0113.
- Registrar role (ERIR-equivalent) with its own keys and receipts; nominative
  ownership satisfied by registrar-held commitment→DIDz mapping under
  selective disclosure
- Jurisdiction profile docs: Argentina (CNV Title XXII sandbox, technology
  neutral, no ERIR) first; Spain (CNMV/ERIR, MiFID II) as the compliance-plane
  play, not the token

## Consumers to wire as phases land

- `SilentLedger`, `equineProData`, `petProData`, `LegacyKey`, `safeHealthData`
