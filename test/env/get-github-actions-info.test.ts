import assert from 'assert';
import mock from 'mock-require';

describe('getGithubActionsInfo()', () => {
    const errors: string[] = [];

    const loggerMock = {
        error: err => errors.push(err)
    };

    mock('../../src/logger', loggerMock);

    afterEach(() => {
        errors.length = 0;
    });

    after(mock.stopAll);

    it('Should detect author name', () => {
        const name = 'Luke';
        const sha = 'commit sha';
        const branchName = 'branchName';
        const eventPath = 'testPath';
        let path = '';
        let encoding = '';

        process.env.GITHUB_EVENT_PATH = eventPath;

        const readFileSync = (filePath, enc) => {
            path = filePath;
            encoding = enc;

            return JSON.stringify({
                'pull_request': {
                    user: { login: name },
                    head: {
                        ref: branchName,
                        sha
                    }
                }
            });
        };

        mock('fs', { readFileSync });

        const getGithubActionsInfo = mock.reRequire('../../src/env/github-actions').getGithubActionsInfo;

        assert.deepEqual(getGithubActionsInfo(readFileSync, loggerMock), {
            commitSHA: sha,
            author:    name,
            branchName
        });
        assert.equal(path, eventPath);
        assert.equal(encoding, 'utf8');
    });

    it('Should log errors', () => {
        const error        = new Error('Some error');
        const readFileSync = () => {
            throw error;
        };

        mock('fs', { readFileSync });
        const getGithubActionsInfo = mock.reRequire('../../src/env/github-actions').getGithubActionsInfo;

        getGithubActionsInfo();

        assert.deepEqual(errors, [
            `Could not retrieve information from the Github Actions environment due to an error: ${error.toString()}`
        ]);
    });
});
