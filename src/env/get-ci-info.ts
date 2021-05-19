import { getGithubActionsInfo } from './github-actions';
import { getBitbucketPipelinesInfo } from './bitbucket-pipelines';
import { getJenkinsInfo } from './jenkins';
import { CIInfo } from '../types/task-start-args';
import {
    CISystems,
    detectCISystem
} from './ci-detection';

const CIInfoGetters = {
    [CISystems.githubActions]:      getGithubActionsInfo,
    [CISystems.bitbucketPipelines]: getBitbucketPipelinesInfo,
    [CISystems.jenkins]:            getJenkinsInfo
};

export function getCIInfo (): CIInfo | undefined {
    let info: CIInfo | undefined;

    const CISystem = detectCISystem();

    if (CISystem)
        return CIInfoGetters[CISystem]();

    return info;
}
