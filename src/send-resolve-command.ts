import fetch from 'isomorphic-fetch';
import {
    ENABLE_LOG,
    TESTCAFE_DASHBOARD_AUTHORIZATION_TOKEN as AUTHORIZATION_TOKEN,
    TESTCAFE_DASHBOARD_URL
} from './env-variables';

const CONCURRENT_ERROR_CODE = 408;
const SUCCESS_STATUS_CODE   = 200;
const MAX_RETRY_COUNT       = 5;

let dashboardLocation = TESTCAFE_DASHBOARD_URL;

if (!dashboardLocation) {
    dashboardLocation = 'http://localhost:3000';

    console.warn(`The 'TESTCAFE_DASHBOARD_URL' environment variable is not defined. The ${dashboardLocation} url will be used by default.`)
}

if (!AUTHORIZATION_TOKEN)
    console.error('\'TESTCAFE_DASHBOARD_AUTHORIZATION_TOKEN\' is not defined');

async function sendCommand (id, commandType, payload) {
    return fetch(`${dashboardLocation}/api/commands/`, {
        method:  'POST',
        headers: {
            'Content-Type': 'application/json',
            'Cookie':       `tc-dashboard-jwt=${AUTHORIZATION_TOKEN}`
        },

        body: JSON.stringify({
            type:          commandType,
            aggregateId:   id,
            aggregateName: 'Report',
            payload:       payload
        })
    });
}

export default async function sendResolveCommand (id, commandType, payload) {
    if (!AUTHORIZATION_TOKEN)
        return;

    let response   = null;
    let retryCount = 0;

    do {
        try {
            response = await sendCommand(id, commandType, payload);
        }
        catch (e) {
            console.error(`${id}, ${commandType}, ${retryCount}, ${e.message}`);

            return;
        }

        retryCount++;

        const message = `${commandType} ${retryCount}: ${response.status} ${response.statusText}`;

        if (response.status !== SUCCESS_STATUS_CODE)
            console.error(message);
        else if (ENABLE_LOG)
            console.log(message);

    } while (response.status === CONCURRENT_ERROR_CODE && retryCount <= MAX_RETRY_COUNT)
}
