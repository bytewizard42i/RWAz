# RWAz review and repair punch list

Clara, September 5, 2026. Reviewed revision: `d8bc5ace6f9d9431a7f9e231ec6a343ecdda317a`.

`node --test tests/contracts.test.cjs` passed seven structural tests. This pass did not run a compiler, prove a transaction, or verify a deployment.

## Highest-priority integration gap

The shared kernel does not automatically call `ObjectProvider` in `perform` or `query`. The current action/receipt flow does not bind ownership evidence to execution. An application can check an owner and later act after that fact changes unless its adapter adds stronger controls.

Done criteria: bind object identifier, owner, state revision or commitment, intended operation, expiry and nonce into the authorization and receipt; reject changed ownership and stale encumbrances at execution; record final settlement evidence. Exercise concurrent transfers, stale reads, retries, revoked authority and failure after reservation.

## Product opportunity

Use the existing identity, authority and object seams for one small verifiable asset-release flow. Keep the first deliverable a synthetic integration with explicit evidence labels. Atomic transfer and legal title effects require their own implementations and evidence; passing structural checks does not supply either.
