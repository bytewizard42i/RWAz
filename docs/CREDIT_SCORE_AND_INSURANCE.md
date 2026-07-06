# RWAz — Credit Score & Insurance Integration

**Date**: July 6, 2026
**Status**: Design
**Related**: `DIDz-io/docs/CREDIT_SCORE.md` (source of truth),
`CryptoSure-me-app/docs/DIDZ_CREDIT_SCORE.md` (canonical spec)

How RWAz registry entries serve as the **insured object** for CryptoSure everyday coverage,
and how the **DIDz credit score** combines with an asset's appraised value to set the
insurable cap.

---

## 1. RWA entry as the insured object

For CryptoSure everyday coverage (`CryptoSure.me`), the insured item is a **RWAz registry
entry** — a real-world asset already committed on-chain (RWAz is the object/RWA
foundational branch; registry entries, not NFTs). This gives insurance a
privacy-preserving handle on:

- **asset type** → risk class,
- **age** → depreciation / risk adjustment,
- **appraised-value band** → the coverage cap ceiling,
- **ownership** → proven via control of the RWA entry, never revealed.

## 2. Insurable cap = f(owner score band, asset value band)

The maximum coverage CryptoSure will write on an RWAz asset is a function of **both**:

- the **owner's DIDz credit-score band** (proven via `DIDz.prove_score_at_least`), and
- the **asset's appraised-value band** (exposed by RWAz as a band, not a raw figure).

```
insurableCap = min(
  capForScoreBand(ownerScoreBand),     // score gates the ceiling
  appraisedValueBand.upper             // never insure above appraised value
)
```

Neither the raw score nor the raw appraised value is revealed — CryptoSure verifies band
booleans and reads the value **band**, then applies a public lookup (no in-circuit
division — Compact quirk).

## 3. Stewardship history feeds the score

RWAz is also a **signal source** for the DIDz scoring oracle:

- Clean stewardship (no fraud flags, no disputed transfers, consistent status history on an
  owner's registered assets) is a **positive** signal.
- Fraud flags / disputed provenance are **negative** signals.
- These are weighted off-chain by the oracle (DIDz `docs/CREDIT_SCORE.md` §3) and only ever
  surface as a band, never as raw RWAz history, to any insurer.

## 4. Expose an appraised-value band (design; MCP-validate first)

RWAz should expose a privacy-preserving **appraised-value band** getter that CryptoSure can
consume:

- `getAppraisedValueBand(assetId): Uint<8>` returning a band index (e.g. 0 = <$500,
  1 = <$1k, 2 = <$5k, …) rather than an exact value.
- Ownership proof reuses the existing RWAz control-of-entry check (analogous to
  `DIDzRegistry.assert_i_control`).

## 5. Flow (everyday coverage on an RWA)

```
1. Owner registers/controls an RWAz asset entry (type, age, appraised-value band)
2. CryptoSure quote: prove owner controls the asset + prove owner DIDz score band (ZK)
3. insurableCap = min(capForScoreBand, appraisedValueBand.upper)
4. Buy policy bound to the assetId commitment + scopeHash; premium by risk class + band
5. Claim on covered loss → ZK event proof → payout from PremiumPool up to insurableCap
```

## 6. Privacy

- Owner identity, raw score, and exact appraised value stay private.
- CryptoSure learns only: "owner controls this asset," "score ≥ band threshold," and the
  **value band** — enough to price and cap, nothing more.
