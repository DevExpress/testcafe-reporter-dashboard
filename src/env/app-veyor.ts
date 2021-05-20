import { CIInfo } from '../types/task-start-args';

export function getAppVeyorInfo (): CIInfo {
    const { env } = process;

    return {
        commitSHA:  env.APPVEYOR_REPO_COMMIT,
        branchName: env.APPVEYOR_REPO_BRANCH,
        author:     env.APPVEYOR_REPO_COMMIT_AUTHOR
    };
};
