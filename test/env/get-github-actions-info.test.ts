import { readFileSync as fsReadFileSync } from 'fs';
import assert from 'assert';

import { getGithubActionsInfo } from '../../src/env/github-actions';

describe('getGithubActionsInfo()', () => {
    const errors: string[] = [];
    const loggerMock = {
        error: err => errors.push(err),
        log:   console.log,
        warn:  console.warn
    };

    let githubEventPath;
    let githubSha;
    let githubActor;
    let githubRef;

    beforeEach(() => {
        githubEventPath = process.env.GITHUB_EVENT_PATH;
        githubSha       = process.env.GITHUB_SHA;
        githubActor     = process.env.GITHUB_ACTOR;
        githubRef       = process.env.GITHUB_REF;
    });

    afterEach(() => {
        process.env.GITHUB_EVENT_PATH = githubEventPath;
        process.env.GITHUB_SHA = githubSha;
        process.env.GITHUB_ACTOR = githubActor;
        process.env.GITHUB_REF = githubRef;

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
        const readFileSync = (() => {
            throw error;
        }) as typeof fsReadFileSync;

        getGithubActionsInfo(readFileSync, loggerMock);

        assert.deepEqual(errors, [
            `Cannot retrieve information from the Github Actions environment due to an error: ${error.toString()}`
        ]);
    });

    it('Should get info from env if actions trigger is not pull_request', () => {
        const name   = 'Luke';
        const sha    = 'commit sha';
        const branch = 'branchName';
        const eventPath = 'testPath';

        process.env.GITHUB_EVENT_PATH = eventPath;
        process.env.GITHUB_SHA = sha;
        process.env.GITHUB_ACTOR = name;
        process.env.GITHUB_REF = branch;

        const readFileSync = ((path: number, options: string) => {
            return JSON.stringify({ path, options });
        }) as (typeof fsReadFileSync);

        assert.deepEqual(getGithubActionsInfo(readFileSync, loggerMock), {
            commitSHA:  sha,
            author:     name,
            branchName: branch
        });
    });
});
