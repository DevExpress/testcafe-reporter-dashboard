import { readFileSync as fsReadFileSync } from 'fs';
import { CIInfo } from '../types/task-start-args';
import reporterLogger from '../logger';
import { createGithubInfoError } from '../texts';

const { env } = process;

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
    let event: EventInfo = {
        'pull_request': {
            head: { sha: '', ref: '' },
            user: { login: '' }
        }
    };

    try {
        const rawEvent = readFileSync(env.GITHUB_EVENT_PATH as string, 'utf8');

        event = JSON.parse(rawEvent) as EventInfo;
    }
    catch (error) {
        logger.error(createGithubInfoError(error.toString()));
    }

    return {
        commitSHA:  event.pull_request.head.sha,
        author:     event.pull_request.user.login,
        branchName: event.pull_request.head.ref
    };
}
