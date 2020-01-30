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
        mock.stop('../lib/env-variables');
    });

    it('Show reporter URL message', async () => {
        const logs = [];

        let reportId = null;

        mock('isomorphic-fetch', (_, request) => {
            reportId = JSON.parse(request.body).aggregateId;

            return Promise.resolve({ ok: true, status: 200, statusText: 'OK' });
        });

        mock('../lib/logger', {
            log: message => {
                logs.push(message);
            }
        });

        const reporter = mock.reRequire('../lib/index')();

        await reporter.reportTaskStart(1, {}, 1);

        assert.equal(logs.length, 1);
        assert.equal(logs[0], `Task execution report: http://localhost/details/${reportId}`);
    
        mock.stop('../lib/logger');
        mock.stop('isomorphic-fetch');
    });
});
