import { readFileSync as fsReadFileSync } from 'fs';
import { CIInfo } from '../types/task-start-args';
import reporterLogger from '../logger';
import { createGithubInfoError } from '../texts';
import { getEnvVariable } from './utils';

interface EventInfo {
    'pull_request': {
        user: {
            login: string;
        };
        head: {
            ref: string;
            sha: string;
        };
    };
}

export function getGithubActionsInfo (
    readFileSync: typeof fsReadFileSync,
    logger: typeof reporterLogger
): CIInfo {
    let event;

    try {
        const rawEvent = readFileSync(process.env.GITHUB_EVENT_PATH as string, 'utf8');

        event = JSON.parse(rawEvent) as EventInfo;

        if (event && event.pull_request) {
            return {
                commitSHA:  event.pull_request.head.sha,
                author:     event.pull_request.user.login,
                branchName: event.pull_request.head.ref
            };
        }
    }
    catch (error) {
        logger.error(createGithubInfoError(error.toString()));
    }

    return {
        commitSHA:  getEnvVariable('GITHUB_SHA'),
        author:     getEnvVariable('GITHUB_ACTOR'),
        branchName: getEnvVariable('GITHUB_HEAD_REF') || getEnvVariable('GITHUB_REF')
    };
}
