const assert = require('assert');
const mock   = require('mock-require');

describe('reportTaskStart', () => {
    before(() => {
        mock('../lib/env-variables', {
            TESTCAFE_DASHBOARD_URL:                 'http://localhost',
            TESTCAFE_DASHBOARD_AUTHORIZATION_TOKEN: 'authorization_token'
        });
    });

    after(() => {
        mock.stopAll();
    });

    it('Show reporter ulr message', async () => {
        const logs = [];

        let reportId = null;

        mock('isomorphic-fetch', (_, request) => {
            reportId = JSON.parse(request.body).aggregateId;

            return Promise.resolve({ status: 200, statusText: 'OK' });
        });

        mock('../lib/logger', {
            log: message => {
                logs.push(message);
            }
        });

        const reporter = mock.reRequire('../lib/index')();

        await reporter.reportTaskStart(1, {}, 1);

        assert.equal(logs.length, 1);
        assert.equal(logs[0], `Task execution report is available by the following URL: http://localhost/details/${reportId}`);
    
        mock.stop('../lib/logger');
        mock.stop('isomorphic-fetch');
    });
});
