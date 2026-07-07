# RWAz

**Real-World Asset and Object identity for the DIDz ecosystem, on Midnight.**

RWAz is the third branch of the DIDz identity architecture. It is a peer to
AgenticDID:

```text
DIDz (root)  ......  universal identity + lifecycle status for every entity
├── AgenticDID ...  the branch for autonomous agents (delegated authority)
└── RWAz .........  the branch for objects and real-world assets (ownership)
```

Where AgenticDID answers "what may this agent do," RWAz answers "what is this
asset, who owns it right now, and what is its provenance," without conflating the
asset's permanent identity with its changeable ownership.

## The one rule RWAz inherits from DIDz

> Do not confuse identity with authority.
>
> A DIDz proves an entity exists or existed. Credentials prove claims. Ownership
> is a credential, not the identity.

The VIN stays with the car. The title changes when the car is sold. RWAz makes
that pattern first-class for every kind of object and asset.

## Why RWAz is its own repo

Real-world assets are a large domain in their own right:

- **Ownership transfer** as a transferable credential (not a mutation of identity)
- **Encumbrances**: lien, insurance, inspection, warranty, escrow credentials
- **Provenance**: an auditable chain of custody and title history
- **Fractional ownership / tokenization** of a single underlying asset
- **Custody** and controller relationships
- **Lifecycle**: active, sold, destroyed, lost, seized, retired, superseded
- **Regulatory surface**: securities-style rules for tokenized RWAs

This is comparable in weight to the scoped-grant and delegation machinery that
justifies AgenticDID being its own repo.

## What RWAz does NOT own

RWAz does not re-implement the shared identity primitives. Those live once in the
DIDz root layer and in `midnight-modules` (entity registry, lifecycle status,
credential registry, merkle membership, commitment/nullifier, recovery). RWAz
imports them and adds only the ownership and provenance layer. This prevents three
drifting copies of the same registry across DIDz, AgenticDID, and RWAz.

## Entity types RWAz covers

```text
ObjectDIDz ....  physical objects (machine, server, robot, medical device,
                 shipping container, Raspberry Pi)
RWADIDz .......  real-world assets (house, car, land parcel, diamond, painting,
                 gold bar, tokenized treasury)
```

## Credential model (sketch)

```text
CarDIDz            = this specific car exists (permanent)
TitleCredential    = who owns it right now (transferable)
LienCredential     = a lender's claim
InsuranceCredential= current insurance status
InspectionCredential = current inspection status
ProvenanceRecord   = auditable chain of prior titles/custody
```

## Ecosystem consumers

RWAz is designed to be the shared substrate that today's RWA-adjacent DIDz
products build on instead of reinventing ownership:

- `SilentLedger` (asset verification, private orderbooks)
- `equineProData`, `petProData` (animals as real-world assets)
- `DownMan` (estate, inheritance, controlled asset migration)
- `safeHealthData` (medical devices as objects)
- tokenized-treasury and fractional-ownership use cases

## Status

**Implemented** (July 2026, compactc 0.31.1):
- `rwa_registry.compact`, 6 circuits: register, transfer, assert_i_own, add/release encumbrance, retire
- `rwa_credentials.compact`, 5 circuits: issue, revoke, prove, is_live, advance_epoch

Compiles clean with full ZK key generation. Privacy-first per ruling #0.

## Documents

- `docs/ARCHITECTURE.md`, RWAz architecture
- `docs/DIVISION_OF_LABOR.md`, exactly what belongs in DIDz root vs RWAz
- `ROADMAP.md`, phased build plan
- `contracts/README.md`, planned contracts

## Author

John M.P. Santi, EnterpriseZK Labs LLC. Part of the DIDz ecosystem.

---

## DIDz Ecosystem

This project is part of the DIDz ecosystem, a suite of privacy-preserving
identity, credential, and application tools built on Midnight Network.

![DIDz Ecosystem Map](docs/DIDz-ecosystem-map.png)

See the full ecosystem map above, or visit [didz.io](https://didz.io) for details.
