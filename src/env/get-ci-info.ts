import { getGithubActionsInfo } from './github-actions';
import { CIInfo } from '../types/dashboard';
import {
    isGithubActions,
} from './ci-detection';

export function getCIInfo (): CIInfo {
    let info = {
        author: ''
    };

    if (isGithubActions)
        info = getGithubActionsInfo();

    return info;
}
