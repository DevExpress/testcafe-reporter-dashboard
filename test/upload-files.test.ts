import uuid from 'uuid';
import assert from 'assert';
import { Screenshot, DashboardTestRunInfo, WarningsInfo } from '../src/types/testcafe';
import { CHROME_HEADLESS, CHROME, FIREFOX } from './data/test-browser-info';
import { AggregateCommandType, UploadStatus, AggregateNames } from '../src/types/internal';
import { EMPTY_TEST_RUN_INFO } from './data/empty-test-run-info';
import reporterObjectFactory from '../src/reporter-object-factory';
import logger from '../src/logger';
import { mockReadFile, SETTINGS, TESTCAFE_DASHBOARD_URL, UPLOAD_URL_PREFIX } from './mocks';
import { TC_OLDEST_COMPATIBLE_VERSION } from '../src/validate-settings';
import { testWarningsInfo, WARNINGS_TEST_RUN_ID_1, WARNINGS_TEST_RUN_ID_2 } from './data/test-warnings-info';

const testRunIdChrome = 'chrome_headless';
const testRunId1 = 'testRun_1';
const testRunId2 = 'testRun_2';

describe('Uploads', () => {
    const aggregateCommands: any[] = [];
    const uploadedFiles: any[]     = [];
    const uploadedUrls: any[]      = [];
    const uploadInfos: any[]       = [];

    const loggerMock = {
        log:   () => void 0,
        warn:  () => void 0,
        error: () => void 0
    };

    function fetch (url, request) {
        if (url === `${TESTCAFE_DASHBOARD_URL}/api/getUploadUrl`) {
            const uploadInfo = { uploadId: uuid(), uploadUrl: `${UPLOAD_URL_PREFIX}${uuid()}` };

            uploadInfos.push(uploadInfo);

            return Promise.resolve({
                ok:   true,
                json: () => uploadInfo
            } as unknown as Response);
        }

        if (url === `${TESTCAFE_DASHBOARD_URL}/api/commands/`) {
            aggregateCommands.push(JSON.parse(request.body));

            return Promise.resolve({ ok: true } as Response);
        }

        if (url.startsWith(UPLOAD_URL_PREFIX)) {
            uploadedUrls.push(url);
            uploadedFiles.push(request.body);

            return Promise.resolve({ ok: true } as Response);
        }

        if (url === `${TESTCAFE_DASHBOARD_URL}/api/validateReporter`)
            return Promise.resolve({ ok: true, status: 200, statusText: 'OK' } as Response);

        throw new Error('Unknown request');
    }

    beforeEach(() => {
        aggregateCommands.splice(0);
        uploadedFiles.splice(0);
        uploadedUrls.splice(0);
        uploadInfos.splice(0);
    });

    describe('Warnings', () => {
        it('Smoke test', async () => {
            const reporter = reporterObjectFactory(mockReadFile, fetch, SETTINGS, logger, TC_OLDEST_COMPATIBLE_VERSION);

            const testWarning1TestRun1 = { message: 'testWarning1TestRun1', testRunId: WARNINGS_TEST_RUN_ID_1 };
            const testWarning2TestRun1 = { message: 'testWarning2TestRun1', testRunId: WARNINGS_TEST_RUN_ID_1 };
            const testWarning3TestRun1 = { message: 'warning3ForTestRun1', testRunId: WARNINGS_TEST_RUN_ID_1 };
            const testWarning4TestRun1 = { message: 'warning4ForTestRun1', testRunId: WARNINGS_TEST_RUN_ID_1 };

            const testWarning1TestRun2 = { message: 'testWarning1TestRun2', testRunId: WARNINGS_TEST_RUN_ID_2 };

            const testWarning2TestRun2 = { message: 'testWarning2TestRun2', testRunId: WARNINGS_TEST_RUN_ID_2 };

            await reporter.reportTaskStart(new Date(), [], 1, [], { configuration: {}, dashboardUrl: '' });
            await reporter.reportWarnings(testWarning1TestRun1);
            await reporter.reportWarnings(testWarning2TestRun1);
            await reporter.reportWarnings(testWarning3TestRun1);
            await reporter.reportWarnings(testWarning4TestRun1);

            await reporter.reportWarnings(testWarning1TestRun2);
            await reporter.reportWarnings(testWarning2TestRun2);

            assert.strictEqual(uploadedFiles.length, 0);

            await reporter.reportTestDone('testName', testWarningsInfo);

            assert.strictEqual(uploadedFiles.length, 1);

            const reportTestDoneUpload = JSON.parse(uploadedFiles[0].toString());

            assert.deepStrictEqual(reportTestDoneUpload.browserRuns[WARNINGS_TEST_RUN_ID_1].warnings, [testWarning1TestRun1, testWarning2TestRun1, testWarning3TestRun1, testWarning4TestRun1] );

            assert.deepStrictEqual(reportTestDoneUpload.browserRuns[WARNINGS_TEST_RUN_ID_2].warnings, [testWarning1TestRun2, testWarning2TestRun2] );

            await reporter.reportTaskDone( new Date(), 1, [''], { failedCount: 2, passedCount: 1, skippedCount: 0 });
            //No new uploads on reportTaskDone since no new warnings arrived
            assert.strictEqual(uploadedFiles.length, 1);

            const testWarning5TestRun1 = { message: 'warning5ForTest1', testRunId: WARNINGS_TEST_RUN_ID_1 };
            const testWarning6TestRun1 = { message: 'warning6ForTest1', testRunId: WARNINGS_TEST_RUN_ID_1 };

            await reporter.reportWarnings({ message: 'warning5ForTest1', testRunId: WARNINGS_TEST_RUN_ID_1 } );
            await reporter.reportWarnings({ message: 'warning6ForTest1', testRunId: WARNINGS_TEST_RUN_ID_1 } );

            const runWarning1 = { message: 'runWarning1' };
            const runWarning2 = { message: 'runWarning2' };

            await reporter.reportWarnings(runWarning1);
            await reporter.reportWarnings(runWarning2);

            assert.strictEqual(uploadedFiles.length, 1);

            await reporter.reportTaskDone( new Date(), 1, [''], {
                failedCount:  2,
                passedCount:  1,
                skippedCount: 0
            });

            assert.strictEqual(uploadedFiles.length, 2);

            const uploadedWarningInfo: WarningsInfo[]  = JSON.parse(uploadedFiles[1].toString());

            assert.strictEqual(uploadedWarningInfo.length, 2);
            assert.strictEqual(uploadedWarningInfo[0].testRunId, WARNINGS_TEST_RUN_ID_1);
            assert.strictEqual(uploadedWarningInfo[0].warnings.length, 2);
            assert.deepStrictEqual(uploadedWarningInfo[0].warnings, [testWarning5TestRun1, testWarning6TestRun1]);
            assert.strictEqual(uploadedWarningInfo[1].testRunId, void 0);
            assert.deepStrictEqual(uploadedWarningInfo[1].warnings, [runWarning1, runWarning2]);
        });
    });

    describe('Screenshots', () => {
        let screenshotPaths: string[] = [];

        function readFile (path: string): Promise<Buffer> {
            screenshotPaths.push(path);

            let fileContent = '';

            if (path === 'C:\\screenshots\\1.png')
                fileContent = 'take_screenshot_action';
            else if (path === 'C:\\screenshots\\errors\\1.png')
                fileContent = 'screenshot_on_fail';
            else
                throw new Error('Unknown file path');

            return Promise.resolve(Buffer.from(fileContent));
        }

        beforeEach(() => {
            screenshotPaths = [];
        });

        it('Smoke test', async () => {
            const screenshots: Screenshot[] = [
                {
                    testRunId:         testRunIdChrome,
                    screenshotPath:    'C:\\screenshots\\1.png',
                    thumbnailPath:     'C:\\screenshots\\thumbnails\\1.png',
                    userAgent:         'Chrome_79.0.3945.88_Windows_8.1',
                    takenOnFail:       false,
                    quarantineAttempt: 0
                },
                {
                    testRunId:         testRunIdChrome,
                    screenshotPath:    'C:\\screenshots\\errors\\1.png',
                    thumbnailPath:     'C:\\screenshots\\errors\\thumbnails\\1.png',
                    userAgent:         'Chrome_79.0.3945.88_Windows_8.1',
                    takenOnFail:       true,
                    quarantineAttempt: 0
                }
            ];

            const reporter = reporterObjectFactory(readFile, fetch, SETTINGS, loggerMock, TC_OLDEST_COMPATIBLE_VERSION);

            await reporter.reportTaskStart(new Date(), [], 1, [], { configuration: {}, dashboardUrl: '' });

            await reporter.reportTestDone('Test 1', {
                ...EMPTY_TEST_RUN_INFO,
                screenshots,
                browsers: [ { ...CHROME_HEADLESS, testRunId: 'chrome_headless' } ]
            });

            const { browserRuns } = JSON.parse(uploadedFiles[2].toString());
            const runCommands     = aggregateCommands.filter(command => command.aggregateName === AggregateNames.Run);

            assert.equal(runCommands.length, 2);
            assert.equal(runCommands[0].type, AggregateCommandType.reportTaskStart);
            assert.equal(runCommands[1].type, AggregateCommandType.reportTestDone);

            assert.equal(browserRuns['chrome_headless'].screenshotMap[0].ids.current, uploadInfos[0].uploadId);
            assert.equal(browserRuns['chrome_headless'].screenshotMap[1].ids.current, uploadInfos[1].uploadId);
            assert.equal(runCommands[1].payload.uploadId, uploadInfos[2].uploadId);

            assert.equal(uploadInfos.length, 3);
            assert.equal(uploadedUrls.length, 3);
            assert.equal(uploadedUrls[0], uploadInfos[0].uploadUrl);
            assert.equal(uploadedUrls[1], uploadInfos[1].uploadUrl);
            assert.equal(uploadedUrls[2], uploadInfos[2].uploadUrl);

            assert.equal(uploadedFiles.length, 3);
            assert.equal(uploadedFiles[0], 'take_screenshot_action');
            assert.equal(uploadedFiles[1], 'screenshot_on_fail');

            assert.equal(screenshotPaths.length, 2);
            assert.equal(screenshotPaths[0], 'C:\\screenshots\\1.png');
            assert.equal(screenshotPaths[1], 'C:\\screenshots\\errors\\1.png');

            const uploadCommands = aggregateCommands.filter(command => command.aggregateName === AggregateNames.Upload);

            assert.equal(uploadCommands[0].type, AggregateCommandType.createUpload);
            assert.deepEqual(uploadCommands[0].aggregateId, uploadInfos[0].uploadId);
            assert.deepEqual(uploadCommands[0].payload, { status: UploadStatus.Completed });

            assert.equal(uploadCommands[1].type, AggregateCommandType.createUpload);
            assert.deepEqual(uploadCommands[1].aggregateId, uploadInfos[1].uploadId);
            assert.deepEqual(uploadCommands[1].payload, { status: UploadStatus.Completed });

            assert.equal(uploadCommands[2].type, AggregateCommandType.createUpload);
            assert.deepEqual(uploadCommands[2].aggregateId, uploadInfos[2].uploadId);
            assert.deepEqual(uploadCommands[2].payload, { status: UploadStatus.Completed });
        });

        it('Should upload screenshots from screenshotData', async () => {


            const screenshots: Screenshot[] = [
                {
                    testRunId:         testRunIdChrome,
                    screenshotPath:    'C:\\screenshots\\1.png',
                    screenshotData:    Buffer.from('take_screenshot_action_from_buffer'),
                    thumbnailPath:     'C:\\screenshots\\thumbnails\\1.png',
                    userAgent:         'Chrome_79.0.3945.88_Windows_8.1',
                    takenOnFail:       false,
                    quarantineAttempt: 0
                },
                {
                    testRunId:         testRunIdChrome,
                    screenshotPath:    'C:\\screenshots\\errors\\1.png',
                    screenshotData:    Buffer.from('screenshot_on_fail_from_buffer'),
                    thumbnailPath:     'C:\\screenshots\\errors\\thumbnails\\1.png',
                    userAgent:         'Chrome_79.0.3945.88_Windows_8.1',
                    takenOnFail:       true,
                    quarantineAttempt: 0
                }
            ];

            const reporter = reporterObjectFactory(readFile, fetch, SETTINGS, loggerMock, TC_OLDEST_COMPATIBLE_VERSION);

            await reporter.reportTaskStart(new Date(), [], 1, [], { configuration: {}, dashboardUrl: '' });

            await reporter.reportTestDone('Test 1', {
                ...EMPTY_TEST_RUN_INFO,
                screenshots,
                browsers: [ { ...CHROME_HEADLESS, testRunId: 'chrome_headless' } ]
            });

            const { browserRuns } = JSON.parse(uploadedFiles[2].toString());
            const runCommands     = aggregateCommands.filter(command => command.aggregateName === AggregateNames.Run);

            assert.equal(runCommands.length, 2);
            assert.equal(runCommands[0].type, AggregateCommandType.reportTaskStart);
            assert.equal(runCommands[1].type, AggregateCommandType.reportTestDone);

            assert.equal(browserRuns['chrome_headless'].screenshotMap[0].ids.current, uploadInfos[0].uploadId);
            assert.equal(browserRuns['chrome_headless'].screenshotMap[1].ids.current, uploadInfos[1].uploadId);
            assert.equal(runCommands[1].payload.uploadId, uploadInfos[2].uploadId);

            assert.equal(uploadInfos.length, 3);
            assert.equal(uploadedUrls.length, 3);
            assert.equal(uploadedUrls[0], uploadInfos[0].uploadUrl);
            assert.equal(uploadedUrls[1], uploadInfos[1].uploadUrl);
            assert.equal(uploadedUrls[2], uploadInfos[2].uploadUrl);

            assert.equal(uploadedFiles.length, 3);
            assert.equal(uploadedFiles[0], 'take_screenshot_action_from_buffer');
            assert.equal(uploadedFiles[1], 'screenshot_on_fail_from_buffer');

            const uploadCommands = aggregateCommands.filter(command => command.aggregateName === AggregateNames.Upload);

            assert.equal(uploadCommands[0].type, AggregateCommandType.createUpload);
            assert.deepEqual(uploadCommands[0].aggregateId, uploadInfos[0].uploadId);
            assert.deepEqual(uploadCommands[0].payload, { status: UploadStatus.Completed });

            assert.equal(uploadCommands[1].type, AggregateCommandType.createUpload);
            assert.deepEqual(uploadCommands[1].aggregateId, uploadInfos[1].uploadId);
            assert.deepEqual(uploadCommands[1].payload, { status: UploadStatus.Completed });

            assert.equal(uploadCommands[2].type, AggregateCommandType.createUpload);
            assert.deepEqual(uploadCommands[2].aggregateId, uploadInfos[2].uploadId);
            assert.deepEqual(uploadCommands[2].payload, { status: UploadStatus.Completed });
        });

        it('Should not send screenshots info to dashboard if NO_SCREENSHOT_UPLOAD is true', async () => {
            const screenshots: Screenshot[] = [
                {
                    testRunId:         testRunIdChrome,
                    screenshotPath:    'C:\\screenshots\\1.png',
                    thumbnailPath:     'C:\\screenshots\\thumbnails\\1.png',
                    userAgent:         'Chrome_79.0.3945.88_Windows_8.1',
                    takenOnFail:       false,
                    quarantineAttempt: 0
                },
                {
                    testRunId:         testRunIdChrome,
                    screenshotPath:    'C:\\screenshots\\errors\\1.png',
                    thumbnailPath:     'C:\\screenshots\\errors\\thumbnails\\1.png',
                    userAgent:         'Chrome_79.0.3945.88_Windows_8.1',
                    takenOnFail:       true,
                    quarantineAttempt: 0
                }
            ];

            const reporter = reporterObjectFactory(mockReadFile, fetch, { ...SETTINGS, noScreenshotUpload: true }, loggerMock, TC_OLDEST_COMPATIBLE_VERSION);

            await reporter.reportTaskStart(new Date(), [], 1, [], { configuration: {}, dashboardUrl: '' });

            await reporter.reportTestDone('Test 1', {
                ...EMPTY_TEST_RUN_INFO,
                screenshots,
                browsers: [ { ...CHROME, testRunId: testRunIdChrome } ]
            });

            assert.equal(uploadInfos.length, 1);
            assert.equal(uploadedUrls.length, 1);
            assert.equal(uploadedFiles.length, 1);
            assert.equal(uploadedFiles.length, 1);

            const { browserRuns } = JSON.parse(uploadedFiles[0].toString()) as DashboardTestRunInfo;

            assert.equal(browserRuns['chrome_headless'].screenshotMap, void 0);

            assert.equal(aggregateCommands.length, 3);
            assert.equal(aggregateCommands[0].type, AggregateCommandType.reportTaskStart);

            assert.equal(aggregateCommands[1].payload.uploadId, uploadInfos[0].uploadId);
            assert.equal(aggregateCommands[1].type, AggregateCommandType.reportTestDone);

            assert.equal(aggregateCommands[2].type, AggregateCommandType.createUpload);
            assert.deepEqual(aggregateCommands[2].aggregateId, uploadInfos[0].uploadId);
            assert.deepEqual(aggregateCommands[2].payload, { status: UploadStatus.Completed });
        });
    });

    describe('Videos', () => {
        it('Smoke test', async () => {
            const videoPaths: string[] = [];

            function readFile (path: string): Promise<Buffer> {
                videoPaths.push(path);

                return Promise.resolve(Buffer.from(`fileContent_${path}`));
            };

            const reporter = reporterObjectFactory(readFile, fetch, SETTINGS, loggerMock, TC_OLDEST_COMPATIBLE_VERSION);

            await reporter.reportTaskStart(new Date(), [], 1, [], { configuration: {}, dashboardUrl: '' });

            await reporter.reportTestDone('Test 1', {
                ...EMPTY_TEST_RUN_INFO,
                browsers: [ { ...CHROME, testRunId: testRunId1 }, { ...FIREFOX, testRunId: testRunId2 } ],
                videos:   [
                    {
                        testRunId: testRunId1,
                        userAgent: CHROME.prettyUserAgent,
                        videoPath: '1.mp4'
                    },
                    {
                        testRunId: testRunId2,
                        userAgent: FIREFOX.prettyUserAgent,
                        videoPath: '2.mp4'
                    }
                ]
            });

            const { browserRuns } = JSON.parse(uploadedFiles[2].toString());
            const runCommands     = aggregateCommands.filter(command => command.aggregateName === AggregateNames.Run);

            assert.equal(runCommands.length, 2);
            assert.equal(runCommands[0].type, AggregateCommandType.reportTaskStart);
            assert.equal(runCommands[1].type, AggregateCommandType.reportTestDone);

            assert.equal(videoPaths.length, 2, 'videoPaths');
            assert.equal(uploadInfos.length, 3, 'uploadInfos');
            assert.equal(uploadedUrls.length, 3, 'uploadedUrls');

            assert.equal(browserRuns['testRun_1'].videoUploadIds[0], uploadInfos[0].uploadId);
            assert.equal(browserRuns['testRun_2'].videoUploadIds[0], uploadInfos[1].uploadId);
            assert.equal(runCommands[1].payload.uploadId, uploadInfos[2].uploadId);

            assert.equal(uploadedUrls[0], uploadInfos[0].uploadUrl);
            assert.equal(uploadedUrls[1], uploadInfos[1].uploadUrl);
            assert.equal(uploadedUrls[2], uploadInfos[2].uploadUrl);

            assert.equal(videoPaths[0], '1.mp4');
            assert.equal(videoPaths[1], '2.mp4');

            assert.equal(uploadedFiles[0], 'fileContent_1.mp4');
            assert.equal(uploadedFiles[1], 'fileContent_2.mp4');

            const uploadCommands = aggregateCommands.filter(command => command.aggregateName === AggregateNames.Upload);

            assert.equal(uploadCommands[0].type, AggregateCommandType.createUpload);
            assert.deepEqual(uploadCommands[0].aggregateId, uploadInfos[0].uploadId);
            assert.deepEqual(uploadCommands[0].payload, { status: UploadStatus.Completed });

            assert.equal(uploadCommands[1].type, AggregateCommandType.createUpload);
            assert.deepEqual(uploadCommands[1].aggregateId, uploadInfos[1].uploadId);
            assert.deepEqual(uploadCommands[1].payload, { status: UploadStatus.Completed });

            assert.equal(uploadCommands[2].type, AggregateCommandType.createUpload);
            assert.deepEqual(uploadCommands[2].aggregateId, uploadInfos[2].uploadId);
            assert.deepEqual(uploadCommands[2].payload, { status: UploadStatus.Completed });
        });

        it('Should not send videos info to dashboard if NO_VIDEO_UPLOAD enabled', async () => {
            const reporter = reporterObjectFactory(mockReadFile, fetch, { ...SETTINGS, noVideoUpload: true }, loggerMock, TC_OLDEST_COMPATIBLE_VERSION);

            await reporter.reportTaskStart(new Date(), [], 1, [], { configuration: {}, dashboardUrl: '' });

            await reporter.reportTestDone('Test 1', {
                ...EMPTY_TEST_RUN_INFO,
                browsers: [ { ...CHROME, testRunId: testRunId1 }, { ...FIREFOX, testRunId: testRunId2 } ],
                videos:   [
                    {
                        testRunId: testRunId1,
                        userAgent: CHROME.prettyUserAgent,
                        videoPath: '1.mp4'
                    },
                    {
                        testRunId: testRunId2,
                        userAgent: FIREFOX.prettyUserAgent,
                        videoPath: '2.mp4'
                    }
                ]
            });

            const { browserRuns } = JSON.parse(uploadedFiles[0].toString()) as DashboardTestRunInfo;

            assert.equal(uploadInfos.length, 1);
            assert.equal(uploadedUrls.length, 1);
            assert.equal(uploadedFiles.length, 1);
            assert.deepEqual(browserRuns['testRun_1'].videoUploadIds, []);
            assert.deepEqual(browserRuns['testRun_2'].videoUploadIds, []);

            assert.equal(aggregateCommands.length, 3);
            assert.equal(aggregateCommands[0].type, AggregateCommandType.reportTaskStart);

            assert.equal(aggregateCommands[1].payload.uploadId, uploadInfos[0].uploadId);
            assert.equal(aggregateCommands[1].type, AggregateCommandType.reportTestDone);

            assert.equal(aggregateCommands[2].type, AggregateCommandType.createUpload);
            assert.deepEqual(aggregateCommands[2].aggregateId, uploadInfos[0].uploadId);
            assert.deepEqual(aggregateCommands[2].payload, { status: UploadStatus.Completed });
        });
    });
});
