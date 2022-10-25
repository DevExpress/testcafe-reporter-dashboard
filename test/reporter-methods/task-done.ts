import { v4 as uuid } from 'uuid';
import assert from 'assert';
import { AggregateCommandType } from '../../src/types/internal/';
import reporterObjectFactory from '../../src/reporter-object-factory';
import logger from '../../src/logger';
import { TC_OLDEST_COMPATIBLE_VERSION } from '../../src/validate-settings';
import { TaskDoneArgs } from '../../src/types';
import { mockReadFile, SETTINGS, TESTCAFE_DASHBOARD_URL, UPLOAD_URL_PREFIX } from '../mocks';
import { WARNINGS_TEST_RUN_ID_1 } from '../data/test-warnings-info';

describe('ReportTaskDone', () => {
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

        throw new Error('Unknown request');
    }

    it('warningsUploadId payload', async () => {
        const reporter = reporterObjectFactory(mockReadFile, fetch, SETTINGS, logger, TC_OLDEST_COMPATIBLE_VERSION);

        assert.deepStrictEqual(taskDonePayload, {});

        await reporter.reportTaskDone(new Date(), 1, [], { failedCount: 2, passedCount: 1, skippedCount: 0 });

        assert.strictEqual(taskDonePayload.warningsUploadId, void 0);

        await reporter.reportWarnings({ message: 'warning', testRunId: WARNINGS_TEST_RUN_ID_1 });

        await reporter.reportTaskDone(new Date(), 1, [], { failedCount: 2, passedCount: 1, skippedCount: 0 });

        assert.ok(taskDonePayload.warningsUploadId);
    });
});
