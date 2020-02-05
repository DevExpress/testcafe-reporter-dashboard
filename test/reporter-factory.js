const assert = require('assert');
const mock   = require('mock-require');

const testActionDoneCalls = require('./data/report-test-action-done-calls');

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

describe('reportTestActionDone', () => {
    before(() => {
        mock('../lib/env-variables', {
            TESTCAFE_DASHBOARD_URL:                 'http://localhost',
            TESTCAFE_DASHBOARD_AUTHORIZATION_TOKEN: 'authorization_token'
        });
    });

    after(() => {
        mock.stop('../lib/env-variables');
    });

    it('Should add test actions info to reportTestDone command', async () => {
        let testRunInfo = null;

        mock('isomorphic-fetch', (_, request) => {
            testRunInfo = JSON.parse(request.body).testRunInfo;

            return Promise.resolve({ ok: true, status: 200, statusText: 'OK' });
        });

        const reporter = mock.reRequire('../lib/index')();

        for (const { apiActionName, actionInfo } in testActionDoneCalls)
            await reporter.reportTestActionDone(apiActionName, actionInfo);

        await reporter.reportTestDone('Test 1', { screenshots: [] });

        const { browserRuns: { browser, actions } } = testRunInfo.browserRuns['chrome'];

        assert.equal(browser.prettyUserAgent, 'Chrome 79.0.3945.130 / Windows 8.1');
        assert.equal(actions.length, 5);

        assert.equal(actions[0].apiName, 'click');
        assert.equal(actions[0].testPhase, 'inTest');
        assert.equal(actions[0].command.type, 'click');

        assert.equal(actions[1].apiName, 'typeText');
        assert.equal(actions[1].testPhase, 'inTest');
        assert.equal(actions[1].command.type, 'type-text');

        assert.equal(actions[2].apiName, 'click');
        assert.equal(actions[2].testPhase, 'inTest');
        assert.equal(actions[2].command.type, 'click');

        assert.equal(actions[3].apiName, 'drag');
        assert.equal(actions[3].testPhase, 'inTest');
        assert.equal(actions[3].command.type, 'drag');

        assert.equal(actions[4].apiName, 'eql');
        assert.equal(actions[4].testPhase, 'inTest');
        assert.equal(actions[4].command.type, 'assertion');
        assert.equal(actions[4].errors.length, 1);
        assert.equal(actions[4].errors[0].errMsg, 'AssertionError: expected \'Peter\' to deeply equal \'Peter1\'');

        mock.stop('isomorphic-fetch');
    });
});
