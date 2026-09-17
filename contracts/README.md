# RWAz Contracts

> First contract landed July 5, 2026. Every contract is compile-validated on
> the local `compactc` before commit (compile-first), and reuses
> `midnight-modules` primitives rather than reimplementing them.

## Live contracts (compiled on compactc 0.31.1, full ZK keys)

| Contract | What it is |
|---|---|
| `rwa_registry.compact` | **v1 of the branch thesis in one contract**: permanent object identity (the VIN), ownership as the credential that moves (the title), one encumbrance slot (the lien, lienholder-only release, transfers blocked while active), rolling provenance hash chain, ZK `assert_i_own`, terminal `retire_object` status. |

## Phase-5 policy contracts (compiled on compactc 0.31.1, full ZK keys, tested on simulated chain)

| Contract | What it is |
|---|---|
| `accredited_transfer.compact` | **Recipient-eligibility policy**: `onboard` verifies a KYCz-signed `KycAssertion` in-circuit (via `include` of `midnight-modules/signed-credential`), inserts the caller into a `HistoricMerkleTree` accredited set; `assert_recipient_accredited` is the guard a gated transfer calls; issuer-managed `allowed_countries`; `freeze_holder`/`unfreeze_holder`. Ported from Brick Towers `midnight-rwa` (Erick Romero). RWAz stores no KYC facts. Tests: `tests/accredited_transfer.*`. |

## Planned follow-on modules (split out as they grow)

- `encumbrance.compact`, multiple simultaneous liens / insurance /
  inspection / warranty / escrow credentials (v1 has one slot).
- `provenance.compact`, richer custody history (v1 keeps a rolling hash head).
- `fractional.compact`, share registry over a single `RWADIDz`; prove
  "owns >= N shares" without revealing totals.
- `custody.compact`, custodian / controller relationships and governed recovery.

## Reused primitives (do not reimplement)

From `midnight-modules`:

- `signed-credential` (in-circuit Schnorr/Jubjub verification of issuer-signed
  credentials; used by `accredited_transfer` to consume KYCz assertions)
- entity registry + lifecycle status (via DIDz root)
- `merkle-membership` (ownership set membership)
- `commitment-nullifier` (one-time transfer / anti-replay)
- `access-control` (issuer / custodian authorization)
- `recovery-core` (m-of-n recovery for stolen titles)

## Compact version

Discover the current `compactc` / language version at session start (do not
hardcode). Use a pragma range that includes the current language version.
Current build: compactc 0.31.1, pragma `>= 0.16 && <= 0.23`.

```bash
compact compile contracts/rwa_registry.compact build/rwa-registry
```
