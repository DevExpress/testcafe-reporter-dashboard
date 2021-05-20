import { CIInfo } from '../types/task-start-args';

export function getCircleCIInfo (): CIInfo {
    const { env } = process;

    return {
        commitSHA:  env.CIRCLE_SHA1,
        branchName: env.CIRCLE_BRANCH,
        author:     env.CIRCLE_USERNAME
    };
};
