const http  = require('http');
const fetch = require('isomorphic-fetch');

const CONCURRENT_ERROR_CODE = 408;

const MAX_RETRY_COUNT     = 5;
const ENABLE_LOG          = process.env.ENABLE_LOG;
const AUTHORIZATION_TOKEN = process.env.TESTCAFE_DASHBOARD_AUTHORIZATION_TOKEN;
let   DASHBOARD_LOCATION  = process.env.TESTCAFE_DASHBOARD_URL;

if (!DASHBOARD_LOCATION) {
    DASHBOARD_LOCATION = 'http://localhost:3000';

    console.warn(`The 'TESTCAFE_DASHBOARD_URL' environment variable is not defined. The ${DASHBOARD_LOCATION} url will be used by default.`)
}

if (!AUTHORIZATION_TOKEN)
    console.error('\'TESTCAFE_DASHBOARD_AUTHORIZATION_TOKEN\' is not defined');

async function sendCommand (id, commandType, payload) {
    return new Promise(async (resolve) => {
        fetch(`${DASHBOARD_LOCATION}/api/commands/`, {
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

        if (response.status !== 200)
            console.error(message);
        else if (ENABLE_LOG)
            console.log(message);

    } while (response.status === CONCURRENT_ERROR_CODE && retryCount <= MAX_RETRY_COUNT)
}
