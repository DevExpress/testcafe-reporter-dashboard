import { promiseReadFile } from './utils';
import { CIInfo } from '../types/dashboard';

const { env } = process;

interface EventInfo {
    'pull_request': {
        user: {
            login: string;
        };
    };
}

async function getEventInfo (): Promise<EventInfo> {
    const rawEvent = await promiseReadFile(env.GITHUB_EVENT_PATH, 'utf8');

    return JSON.parse(rawEvent);
}

export async function getGithubActionsInfo (): Promise<CIInfo> {
    const event = await getEventInfo();

    return {
        author: event.pull_request.user.login
    };
}
