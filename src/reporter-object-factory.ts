import uuid from 'uuid';

import { createReportUrlMessage } from './texts';
import {
    createDashboardTestRunInfo,
    createTestError,
    FetchMethod,
    ReadFileMethod,
    DashboardSettings,
    Logger,
    ReporterPluginObject
} from './types/internal/';
import {
    ActionInfo,
    BrowserRunInfo,
    BuildId,
    Error,
    ReportedTestStructureItem,
    ShortId,
    TestDoneArgs,
    TestError
} from './types';
import { Uploader } from './upload';
import { errorDecorator, curly } from './error-decorator';
import reportCommandsFactory from './report-commands-factory';
import Transport from './transport';
import assignReporterMethods from './assign-reporter-methods';
import { validateSettings } from './validate-settings';
import BLANK_REPORTER from './blank-reporter';

function isThirdPartyError (error: Error): boolean {
    return error.code === 'E2';
}

export default function reporterObjectFactory (
    readFile: ReadFileMethod,
    fetch: FetchMethod,
    settings: DashboardSettings,
    logger: Logger,
    tcVersion: string
): ReporterPluginObject {
    if (!validateSettings(settings, tcVersion, logger))
        return BLANK_REPORTER;

    const {
        authenticationToken,
        buildId,
        dashboardUrl,
        isLogEnabled,
        noScreenshotUpload,
        noVideoUpload,
        runId,
        responseTimeout,
        requestRetryCount,
        ciInfo
    } = settings;

    const id: string = runId || uuid();

    const transport      = new Transport(fetch, dashboardUrl, authenticationToken, isLogEnabled, logger, responseTimeout, requestRetryCount);
    const uploader       = new Uploader(readFile, transport, logger);
    const reportCommands = reportCommandsFactory(id, transport);

    const testRunToActionsMap: Record<string, ActionInfo[]> = {};
    const browserToRunsMap: Record<string, any[]>           = {};

    const reporterPluginObject: ReporterPluginObject = { ...BLANK_REPORTER, createErrorDecorator: errorDecorator };

    assignReporterMethods(reporterPluginObject, {
        async reportTaskStart (startTime, userAgents, testCount, taskStructure: ReportedTestStructureItem[]): Promise<void> {
            logger.log(createReportUrlMessage(buildId || id, authenticationToken, dashboardUrl));

            await reportCommands.sendTaskStartCommand({
                startTime, userAgents, testCount, buildId: buildId as BuildId, taskStructure, ciInfo
            });
        },

        async reportFixtureStart (): Promise<void> {
            return void 0;
        },

        async reportTestStart (name, meta, testStartInfo): Promise<void> {

            const testId = testStartInfo.testId as ShortId;

            await reportCommands.sendTestStartCommand({ testId });
        },

        async reportTestActionDone (apiActionName, actionInfo): Promise<void> {
            const { test: { phase }, command, testRunId, err, duration, browser } = actionInfo;

            if (!testRunToActionsMap[testRunId])
                testRunToActionsMap[testRunId] = [];

            const action: ActionInfo = {
                duration,
                apiName:   apiActionName,
                testPhase: phase,
                command
            };

            if (err) {
                action.error = createTestError(err,
                    curly(this.useWordWrap(false).setIndent(0).formatError(err))
                );
            }

            testRunToActionsMap[testRunId].push(action);

            if (!browser)
                return;

            const { alias } = browser;

            if (!browserToRunsMap[alias])
                browserToRunsMap[alias] = [testRunId];
            else if (!browserToRunsMap[alias].includes(testRunId))
                browserToRunsMap[alias].push(testRunId);
        },

        async reportTestDone (name, testRunInfo): Promise<void> {
            const { screenshots, videos, errs, durationMs, testId, browsers, skipped, unstable } = testRunInfo;

            const testRunToScreenshotsMap: Record<string, string[]> = {};
            const testRunToVideosMap: Record<string, string[]>      = {};
            const testRunToErrorsMap: Record<string, TestError>     = {};

            if (!noScreenshotUpload) {
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

            if (!noVideoUpload) {
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
                const { alias, testRunId } = browser;
                const runIds               = browserToRunsMap[alias];

                let videoUploadIds: string[] = [];

                if (!noVideoUpload) {
                    const videoTestRunId = runIds && runIds.find(videoRunId => testRunToVideosMap[videoRunId] && testRunToVideosMap[videoRunId].length) || testRunId;

                    if (videoTestRunId)
                        videoUploadIds = testRunToVideosMap[videoTestRunId];
                }
                let quarantineAttempt = 1;

                const getBrowserRunInfo = (attemptRunId: string, attempt: number): BrowserRunInfo => {
                    const result = {
                        browser,
                        screenshotUploadIds: testRunToScreenshotsMap[attemptRunId],
                        videoUploadIds,
                        actions:             testRunToActionsMap[attemptRunId],
                        thirdPartyError:     testRunToErrorsMap[attemptRunId],
                        quarantineAttempt:   attempt,
                        isFinalAttempt:      attemptRunId === testRunId
                    };

                    delete testRunToActionsMap[attemptRunId];

                    return result;
                };

                if (browserToRunsMap[alias] && browserToRunsMap[alias].length) {
                    for (const attemptRunId of browserToRunsMap[alias])
                        runs[attemptRunId] = getBrowserRunInfo(attemptRunId, quarantineAttempt);

                    quarantineAttempt++;
                }
                else
                    runs[testRunId] = getBrowserRunInfo(testRunId, quarantineAttempt);

                delete browserToRunsMap[alias];

                return runs;
            }, {} as Record<string, BrowserRunInfo>);

            const testDonePayload: TestDoneArgs = {
                testId:     testId as ShortId,
                skipped,
                errorCount: errs.length,
                duration:   durationMs,
                unstable,
                uploadId:   await uploader.uploadTest(name,
                    createDashboardTestRunInfo(testRunInfo, browserRuns)
                )
            };

            await reportCommands.sendTestDoneCommand(testDonePayload);
        },

        async reportTaskDone (endTime, passed, warnings, result): Promise<void> {
            await uploader.waitUploads();
            await reportCommands.sendTaskDoneCommand({
                endTime, passed, warnings, result, buildId: buildId as BuildId
            });
        }
    }, isLogEnabled);

    return reporterPluginObject;
};
