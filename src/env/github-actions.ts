import { readFileSync as fsReadFileSync } from 'fs';
import { CIInfo } from '../types/dashboard';

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
    readFileSync: typeof fsReadFileSync
): CIInfo {
    const rawEvent = readFileSync(env.GITHUB_EVENT_PATH, 'utf8');
    const event = JSON.parse(rawEvent) as EventInfo;

    return {
        commitSHA:  event.pull_request.head.sha,
        author:     event.pull_request.user.login,
        branchName: event.pull_request.head.ref
    };
}
