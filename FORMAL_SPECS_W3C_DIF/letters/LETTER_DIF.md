# Draft Letter: RWAz Protocol Introduction to DIF

**To:** Decentralized Identity Foundation — Claims & Credentials WG
**From:** John M.P. Santi, EnterpriseZK Labs LLC
**Date:** July 27, 2026
**Subject:** RWAz — object identity, ownership credentials, and private provenance

---

Dear members of the Decentralized Identity Foundation,

I am writing to introduce the **RWAz Protocol**: identity, ownership,
encumbrance, and provenance for physical objects and real-world assets,
built on decentralized-identity primitives rather than token standards.

## The position

Tokenized-RWA systems typically make the token BE the asset: ownership
transfer moves the identity anchor and publishes the transfer graph.
RWAz inverts this:

- the object's identity is a **permanent registry entry** with no
  transfer circuit (not an NFT);
- **ownership is a credential** over that identity, transferred by
  replacing a hiding owner-commitment;
- **encumbrances** (liens, escrow, holds) are third-party-held
  credentials that block transfer by construction until their holder
  releases them;
- **provenance** is a rolling hash head proving unbroken history
  without revealing it;
- ownership verification is a **one-bit ZK assertion**.

## Relevance to DIF work

- **Claims & Credentials**: title/lien/insurance/inspection as
  credential schemas over non-person subjects; the encumbrance pattern
  (a credential held by a third party that constrains the subject) may
  merit schema-directory treatment.
- **Identifiers & Discovery**: ObjectDIDz semantics — permanent,
  non-transferable, key-rotatable subject identifiers for things.
- **Trusted AI Agents / AgenticDID**: agents transact over RWAz objects
  under scoped grants ("sell asset X for ≥ $Y before Z") — this
  composes with our AgenticDID proposal.

## Evidence

Compiler and structural-test evidence only (Compact modules; the DIDz
kernel's demoLand ObjectProvider passes an executable conformance
suite). No audit, no production deployment, no legal-effect claims —
the spec says so explicitly.

## What we are seeking

1. C&C WG review of the encumbrance-as-credential pattern.
2. Feedback on private provenance with selective segment disclosure.
3. Evaluation alongside our DIDz Protocol kernel + AgenticDID
   proposals as one stack (RWAz is the object pillar).

**Specification:** `FORMAL_SPECS_W3C_DIF/rwaz-protocol-v0.1-draft.md`
in the RWAz repository. **License:** Apache 2.0.

**Implementation status (updated August 2, 2026).** The RWAz registry is no
longer design-only: `rwa_registry` (permanent object identity, ownership as
a movable title, single-lien encumbrance, rolling provenance hash chain)
compiles on the current Midnight toolchain and was the first contract of
our ecosystem deployed to a live Midnight network — object registration
and zero-knowledge proof-of-ownership are chain-confirmed with real
proofs, served through the DIDz kernel's ObjectProvider seam. Cross-pillar
binding is demonstrated: one holder key commitment controls both a
registered identity and a registered asset title. Our test methodology now
includes an adversarial population ("TestTown") whose asset dossiers carry
independently confirmable paper trails — including deliberate impostors
that admission and attestation ceremonies must refuse.

Respectfully,

**John M.P. Santi**
EnterpriseZK Labs LLC
Midnight Network Ambassador
