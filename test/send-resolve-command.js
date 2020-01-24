const assert = require('assert');
const uuid   = require('uuid');
const mock   = require('mock-require');

describe('sendResolveCommand', () => {
    before(() => {
        mock('../lib/env-variables', {
            TESTCAFE_DASHBOARD_URL:                 'http://localhost',
            TESTCAFE_DASHBOARD_AUTHORIZATION_TOKEN: 'authorization_token'
        });
    });

    after(() => {
        mock.stopAll();
    });

    it('Retry command test', async () => {
        let sendCommandCount = 0;

        mock('isomorphic-fetch', () => {
            sendCommandCount++;

            return Promise.resolve({ status: sendCommandCount === 1 ? 408 : 200 });
        });

        const sendResolveCommand = mock.reRequire('../lib/send-resolve-command').default;

        await sendResolveCommand({
            aggregateId:   uuid(),
            aggregateName: 'Report',
            type:          'reportTestStart',
            payload:       { name: 'test 1' }
        });

        assert.equal(sendCommandCount, 2);

        mock.stop('isomorphic-fetch');
    });
});
