# RWAz Contracts (planned)

Design-only. No `.compact` source committed yet. Every contract below must be
validated via the Midnight MCP (`skipZk`) before source is added, per DIDzM
conventions, and must reuse `midnight-modules` primitives rather than
reimplementing them.

## Planned modules

- `title.compact` — `TitleCredential` issuance + ownership transfer circuit
  (verifies current holder in ZK, issues new title, appends provenance, leaves
  asset DIDz untouched).
- `encumbrance.compact` — lien / insurance / inspection / warranty / escrow
  credentials + transfer guard.
- `provenance.compact` — append-only title/custody history bound to an asset DIDz.
- `fractional.compact` — share registry over a single `RWADIDz`; prove
  "owns >= N shares" without revealing totals.
- `custody.compact` — custodian / controller relationships and governed recovery.

## Reused primitives (do not reimplement)

From `midnight-modules`:

- entity registry + lifecycle status (via DIDz root)
- `merkle-membership` (ownership set membership)
- `commitment-nullifier` (one-time transfer / anti-replay)
- `access-control` (issuer / custodian authorization)
- `recovery-core` (m-of-n recovery for stolen titles)

## Compact version

Discover the current `compactc` / language version at session start (do not
hardcode). Use a pragma range that includes the current language version.
