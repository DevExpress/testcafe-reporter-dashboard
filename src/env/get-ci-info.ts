import { getAppVeyorInfo } from './app-veyor';
import { getAWSCodeBuildInfo } from './aws-code-build';
import { getBambooInfo } from './bamboo';
import { getBitbucketPipelinesInfo } from './bitbucket-pipelines';
import { getCircleCIInfo } from './circle-ci';
import { getGithubActionsInfo } from './github-actions';
import { getJenkinsInfo } from './jenkins';
import { CIInfo } from '../types/task-start-args';
import {
    CISystems,
    detectCISystem
} from './ci-detection';

const CIInfoGetters = {
    [CISystems.appVeyor]:           getAppVeyorInfo,
    [CISystems.awsCodeBuild]:       getAWSCodeBuildInfo,
    [CISystems.bamboo]:             getBambooInfo,
    [CISystems.bitbucketPipelines]: getBitbucketPipelinesInfo,
    [CISystems.githubActions]:      getGithubActionsInfo,
    [CISystems.circleCI]:           getCircleCIInfo,
    [CISystems.jenkins]:            getJenkinsInfo
};

export function getCIInfo (): CIInfo | undefined {
    let info: CIInfo | undefined;

    const CISystem = detectCISystem();

    if (CISystem)
        return CIInfoGetters[CISystem]();

    return info;
}
