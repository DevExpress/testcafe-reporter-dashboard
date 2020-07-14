import mock from 'mock-require';
import uuid from 'uuid';
import assert from 'assert';
import { Screenshot, ReporterPluginObject } from '../src/types/testcafe';
import { CHROME_HEADLESS, CHROME, FIREFOX } from './data/test-browser-info';
import { DashboardTestRunInfo } from '../src/types/dashboard';
import { EMPTY_TEST_RUN_INFO } from './data/empty-test-run-info';

const TESTCAFE_DASHBOARD_URL = 'http://localhost';

const noop = () => void 0;

function mockFetchAndFs (fsObject) {
    const uploadUrlPrefix   = 'http://upload_url/';
    const uploadInfos       = [];
    const aggregateCommands = [];
    const uploadedUrls      = [];
    const uploadedFiles     = [];

    mock('isomorphic-fetch', (url, request) => {
        if (url.startsWith(`${TESTCAFE_DASHBOARD_URL}/api/uploader/getUploadUrl?dir=`)) {
            const uploadInfo = { uploadId: uuid(), uploadUrl: `${uploadUrlPrefix}${uuid()}` };

            uploadInfos.push(uploadInfo);

            return Promise.resolve({
                ok:   true,
                json: () => uploadInfo
            });
        }

        if (url === `${TESTCAFE_DASHBOARD_URL}/api/commands/`) {
            aggregateCommands.push(JSON.parse(request.body));

            return Promise.resolve({ ok: true });
        }

        if (url.startsWith(uploadUrlPrefix)) {
            uploadedUrls.push(url);
            uploadedFiles.push(request.body);

            return Promise.resolve({ ok: true });
        }

        throw new Error('Unknown request');
    });

    mock('fs', fsObject);

    mock.reRequire('../lib/fetch');
    mock.reRequire('../lib/upload');
    mock.reRequire('../lib/send-resolve-command');
    mock.reRequire('../lib/commands');

    return { uploadInfos, aggregateCommands, uploadedUrls, uploadedFiles };
}

describe('Uploads', () => {
    afterEach(() => {
        mock.stop('../lib/env-variables');
        mock.stop('isomorphic-fetch');
        mock.stop('fs');
        mock.reRequire('../lib/fetch');
        mock.reRequire('../lib/upload');
        mock.reRequire('../lib/send-resolve-command');
        mock.reRequire('../lib/commands');
    });

    describe('Screenshots', () => {
        before(() => {
            mock('../lib/env-variables', {
                TESTCAFE_DASHBOARD_URL,
                TESTCAFE_DASHBOARD_AUTHENTICATION_TOKEN: 'authentication_token'
            });
        });

        it('Smoke test', async () => {
            const screenshotPaths = [];

            const screenshots: Screenshot[] = [
                {
                    testRunId:         'chrome_headless',
                    screenshotPath:    'C:\\screenshots\\1.png',
                    thumbnailPath:     'C:\\screenshots\\thumbnails\\1.png',
                    userAgent:         'Chrome_79.0.3945.88_Windows_8.1',
                    takenOnFail:       false,
                    quarantineAttempt: 0
                },
                {
                    testRunId:         'chrome_headless',
                    screenshotPath:    'C:\\screenshots\\errors\\1.png',
                    thumbnailPath:     'C:\\screenshots\\errors\\thumbnails\\1.png',
                    userAgent:         'Chrome_79.0.3945.88_Windows_8.1',
                    takenOnFail:       true,
                    quarantineAttempt: 0
                }
            ];

            function readFile (path, readFileCallback): void {
                screenshotPaths.push(path);

                let fileContent = '';

                if (path === 'C:\\screenshots\\1.png')
                    fileContent = 'take_screenshot_action';
                else if (path === 'C:\\screenshots\\errors\\1.png')
                    fileContent = 'screenshot_on_fail';
                else
                    throw new Error('Unknown file path');

                readFileCallback(null, fileContent);
            }

            const { uploadInfos, uploadedUrls, uploadedFiles } = mockFetchAndFs({ readFile });

            const reporter = mock.reRequire('../lib/index')();

            await reporter.reportTestDone('Test 1', {
                ...EMPTY_TEST_RUN_INFO,
                screenshots,
                browsers: [ { ...CHROME_HEADLESS, testRunId: 'chrome_headless' } ]
            });

            const { browserRuns } = JSON.parse(uploadedFiles[2].toString()) as DashboardTestRunInfo;

            assert.equal(browserRuns['chrome_headless'].screenshotUploadIds[0], uploadInfos[0].uploadId);
            assert.equal(browserRuns['chrome_headless'].screenshotUploadIds[1], uploadInfos[1].uploadId);

            assert.equal(uploadInfos.length, 3);
            assert.equal(uploadedUrls.length, 3);
            assert.equal(uploadedUrls[0], uploadInfos[0].uploadUrl);
            assert.equal(uploadedUrls[1], uploadInfos[1].uploadUrl);

            assert.equal(uploadedFiles.length, 3);
            assert.equal(uploadedFiles[0], 'take_screenshot_action');
            assert.equal(uploadedFiles[1], 'screenshot_on_fail');

            assert.equal(screenshotPaths.length, 2);
            assert.equal(screenshotPaths[0], 'C:\\screenshots\\1.png');
            assert.equal(screenshotPaths[1], 'C:\\screenshots\\errors\\1.png');
        });

        it('Should not send screenshots info to dashboard if NO_SCREENSHOT_UPLOAD is true', async () => {
            mock('../lib/env-variables', {
                TESTCAFE_DASHBOARD_URL,
                TESTCAFE_DASHBOARD_AUTHENTICATION_TOKEN: 'authentication_token',
                NO_SCREENSHOT_UPLOAD:                    true
            });

            const screenshots: Screenshot[] = [
                {
                    testRunId:         'chrome_headless',
                    screenshotPath:    'C:\\screenshots\\1.png',
                    thumbnailPath:     'C:\\screenshots\\thumbnails\\1.png',
                    userAgent:         'Chrome_79.0.3945.88_Windows_8.1',
                    takenOnFail:       false,
                    quarantineAttempt: 0
                },
                {
                    testRunId:         'chrome_headless',
                    screenshotPath:    'C:\\screenshots\\errors\\1.png',
                    thumbnailPath:     'C:\\screenshots\\errors\\thumbnails\\1.png',
                    userAgent:         'Chrome_79.0.3945.88_Windows_8.1',
                    takenOnFail:       true,
                    quarantineAttempt: 0
                }
            ];

            const { uploadInfos, uploadedUrls, uploadedFiles } = mockFetchAndFs({ readFile: noop });

            const reporter: ReporterPluginObject = mock.reRequire('../lib/index')();

            await reporter.reportTestDone('Test 1', {
                ...EMPTY_TEST_RUN_INFO,
                screenshots,
                browsers: [ { ...CHROME, testRunId: 'chrome_headless' } ]
            });

            assert.equal(uploadInfos.length, 1);
            assert.equal(uploadedUrls.length, 1);
            assert.equal(uploadedFiles.length, 1);
            assert.equal(uploadedFiles.length, 1);

            const { browserRuns } = JSON.parse(uploadedFiles[0].toString()) as DashboardTestRunInfo;

            assert.equal(browserRuns['chrome_headless'].screenshotUploadIds, void 0);
        });
    });

    describe('Videos', () => {
        before(() => {
            mock('../lib/env-variables', {
                TESTCAFE_DASHBOARD_URL,
                TESTCAFE_DASHBOARD_AUTHENTICATION_TOKEN: 'authentication_token'
            });
        });

        it('Smoke test', async () => {
            const videoPaths = [];

            function readFile (path, readFileCallback): void {
                videoPaths.push(path);

                readFileCallback(null, `fileContent_${path}`);
            }

            function existsSync (path: string): boolean {
                return !path.includes('1_Chrome');
            }

            const { uploadInfos, uploadedUrls, uploadedFiles } = mockFetchAndFs({ readFile, existsSync });
            const reporter: ReporterPluginObject = mock.reRequire('../lib/index')();

            await reporter.reportTestDone('Test 1', {
                ...EMPTY_TEST_RUN_INFO,
                browsers: [ { ...CHROME, testRunId: 'testRun_1' }, { ...FIREFOX, testRunId: 'testRun_2' } ],
                videos:   [
                    {
                        quarantineAttempt: null,
                        testRunId:         'testRun_1',
                        userAgent:         CHROME.prettyUserAgent,
                        videoPath:         '1.mp4'
                    },
                    {
                        quarantineAttempt: null,
                        testRunId:         'testRun_2',
                        userAgent:         FIREFOX.prettyUserAgent,
                        videoPath:         '2.mp4'
                    }
                ]
            });

            const { browserRuns } = JSON.parse(uploadedFiles[2].toString()) as DashboardTestRunInfo;

            assert.equal(videoPaths.length, 2, 'videoPaths');
            assert.equal(uploadInfos.length, 3, 'uploadInfos');
            assert.equal(uploadedUrls.length, 3, 'uploadedUrls');

            assert.equal(browserRuns['testRun_1'].videoUploadIds[0], uploadInfos[0].uploadId);
            assert.equal(browserRuns['testRun_2'].videoUploadIds[0], uploadInfos[1].uploadId);

            assert.equal(uploadedUrls[0], uploadInfos[0].uploadUrl);
            assert.equal(uploadedUrls[1], uploadInfos[1].uploadUrl);

            assert.equal(videoPaths[0], '1.mp4');
            assert.equal(videoPaths[1], '2.mp4');

            assert.equal(uploadedFiles[0], 'fileContent_1.mp4');
            assert.equal(uploadedFiles[1], 'fileContent_2.mp4');
        });

        it('Should not send videos info to dashboard if NO_VIDEO_UPLOAD enabled', async () => {
            mock('../lib/env-variables', {
                TESTCAFE_DASHBOARD_URL,
                TESTCAFE_DASHBOARD_AUTHENTICATION_TOKEN: 'authentication_token',
                NO_VIDEO_UPLOAD:                         true
            });

            const { uploadInfos, uploadedUrls, uploadedFiles } = mockFetchAndFs({ readFile: noop, existsSync: noop });

            const reporter: ReporterPluginObject = mock.reRequire('../lib/index')();

            await reporter.reportTestDone('Test 1', {
                ...EMPTY_TEST_RUN_INFO,
                browsers: [ { ...CHROME, testRunId: 'testRun_1' }, { ...FIREFOX, testRunId: 'testRun_2' } ],
                videos:   [
                    {
                        quarantineAttempt: null,
                        testRunId:         'testRun_1',
                        userAgent:         CHROME.prettyUserAgent,
                        videoPath:         '1.mp4'
                    },
                    {
                        quarantineAttempt: null,
                        testRunId:         'testRun_2',
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
        });
    });
});
