import uuid from 'uuid';
import logger from './logger';
import { join as pathJoin } from 'path';
import fs from 'fs';

import { ENABLE_SCREENSHOTS_UPLOAD, VIDEO_FOLDER, BUILD_ID } from './env-variables';

import { createReportUrlMessage } from './texts';
import { BrowserRunInfo, createDashboardTestRunInfo, createTestError, ActionInfo } from './types/dashboard';
import { getUploadInfo, uploadFile } from './upload';
import { ReporterPluginObject, Error, BrowserInfo } from './types/testcafe';
import { errorDecorator, curly } from './error-decorator';
import { sendTaskStartCommand, sendFixtureStartCommand, sendTestStartCommand, sendTestDoneCommand, sendTaskDoneCommand } from './commands';

const WORKING_DIR = process.cwd();

function formatUserAgent (prettyUserAgent: string): string {
    return prettyUserAgent.replace(' / ', '_').replace(/\s/g, '_');
}

function getVideoPath (testIndex: number, userAgent: string, qarantinAttempt: string): string {
    return pathJoin(WORKING_DIR, VIDEO_FOLDER, `${testIndex}_${userAgent}/${qarantinAttempt}.mp4`);
}

const browserNameMap = {
    'chrome':        'Chrome',
    'chrome-canary': 'Chrome Canary',
    'ie':            'Explorer',
    'edge':          'Edge',
    'Opera':         'Opera',
    'firefox':       'Firefox',
};

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
    const uploads: Promise<void>[]  = [];
    let testIndex = 0;

    const testRuns: Record<string, BrowserRunInfo> = {};
    let testRunIds: string[] = [];

    return {
        createErrorDecorator: errorDecorator,

        async reportTaskStart (startTime, userAgents, testCount): Promise<void> {
            this.userAgents = userAgents;

            await sendTaskStartCommand(id, { startTime, userAgents, testCount, buildId: BUILD_ID });
            logger.log(createReportUrlMessage(id));
        },

        async reportFixtureStart (name): Promise<void> {
            await sendFixtureStartCommand(id, { name });
        },

        async reportTestStart (name, meta, testStartInfo): Promise<void> {
            testIndex += 1;
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
            const { screenshots, errs } = testRunInfo;

            if (ENABLE_SCREENSHOTS_UPLOAD) {
                for (const screenshotInfo of screenshots) {
                    const { screenshotPath } = screenshotInfo;
                    const uploadInfo = await getUploadInfo(id, screenshotPath);

                    if (!uploadInfo) continue;

                    screenshotInfo.uploadId = uploadInfo.uploadId;

                    uploads.push(uploadFile(screenshotPath, uploadInfo, id));
                }
            }

            if (VIDEO_FOLDER) {
                testRunInfo.videos = [];
                const { quarantine } = testRunInfo;
                const quarantineAttempts = quarantine ? Object.keys(quarantine) : ['1'];

                for (const userAgent of this.userAgents) {
                    for (const attempt of quarantineAttempts) {
                        const videoPath  = getVideoPath(testIndex, formatUserAgent(userAgent), attempt);

                        if (!fs.existsSync(videoPath)) continue;
                        const uploadInfo = await getUploadInfo(id, videoPath);

                        if (!uploadInfo) continue;

                        testRunInfo.videos.push({
                            uploadId:          uploadInfo.uploadId,
                            userAgent:         userAgent,
                            quarantineAttempt: parseInt(attempt, 10)
                        });

                        uploads.push(uploadFile(videoPath, uploadInfo, id));
                    }
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

            await sendTestDoneCommand(id, {
                name,
                testRunInfo: createDashboardTestRunInfo(testRunInfo, browserRuns)
            });

            for (const runId of testRunIds)
                delete testRuns[runId];
        },

        async reportTaskDone (endTime, passed, warnings, result): Promise<void> {
            await Promise.all(uploads);
            await sendTaskDoneCommand(id, { endTime, passed, warnings, result, buildId: BUILD_ID });
        }
    };
};
