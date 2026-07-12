# PrivateEye + ZKsplunk OPSEC Integration

> **Canonical spec:** [`PrivateEye/docs/PRIVATEEYE_ZKSPLUNK_OPSEC.md`](../PrivateEye/docs/PRIVATEEYE_ZKSPLUNK_OPSEC.md)

## RWAz's Role

RWAz represents real-world assets, their claims, attestations, ownership,
control, and lifecycle state. PrivateEye answers useful asset questions without
exposing confidential owners, valuations, locations, counterparties, or
documents.

**RWAz tells the ecosystem what an object is and which claims apply. PrivateEye
controls which claims may be revealed. ZKsplunk watches for asset-related abuse
and operational anomalies.**

### Examples

- "Is the asset insured?" instead of exposing the policy.
- "Is the owner authorized to transfer it?" instead of exposing full identity records.
- "Has the inspection requirement been satisfied?" instead of exposing the complete report.

### What ZKsplunk Observes from RWAz

- Conflicting ownership claims
- Unusual transfer attempts
- Repeated valuation probing
- Suspicious attestation patterns
- Unauthorized metadata correlation
- Rapid changes in control
- Attempts to infer hidden counterparties
- Asset activity inconsistent with jurisdictional rules
