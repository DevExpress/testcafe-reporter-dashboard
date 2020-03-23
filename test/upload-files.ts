import mock from 'mock-require';
import uuid from 'uuid';
import assert from 'assert';

const TESTCAFE_DASHBOARD_URL = 'http://localhost';

describe('Upload files', () => {
    before(() => {
        mock('../lib/env-variables', {
            TESTCAFE_DASHBOARD_URL,
            TESTCAFE_DASHBOARD_AUTHENTICATION_TOKEN: 'authentication_token',
            ENABLE_SCREENSHOTS_UPLOAD:               true
        });
    });

    after(() => {
        mock.stop('../lib/env-variables');
    });

    it('Smoke test', async () => {
        const uploadUrlPrefix   = 'http://upload_url/';
        const uploadInfos       = [];
        const aggregateCommands = [];
        const uploadedUrls      = [];
        const uploadedFiles     = [];
        const screenshotPaths   = [];

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

        mock('fs', {
            readFile: (path, readFileCallback) => {
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
        });

        mock.reRequire('../lib/fetch');
        mock.reRequire('../lib/upload');

        const reporter = mock.reRequire('../lib/index')();

        await reporter.reportTestDone('Test 1', { screenshots });
        await reporter.reportTaskDone('', 1, [], {});

        assert.equal(uploadInfos.length, 2);
        assert.equal(uploadedUrls.length, 2);
        assert.equal(uploadedUrls[0], uploadInfos[0].uploadUrl);
        assert.equal(uploadedUrls[1], uploadInfos[1].uploadUrl);

        assert.equal(screenshots[0].uploadId, uploadInfos[0].uploadId);
        assert.equal(screenshots[1].uploadId, uploadInfos[1].uploadId);

        assert.equal(uploadedFiles.length, 2);
        assert.equal(uploadedFiles[0], 'take_screenshot_action');
        assert.equal(uploadedFiles[1], 'screenshot_on_fail');

        assert.equal(screenshotPaths.length, 2);
        assert.equal(screenshotPaths[0], 'C:\\screenshots\\1.png');
        assert.equal(screenshotPaths[1], 'C:\\screenshots\\errors\\1.png');

        mock.stop('isomorphic-fetch');
        mock.stop('fs');
    });
});
