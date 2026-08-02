# Draft Letter: RWAz Protocol Introduction to W3C

**To:** W3C Credentials Community Group
**From:** John M.P. Santi, EnterpriseZK Labs LLC
**Date:** July 27, 2026
**Subject:** RWAz — permanent object identity with transferable ownership as credentials

---

Dear members of the W3C Credentials Community Group,

I am writing to introduce the **RWAz Protocol**, a specification for
object and real-world-asset identity in which everything changeable
about an object is modeled as a credential over a permanent,
non-transferable identity anchor.

## The core idea, in CCG terms

The VIN stays with the car; the title is a credential. RWAz makes that
pattern normative for every object class:

- **ObjectDIDz/RWADIDz** — a permanent identity registry entry with no
  transfer semantics (deliberately NOT an NFT);
- **Title, lien, insurance, inspection** — transferable/holdable
  credentials, expressible in the VC Data Model with committed claims;
- **`assert_i_own`** — a one-bit zero-knowledge ownership assertion
  (the verifier learns a boolean, never the owner);
- **Provenance** — a rolling hash chain
  (`new_head = H(old_head, new_owner_commitment)`) proving unbroken
  history without revealing it, with selective segment disclosure
  planned.

## Why this may interest the CCG

1. It exercises the VC model on non-person subjects at depth
   (encumbrances as third-party-held credentials that BLOCK a subject's
   own transfers are, we believe, an underexplored VC pattern).
2. The one-bit ownership assertion is selective disclosure applied to
   property rights.
3. It cleanly separates identity (permanent) from claims (changeable),
   which is the CCG's own foundational distinction, applied to assets.

## Honest posture

Compiler and structural-test evidence only; no audit; no production
deployment; and the spec explicitly makes **no legal-effect claims** —
it binds cryptographic evidence, and fraudulent initial registration is
a legal problem the provenance chain makes auditable, not a
cryptographic impossibility.

## What we are seeking

1. Review of the encumbrance-as-credential and provenance-head
   patterns.
2. Guidance on VC expression of committed-claim credentials for
   objects.
3. Incubation interest, in coordination with our companion DIDz
   Protocol proposal (RWAz is its object pillar).

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
