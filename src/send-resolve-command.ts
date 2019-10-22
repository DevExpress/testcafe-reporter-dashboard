const http = require('http');

export default function sendResolveCommand (id, commandType, payload) {
    const AUTHORIZATION_TOKEN = process.env.TESTCAFE_DASHBOARD_AUTHORIZATION_TOKEN;

    if (!AUTHORIZATION_TOKEN) {
        console.error('\'TESTCAFE_DASHBOARD_AUTHORIZATION_TOKEN\' is not defined');

        return;
    }

    return new Promise(async (resolve) => {
        const request = new http.ClientRequest({
            hostname: 'localhost',
            port:     3000,
            path:     '/api/commands/',
            method:   'POST',
            headers:  {
                'Content-Type': 'application/json'
            }
        }, cb => {
            console.log(`${commandType}: ${cb.statusCode} ${cb.statusMessage}`);
        });

        request.end(JSON.stringify({
            type:          commandType,
            aggregateId:   id,
            aggregateName: 'Report',

            payload,
            ownerId: AUTHORIZATION_TOKEN
        }));

        setTimeout(resolve, 100);
    })
}
