const { runStructuralTests } = require('../../midnight-modules/tests/structural-test-helper.cjs');
const path = require('path');

runStructuralTests('accredited_transfer', path.join(__dirname, '..', 'build', 'accredited-transfer', 'contract', 'index.d.ts'), {
  expected: [
    'allow_country', 'assert_recipient_accredited', 'compute_challenge_for_assertion', 'disallow_country',
    'find_accreditation_path', 'freeze_holder', 'get_challenge_reduction', 'onboard', 'unfreeze_holder',
  ],
  mustHave: ['onboard', 'assert_recipient_accredited', 'allow_country', 'freeze_holder', 'unfreeze_holder'],
});
