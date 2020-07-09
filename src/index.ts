import uuid from 'uuid';
import logger from './logger';

import { NO_SCREENSHOT_UPLOAD, NO_VIDEO_UPLOAD, TESTCAFE_DASHBOARD_BUILD_ID } from './env-variables';
import { createReportUrlMessage, createLongBuildIdError } from './texts';
import { BrowserRunInfo, createDashboardTestRunInfo, createTestError, ActionInfo, TestError } from './types/dashboard';
import { Uploader } from './upload';
import { ReporterPluginObject, Error, ReportedTestStructureItem } from './types/testcafe';
import { errorDecorator, curly } from './error-decorator';
import { sendTaskStartCommand, sendTestStartCommand, sendTestDoneCommand, sendTaskDoneCommand } from './commands';

export const MAX_BUILD_ID_LENGTH = 100;

function isThirdPartyError (error: Error): boolean {
    return error.code === 'E2';
}

module.exports = function plaginFactory (): ReporterPluginObject {
    const id = uuid() as string;
    const uploader = new Uploader(id);

    const testRunToActionsMap: Record<string, ActionInfo[]> = {};

    return {
        createErrorDecorator: errorDecorator,

        async reportTaskStart (startTime, userAgents, testCount, taskStructure: ReportedTestStructureItem[]): Promise<void> {
            if (TESTCAFE_DASHBOARD_BUILD_ID && TESTCAFE_DASHBOARD_BUILD_ID.length > MAX_BUILD_ID_LENGTH) {
                logger.log(createLongBuildIdError(TESTCAFE_DASHBOARD_BUILD_ID));
                throw new Error(createLongBuildIdError(TESTCAFE_DASHBOARD_BUILD_ID));
            }

            await sendTaskStartCommand(id, { startTime, userAgents, testCount, buildId: TESTCAFE_DASHBOARD_BUILD_ID, taskStructure });
            logger.log(createReportUrlMessage(TESTCAFE_DASHBOARD_BUILD_ID || id));
        },

        async reportFixtureStart () {
            return void 0;
        },

        async reportTestStart (name, meta, testStartInfo): Promise<void> {
            const { testId } = testStartInfo;

            await sendTestStartCommand(id, { testId });
        },

        async reportTestActionDone (apiActionName, actionInfo): Promise<void> {
            const { test: { phase }, command, testRunId, err, duration } = actionInfo;

            if (!testRunToActionsMap[testRunId])
                testRunToActionsMap[testRunId] = [];

            const action: ActionInfo = {
                duration,
                apiName:   apiActionName,
                testPhase: phase,
                command,
            };

            if (err) {
                action.error = createTestError(err,
                    curly(this.useWordWrap(false).setIndent(0).formatError(err))
                );
            }

            testRunToActionsMap[testRunId].push(action);
        },

        async reportTestDone (name, testRunInfo): Promise<void> {
            const { screenshots, videos, errs, durationMs, testId, browsers } = testRunInfo;

            const testRunToScreenshotsMap: Record<string, string[]> = {};
            const testRunToVideosMap: Record<string, string[]>      = {};
            const testRunToErrorsMap: Record<string, TestError>     = {};

            if (!NO_SCREENSHOT_UPLOAD) {
                for (const screenshotInfo of screenshots) {
                    const { screenshotPath, testRunId } = screenshotInfo;

                    const uploadId = await uploader.uploadFile(screenshotPath);

                    if (!uploadId) continue;

                    if (testRunToScreenshotsMap[testRunId])
                        testRunToScreenshotsMap[testRunId].push(uploadId);
                    else
                        testRunToScreenshotsMap[testRunId] = [uploadId];
                }
            }

            if (!NO_VIDEO_UPLOAD) {
                for (const videoInfo of videos) {
                    const { videoPath, testRunId } = videoInfo;

                    const uploadId = await uploader.uploadFile(videoPath);

                    if (!uploadId) continue;

                    if (testRunToVideosMap[testRunId])
                        testRunToVideosMap[testRunId].push(uploadId);
                    else
                        testRunToVideosMap[testRunId] = [uploadId];
                }
            }

            for (const err of errs) {
                if (!isThirdPartyError(err))
                    continue;

                const { testRunId } = err;

                testRunToErrorsMap[testRunId] = createTestError(err,
                    curly(this.useWordWrap(false).setIndent(0).formatError(err))
                );
            }

            const browserRuns = browsers.reduce((runs, browser) => {
                const { testRunId } = browser;

                runs[testRunId] = {
                    browser,
                    screenshotUploadIds: testRunToScreenshotsMap[testRunId],
                    videoUploadIds:      testRunToVideosMap[testRunId],
                    actions:             testRunToActionsMap[testRunId],
                    thirdPartyError:     testRunToErrorsMap[testRunId]
                };

                delete testRunToActionsMap[testRunId];

                return runs;
            }, {} as Record<string, BrowserRunInfo>);

            const testDonePayload = {
                testId,
                errorCount: errs.length,
                duration:   durationMs,
                uploadId:   await uploader.uploadTest(name, createDashboardTestRunInfo(testRunInfo, browserRuns))
            };

            await sendTestDoneCommand(id, testDonePayload);
        },

        async reportTaskDone (endTime, passed, warnings, result): Promise<void> {
            await uploader.waitUploads();
            await sendTaskDoneCommand(id, { endTime, passed, warnings, result, buildId: TESTCAFE_DASHBOARD_BUILD_ID });
        }
    };
};
