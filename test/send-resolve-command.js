const assert = require('assert');
const uuid = require('uuid');
const mock = require('mock-require');

mock('../lib/env-variables', {
    TESTCAFE_DASHBOARD_URL:                 'http://localhost',
    TESTCAFE_DASHBOARD_AUTHORIZATION_TOKEN: 'authorization_token'
});

describe('sendResolveCommand', () => {
    it('Retry command test', async () => {
        let sendCommandCount = 0;

        mock('isomorphic-fetch', function () {
            sendCommandCount++;

            const response = { status: sendCommandCount === 1 ? 408 : 200 };

            return new Promise(resolve => {
                resolve(response);
            });
        });

        const sendResolveCommand = require('../lib/send-resolve-command').default;

        await sendResolveCommand(uuid(), 'reportTestStart', { name: 'test 1' });

        assert.equal(sendCommandCount, 2);
    });
});
