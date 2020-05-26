import mock from 'mock-require';
import uuid from 'uuid';
import assert from 'assert';

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

            const screenshots = [
                {
                    screenshotPath: 'C:\\screenshots\\1.png',
                    thumbnailPath:  'C:\\screenshots\\thumbnails\\1.png',
                    userAgent:      'Chrome_79.0.3945.88_Windows_8.1',
                    takenOnFail:    false,
                    uploadId:       null,
                },
                {
                    screenshotPath: 'C:\\screenshots\\errors\\1.png',
                    thumbnailPath:  'C:\\screenshots\\errors\\thumbnails\\1.png',
                    userAgent:      'Chrome_79.0.3945.88_Windows_8.1',
                    takenOnFail:    true,
                    uploadId:       null,
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

            await reporter.reportTestDone('Test 1', { screenshots, errs: [], videos: [] });
            await reporter.reportTaskDone('', 1, [], {});

            assert.equal(uploadInfos.length, 3);
            assert.equal(uploadedUrls.length, 3);
            assert.equal(uploadedUrls[0], uploadInfos[0].uploadUrl);
            assert.equal(uploadedUrls[1], uploadInfos[1].uploadUrl);

            assert.equal(screenshots[0].uploadId, uploadInfos[0].uploadId);
            assert.equal(screenshots[1].uploadId, uploadInfos[1].uploadId);

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

            const screenshots = [
                {
                    screenshotPath: 'C:\\screenshots\\1.png',
                    thumbnailPath:  'C:\\screenshots\\thumbnails\\1.png',
                    userAgent:      'Chrome_79.0.3945.88_Windows_8.1',
                    takenOnFail:    false,
                    uploadId:       null,
                },
                {
                    screenshotPath: 'C:\\screenshots\\errors\\1.png',
                    thumbnailPath:  'C:\\screenshots\\errors\\thumbnails\\1.png',
                    userAgent:      'Chrome_79.0.3945.88_Windows_8.1',
                    takenOnFail:    true,
                    uploadId:       null,
                }
            ];

            const { uploadInfos, uploadedUrls, uploadedFiles } = mockFetchAndFs({ readFile: noop });

            const reporter = mock.reRequire('../lib/index')();

            await reporter.reportTestDone('Test 1', { screenshots, errs: [], videos: [] });
            await reporter.reportTaskDone('', 1, [], {});

            assert.equal(uploadInfos.length, 1);
            assert.equal(uploadedUrls.length, 1);
            assert.equal(uploadedFiles.length, 1);
            assert.equal(uploadedFiles.length, 1);

            const testRunInfo = JSON.parse(uploadedFiles[0].toString());

            assert.equal(testRunInfo.screenshots.length, 0);
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
            const prettyUserAgents = ['Chrome 80.0.3987.149 \\ Windows 10', 'Firefox 73.0 \\ Windows 10'];
            const videoPaths = [];

            function readFile (path, readFileCallback): void {
                videoPaths.push(path);

                readFileCallback(null, 'fileContent');
            }

            function existsSync (path: string): boolean {
                return !path.includes('1_Chrome');
            }

            const { uploadInfos, uploadedUrls, uploadedFiles } = mockFetchAndFs({ readFile, existsSync });

            const reporter = mock.reRequire('../lib/index')();

            await reporter.reportTaskStart('timeStamp', prettyUserAgents, 1);
            await reporter.reportTestStart('testName1', {}, { testRunIds: [ 'testRun_1', 'testRun_2' ] });
            await reporter.reportTestActionDone('click', { testRunId: 'testRun_1', test: { phase: '' }, browser: { prettyUserAgent: prettyUserAgents[0] } });
            await reporter.reportTestActionDone('click', { testRunId: 'testRun_2', test: { phase: '' }, browser: { prettyUserAgent: prettyUserAgents[1] } });
            await reporter.reportTestDone('testName1', {
                screenshots: [],
                errs:        [],

                videos: [
                    {
                        videoPath: '1.mp4',
                        testRunId: 'testRun_1'
                    },
                    {
                        videoPath: '2.mp4',
                        testRunId: 'testRun_2'
                    }
                ],
            }, {});
            await reporter.reportTaskDone('', 1, [], {});

            assert.equal(videoPaths.length, 2, 'videoPaths');
            assert.equal(uploadInfos.length, 3, 'uploadInfos');
            assert.equal(uploadedUrls.length, 3, 'uploadedUrls');

            const { videos } = JSON.parse(uploadedFiles[2].toString());

            assert.equal(videos[0].uploadId, uploadInfos[0].uploadId);
            assert.equal(videos[0].testRunId, 'testRun_1');
            assert.equal(videos[0].userAgent, prettyUserAgents[0]);
            assert.equal(videos[1].uploadId, uploadInfos[1].uploadId);
            assert.equal(videos[1].testRunId, 'testRun_2');
            assert.equal(videos[1].userAgent, prettyUserAgents[1]);

            assert.equal(uploadedUrls[0], uploadInfos[0].uploadUrl);
            assert.equal(uploadedUrls[1], uploadInfos[1].uploadUrl);
        });

        it('Should not send videos info to dashboard if NO_VIDEO_UPLOAD enabled', async () => {
            mock('../lib/env-variables', {
                TESTCAFE_DASHBOARD_URL,
                TESTCAFE_DASHBOARD_AUTHENTICATION_TOKEN: 'authentication_token',
                NO_VIDEO_UPLOAD:                         true
            });

            const prettyUserAgents = ['Chrome 80.0.3987.149 \\ Windows 10', 'Firefox 73.0 \\ Windows 10'];

            const { uploadInfos, uploadedUrls, uploadedFiles } = mockFetchAndFs({ readFile: noop, existsSync: noop });

            const reporter = mock.reRequire('../lib/index')();

            await reporter.reportTaskStart('timeStamp', prettyUserAgents, 1);
            await reporter.reportTestStart('testName1', {}, { testRunIds: [ 'testRun_1', 'testRun_2' ] });
            await reporter.reportTestActionDone('click', { testRunId: 'testRun_1', test: { phase: '' }, browser: { prettyUserAgent: prettyUserAgents[0] } });
            await reporter.reportTestActionDone('click', { testRunId: 'testRun_2', test: { phase: '' }, browser: { prettyUserAgent: prettyUserAgents[1] } });
            await reporter.reportTestDone('testName1', {
                screenshots: [],
                errs:        [],

                videos: [
                    {
                        videoPath: '1.mp4',
                        testRunId: 'testRun_1'
                    },
                    {
                        videoPath: '2.mp4',
                        testRunId: 'testRun_2'
                    }
                ],
            }, {});
            await reporter.reportTaskDone('', 1, [], {});

            const { videos } = JSON.parse(uploadedFiles[0].toString());

            assert.equal(uploadInfos.length, 1);
            assert.equal(uploadedUrls.length, 1);
            assert.equal(uploadedFiles.length, 1);
            assert.equal(videos.length, 0);
        });
    });
});
