import assert from 'assert';
import mock from 'mock-require';

describe('getGithubActionsInfo()', () => {
    const modulePath = '../../src/env/github-actions';
    let getGithubActionsInfo = mock.reRequire(modulePath);
    let readResult = '';

    before(() => {
        mock('fs', { readFileSync: () => readResult });
        getGithubActionsInfo = mock.reRequire(modulePath).getGithubActionsInfo;
    });

    afterEach(() => {
        readResult = '';
    });

    after(() => {
        mock.stopAll();
    });

    it('Should detect author name', () => {
        const name = 'Luke';

        readResult = JSON.stringify({
            'pull_request': { user: { login: name } }
        });

        assert.deepEqual(getGithubActionsInfo(), {
            author: name
        });
    });
});
