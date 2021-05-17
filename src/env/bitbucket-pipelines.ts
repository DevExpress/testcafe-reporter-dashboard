import { CIInfo } from '../types/task-start-args';

export function getBitbucketPipelinesInfo (): CIInfo {
    const { env } = process;

    return {
        commitSHA:  env.BITBUCKET_COMMIT,
        branchName: env.BITBUCKET_BRANCH
    };
};