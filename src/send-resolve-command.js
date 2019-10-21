const http = require('http');

const AUTHORIZATION_TOKEN = process.env.AUTHORIZATION_TOKEN;

if (!AUTHORIZATION_TOKEN)
    throw Error('\'AUTHORIZATION_TOKEN\' is not defined');

export async function sendResolveCommand (id, commandType, payload) {
    const request = new http.ClientRequest({
        hostname: 'localhost',
        port:     3000,
        path:     '/api/commands/',
        method:   'POST',
        headers:  {
            'Content-Type': 'application/json'
        }
    });

    await request.end(JSON.stringify({
        type:          commandType,
        aggregateId:   id,
        aggregateName: 'Report',

        payload,
        ownerId: AUTHORIZATION_TOKEN
    }));
}
