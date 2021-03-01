import uuid from 'uuid';
import assert from 'assert';
import { Screenshot, DashboardTestRunInfo } from '../src/types/testcafe';
import { CHROME_HEADLESS, CHROME, FIREFOX } from './data/test-browser-info';
import { AggregateCommandType, UploadStatus, AggregateNames, DashboardSettings } from '../src/types/internal/';
import { EMPTY_TEST_RUN_INFO } from './data/empty-test-run-info';
import reporterObjectFactory from '../src/reporter-object-factory';
import logger from '../src/logger';
import { Name } from '../src/types';

const UPLOAD_URL_PREFIX           = 'http://upload_url/';
const TESTCAFE_DASHBOARD_URL      = 'http://localhost';
const SETTINGS: DashboardSettings = {
    authenticationToken: 'authentication_token',
    buildId:             '',
    dashboardUrl:        TESTCAFE_DASHBOARD_URL,
    isLogEnabled:        false,
    noScreenshotUpload:  false,
    noVideoUpload:       false
};

const noop  = () => void 0;

const testRunIdChrome = 'chrome_headless' as Name;
const testRunId1 = 'testRun_1' as Name;
const testRunId2 = 'testRun_2' as Name;

describe('Uploads', () => {
    const aggregateCommands = [];
    const uploadedFiles     = [];
    const uploadedUrls      = [];
    const uploadInfos       = [];

    function fetch (url, request) {
        if (url.startsWith(`${TESTCAFE_DASHBOARD_URL}/api/uploader/getUploadUrl?dir=`)) {
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

        throw new Error('Unknown request');
    }

    beforeEach(() => {
        aggregateCommands.splice(0);
        uploadedFiles.splice(0);
        uploadedUrls.splice(0);
        uploadInfos.splice(0);
    });

    describe('Screenshots', () => {
        it('Smoke test', async () => {
            const screenshotPaths = [];

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

            const reporter = reporterObjectFactory(readFile, fetch, SETTINGS, logger);

            await reporter.reportTestDone('Test 1', {
                ...EMPTY_TEST_RUN_INFO,
                screenshots,
                browsers: [ { ...CHROME_HEADLESS, testRunId: 'chrome_headless' as Name } ]
            });

            const { browserRuns } = JSON.parse(uploadedFiles[2].toString()) as DashboardTestRunInfo;
            const runCommands     = aggregateCommands.filter(command => command.aggregateName === AggregateNames.Run);

            assert.equal(runCommands.length, 1);
            assert.equal(runCommands[0].type, AggregateCommandType.reportTestDone);

            assert.equal(browserRuns['chrome_headless'].screenshotUploadIds[0], uploadInfos[0].uploadId);
            assert.equal(browserRuns['chrome_headless'].screenshotUploadIds[1], uploadInfos[1].uploadId);
            assert.equal(runCommands[0].payload.uploadId, uploadInfos[2].uploadId);

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
            assert.deepEqual(uploadCommands[0].payload, { status: UploadStatus.Completed, reportId: runCommands[0].aggregateId });

            assert.equal(uploadCommands[1].type, AggregateCommandType.createUpload);
            assert.deepEqual(uploadCommands[1].aggregateId, uploadInfos[1].uploadId);
            assert.deepEqual(uploadCommands[1].payload, { status: UploadStatus.Completed, reportId: runCommands[0].aggregateId });

            assert.equal(uploadCommands[2].type, AggregateCommandType.createUpload);
            assert.deepEqual(uploadCommands[2].aggregateId, uploadInfos[2].uploadId);
            assert.deepEqual(uploadCommands[2].payload, { status: UploadStatus.Completed, reportId: runCommands[0].aggregateId });
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

            const reporter = reporterObjectFactory(noop, fetch, { ...SETTINGS, noScreenshotUpload: true }, logger);

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

            assert.equal(browserRuns['chrome_headless'].screenshotUploadIds, void 0);

            assert.equal(aggregateCommands.length, 2);
            assert.equal(aggregateCommands[0].payload.uploadId, uploadInfos[0].uploadId);
            assert.equal(aggregateCommands[0].type, AggregateCommandType.reportTestDone);

            assert.equal(aggregateCommands[1].type, AggregateCommandType.createUpload);
            assert.deepEqual(aggregateCommands[1].aggregateId, uploadInfos[0].uploadId);
            assert.deepEqual(aggregateCommands[1].payload, { status: UploadStatus.Completed, reportId: aggregateCommands[0].aggregateId });
        });
    });

    describe('Videos', () => {
        it('Smoke test', async () => {
            const videoPaths = [];

            function readFile (path: string): Promise<Buffer> {
                videoPaths.push(path);

                return Promise.resolve(Buffer.from(`fileContent_${path}`));
            };

            const reporter = reporterObjectFactory(readFile, fetch, SETTINGS, logger);

            await reporter.reportTestDone('Test 1', {
                ...EMPTY_TEST_RUN_INFO,
                browsers: [ { ...CHROME, testRunId: testRunId1 }, { ...FIREFOX, testRunId: testRunId2 } ],
                videos:   [
                    {
                        quarantineAttempt: null,
                        testRunId:         testRunId1,
                        userAgent:         CHROME.prettyUserAgent,
                        videoPath:         '1.mp4'
                    },
                    {
                        quarantineAttempt: null,
                        testRunId:         testRunId2,
                        userAgent:         FIREFOX.prettyUserAgent,
                        videoPath:         '2.mp4'
                    }
                ]
            });

            const { browserRuns } = JSON.parse(uploadedFiles[2].toString()) as DashboardTestRunInfo;
            const runCommands     = aggregateCommands.filter(command => command.aggregateName === AggregateNames.Run);

            assert.equal(runCommands.length, 1);
            assert.equal(runCommands[0].type, AggregateCommandType.reportTestDone);

            assert.equal(videoPaths.length, 2, 'videoPaths');
            assert.equal(uploadInfos.length, 3, 'uploadInfos');
            assert.equal(uploadedUrls.length, 3, 'uploadedUrls');

            assert.equal(browserRuns['testRun_1'].videoUploadIds[0], uploadInfos[0].uploadId);
            assert.equal(browserRuns['testRun_2'].videoUploadIds[0], uploadInfos[1].uploadId);
            assert.equal(runCommands[0].payload.uploadId, uploadInfos[2].uploadId);

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
            assert.deepEqual(uploadCommands[0].payload, { status: UploadStatus.Completed, reportId: runCommands[0].aggregateId });

            assert.equal(uploadCommands[1].type, AggregateCommandType.createUpload);
            assert.deepEqual(uploadCommands[1].aggregateId, uploadInfos[1].uploadId);
            assert.deepEqual(uploadCommands[1].payload, { status: UploadStatus.Completed, reportId: runCommands[0].aggregateId });

            assert.equal(uploadCommands[2].type, AggregateCommandType.createUpload);
            assert.deepEqual(uploadCommands[2].aggregateId, uploadInfos[2].uploadId);
            assert.deepEqual(uploadCommands[2].payload, { status: UploadStatus.Completed, reportId: runCommands[0].aggregateId });
        });

        it('Should not send videos info to dashboard if NO_VIDEO_UPLOAD enabled', async () => {
            const reporter = reporterObjectFactory(noop, fetch, { ...SETTINGS, noVideoUpload: true }, logger);

            await reporter.reportTestDone('Test 1', {
                ...EMPTY_TEST_RUN_INFO,
                browsers: [ { ...CHROME, testRunId: testRunId1 }, { ...FIREFOX, testRunId: testRunId2 } ],
                videos:   [
                    {
                        quarantineAttempt: null,
                        testRunId:         testRunId1,
                        userAgent:         CHROME.prettyUserAgent,
                        videoPath:         '1.mp4'
                    },
                    {
                        quarantineAttempt: null,
                        testRunId:         testRunId2,
                        userAgent:         FIREFOX.prettyUserAgent,
                        videoPath:         '2.mp4'
                    }
                ]
            });

            const { browserRuns } = JSON.parse(uploadedFiles[0].toString()) as DashboardTestRunInfo;

            assert.equal(uploadInfos.length, 1);
            assert.equal(uploadedUrls.length, 1);
            assert.equal(uploadedFiles.length, 1);
            assert.equal(browserRuns['testRun_1'].videoUploadIds, void 0);
            assert.equal(browserRuns['testRun_2'].videoUploadIds, void 0);

            assert.equal(aggregateCommands.length, 2);
            assert.equal(aggregateCommands[0].payload.uploadId, uploadInfos[0].uploadId);
            assert.equal(aggregateCommands[0].type, AggregateCommandType.reportTestDone);

            assert.equal(aggregateCommands[1].type, AggregateCommandType.createUpload);
            assert.deepEqual(aggregateCommands[1].aggregateId, uploadInfos[0].uploadId);
            assert.deepEqual(aggregateCommands[1].payload, { status: UploadStatus.Completed, reportId: aggregateCommands[0].aggregateId });
        });
    });
});
