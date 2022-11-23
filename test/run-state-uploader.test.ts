import assert from 'assert';
import { RunStateUploader, Uploader, RunStateProvider, } from '../src/run-state-uploader';
import FetchResponse from '../src/transport/fetch-response';

describe('Run state uploader tests', () => {
    let runStateUploader: RunStateUploader | null = null;
    let uploadedRunState = {};
    let currentRunState  = {
        id:     'run_1',
        passed: 0,
    };

    const uploader: Uploader = {
        getUploadInfo: async function getUploadInfo () {
            return {
                uploadUrl: 'https://upload.com',
                uploadId:  'upload_1'
            };
        },
        upload: async function upload (uploadUrl: string, uploadEntity: Buffer) {
            uploadedRunState = JSON.parse(uploadEntity.toString());

            return new FetchResponse({ ok: true });
        }
    };

    const runStateProvider: RunStateProvider = {
        getRunState: function getRunState () {
            return currentRunState;
        }
    };

    it('Upload run state on start', async () => {
        // arrange
        runStateUploader = new RunStateUploader(uploader, runStateProvider);

        // act
        const uploadId = await runStateUploader.start('run_1');

        // assert
        assert.deepStrictEqual(uploadedRunState, currentRunState);
        assert.deepStrictEqual(uploadId, 'upload_1');
    });

    it('Upload run state after run state upload period', async () => {
        // arrange
        runStateUploader = new RunStateUploader(uploader, runStateProvider, 1000);

        // act
        await runStateUploader.start('run_1');

        currentRunState = { ...currentRunState, passed: 1 };

        await new Promise((r) => setTimeout(r, 1500));

        // assert
        assert.deepStrictEqual(uploadedRunState, currentRunState);
    });

    it('Upload run state after run state on end', async () => {
        // arrange
        runStateUploader = new RunStateUploader(uploader, runStateProvider);

        // act
        await runStateUploader.start('run_1');

        currentRunState = { ...currentRunState, passed: 2 };

        await runStateUploader.end();

        // assert
        assert.deepStrictEqual(uploadedRunState, currentRunState);
    });

    afterEach(async () => {
        await runStateUploader?.end();

        runStateUploader = null;
    });
});
