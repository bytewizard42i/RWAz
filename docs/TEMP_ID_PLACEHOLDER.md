# tDIDz — Temporary Identity Placeholder (dev only)

While real Midnight **DIDz** / **RWAz** wiring is in progress, the DIDzMonolith
data plane (HelixChain) uses a **temporary-ID authority** ("tDIDz" = temp DIDz)
as a swappable stand-in for owner identities. This note exists so there is
**no confusion** when you see `TEMP-*` labels or `id_scheme = 'temp'`.

- **What it is**: a traditional-registrar-style placeholder that issues labels
  like `TEMP-HUMAN-0001`, with `commitment = sha256("helix:temp:" + label)`.
  Asset `owner_commitment` values point at these.
- **Why**: lets us build asset/ownership flows now; swaps to real DIDz with
  **zero business-logic changes** (one-line provider swap).
- **Not production identity.** Real DIDz commitments are non-resolvable by
  design (privacy); the temp scheme's resolvable labels are a dev convenience.

## The four ecosystem classes (do NOT conflate)

Powered by **DIDz + AgenticDID + RWAz + HelixChain**. RWAz owns the **Asset**
class — and must not be confused with credentials:

| Class | Engine | What it is | Transferable? |
|---|---|---|---|
| Identity | **DIDz** | who/what this is | no |
| Verifiable Credential (VC) | DIDz-branch | a claim ABOUT a holder (diploma, security pass) | no |
| Asset | **RWAz** | a thing a holder OWNS (car, house, watch, pet) | yes — title changes, provenance tracked |
| Grant | **AgenticDID** | what an agent may DO for you | delegated |

**Golden rule:** the VIN stays with the car; the title changes. A diploma is a
VC (a claim), a watch is an Asset (owned). Do not model credentials as assets.

**Canonical spec** (authoritative, with full detail + migration path):
`helixchain/docs/IDENTITY_PLACEHOLDER_SCHEME.md`
Reference implementation: `helixchain/hackathon/app/src/identity.ts`
