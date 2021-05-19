import assert from 'assert';
import { getBitbucketPipelinesInfo } from '../../src/env/bitbucket-pipelines';

describe('getBitbucketPipelinesInfo', () => {
    const originalVariables = {
        BITBUCKET_COMMIT: process.env.BITBUCKET_COMMIT,
        BITBUCKET_BRANCH: process.env.BITBUCKET_BRANCH
    };

    after(() => {
        process.env.BITBUCKET_COMMIT = originalVariables.BITBUCKET_COMMIT;
        process.env.BITBUCKET_BRANCH = originalVariables.BITBUCKET_BRANCH;
    });

    it('should give commit info', () => {
        const sha        = 'commit sha';
        const branchName = 'branchName';

        process.env.BITBUCKET_COMMIT = sha;
        process.env.BITBUCKET_BRANCH = branchName;

        assert.deepEqual(getBitbucketPipelinesInfo(), {
            commitSHA: sha,
            branchName
        });
    });
});
