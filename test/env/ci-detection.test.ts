import assert from 'assert';
import mock from 'mock-require';

describe('CI detection', () => {
    const modulePath = '../../src/env/ci-detection';

    it('Should detect Github Actions', () => {
        let { isGithubActions } = mock.reRequire(modulePath);

        assert.equal(isGithubActions, false);

        process.env.GITHUB_ACTIONS = 'true';

        isGithubActions = mock.reRequire(modulePath).isGithubActions;

        assert.equal(isGithubActions, true);
    });
});
