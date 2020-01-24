const assert = require('assert');
const mock   = require('mock-require');

describe('reportTaskDone', () => {
    before(() => {
        mock('../lib/env-variables', {
            TESTCAFE_DASHBOARD_URL:                 'http://localhost',
            TESTCAFE_DASHBOARD_AUTHORIZATION_TOKEN: 'authorization_token'
        });
    });

    after(() => {
        mock.stopAll();
    });

    it('', async () => {
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

        await reporter.reportTestDone(1, {}, 1);

        assert.equal(logs.length, 1);
        assert.equal(logs[0], `Task execution report: http://localhost/details/${reportId}`);

        mock.stop('../lib/logger');
        mock.stop('isomorphic-fetch');
    });
});
