# HelixChain Integration (pointer)

**RWAz** integrates with **HelixChain**, the ecosystem's privacy-preserving data
plane + AI agent (powered by **DIDz + AgenticDID + RWAz + HelixChain**).

**This repo primarily writes:** `rwa_objects` + `ownership_history` — owned,
transferable assets and their provenance (title changes; the VIN stays with the
car). Do NOT model credentials as assets — a diploma is a VC, a watch is an asset.

**Integration contract (summary):**
- every subject/owner/holder is a 32-byte **commitment**, never a name
- use the identity layer (DIDz ⇄ tID swappable at runtime) — never hard-code a provider
- store **coarse** data only (valuation buckets, coarse location) + a `*_hash` anchor
- pick the right class: **DIDz** identity / **VC** credential / **RWAz** asset / **AgenticDID** grant

**Canonical integration schema:** `helixchain/docs/HELIXCHAIN_INTEGRATION.md`
**Alternate-ID (tDIDz) scheme:** `helixchain/docs/IDENTITY_PLACEHOLDER_SCHEME.md`
(local pointer: `docs/TEMP_ID_PLACEHOLDER.md`)
