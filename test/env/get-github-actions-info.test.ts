import { readFileSync as fsReadFileSync } from 'fs';
import assert from 'assert';

describe('getGithubActionsInfo()', () => {
    const errors = [];
    const loggerMock = {
        error: err => errors.push(err)
    };

    afterEach(() => {
        errors.length = 0;
    });

    it('Should detect author name', () => {
        const name = 'Luke';
        const sha = 'commit sha';
        const branchName = 'branchName';
        const eventPath = 'testPath';
        let path = '';
        let encoding = '';

        process.env.GITHUB_EVENT_PATH = eventPath;

        const getGithubActionsInfo = require('../../src/env/github-actions').getGithubActionsInfo;

        const readFileSync = ((filePath, enc) => {
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
        }) as typeof fsReadFileSync;

        assert.deepEqual(getGithubActionsInfo(readFileSync, loggerMock), {
            commitSHA: sha,
            author:    name,
            branchName
        });
        assert.equal(path, eventPath);
        assert.equal(encoding, 'utf8');
    });

    it('Should log errors', () => {
        const error = new Error('Some error');
        const getGithubActionsInfo = require('../../src/env/github-actions').getGithubActionsInfo;

        const readFileSync = (() => {
            throw error;
        }) as typeof fsReadFileSync;

        getGithubActionsInfo(readFileSync, loggerMock);

        assert.deepEqual(errors, [
            `Could not retrieve information from Github Actions environment due to an error: ${error.toString()}`
        ]);
    });
});
