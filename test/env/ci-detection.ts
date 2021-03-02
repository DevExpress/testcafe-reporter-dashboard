import assert from 'assert';
import mock from 'mock-require';

describe('CI detection', () => {
    it('Should detect Github Actions', () => {
        let { isGithubActions } = mock.reRequire('../src/env/ci-detection');

        assert.equal(isGithubActions, false);

        process.env.GITHUB_ACTIONS = 'true';

        isGithubActions = mock.reRequire('../src/env/ci-detection').isGithubActions;

        assert.equal(isGithubActions, true);
    });
});
