# FORMAL_SPECS_W3C_DIF — RWAz Protocol

This folder is the standard formal-specification package for this project
(the house convention for every original concept: spec + letters +
submission instructions, all in a folder named `FORMAL_SPECS_W3C_DIF`).
It contains the formal specification for **RWAz: permanent object
identity with transferable ownership, encumbrance, and private
provenance**.

| File | What it is |
|---|---|
| [`rwaz-protocol-v0.1-draft.md`](rwaz-protocol-v0.1-draft.md) | The specification: ObjectDIDz/RWADIDz, one-bit ownership assertion, encumbrance-blocked transfer, rolling provenance head. |
| [`letters/LETTER_W3C.md`](letters/LETTER_W3C.md) | Introduction letter to the W3C Credentials Community Group. |
| [`letters/LETTER_DIF.md`](letters/LETTER_DIF.md) | Introduction letter to DIF (Claims & Credentials WG). |
| [`SUBMISSION_INSTRUCTIONS.md`](SUBMISSION_INSTRUCTIONS.md) | Provenance + submission playbook (procedures verified July 27, 2026). |

## Position in the stack

RWAz is the **object pillar** of the DIDz Protocol — the normative depth
for Seam 3 (`ObjectProvider`) of the kernel
(`didz-kernel/FORMAL_SPECS_W3C_DIF/didz-protocol-v0.1.md`). Identity
primitives are imported from the shared DIDz layer; RWAz adds only the
ownership/encumbrance/provenance layer.

## Evidence status

Compiler and structural-test evidence only. `MOCK` for the kernel seam
(demoLand `ObjectProvider` passes the conformance suite). No audit, no
production deployment, and **no legal-effect claims** — the spec is
explicit that it binds evidence, not legal truth.

## Rules for editing

1. Never introduce transfer semantics on identity. Identity is a
   registry entry, not a token — this is John's binding NOT-NFTs ruling.
2. Evidence labels on every claim; the no-legal-effect caveat stays.
3. Normative changes bump the version with a dated changelog entry.
