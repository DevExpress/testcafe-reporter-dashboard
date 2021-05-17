import assert from 'assert';
import mock from 'mock-require';

describe('CI detection', () => {
    const modulePath = '../../src/env/ci-detection';

    it('Should detect Github Actions', () => {
        const originalValue = process.env.GITHUB_ACTIONS;

        process.env.GITHUB_ACTIONS = '';

        let { isGithubActions } = mock.reRequire(modulePath);

        assert.equal(isGithubActions, false);

        process.env.GITHUB_ACTIONS = 'true';

        isGithubActions = mock.reRequire(modulePath).isGithubActions;

        assert.equal(isGithubActions, true);

        process.env.GITHUB_ACTIONS = originalValue;
    });

    it('Should detect Bitbucket Pipelines', () => {

    });
});
