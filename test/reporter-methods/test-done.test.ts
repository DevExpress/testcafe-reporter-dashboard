import assert from 'assert';
import { v4 as uuid } from 'uuid';
import { buildReporterPlugin } from 'testcafe/lib/embedding-utils';

import { AggregateCommandType } from '../../src/types/internal/dashboard';
import { CHROME } from './../data/test-browser-info';
import {
    thirdPartyTestDone,
    thirdPartyTestDone2,
    skippedTestDone,
    TEST_RUN_ID,
    TEST_RUN_ID_2
} from './../data';
import { testActionInfos, quarantineTestDoneInfo, quarantiteTestStartInfo } from '../data/test-quarantine-mode-info';
import { reporterObjectFactory } from '../../src/reporter-object-factory';
import { DashboardTestRunInfo, TaskDoneArgs, TestDoneArgs } from '../../src/types';
import { mockFileExists, mockReadFile, SETTINGS, TESTCAFE_DASHBOARD_URL, UPLOAD_URL_PREFIX } from '../mocks';
import { TC_OLDEST_COMPATIBLE_VERSION } from '../../src/validate-settings';
import { WARNINGS_TEST_RUN_ID_1 } from '../data/test-warnings-info';
import { layoutTestingActionInfo1, layoutTestingActionInfo2, layoutTestingTestDoneInfo, layoutTestingTestStartInfo } from '../data/test-layout-testing-info';

describe('reportTestDone', () => {
    let testRunInfo           = {} as DashboardTestRunInfo;
    let uploadPaths: string[] = [];

    const loggerMock = {
        log:   () => void 0,
        warn:  () => void 0,
        error: () => void 0
    };

    function fetchRunInfoMock (url: string, request) {
        const response  = { ok: true, status: 200, statusText: 'OK' } as Response;
        const uploadUrl = 'upload_url';

        if (url === `${TESTCAFE_DASHBOARD_URL}/api/getUploadUrl`)
            response.json = () => Promise.resolve({ uploadId: 'upload_id', uploadUrl });
        else if (url.startsWith(uploadUrl)) {
            const body = request.body.toString();

            if (body.startsWith('%filePath%'))
                uploadPaths.push(body);
            else
                testRunInfo = JSON.parse(request.body.toString());
        }

        return Promise.resolve(response as unknown as Response);
    }

    beforeEach(() => {
        testRunInfo = {} as DashboardTestRunInfo;
        uploadPaths = [];
    });

    it('Should process errors originated not from actions', async () => {
        const reporter = buildReporterPlugin(() => reporterObjectFactory(
                mockReadFile, mockFileExists, fetchRunInfoMock, SETTINGS, loggerMock, TC_OLDEST_COMPATIBLE_VERSION
            ), process.stdout
        );

        await reporter.reportTaskStart(new Date(), [], 1, [], { configuration: {}, dashboardUrl: '' });
        await reporter.reportTestDone('Test 1', thirdPartyTestDone);

        const { thirdPartyError, actions, browser } = testRunInfo.browserRuns[thirdPartyTestDone.browsers[0].testRunId];

        assert.ok(thirdPartyError);

        assert.deepEqual(actions, void 0);
        assert.ok(browser);
        assert.equal(browser.alias, CHROME.alias);
        assert.equal(browser.name, CHROME.name);
        assert.equal(browser.prettyUserAgent, thirdPartyTestDone.errs[0].userAgent);
        assert.ok(browser.version);
        assert.ok(browser.os);
        assert.ok(browser.os.name);
        assert.ok(browser.os.version);
    });

    it('Should send skipped prop in test done command', async () => {
        let testDonePayload = null as unknown as TestDoneArgs;

        function fetchMock (url: string, request) {
            const response  = { ok: true, status: 200, statusText: 'OK', json: () => Promise.resolve('') };

            if (url.startsWith(`${TESTCAFE_DASHBOARD_URL}/api/commands`)) {
                const { type, payload } = JSON.parse(request.body);

                if (type === AggregateCommandType.reportTestDone)
                    testDonePayload = payload;
            }

            return Promise.resolve(response as Response);
        }

        const reporter = buildReporterPlugin(() => reporterObjectFactory(
                mockReadFile, mockFileExists, fetchMock, SETTINGS, loggerMock, TC_OLDEST_COMPATIBLE_VERSION
            ), process.stdout);

        await reporter.reportTaskStart(new Date(), [], 1, [], { configuration: {}, dashboardUrl: '' });
        await reporter.reportTestDone('Test 1', skippedTestDone);

        assert.ok(testDonePayload);
        assert.ok(testDonePayload.skipped);
    });

    it('should collect quarantine attempts info', async () => {
        const readFile = (path: string) => Promise.resolve(Buffer.from(path));

        const reporter = buildReporterPlugin(() => reporterObjectFactory(
                readFile, mockFileExists, fetchRunInfoMock, SETTINGS, loggerMock, TC_OLDEST_COMPATIBLE_VERSION
            ), process.stdout
        );

        await reporter.reportTaskStart(new Date(), [], 1, [], { configuration: {}, dashboardUrl: '' });
        await reporter.reportTestStart('Test 1', {}, quarantiteTestStartInfo);

        for (const actionInfo of testActionInfos)
            await reporter.reportTestActionDone('click', actionInfo);

        await reporter.reportTestDone('Test 1', quarantineTestDoneInfo);

        const { browserRuns } = testRunInfo;

        assert.equal(browserRuns.firefox_1.browser.alias, 'firefox');
        assert.equal(browserRuns.firefox_1.quarantineAttempt, void 0);
        assert.deepEqual(browserRuns.firefox_1.screenshotMap, [
            {
                ids: {
                    current: 'upload_id'
                },
                path: '%filePath%firefox_1.png'
            }
        ]);

        assert.equal(browserRuns.chrome_1_1.browser.alias, 'chrome');
        assert.equal(browserRuns.chrome_1_1.quarantineAttempt, 2);
        assert.deepEqual(browserRuns.chrome_1_1.screenshotMap, [
            {
                ids: {
                    current: 'upload_id'
                },
                path: '%filePath%chrome_1_1.png'
            }
        ]);

        assert.equal(browserRuns.chrome_1.browser.alias, 'chrome');
        assert.equal(browserRuns.chrome_1.quarantineAttempt, 1);
        assert.deepEqual(browserRuns.chrome_1.screenshotMap, [
            {
                ids: {
                    current: 'upload_id'
                },
                path: '%filePath%chrome_1.png'
            }
        ]);

        assert.equal(browserRuns.chrome_headless_1.browser.alias, 'chrome:headless');
        assert.equal(browserRuns.chrome_headless_1.quarantineAttempt, 2);
        assert.deepEqual(browserRuns.chrome_headless_1.screenshotMap, [
            {
                ids: {
                    current: 'upload_id'
                },
                path: '%filePath%chrome_headless_1.png'
            }
        ]);

        assert.equal(browserRuns.chrome_headless_2.browser.alias, 'chrome:headless');
        assert.equal(browserRuns.chrome_headless_2.quarantineAttempt, 3);
        assert.deepEqual(browserRuns.chrome_headless_2.screenshotMap, [
            {
                ids: {
                    current: 'upload_id'
                },
                path: '%filePath%chrome_headless_2.png'
            }
        ]);

        assert.equal(browserRuns.chrome_headless.browser.alias, 'chrome:headless');
        assert.equal(browserRuns.chrome_headless.quarantineAttempt, 1);
        assert.deepEqual(browserRuns.chrome_headless.screenshotMap, [
            {
                ids: {
                    current: 'upload_id'
                },
                path: '%filePath%chrome_headless.png'
            }
        ]);

        assert.equal(uploadPaths.length, 9);

        for (const runInfo of Object.values(browserRuns))
            assert.deepEqual(runInfo.videoUploadIds, ['upload_id']);
    });

    it('should match screenshots with originating actions', async () => {
        const readFile = (path: string) => Promise.resolve(Buffer.from(path));

        const reporter = buildReporterPlugin(() => reporterObjectFactory(
                readFile, mockFileExists, fetchRunInfoMock, SETTINGS, loggerMock, TC_OLDEST_COMPATIBLE_VERSION
            ), process.stdout
        );

        await reporter.reportTaskStart(new Date(), [], 1, [], { configuration: {}, dashboardUrl: '' });
        await reporter.reportTestStart('Test 1', {}, layoutTestingTestStartInfo);

        await reporter.reportTestActionDone('takeScreenshot', layoutTestingActionInfo1);
        await reporter.reportTestActionDone('click', layoutTestingActionInfo2);

        await reporter.reportTestDone('Test 1', layoutTestingTestDoneInfo);

        const { browserRuns } = testRunInfo;

        assert.equal(browserRuns.chrome_1.actions?.length, 2);
        assert.equal(browserRuns.chrome_1.actions![0].screenshotPath, '%filePath%chrome_1_1.png');
        assert.equal(browserRuns.chrome_1.actions![1].screenshotPath, void 0);
        assert.deepEqual(browserRuns.chrome_1.screenshotMap, [
            {
                ids: {
                    current: 'upload_id'
                },
                path: '%filePath%chrome_1_1.png'
            },
            {
                ids: {
                    current: 'upload_id'
                },
                path: '%filePath%chrome_1_2.png'
            }
        ]);
    });

    it('warningsUploadId payload', async () => {
        let taskDonePayload: TaskDoneArgs = {} as TaskDoneArgs;

        function fetch (url, request) {
            if (url === `${TESTCAFE_DASHBOARD_URL}/api/getUploadUrl`) {
                const uploadInfo = { uploadId: uuid(), uploadUrl: `${UPLOAD_URL_PREFIX}${uuid()}` };

                return Promise.resolve({ ok: true, json: () => uploadInfo } as unknown as Response);
            }

            if (url === `${TESTCAFE_DASHBOARD_URL}/api/commands/`) {
                const { type, payload } = JSON.parse(request.body);

                if (type === AggregateCommandType.reportTaskDone)
                    taskDonePayload = payload;

                return Promise.resolve({ ok: true } as Response);
            }

            return Promise.resolve({ ok: true, status: 200, statusText: 'OK' } as Response);
        }

        const reporter = reporterObjectFactory(mockReadFile, mockFileExists, fetch, SETTINGS, loggerMock, TC_OLDEST_COMPATIBLE_VERSION);

        assert.deepStrictEqual(taskDonePayload, {});

        await reporter.reportTaskStart(new Date(), [], 1, [], { configuration: {}, dashboardUrl: '' });
        await reporter.reportTaskDone(new Date(), 1, [], { failedCount: 2, passedCount: 1, skippedCount: 0 });

        assert.strictEqual(taskDonePayload.warningsUploadId, void 0);

        await reporter.reportWarnings({ message: 'warning', testRunId: WARNINGS_TEST_RUN_ID_1 });

        await reporter.reportTaskDone(new Date(), 1, [], { failedCount: 2, passedCount: 1, skippedCount: 0 });

        assert.ok(taskDonePayload.warningsUploadId);
    });

    it('should not duplicate errors from action and test done (including case of concurrency)', async () => {
        const reporter = buildReporterPlugin(() => reporterObjectFactory(
                mockReadFile, mockFileExists, fetchRunInfoMock, SETTINGS, loggerMock, TC_OLDEST_COMPATIBLE_VERSION
            ), process.stdout
        );

        const mockActionInfo = {
            test:      { phase: 'inTest', id: 'Test' },
            command:   {},
            testRunId: TEST_RUN_ID,
            duration:  1,
            browser:   {},
            err:       { id: 'action_error', formatMessage: () => '' }
        };

        const mockActionInfo2 = { ...mockActionInfo };

        mockActionInfo2.test.id   = 'Test2';
        mockActionInfo2.testRunId = TEST_RUN_ID_2;

        await reporter.reportTaskStart(new Date(), [], 1, [], { configuration: {}, dashboardUrl: '' });
        await reporter.reportTestActionDone('click', mockActionInfo);
        await reporter.reportTestActionDone('click', mockActionInfo2);
        await reporter.reportTestDone('Test 1', thirdPartyTestDone2);
        await reporter.reportTestDone('Test 1', thirdPartyTestDone);

        const { thirdPartyError } = testRunInfo.browserRuns[thirdPartyTestDone.browsers[0].testRunId];

        assert.ok(thirdPartyError);
        assert.match(thirdPartyError.errorModel, /Error: In Before - third party error 1/);
    });
});
