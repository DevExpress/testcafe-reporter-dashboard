import uuid from 'uuid';
import assert from 'assert';
import { Screenshot, DashboardTestRunInfo, WarningsInfo } from '../src/types/testcafe';
import { CHROME_HEADLESS, CHROME, FIREFOX } from './data/test-browser-info';
import { AggregateCommandType, AggregateNames } from '../src/types/internal';
import { EMPTY_TEST_RUN_INFO } from './data/empty-test-run-info';
import { reporterObjectFactory } from '../src/reporter-object-factory';
import logger from '../src/logger';
import { clearLayoutSettingsVariables, mockFileExists, mockReadFile, restoreLayoutSettingsVariables, setLayoutSettingsVariables, SETTINGS, stashLayoutSettingsVariables, TESTCAFE_DASHBOARD_URL, UPLOAD_URL_PREFIX } from './mocks';
import { TC_OLDEST_COMPATIBLE_VERSION } from '../src/validate-settings';
import { testWarningsInfo, WARNINGS_TEST_RUN_ID_1, WARNINGS_TEST_RUN_ID_2 } from './data/test-warnings-info';
import path from 'path';
import mock from 'mock-require';

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
            const reporter = reporterObjectFactory(mockReadFile, mockFileExists, fetch, SETTINGS, logger, TC_OLDEST_COMPATIBLE_VERSION);

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

        const pathPrefix      = path.sep === '\\' ? 'C:\\' : '/';
        const screenshotPath1 = `${pathPrefix}testing${path.sep}screenshots${path.sep}1.png`;
        const artifactsPath1  = `${pathPrefix}testing${path.sep}artifacts${path.sep}compared-screenshots${path.sep}1.png`;
        const baselinePath1   = `${pathPrefix}testing${path.sep}artifacts${path.sep}compared-screenshots${path.sep}1_etalon.png`;
        const diffPath1       = `${pathPrefix}testing${path.sep}artifacts${path.sep}compared-screenshots${path.sep}1_diff.png`;
        const maskPath1       = `${pathPrefix}testing${path.sep}artifacts${path.sep}compared-screenshots${path.sep}1_mask.png`;
        const thumbnailPath1  = `${pathPrefix}testing${path.sep}screenshots${path.sep}thumbnails${path.sep}1.png`;
        const screenshotPath2 = `${pathPrefix}testing${path.sep}screenshots${path.sep}2.png`;
        const artifactsPath2  = `${pathPrefix}testing${path.sep}artifacts${path.sep}compared-screenshots${path.sep}2.png`;
        const baselinePath2   = `${pathPrefix}testing${path.sep}artifacts${path.sep}compared-screenshots${path.sep}2_etalon.png`;
        const diffPath2       = `${pathPrefix}testing${path.sep}artifacts${path.sep}compared-screenshots${path.sep}2_diff.png`;
        const maskPath2       = `${pathPrefix}testing${path.sep}artifacts${path.sep}compared-screenshots${path.sep}2_mask.png`;
        const thumbnailPath2  = `${pathPrefix}testing${path.sep}screenshots${path.sep}thumbnails${path.sep}2.png`;
        const screenshotPath3 = `${pathPrefix}testing${path.sep}screenshots${path.sep}errors${path.sep}3.png`;
        const artifactsPath3  = `${pathPrefix}testing${path.sep}artifacts${path.sep}compared-screenshots${path.sep}errors${path.sep}3.png`;
        const thumbnailPath3  = `${pathPrefix}testing${path.sep}screenshots${path.sep}errors${path.sep}thumbnails${path.sep}3.png`;
        const screenshotPath4 = `${pathPrefix}testing${path.sep}my-screenshots-custom-folder${path.sep}4.png`;
        const thumbnailPath4  = `${pathPrefix}testing${path.sep}my-screenshots-custom-folder${path.sep}thumbnails${path.sep}4.png`;

        function readFile (filePath: string): Promise<Buffer> {
            screenshotPaths.push(filePath);

            let fileContent = '';

            switch (filePath) {
                case screenshotPath1:
                    fileContent = 'take_screenshot_action';
                    break;
                case baselinePath1:
                    fileContent = 'take_screenshot_action_etalon';
                    break;
                case diffPath1:
                    fileContent = 'take_screenshot_action_diff';
                    break;
                case maskPath1:
                    fileContent = 'take_screenshot_action_mask';
                    break;
                case screenshotPath2:
                    fileContent = 'some_other_action';
                    break;
                case baselinePath2:
                    fileContent = 'some_other_action_etalon';
                    break;
                case diffPath2:
                    fileContent = 'some_other_action_diff';
                    break;
                case screenshotPath3:
                    fileContent = 'screenshot_on_fail';
                    break;
                case screenshotPath4:
                    fileContent = 'custom_folder_screenshot';
                    break;
                default:
                    throw new Error(`Unknown file path: ${filePath}`);
            }

            return Promise.resolve(Buffer.from(fileContent));
        }

        function fileExists (filePath: string): Promise<boolean> {
            if ([
                artifactsPath3,
                maskPath2
            ].includes(filePath))
                return Promise.resolve(false);

            if ([
                screenshotPath1,
                artifactsPath1,
                baselinePath1,
                diffPath1,
                maskPath1,
                screenshotPath2,
                artifactsPath2,
                baselinePath2,
                diffPath2,
                screenshotPath3,
                screenshotPath4
            ].includes(filePath))
                return Promise.resolve(true);

            throw new Error(`Unknown file path: ${filePath}`);
        }

        function reRequireModules () {
            mock.reRequire('../src/env');
            mock.reRequire('../src/get-reporter-settings');

            return mock.reRequire('../src/reporter-object-factory').reporterObjectFactory;
        }

        before(stashLayoutSettingsVariables);
        after(() => {
            restoreLayoutSettingsVariables();
            reRequireModules();
        });

        afterEach(() => {
            clearLayoutSettingsVariables();
            reRequireModules();
        });

        beforeEach(() => {
            screenshotPaths = [];
        });

        it('Smoke test', async () => {
            setLayoutSettingsVariables('true', `${path.sep}screenshots`, `${path.sep}artifacts${path.sep}compared-screenshots`, `.${path.sep}testing`);

            const reporterFactory = reRequireModules();

            const screenshots: Screenshot[] = [
                {
                    testRunId:         testRunIdChrome,
                    screenshotPath:    screenshotPath1,
                    thumbnailPath:     thumbnailPath1,
                    userAgent:         'Chrome_79.0.3945.88_Windows_8.1',
                    takenOnFail:       false,
                    quarantineAttempt: 0
                },
                {
                    testRunId:         testRunIdChrome,
                    screenshotPath:    screenshotPath2,
                    thumbnailPath:     thumbnailPath2,
                    userAgent:         'Chrome_79.0.3945.88_Windows_8.1',
                    takenOnFail:       false,
                    quarantineAttempt: 0
                },
                {
                    testRunId:         testRunIdChrome,
                    screenshotPath:    screenshotPath3,
                    thumbnailPath:     thumbnailPath3,
                    userAgent:         'Chrome_79.0.3945.88_Windows_8.1',
                    takenOnFail:       true,
                    quarantineAttempt: 0
                },
                {
                    testRunId:         testRunIdChrome,
                    screenshotPath:    screenshotPath4,
                    thumbnailPath:     thumbnailPath4,
                    userAgent:         'Chrome_79.0.3945.88_Windows_8.1',
                    takenOnFail:       false,
                    quarantineAttempt: 0
                }
            ];

            const reporter = reporterFactory(readFile, fileExists, fetch, SETTINGS, loggerMock, TC_OLDEST_COMPATIBLE_VERSION);

            await reporter.reportTaskStart(new Date(), [], 1, [], { configuration: {}, dashboardUrl: '' });

            await reporter.reportTestDone('Test 1', {
                ...EMPTY_TEST_RUN_INFO,
                screenshots,
                browsers: [ { ...CHROME_HEADLESS, testRunId: 'chrome_headless' } ],
                fixture:  {
                    id:   'fixture1',
                    name: 'My fixture',
                    path: `${pathPrefix}testing${path.sep}tests${path.sep}suite1${path.sep}fixture1.js`,
                    meta: {}
                }
            });

            const { browserRuns } = JSON.parse(uploadedFiles[9].toString());
            const runCommands     = aggregateCommands.filter(command => command.aggregateName === AggregateNames.Run);

            assert.equal(runCommands.length, 2);
            assert.equal(runCommands[0].type, AggregateCommandType.reportTaskStart);
            assert.equal(runCommands[1].type, AggregateCommandType.reportTestDone);

            assert.equal(browserRuns['chrome_headless'].screenshotMap[0].path, screenshotPath1);
            assert.equal(browserRuns['chrome_headless'].screenshotMap[0].ids.current, uploadInfos[0].uploadId);
            assert.equal(browserRuns['chrome_headless'].screenshotMap[0].ids.baseline, uploadInfos[1].uploadId);
            assert.equal(browserRuns['chrome_headless'].screenshotMap[0].ids.diff, uploadInfos[2].uploadId);
            assert.equal(browserRuns['chrome_headless'].screenshotMap[0].ids.mask, uploadInfos[3].uploadId);
            assert.equal(browserRuns['chrome_headless'].screenshotMap[0].baselineSourcePath, 'testing/tests/suite1/etalons/1.png');
            assert.equal(browserRuns['chrome_headless'].screenshotMap[0].maskSourcePath, 'testing/tests/suite1/etalons/1_mask.png');
            assert.ok(browserRuns['chrome_headless'].screenshotMap[0].comparisonFailed);
            assert.equal(browserRuns['chrome_headless'].screenshotMap[1].path, screenshotPath2);
            assert.equal(browserRuns['chrome_headless'].screenshotMap[1].ids.current, uploadInfos[4].uploadId);
            assert.equal(browserRuns['chrome_headless'].screenshotMap[1].ids.baseline, uploadInfos[5].uploadId);
            assert.equal(browserRuns['chrome_headless'].screenshotMap[1].ids.diff, uploadInfos[6].uploadId);
            assert.equal(browserRuns['chrome_headless'].screenshotMap[1].baselineSourcePath, 'testing/tests/suite1/etalons/2.png');
            assert.equal(browserRuns['chrome_headless'].screenshotMap[1].maskSourcePath, 'testing/tests/suite1/etalons/2_mask.png');
            assert.ok(browserRuns['chrome_headless'].screenshotMap[1].comparisonFailed);
            assert.equal(browserRuns['chrome_headless'].screenshotMap[2].path, screenshotPath3);
            assert.equal(browserRuns['chrome_headless'].screenshotMap[2].ids.current, uploadInfos[7].uploadId);
            assert.equal(browserRuns['chrome_headless'].screenshotMap[2].comparisonFailed, false);
            assert.equal(browserRuns['chrome_headless'].screenshotMap[3].path, screenshotPath4);
            assert.equal(browserRuns['chrome_headless'].screenshotMap[3].ids.current, uploadInfos[8].uploadId);
            assert.equal(browserRuns['chrome_headless'].screenshotMap[3].comparisonFailed, false);
            assert.equal(runCommands[1].payload.uploadId, uploadInfos[9].uploadId);

            assert.equal(uploadInfos.length, 10);
            assert.equal(uploadedUrls.length, 10);
            assert.equal(uploadedUrls[0], uploadInfos[0].uploadUrl);
            assert.equal(uploadedUrls[1], uploadInfos[1].uploadUrl);
            assert.equal(uploadedUrls[2], uploadInfos[2].uploadUrl);
            assert.equal(uploadedUrls[3], uploadInfos[3].uploadUrl);
            assert.equal(uploadedUrls[4], uploadInfos[4].uploadUrl);
            assert.equal(uploadedUrls[5], uploadInfos[5].uploadUrl);
            assert.equal(uploadedUrls[6], uploadInfos[6].uploadUrl);
            assert.equal(uploadedUrls[7], uploadInfos[7].uploadUrl);
            assert.equal(uploadedUrls[8], uploadInfos[8].uploadUrl);
            assert.equal(uploadedUrls[9], uploadInfos[9].uploadUrl);

            assert.equal(uploadedFiles.length, 10);
            assert.equal(uploadedFiles[0], 'take_screenshot_action');
            assert.equal(uploadedFiles[1], 'take_screenshot_action_etalon');
            assert.equal(uploadedFiles[2], 'take_screenshot_action_diff');
            assert.equal(uploadedFiles[3], 'take_screenshot_action_mask');
            assert.equal(uploadedFiles[4], 'some_other_action');
            assert.equal(uploadedFiles[5], 'some_other_action_etalon');
            assert.equal(uploadedFiles[6], 'some_other_action_diff');
            assert.equal(uploadedFiles[7], 'screenshot_on_fail');
            assert.equal(uploadedFiles[8], 'custom_folder_screenshot');

            assert.equal(screenshotPaths.length, 9);
            assert.equal(screenshotPaths[0], screenshotPath1);
            assert.equal(screenshotPaths[1], baselinePath1);
            assert.equal(screenshotPaths[2], diffPath1);
            assert.equal(screenshotPaths[3], maskPath1);
            assert.equal(screenshotPaths[4], screenshotPath2);
            assert.equal(screenshotPaths[5], baselinePath2);
            assert.equal(screenshotPaths[6], diffPath2);
            assert.equal(screenshotPaths[7], screenshotPath3);
            assert.equal(screenshotPaths[8], screenshotPath4);

            const uploadCommands = aggregateCommands.filter(command => command.aggregateName === AggregateNames.Upload);

            assert.equal(uploadCommands.length, 0);
        });

        it('Should upload only layout testing failures if noScreenshotUpload is true', async () => {
            setLayoutSettingsVariables('true', `${path.sep}screenshots`, `${path.sep}artifacts${path.sep}compared-screenshots`, `.${path.sep}testing`);

            const reporterFactory = reRequireModules();

            const screenshots: Screenshot[] = [
                {
                    testRunId:         testRunIdChrome,
                    screenshotPath:    screenshotPath1,
                    thumbnailPath:     thumbnailPath1,
                    userAgent:         'Chrome_79.0.3945.88_Windows_8.1',
                    takenOnFail:       false,
                    quarantineAttempt: 0
                },
                {
                    testRunId:         testRunIdChrome,
                    screenshotPath:    screenshotPath2,
                    thumbnailPath:     thumbnailPath2,
                    userAgent:         'Chrome_79.0.3945.88_Windows_8.1',
                    takenOnFail:       false,
                    quarantineAttempt: 0
                },
                {
                    testRunId:         testRunIdChrome,
                    screenshotPath:    screenshotPath3,
                    thumbnailPath:     thumbnailPath3,
                    userAgent:         'Chrome_79.0.3945.88_Windows_8.1',
                    takenOnFail:       true,
                    quarantineAttempt: 0
                },
                {
                    testRunId:         testRunIdChrome,
                    screenshotPath:    screenshotPath4,
                    thumbnailPath:     thumbnailPath4,
                    userAgent:         'Chrome_79.0.3945.88_Windows_8.1',
                    takenOnFail:       false,
                    quarantineAttempt: 0
                }
            ];

            const reporter = reporterFactory(readFile, fileExists, fetch, { ...SETTINGS, noScreenshotUpload: true }, loggerMock, TC_OLDEST_COMPATIBLE_VERSION);

            await reporter.reportTaskStart(new Date(), [], 1, [], { configuration: {}, dashboardUrl: '' });

            await reporter.reportTestDone('Test 1', {
                ...EMPTY_TEST_RUN_INFO,
                screenshots,
                browsers: [ { ...CHROME_HEADLESS, testRunId: 'chrome_headless' } ],
                fixture:  {
                    id:   'fixture1',
                    name: 'My fixture',
                    path: `${pathPrefix}testing${path.sep}tests${path.sep}suite1${path.sep}fixture1.js`,
                    meta: {}
                }
            });

            const { browserRuns } = JSON.parse(uploadedFiles[7].toString());
            const runCommands     = aggregateCommands.filter(command => command.aggregateName === AggregateNames.Run);

            assert.equal(runCommands.length, 2);
            assert.equal(runCommands[0].type, AggregateCommandType.reportTaskStart);
            assert.equal(runCommands[1].type, AggregateCommandType.reportTestDone);

            assert.equal(browserRuns['chrome_headless'].screenshotMap[0].path, screenshotPath1);
            assert.equal(browserRuns['chrome_headless'].screenshotMap[0].ids.current, uploadInfos[0].uploadId);
            assert.equal(browserRuns['chrome_headless'].screenshotMap[0].ids.baseline, uploadInfos[1].uploadId);
            assert.equal(browserRuns['chrome_headless'].screenshotMap[0].ids.diff, uploadInfos[2].uploadId);
            assert.equal(browserRuns['chrome_headless'].screenshotMap[0].ids.mask, uploadInfos[3].uploadId);
            assert.equal(browserRuns['chrome_headless'].screenshotMap[0].baselineSourcePath, 'testing/tests/suite1/etalons/1.png');
            assert.equal(browserRuns['chrome_headless'].screenshotMap[0].maskSourcePath, 'testing/tests/suite1/etalons/1_mask.png');
            assert.ok(browserRuns['chrome_headless'].screenshotMap[0].comparisonFailed);
            assert.equal(browserRuns['chrome_headless'].screenshotMap[1].path, screenshotPath2);
            assert.equal(browserRuns['chrome_headless'].screenshotMap[1].ids.current, uploadInfos[4].uploadId);
            assert.equal(browserRuns['chrome_headless'].screenshotMap[1].ids.baseline, uploadInfos[5].uploadId);
            assert.equal(browserRuns['chrome_headless'].screenshotMap[1].ids.diff, uploadInfos[6].uploadId);
            assert.equal(browserRuns['chrome_headless'].screenshotMap[1].baselineSourcePath, 'testing/tests/suite1/etalons/2.png');
            assert.equal(browserRuns['chrome_headless'].screenshotMap[1].maskSourcePath, 'testing/tests/suite1/etalons/2_mask.png');
            assert.ok(browserRuns['chrome_headless'].screenshotMap[1].comparisonFailed);
            assert.equal(runCommands[1].payload.uploadId, uploadInfos[7].uploadId);

            assert.equal(uploadInfos.length, 8);
            assert.equal(uploadedUrls.length, 8);
            assert.equal(uploadedUrls[0], uploadInfos[0].uploadUrl);
            assert.equal(uploadedUrls[1], uploadInfos[1].uploadUrl);
            assert.equal(uploadedUrls[2], uploadInfos[2].uploadUrl);
            assert.equal(uploadedUrls[3], uploadInfos[3].uploadUrl);
            assert.equal(uploadedUrls[4], uploadInfos[4].uploadUrl);
            assert.equal(uploadedUrls[5], uploadInfos[5].uploadUrl);
            assert.equal(uploadedUrls[6], uploadInfos[6].uploadUrl);
            assert.equal(uploadedUrls[7], uploadInfos[7].uploadUrl);

            assert.equal(uploadedFiles.length, 8);
            assert.equal(uploadedFiles[0], 'take_screenshot_action');
            assert.equal(uploadedFiles[1], 'take_screenshot_action_etalon');
            assert.equal(uploadedFiles[2], 'take_screenshot_action_diff');
            assert.equal(uploadedFiles[3], 'take_screenshot_action_mask');
            assert.equal(uploadedFiles[4], 'some_other_action');
            assert.equal(uploadedFiles[5], 'some_other_action_etalon');
            assert.equal(uploadedFiles[6], 'some_other_action_diff');

            assert.equal(screenshotPaths.length, 7);
            assert.equal(screenshotPaths[0], screenshotPath1);
            assert.equal(screenshotPaths[1], baselinePath1);
            assert.equal(screenshotPaths[2], diffPath1);
            assert.equal(screenshotPaths[3], maskPath1);
            assert.equal(screenshotPaths[4], screenshotPath2);
            assert.equal(screenshotPaths[5], baselinePath2);
            assert.equal(screenshotPaths[6], diffPath2);

            const uploadCommands = aggregateCommands.filter(command => command.aggregateName === AggregateNames.Upload);

            assert.equal(uploadCommands.length, 0);
        });

        it('Should upload screenshots from screenshotData', async () => {
            const screenshots: Screenshot[] = [
                {
                    testRunId:         testRunIdChrome,
                    screenshotPath:    screenshotPath1,
                    screenshotData:    Buffer.from('take_screenshot_action_from_buffer'),
                    thumbnailPath:     thumbnailPath1,
                    userAgent:         'Chrome_79.0.3945.88_Windows_8.1',
                    takenOnFail:       false,
                    quarantineAttempt: 0
                },
                {
                    testRunId:         testRunIdChrome,
                    screenshotPath:    screenshotPath2,
                    screenshotData:    Buffer.from('screenshot_on_fail_from_buffer'),
                    thumbnailPath:     thumbnailPath2,
                    userAgent:         'Chrome_79.0.3945.88_Windows_8.1',
                    takenOnFail:       true,
                    quarantineAttempt: 0
                }
            ];

            const reporter = reporterObjectFactory(readFile, mockFileExists, fetch, SETTINGS, loggerMock, TC_OLDEST_COMPATIBLE_VERSION);

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

            assert.equal(uploadCommands.length, 0);
        });

        it('Should not send screenshots info to dashboard if NO_SCREENSHOT_UPLOAD is true', async () => {
            const screenshots: Screenshot[] = [
                {
                    testRunId:         testRunIdChrome,
                    screenshotPath:    screenshotPath1,
                    thumbnailPath:     thumbnailPath1,
                    userAgent:         'Chrome_79.0.3945.88_Windows_8.1',
                    takenOnFail:       false,
                    quarantineAttempt: 0
                },
                {
                    testRunId:         testRunIdChrome,
                    screenshotPath:    screenshotPath2,
                    thumbnailPath:     thumbnailPath2,
                    userAgent:         'Chrome_79.0.3945.88_Windows_8.1',
                    takenOnFail:       true,
                    quarantineAttempt: 0
                }
            ];

            const reporter = reporterObjectFactory(mockReadFile, mockFileExists, fetch, { ...SETTINGS, noScreenshotUpload: true }, loggerMock, TC_OLDEST_COMPATIBLE_VERSION);

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

            assert.equal(aggregateCommands.length, 2);
            assert.equal(aggregateCommands[0].type, AggregateCommandType.reportTaskStart);

            assert.equal(aggregateCommands[1].payload.uploadId, uploadInfos[0].uploadId);
            assert.equal(aggregateCommands[1].type, AggregateCommandType.reportTestDone);
        });
    });

    describe('Videos', () => {
        it('Smoke test', async () => {
            const videoPaths: string[] = [];

            function readFile (filePath: string): Promise<Buffer> {
                videoPaths.push(filePath);

                return Promise.resolve(Buffer.from(`fileContent_${filePath}`));
            };

            const reporter = reporterObjectFactory(readFile, mockFileExists, fetch, SETTINGS, loggerMock, TC_OLDEST_COMPATIBLE_VERSION);

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

            assert.equal(uploadCommands.length, 0);
        });

        it('Should not send videos info to dashboard if NO_VIDEO_UPLOAD enabled', async () => {
            const reporter = reporterObjectFactory(mockReadFile, mockFileExists, fetch, { ...SETTINGS, noVideoUpload: true }, loggerMock, TC_OLDEST_COMPATIBLE_VERSION);

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

            assert.equal(aggregateCommands.length, 2);
            assert.equal(aggregateCommands[0].type, AggregateCommandType.reportTaskStart);

            assert.equal(aggregateCommands[1].payload.uploadId, uploadInfos[0].uploadId);
            assert.equal(aggregateCommands[1].type, AggregateCommandType.reportTestDone);
        });
    });
});
