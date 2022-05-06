import uuid from 'uuid';

import { AUTHENTICATION_TOKEN_REJECTED, createReportUrlMessage } from './texts';
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
    DashboardInfo,
    DASHBOARD_INFO_TYPES,
    ReportedTestStructureItem,
    ShortId,
    TestDoneArgs,
    TestError,
    Warning,
    WarningsInfo
} from './types';
import { Uploader } from './upload';
import { errorDecorator, curly } from './error-decorator';
import reportCommandsFactory from './report-commands-factory';
import Transport from './transport';
import assignReporterMethods from './assign-reporter-methods';
import { validateSettings } from './validate-settings';
import BLANK_REPORTER from './blank-reporter';

function addArrayValueByKey (collection: Record<string, any[]>, key: string, value: any) {
    if (!collection[key])
        collection[key] = [value];
    else if (!collection[key].includes(value))
        collection[key].push(value);
};

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

    const testRunToWarningsMap: Record<string, Warning[]>         = {};
    const runWarnings: Warning[] = [];
    const testRunToActionsMap: Record<string, ActionInfo[]>       = {};
    const browserToRunsMap: Record<string, Record<string, any[]>> = {};
    const testRunIdToTestIdMap: Record<string, string>            = {};
    const errorsToTestIdMap: Record<string, string[]>             = {};

    let reportRejected = false;

    const reporterPluginObject: ReporterPluginObject = {
        ...BLANK_REPORTER,
        createErrorDecorator: errorDecorator,

        async init (): Promise<void> {
            const validationResponse = await transport.fetchFromDashboard(
                'api/validateReporter',
                {
                    method: 'POST',
                    body:   JSON.stringify({
                        reportId:        id,
                        reporterVersion: require('../package.json').version,
                        tcVersion
                    })
                }
            );

            const responseJson = await validationResponse.json();

            if(!responseJson)
                throw new Error('Expected json response');

            if (!validationResponse.ok) {
                const errorMessage = responseJson.message ? responseJson.message : AUTHENTICATION_TOKEN_REJECTED;

                logger.error(errorMessage);

                throw new Error(errorMessage);
            }

            processLimits(responseJson as DashboardInfo);     
        }
    };

    function processLimits(dashboardInfo: DashboardInfo) {
        if (dashboardInfo && dashboardInfo.type === DASHBOARD_INFO_TYPES.warning) {
            logger.warn(dashboardInfo.message);
            reportRejected = true;
        }
    }

    async function uploadWarnings (): Promise<string | undefined> {
        const warningsRunIds = Object.keys(testRunToWarningsMap);

        if (!warningsRunIds.length && !runWarnings.length)
            return void 0;

        const warningsInfo: WarningsInfo[] = [];

        for (const testRunId of warningsRunIds)
            warningsInfo.push({ testRunId, warnings: testRunToWarningsMap[testRunId] });

        if (runWarnings.length)
            warningsInfo.push({ warnings: runWarnings });

        return await uploader.uploadRunWarning(id, warningsInfo);
    }

    assignReporterMethods(reporterPluginObject, {
        async reportTaskStart (startTime, userAgents, testCount, taskStructure: ReportedTestStructureItem[]): Promise<void> {
            if (reportRejected) return;

            logger.log(createReportUrlMessage(buildId || id, authenticationToken, dashboardUrl));

            await reportCommands.sendTaskStartCommand({
                startTime, userAgents, testCount, buildId: buildId as BuildId, taskStructure, ciInfo
            });
        },

        async reportFixtureStart (): Promise<void> {
            return;
        },

        async reportWarnings (warning: Warning): Promise<void> {
            if (reportRejected) return;

            if (warning.testRunId) {
                if (!testRunToWarningsMap[warning.testRunId])
                    testRunToWarningsMap[warning.testRunId] = [];

                testRunToWarningsMap[warning.testRunId].push(warning);

                const testId = testRunIdToTestIdMap[warning.testRunId];

                if (testId) {
                    await reportCommands.sendReportWarningsCommand({
                        testId: testId as ShortId,
                    });
                }
            }
            else
                runWarnings.push(warning);

        },

        async reportTestStart (name, meta, testStartInfo): Promise<void> {
            if (reportRejected) return;

            const testId = testStartInfo.testId as ShortId;

            for (const testRunId of testStartInfo.testRunIds)
                testRunIdToTestIdMap[testRunId] = testId;

            browserToRunsMap[testId] = {};

            await reportCommands.sendTestStartCommand({ testId });
        },

        async reportTestActionDone (apiActionName, actionInfo): Promise<void> {
            if (reportRejected) return;

            const { test: { phase, id: testId }, command, testRunId, err, duration, browser } = actionInfo;

            if (!testRunToActionsMap[testRunId])
                testRunToActionsMap[testRunId] = [];

            const action: ActionInfo = {
                duration,
                apiName:   apiActionName,
                testPhase: phase,
                command
            };

            if (err) {
                if (err.id)
                    addArrayValueByKey(errorsToTestIdMap, testId, err.id);

                action.error = createTestError(err,
                    curly(this.useWordWrap(false).setIndent(0).formatError(err))
                );
            }

            testRunToActionsMap[testRunId].push(action);

            if (!browser)
                return;

            const { alias }       = browser;
            const testBrowserRuns = browserToRunsMap[testId];

            if (testBrowserRuns)
                addArrayValueByKey(testBrowserRuns, alias, testRunId);
        },

        async reportTestDone (name, testRunInfo): Promise<void> {
            if (reportRejected) return;

            const { screenshots, videos, errs, durationMs, testId, browsers, skipped, unstable } = testRunInfo;

            const testRunToScreenshotsMap: Record<string, string[]> = {};
            const testRunToVideosMap: Record<string, string[]>      = {};
            const testRunToErrorsMap: Record<string, TestError>     = {};

            if (!noScreenshotUpload) {
                for (const screenshotInfo of screenshots) {
                    const { screenshotPath, testRunId } = screenshotInfo;

                    const uploadId = await uploader.uploadFile(screenshotPath);

                    if (!uploadId) continue;

                    addArrayValueByKey(testRunToScreenshotsMap, testRunId, uploadId);
                }
            }

            if (!noVideoUpload) {
                for (const videoInfo of videos) {
                    const { videoPath, testRunId } = videoInfo;

                    const uploadId = await uploader.uploadFile(videoPath);

                    if (!uploadId) continue;

                    addArrayValueByKey(testRunToVideosMap, testRunId, uploadId);
                }
            }

            for (const err of errs) {
                if (err.id && errorsToTestIdMap[testId] && errorsToTestIdMap[testId].includes(err.id))
                    continue;

                const { testRunId } = err;

                testRunToErrorsMap[testRunId] = createTestError(err,
                    curly(this.useWordWrap(false).setIndent(0).formatError(err))
                );
            }

            delete errorsToTestIdMap[testId];

            const testBrowserRuns = browserToRunsMap[testId];

            const browserRuns = browsers.reduce((runs, browser) => {
                const { alias, testRunId } = browser;
                const runIds               = testBrowserRuns && testBrowserRuns[alias] || null;

                let videoUploadIds: string[] = [];

                if (!noVideoUpload) {
                    const videoTestRunId = runIds && runIds.find(videoRunId => testRunToVideosMap[videoRunId] && testRunToVideosMap[videoRunId].length) || testRunId;

                    if (videoTestRunId)
                        videoUploadIds = testRunToVideosMap[videoTestRunId];
                }

                const getBrowserRunInfo = (attemptRunId: string, attempt?: number): BrowserRunInfo => {
                    const result = {
                        browser,
                        screenshotUploadIds: testRunToScreenshotsMap[attemptRunId],
                        videoUploadIds,
                        actions:             testRunToActionsMap[attemptRunId],
                        thirdPartyError:     testRunToErrorsMap[attemptRunId],
                        quarantineAttempt:   attempt,
                        warnings:            testRunToWarningsMap[attemptRunId],
                    };

                    delete testRunToActionsMap[attemptRunId];
                    delete testRunToWarningsMap[attemptRunId];

                    return result;
                };

                if (runIds && runIds.length) {
                    let quarantineAttempt = runIds.length > 1 ? 1 : void 0;

                    for (const attemptRunId of runIds) {
                        runs[attemptRunId] = getBrowserRunInfo(attemptRunId, quarantineAttempt);

                        if (quarantineAttempt)
                            quarantineAttempt++;
                    }

                    delete testBrowserRuns[alias];
                }
                else
                    runs[testRunId] = getBrowserRunInfo(testRunId);

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

            if (browserToRunsMap && browserToRunsMap[testId])
                delete browserToRunsMap[testId];

            await reportCommands.sendTestDoneCommand(testDonePayload);
        },

        async reportTaskDone (endTime, passed, warnings, result): Promise<void> {
            if (reportRejected) return;

            const warningsUploadId = await uploadWarnings();

            await uploader.waitUploads();

            await reportCommands.sendTaskDoneCommand({
                endTime, passed, warningsUploadId, warnings, result, buildId: buildId as BuildId
            });
        }
    }, isLogEnabled);

    return reporterPluginObject;
};
