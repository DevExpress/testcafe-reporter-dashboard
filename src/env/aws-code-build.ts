import { CIInfo } from '../types/task-start-args';

export function getAWSCodeBuildInfo (): CIInfo {
    const { env } = process;

    return {
        commitSHA: env.CODEBUILD_RESOLVED_SOURCE_VERSION
    };
};
