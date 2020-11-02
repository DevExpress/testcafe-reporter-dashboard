import uuid from 'uuid';

import { createReportUrlMessage, getProjectId } from './texts';
import {
    BrowserRunInfo,
    createDashboardTestRunInfo,
    createTestError,
    ActionInfo,
    TestError,
    TestDoneArgs,
    FetchMethod,
    ReadFileMethod, DashboardSettings, Logger
} from './types/dashboard';
import { Uploader } from './upload';
import { ReporterPluginObject, Error, ReportedTestStructureItem } from './types/testcafe';
import { errorDecorator, curly } from './error-decorator';
import reportCommandsFactory from './report-commands-factory';
import Transport from './transport';
import assignReporterMethods from './assign-reporter-methods';
import validateSettings from './validate-settings';
import BLANK_REPORTER from './blank-reporter';

function isThirdPartyError (error: Error): boolean {
    return error.code === 'E2';
}

export default function reporterObjectFactory (readFile: ReadFileMethod, fetch: FetchMethod, settings: DashboardSettings, logger: Logger): ReporterPluginObject {
    if (!validateSettings(settings, logger))
        return BLANK_REPORTER;

    const {
        authenticationToken,
        buildId,
        dashboardUrl,
        isLogEnabled,
        noScreenshotUpload,
        noVideoUpload,
        runId
    } = settings;

    const id: string = runId || uuid();

    const transport      = new Transport(fetch, dashboardUrl, authenticationToken, isLogEnabled, logger);
    const uploader       = new Uploader(id, readFile, transport, logger);
    const projectId      = getProjectId(buildId || id, authenticationToken);
    const reportCommands = reportCommandsFactory(id, projectId, transport);

    const testRunToActionsMap: Record<string, ActionInfo[]> = {};

    const reporterPluginObject: ReporterPluginObject = { ...BLANK_REPORTER, createErrorDecorator: errorDecorator };

    assignReporterMethods(reporterPluginObject, {
        async reportTaskStart (startTime, userAgents, testCount, taskStructure: ReportedTestStructureItem[]): Promise<void> {
            logger.log(createReportUrlMessage(buildId || id, authenticationToken, dashboardUrl));
            await reportCommands.sendTaskStartCommand({ startTime, userAgents, testCount, runId: id, buildId, taskStructure });
        },

        async reportFixtureStart (): Promise<void> {
            return void 0;
        },

        async reportTestStart (name, meta, testStartInfo): Promise<void> {
            const { testId } = testStartInfo;

            await reportCommands.sendTestStartCommand({ testId });
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
            const { screenshots, videos, errs, durationMs, testId, browsers, skipped } = testRunInfo;

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

            const testDonePayload: TestDoneArgs = {
                testId,
                skipped,
                errorCount: errs.length,
                duration:   durationMs,
                uploadId:   await uploader.uploadTest(name, createDashboardTestRunInfo(testRunInfo, browserRuns))
            };

            await reportCommands.sendTestDoneCommand(testDonePayload);
        },

        async reportTaskDone (endTime, passed, warnings, result): Promise<void> {
            await uploader.waitUploads();
            await reportCommands.sendTaskDoneCommand({ endTime, passed, warnings, result, buildId });
        }
    }, isLogEnabled);

    return reporterPluginObject;
};
