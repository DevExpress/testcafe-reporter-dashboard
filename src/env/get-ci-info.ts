import { getGithubActionsInfo } from './github-actions';
import { CIInfo } from '../types/dashboard';
import {
    isGithubActions,
} from './ci-detection';

export async function getCIInfo (): Promise<CIInfo> {
    let info = {
        author: ''
    };

    if (isGithubActions)
        info = await getGithubActionsInfo();

    return info;
}
