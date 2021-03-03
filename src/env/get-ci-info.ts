import { readFileSync } from 'fs';
import { getGithubActionsInfo } from './github-actions';
import { CIInfo } from '../types/task-start-args';
import {
    isGithubActions,
} from './ci-detection';

export function getCIInfo (): CIInfo | undefined {
    let info: CIInfo | undefined;

    if (isGithubActions)
        info = getGithubActionsInfo(readFileSync);

    return info;
}
