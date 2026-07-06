const { runStructuralTests } = require('../../midnight-modules/tests/structural-test-helper.cjs');
const path = require('path');

runStructuralTests('rwa-registry', path.join(__dirname, '..', 'build', 'rwa-registry', 'contract', 'index.d.ts'), {
  expected: ['add_encumbrance', 'assert_i_own', 'register_object', 'release_encumbrance', 'retire_object', 'transfer_ownership'],
  mustHave: ['register_object', 'transfer_ownership', 'assert_i_own', 'retire_object'],
  forbidden: ['delete_object', 'burn_object'],
});

runStructuralTests('rwa-credentials', path.join(__dirname, '..', 'build', 'rwa-credentials', 'contract', 'index.d.ts'), {
  expected: ['advance_epoch', 'is_credential_live', 'issue_credential', 'prove_credential', 'revoke_credential'],
  mustHave: ['issue_credential', 'revoke_credential', 'prove_credential'],
});
