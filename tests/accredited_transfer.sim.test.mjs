// accredited_transfer.sim.test.mjs — END-TO-END: KYCz IDP assertion -> RWAz eligibility gate.
//
// Real compiled circuits (build/accredited-transfer) on a simulated chain. The KYCz
// IDP (KYCz/src/idp) signs a KycAssertion off-chain; `onboard` verifies it in-circuit
// and adds the holder to the accredited Merkle set; `assert_recipient_accredited`
// is the guard a gated transfer would call.
//
// Prereq:  compact compile contracts/accredited_transfer.compact build/accredited-transfer
//          compact compile ../KYCz/contracts/PassportCredential.compact ../KYCz/build/PassportCredential
// Run:     node --test tests/accredited_transfer.sim.test.mjs

import { describe, it, before } from 'node:test';
import assert from 'node:assert/strict';
import { pathToFileURL } from 'node:url';
import path from 'node:path';
import * as rt from '@midnight-ntwrk/compact-runtime';
import { challengeReductionWitness } from '../../midnight-modules/modules/signed-credential/signer.mjs';
import { KyczIdentityProvider } from '../../KYCz/src/idp/credential-service.mjs';

const here = path.dirname(new URL(import.meta.url).pathname);
const CONTRACT_PATH = path.join(here, '..', 'build', 'accredited-transfer', 'contract', 'index.js');
const COIN_PUBLIC_KEY = '0'.repeat(64);
const IDP_SECRET = 0x0b5e_55ed_1d9c_0ffe_e15c_0ffe_e00d_babe_c0de_4b1d_1234n;

const bytes32 = (label) => { const b = new Uint8Array(32); b.set(Buffer.from(label, 'utf8').subarray(0, 32)); return b; };
const asciiField = (s) => BigInt('0x' + Buffer.from(s, 'ascii').toString('hex'));

// Actors: each is a 32-byte secret; the contract derives H("midnight:mm:pk:", sk).
const ISSUER = bytes32('rwaz:test:issuer');
const ALICE = bytes32('rwaz:test:alice');   // UTO national, adult
const BOB = bytes32('rwaz:test:bob');       // never onboards
const CAROL = bytes32('rwaz:test:carol');   // disallowed nationality

describe('accredited_transfer — KYCz assertion -> RWAz gate simulator', () => {
  let mod, idp, contract, context, pk;

  const witnesses = {
    get_challenge_reduction: challengeReductionWitness,
    local_secret_key: (ctx) => [ctx.privateState, ctx.privateState.secretKey],
    find_accreditation_path: (ctx, leaf) => {
      const found = ctx.ledger.accredited_holders.findPathForLeaf(leaf);
      if (!found) throw new Error('Recipient is not in the accredited set');
      return [ctx.privateState, found];
    },
  };

  before(async () => {
    mod = await import(pathToFileURL(CONTRACT_PATH).href);
    idp = await KyczIdentityProvider.create(IDP_SECRET, { rwazContractPath: CONTRACT_PATH });
    contract = new mod.Contract(witnesses);
    pk = (sk) => mod.pureCircuits.derive_public_key(sk);
    const ctor = contract.initialState(rt.createConstructorContext({ secretKey: ISSUER }, COIN_PUBLIC_KEY), pk(ISSUER), idp.publicKey);
    context = rt.createCircuitContext(rt.dummyContractAddress(), COIN_PUBLIC_KEY, ctor.currentContractState.data, ctor.currentPrivateState);
  });

  // Actor switch = whose secret the witness hands the circuit.
  const as = (actorSecret, name, ...args) => {
    context.currentPrivateState = { secretKey: actorSecret };
    const out = contract.circuits[name](context, ...args);
    context = out.context;
    return out.result;
  };
  const ledger = () => mod.ledger(context.currentQueryContext.state);
  const assertionFor = (actorSecret, nationality, isAdult = true) =>
    idp.issueKycAssertion({ subjectCommitment: 0n, nationality, isAdult });

  it('deploy seals the issuer commitment and the KYCz IDP key', () => {
    assert.deepEqual(ledger().issuer_public_key, pk(ISSUER));
    assert.deepEqual(ledger().kycz_idp_public_key, idp.publicKey);
  });

  it('only the issuer can edit the country policy', () => {
    assert.throws(() => as(ALICE, 'allow_country', asciiField('UTO')), /not the issuer/);
    as(ISSUER, 'allow_country', asciiField('UTO'));
    assert.ok(ledger().allowed_countries.member(asciiField('UTO')));
  });

  it('onboard: rejects before the holder\'s country is allowed', () => {
    assert.throws(() => as(CAROL, 'onboard', assertionFor(CAROL, 'MID')), /nationality not allowed/);
  });

  it('onboard: rejects a KYCz assertion that says not-adult', () => {
    assert.throws(() => as(ALICE, 'onboard', assertionFor(ALICE, 'UTO', false)), /not an adult/);
  });

  it('onboard: rejects an assertion not signed by the KYCz IDP', async () => {
    const rogue = new KyczIdentityProvider(0xbad_1dea_5eedn, undefined, mod);
    const forged = rogue.issueKycAssertion({ subjectCommitment: 0n, nationality: 'UTO', isAdult: true });
    assert.throws(() => as(ALICE, 'onboard', forged), /not signed by trusted issuer/);
  });

  it('onboard: accepts a valid KYCz assertion and grows the accredited set', () => {
    as(ALICE, 'onboard', assertionFor(ALICE, 'UTO'));
    assert.equal(ledger().total_onboarded, 1n);
  });

  it('guard: passes for an onboarded recipient, fails for a stranger', () => {
    assert.doesNotThrow(() => as(ISSUER, 'assert_recipient_accredited', pk(ALICE)));
    assert.throws(() => as(ISSUER, 'assert_recipient_accredited', pk(BOB)), /not in the accredited set/);
  });

  it('guard: a frozen holder fails until unfrozen (issuer-only controls)', () => {
    assert.throws(() => as(ALICE, 'freeze_holder', pk(ALICE)), /not the issuer/);
    as(ISSUER, 'freeze_holder', pk(ALICE));
    assert.throws(() => as(ISSUER, 'assert_recipient_accredited', pk(ALICE)), /Recipient is frozen/);
    as(ISSUER, 'unfreeze_holder', pk(ALICE));
    assert.doesNotThrow(() => as(ISSUER, 'assert_recipient_accredited', pk(ALICE)));
  });

  it('disallow_country closes the door for new onboarding', () => {
    as(ISSUER, 'disallow_country', asciiField('UTO'));
    assert.throws(() => as(BOB, 'onboard', assertionFor(BOB, 'UTO')), /nationality not allowed/);
  });
});
