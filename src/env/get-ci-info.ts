import { getGithubActionsInfo } from './github-actions';
import { getBitbucketPipelinesInfo } from './bitbucket-pipelines';
import { CIInfo } from '../types/task-start-args';
import {
    isGithubActions,
    isBitbucketPipelines
} from './ci-detection';

export function getCIInfo (): CIInfo | undefined {
    let info: CIInfo | undefined;

    if (isGithubActions)
        info = getGithubActionsInfo();
    
    if (isBitbucketPipelines)
        info = getBitbucketPipelinesInfo();

    return info;
}
