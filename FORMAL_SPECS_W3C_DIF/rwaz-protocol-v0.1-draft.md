# The RWAz Protocol

## Permanent Object Identity with Transferable Ownership, Encumbrance, and Private Provenance

| | |
|---|---|
| **Version** | 0.1 (Editor's Draft) |
| **Date** | July 27, 2026 |
| **Author** | John M.P. Santi, EnterpriseZK Labs LLC |
| **Status** | Editor's Draft for community review — not yet submitted to any standards body |
| **License** | Apache 2.0 |
| **Reference implementation** | RWAz repository (Compact contracts) + shared primitives in `midnight-modules`; the DIDz Trust Kernel's `ObjectProvider` seam (`didz-kernel`) is the chain-agnostic interface. |
| **Evidence status** | Compiler and structural-test evidence only (`MOCK` for the kernel seam; Compact modules compile). No audit, no production deployment, no legal-effect claims. |

---

## How to read this document

**Normative text** uses RFC 2119 key words (MUST, MUST NOT, SHOULD, MAY).

> 💬 **In plain English:** sidebars translate each concept. Informative,
> not normative.

---

## Abstract

The RWAz Protocol defines identity, ownership, encumbrance, and
provenance for physical objects and real-world assets under one rule
inherited from the DIDz Protocol:

> **Do not confuse identity with authority.** An object's identity is
> permanent; its ownership is a transferable credential; its
> encumbrances are third-party claims; its provenance is a private,
> extendable hash chain.

On-chain state is commitments and status bits only. Ownership is proven
with a one-bit zero-knowledge assertion (`assert_i_own`) that reveals
nothing about the owner. Transfers extend a provenance head
(`new_head = H(old_head, new_owner_commitment)`) without exposing the
history. Encumbrances (liens, escrow, insurance holds) block transfer by
construction until released by their holder.

> 💬 **In plain English:** think of a car. The VIN stays with the car for
> life — that's identity. The title changes hands when the car sells —
> that's ownership. The bank's lien stops you selling until the loan is
> paid — that's an encumbrance. The chain of every previous title is the
> provenance. Today all of that lives in filing cabinets and state
> databases that anyone with a subpoena or a breach can read. RWAz keeps
> the same structure but seals every fact: you can *prove* you own the
> car without saying who you are, and a buyer can *verify* clean title
> without reading your history.

---

## 1. Motivation

- **NFTs conflate identity with ownership.** A token that IS the asset
  moves when ownership moves, destroying the permanent identity anchor
  and leaking the full transfer history publicly.
- **Registries expose owners.** Title and lien registries are public or
  breachable; ownership queries reveal the owner.
- **Provenance is either public or absent.** Systems offer full public
  history (privacy loss) or no verifiable history (fraud surface).

RWAz's position: the object gets a permanent, non-transferable
**ObjectDIDz/RWADIDz** (a registry entry, never a token); everything
changeable is a credential or commitment layered on top.

---

## 2. Terminology

| Term | Definition |
|---|---|
| **ObjectDIDz / RWADIDz** | Permanent identity for a physical object / real-world asset. Non-transferable by construction (no transfer circuit exists for identity). |
| **Owner commitment** | A hiding commitment to the current owner's key. On-chain ownership is only this commitment. |
| **Descriptor hash** | Commitment to the object's off-chain descriptor (make, model, serial, documents). Raw facts never on-chain. |
| **Title credential** | The transferable "who owns it now" credential. |
| **Encumbrance** | A third-party claim (lien, escrow, insurance/inspection hold) held by an encumbrance holder's commitment; blocks transfer until released. |
| **Provenance head** | A rolling hash chain: `new_head = H(old_head, new_owner_commitment)`. Proves an unbroken history without revealing it. |
| **`assert_i_own`** | The one-bit ownership assertion: claimant proves control of the current owner commitment; verifier learns a boolean. |
| **Lifecycle** | `active → sold / destroyed / lost / seized / retired / superseded`; terminal states are irreversible. |

---

## 3. Protocol requirements

### 3.1 Identity

1. Object identity MUST be permanent and non-transferable. Conforming
   implementations MUST NOT expose any circuit or operation that moves
   an ObjectDIDz between controllers.
2. Registration binds `(ownerCommitment, descriptorHash)` and
   initializes the provenance head.
3. Terminal lifecycle states MUST be irreversible; a terminal object
   MUST reject transfer and encumbrance operations.

### 3.2 Ownership

1. On-chain ownership state is the owner commitment only. Owner
   identity MUST NOT be derivable from chain state.
2. `assert_i_own` MUST return one bit and MUST NOT leak the owner
   commitment preimage or any linkable identifier.
3. Transfer replaces the owner commitment, extends the provenance head,
   and MUST be rejected if the object is encumbered or terminal.

### 3.3 Encumbrance

1. An encumbrance records the holder's commitment and a kind tag.
2. While any encumbrance is active, transfer MUST fail.
3. Only the encumbrance holder (proving control of the holder
   commitment) may release it.

> 💬 **In plain English:** the bank doesn't have to trust you not to
> sell the car — the protocol physically refuses the sale while the lien
> exists, and only the bank's key can lift it.

### 3.4 Provenance

1. Every transfer MUST extend the head:
   `new_head = H(old_head, new_owner_commitment)`.
2. The chain of prior owners MUST NOT be recoverable from public state.
3. A holder MAY selectively disclose provenance segments (e.g. "no
   custody gap between epochs A and B") in zero knowledge. `PLANNED`

### 3.5 Fractionalization and custody (roadmap)

Fractional interests, custody/controller relationships, and
tokenization of value flows are v0.2+ scope. Where value moves, tokens
are appropriate; identity never becomes a token. `PLANNED`

---

## 4. Privacy analysis

| Property | Mechanism | What leaks |
|---|---|---|
| Owner anonymity | Owner commitment + one-bit assertion | Nothing about the owner |
| History privacy | Rolling provenance head | Chain LENGTH may be inferable from update count; contents are not |
| Encumbrance privacy | Holder commitment + kind tag | That an encumbrance of some kind exists (needed so buyers can check "clean title: yes/no") |
| Descriptor privacy | Descriptor hash | Nothing; raw facts off-chain |

Residual surfaces (`RESEARCH`): transaction-graph timing analysis;
correlation via repeated `assert_i_own` calls from the same network
endpoint.

---

## 5. Security considerations

- **Stolen owner key**: rotation/recovery follows the DIDz Protocol's
  key-rotation model (identity never moves; epoch increments).
- **Forged registration**: registration requires an authorized
  registrar policy per deployment; the protocol binds evidence, not
  legal truth — a fraudulent initial claim is a legal problem the
  provenance chain makes auditable, not a cryptographic impossibility.
  This spec makes no legal-effect claims.
- **Encumbrance griefing**: encumbrance creation MUST be restricted to
  parties the owner has authorized (e.g. via an AgenticDID grant) or to
  legally empowered registrars per deployment policy.
- **Replay**: all assertions bind to context per the underlying proof
  system.

---

## 6. Relationship to existing work

- **DIDz Protocol** — RWAz is the object pillar (Seam 3,
  `ObjectProvider`) of the kernel; this spec is the normative depth for
  that seam. Identity primitives (registry, lifecycle, credentials,
  recovery) are imported from the shared DIDz layer, never duplicated.
- **AgenticDID** — agents transact over RWAz objects under scoped
  grants (e.g. "sell asset X for ≥ $Y before date Z").
- **W3C VC Data Model** — title, lien, insurance, and inspection
  credentials are expressible as VCs with committed claims.
- **NFT standards (ERC-721 et al.)** — RWAz is explicitly NOT an NFT
  standard: identity is a registry entry with no transfer semantics;
  only credentials and (future) value tokens move.
- **Midnight Network** — reference implementation platform.

---

## 7. Authorship

This specification is authored by **John M.P. Santi, EnterpriseZK Labs
LLC**, published under the **Apache License 2.0**. The RWAz model —
permanent non-token object identity, one-bit ownership assertion,
encumbrance-blocked transfer, and the rolling private provenance head —
was developed by the author through 2026; repository history records
provenance.
