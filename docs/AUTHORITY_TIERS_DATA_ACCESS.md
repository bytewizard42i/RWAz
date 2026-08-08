# Authority-Tiered Data Access (pointer)

**RWAz** objects are queried through the **HelixCTW** gateway, and the same
query returns different result-set visibility depending on the caller's
authority tier.

**How RWAz fits:** RWAz provides the objects being queried. The
`rwa_registry.compact` stores descriptor hashes; the encrypted descriptor
bundles live on Filecoin; the gateway gates which fields of those bundles are
visible based on the caller's authority.

**Authority sources (composed at query time):**
- **DIDz** identity (who is asking)
- **AgenticDID** scoped grants (native authority tier)
- **Trusted-issuer credentials** (legacy permissions: prequalification letters,
  professional licenses, institutional endorsements, resolved via
  `TrustedIssuerRegistry.compact`)

**Canonical example (real estate):** A user searches for houses in a price
range. Tier 1 (public) sees coarse metadata and ZIP-level location. Tier 2
(prequalified buyer, via a bank's trusted-issuer credential) sees full address,
inspection summary, and encumbrance status. Tier 3 (licensed agent) sees price
history and comparables. Tier 4 (institutional) sees title chain depth and
compliance history. The query is identical; only the SELECT changes.

**RWAz contract impact:** None. The object registry already stores descriptor
hashes and owner commitments. Tiered access is a gateway GATE-step refinement,
not a contract change.

## NIGHTGATE projection boundary

NIGHTGATE may serve as a planned CAP/OData transport for a projection that the
HelixCTW GATE step has already authorized. It must not infer access from the
mere possession of a NIGHTGATE bearer grant. That grant authorizes transport
and budget only; DIDz identity, AgenticDID scoped authority, trusted issuer
credentials, and RWAz state still determine what the caller may see or do.

NIGHTGATE and NIGHTGATE-MCP are not a fifth engine, a data authority, a title
authority, or proof of ownership. The projection must preserve row-level
authorization and return only fields allowed by the verified tier. Never place
wallet seeds, private keys, bearer tokens, title documents, private evidence,
or ZK witnesses in repository files, examples, fixtures, logs, telemetry, or
MCP prompts.

**Canonical specification:**
`helixctw/docs/AUTHORITY_TIERS_DATA_ACCESS.md`
