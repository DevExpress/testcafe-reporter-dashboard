import { readFileSync } from 'fs';
import { CIInfo } from '../types/dashboard';

const { env } = process;

interface EventInfo {
    'pull_request': {
        user: {
            login: string;
        };
    };
}

function getEventInfo (): EventInfo {
    const rawEvent = readFileSync(env.GITHUB_EVENT_PATH, 'utf8');

    return JSON.parse(rawEvent);
}

export function getGithubActionsInfo (): CIInfo {
    const event = getEventInfo();

    return {
        author: event.pull_request.user.login
    };
}
