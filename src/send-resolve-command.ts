const http  = require('http');
const fetch = require('isomorphic-fetch');

const AUTHORIZATION_TOKEN = process.env.TESTCAFE_DASHBOARD_AUTHORIZATION_TOKEN;
let   DASHBOARD_LOCATION  = process.env.TESTCAFE_DASHBOARD_URL;

if (!DASHBOARD_LOCATION) {
    DASHBOARD_LOCATION = 'http://localhost:3000';

    console.warn(`The 'TESTCAFE_DASHBOARD_URL' environment variable is not defined. The ${DASHBOARD_LOCATION} url will be used by default.`)
}

if (!AUTHORIZATION_TOKEN)
    console.error('\'TESTCAFE_DASHBOARD_AUTHORIZATION_TOKEN\' is not defined');

export default async function sendResolveCommand (id, commandType, payload) {
    if (!AUTHORIZATION_TOKEN)
        return;

    return new Promise(async (resolve) => {
        fetch(`http://localhost:3000/api/commands/`, {
            method: 'POST',
            headers: {
            'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                type:          commandType,
                aggregateId:   id,
                aggregateName: 'Report',

                payload: { ownerId: AUTHORIZATION_TOKEN, ...payload },
            })
        })
        .then(function(response) {
            console.log(`${commandType}: ${response.status} ${response.statusText}`);

            resolve()
        });
    });
}
