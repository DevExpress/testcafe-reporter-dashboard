import assert from 'assert';
import { getJenkinsInfo } from '../../src/env/jenkins';

describe('getJenkinsInfo', () => {
    const originalVariables = {
        GIT_COMMIT:      process.env.GIT_COMMIT,
        GIT_BRANCH:      process.env.GIT_BRANCH,
        GIT_AUTHOR_NAME: process.env.GIT_AUTHOR_NAME
    };

    after(() => {
        process.env.GIT_COMMIT      = originalVariables.GIT_COMMIT;
        process.env.GIT_BRANCH      = originalVariables.GIT_BRANCH;
        process.env.GIT_AUTHOR_NAME = originalVariables.GIT_AUTHOR_NAME;
    });

    it('should give commit info', () => {
        const sha        = 'commit sha';
        const branchName = 'branchName';
        const author     = 'authorName';

        process.env.GIT_COMMIT      = sha;
        process.env.GIT_BRANCH      = branchName;
        process.env.GIT_AUTHOR_NAME = author;

        assert.deepEqual(getJenkinsInfo(), {
            commitSHA: sha,
            branchName,
            author
        });
    });
});
