import { DASHBOARD_LOCATION_NOT_DEFINED, AUTHENTICATION_TOKEN_NOT_DEFINED } from './texts';
import {
    TESTCAFE_DASHBOARD_AUTHENTICATION_TOKEN as AUTHENTICATION_TOKEN,
    TESTCAFE_DASHBOARD_URL,
    ENABLE_LOG
} from './env-variables';
import { ResolveCommand } from './types/resolve';

import fetch from './fetch';
import logger from './logger';

const CONCURRENT_ERROR_CODE = 408;
const MAX_RETRY_COUNT       = 5;

if (!TESTCAFE_DASHBOARD_URL)
    logger.error(DASHBOARD_LOCATION_NOT_DEFINED);

if (!AUTHENTICATION_TOKEN)
    logger.error(AUTHENTICATION_TOKEN_NOT_DEFINED);

function removeNullValues (key, value) {
    if (value !== null) return value;
}

async function sendCommand (command: ResolveCommand) {
    return fetch(`${TESTCAFE_DASHBOARD_URL}/api/commands/`, {
        method:  'POST',
        headers: {
            'Content-Type': 'application/json',
            'Cookie':       `tc-dashboard-jwt=${AUTHENTICATION_TOKEN}`
        },

        body: JSON.stringify(command, removeNullValues)
    });
}

export default async function sendResolveCommand (command: ResolveCommand): Promise<void> {
    const { aggregateId, type: commandType } = command;

    if (!AUTHENTICATION_TOKEN)
        return;

    let response   = null;
    let retryCount = 0;

    do {
        response = await sendCommand(command);

        retryCount++;

        if (!response.ok)
            logger.error(`${aggregateId} ${commandType} ${response}`);
        else if (ENABLE_LOG)
            logger.log(response);

    } while (response.status === CONCURRENT_ERROR_CODE && retryCount <= MAX_RETRY_COUNT)
}
