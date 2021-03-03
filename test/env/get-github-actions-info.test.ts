import { readFileSync as fsReadFileSync } from 'fs';
import assert from 'assert';

describe('getGithubActionsInfo()', () => {
    it('Should detect author name', () => {
        const name = 'Luke';
        const eventPath = 'testPath';
        let path = '';
        let encoding = '';

        process.env.GITHUB_EVENT_PATH = eventPath;

        const getGithubActionsInfo = require('../../src/env/github-actions').getGithubActionsInfo;

        const readFileSync = ((filePath, enc) => {
            path = filePath;
            encoding = enc;

            return JSON.stringify({
                'pull_request': { user: { login: name } }
            });
        }) as typeof fsReadFileSync;

        assert.deepEqual(getGithubActionsInfo(readFileSync), {
            author: name
        });
        assert.equal(path, eventPath);
        assert.equal(encoding, 'utf8');
    });
});
