import { CIInfo } from '../types/task-start-args';

export function getJenkinsInfo (): CIInfo {
    const { env } = process;

    return {
        commitSHA:  env.GIT_COMMIT,
        branchName: env.GIT_BRANCH,
        author:     env.GIT_AUTHOR_NAME || env.GIT_COMMITTER_NAME
    };
};
