import uuid from 'uuid';
import logger from './logger';

import { NO_SCREENSHOT_UPLOAD, NO_VIDEO_UPLOAD, TESTCAFE_DASHBOARD_BUILD_ID } from './env-variables';
import { createReportUrlMessage, createLongBuildIdError } from './texts';
import { BrowserRunInfo, createDashboardTestRunInfo, createTestError, ActionInfo } from './types/dashboard';
import { Uploader } from './upload';
import { ReporterPluginObject, Error, BrowserInfo } from './types/testcafe';
import { errorDecorator, curly } from './error-decorator';
import { sendTaskStartCommand, sendFixtureStartCommand, sendTestStartCommand, sendTestDoneCommand, sendTaskDoneCommand } from './commands';

const browserNameMap = {
    'chrome':        'Chrome',
    'chrome-canary': 'Chrome Canary',
    'ie':            'Explorer',
    'edge':          'Edge',
    'Opera':         'Opera',
    'firefox':       'Firefox',
};

export const MAX_BUILD_ID_LENGTH = 100;

function isThirdPartyError (error: Error): boolean {
    return error.code === 'E2';
}

function getBrowserAlias (error: Error): string {
    const { userAgent } = error;
    let alias = 'chrome';

    if (userAgent.includes('Canary'))
        alias = 'chrome-canary';
    else if (userAgent.includes('Chrome'))
        alias = 'chrome';
    else if (userAgent.includes('Explorer'))
        alias = 'ie';
    else if (userAgent.includes('Edge'))
        alias = 'edge';
    else if (userAgent.includes('Firefox'))
        alias = 'firefox';
    else if (userAgent.includes('Opera'))
        alias = 'opera';

    return alias;
}

module.exports = function plaginFactory (): ReporterPluginObject {
    const id = uuid() as string;
    const uploader = new Uploader(id);

    const testRuns: Record<string, BrowserRunInfo> = {};
    let testRunIds: string[] = [];

    return {
        createErrorDecorator: errorDecorator,

        async reportTaskStart (startTime, userAgents, testCount): Promise<void> {
            if (TESTCAFE_DASHBOARD_BUILD_ID?.length > MAX_BUILD_ID_LENGTH) {
                logger.log(createLongBuildIdError(TESTCAFE_DASHBOARD_BUILD_ID));
                return;
            }
            await sendTaskStartCommand(id, { startTime, userAgents, testCount, buildId: TESTCAFE_DASHBOARD_BUILD_ID });
            logger.log(createReportUrlMessage(TESTCAFE_DASHBOARD_BUILD_ID || id));
        },

        async reportFixtureStart (name): Promise<void> {
            await sendFixtureStartCommand(id, { name });
        },

        async reportTestStart (name, meta, testStartInfo): Promise<void> {
            testRunIds = testStartInfo.testRunIds;

            await sendTestStartCommand(id, { name });
        },

        async reportTestActionDone (apiActionName, actionInfo): Promise<void> {
            const { browser, test: { phase }, command, testRunId, err, duration } = actionInfo;

            if (!testRuns[testRunId])
                testRuns[testRunId] = { browser, actions: [] };

            const action: ActionInfo = {
                testRunId,
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

            testRuns[testRunId].actions.push(action);
        },

        async reportTestDone (name, testRunInfo): Promise<void> {
            const { screenshots, videos, errs, durationMs } = testRunInfo;

            if (!NO_SCREENSHOT_UPLOAD) {
                for (const screenshotInfo of screenshots) {
                    const { screenshotPath } = screenshotInfo;

                    screenshotInfo.uploadId = await uploader.uploadFile(screenshotPath);
                }
            }

            if (!NO_VIDEO_UPLOAD) {
                for (const videoInfo of videos) {
                    const { videoPath } = videoInfo;

                    videoInfo.uploadId = await uploader.uploadFile(videoPath);
                    videoInfo.userAgent = testRuns[videoInfo.testRunId].browser.prettyUserAgent;
                }
            }

            for (const err of errs) {
                const { testRunId } = err;
                const browserAlias = getBrowserAlias(err);
                //NOTE: we mock browser object in case if no actions have been performed in test before an error
                const runInfo = testRuns[testRunId] || {
                    browser: {
                        alias:           browserAlias,
                        name:            browserNameMap[browserAlias],
                        userAgent:       err.userAgent,
                        prettyUserAgent: err.userAgent,
                        version:         'browser version N/A',
                        os:              {
                            name:    'OS name N/A',
                            version: 'OS version N/A'
                        }
                    } as BrowserInfo,
                    actions: []
                };

                if (!testRuns[testRunId])
                    testRuns[testRunId] = runInfo;

                if (!isThirdPartyError(err))
                    continue;

                runInfo.thirdPartyError = createTestError(err,
                    curly(this.useWordWrap(false).setIndent(0).formatError(err))
                );
            }

            const browserRuns = testRunIds.reduce((runs, runId) => {
                const runInfo = testRuns[runId];

                if (runInfo)
                    runs[runInfo.browser.alias] = runInfo;

                return runs;
            }, {} as Record<string, BrowserRunInfo>);

            const testDonePayload = {
                name,
                errorCount: errs.length,
                duration:   durationMs,
                uploadId:   await uploader.uploadTest(name, createDashboardTestRunInfo(testRunInfo, browserRuns))
            };

            await sendTestDoneCommand(id, testDonePayload);

            for (const runId of testRunIds)
                delete testRuns[runId];
        },

        async reportTaskDone (endTime, passed, warnings, result): Promise<void> {
            await uploader.waitUploads();
            await sendTaskDoneCommand(id, { endTime, passed, warnings, result, buildId: TESTCAFE_DASHBOARD_BUILD_ID });
        }
    };
};
