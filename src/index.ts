import uuid from 'uuid';
import logger from './logger';
import { join as pathJoin } from 'path';
import fs from 'fs';

import { ENABLE_SCREENSHOTS_UPLOAD, VIDEO_FOLDER, BUILD_ID } from './env-variables';

import { createReportUrlMessage } from './texts';
import { BrowserRunInfo, createDashboardTestRunInfo, createTestError, ActionInfo } from './types/dashboard';
import { getUploadInfo, uploadFile } from './upload';
import { ReporterPluginObject } from './types/testcafe';
import { errorDecorator, curly } from './error-decorator';
import { sendTaskStartCommand, sendFixtureStartCommand, sendTestStartCommand, sendTestDoneCommand, sendTaskDoneCommand } from './commands';

const WORKING_DIR = process.cwd();

function formatUserAgent (prettyUserAgent: string): string {
    return prettyUserAgent.replace(' / ', '_').replace(/\s/g, '_');
}

function getVideoPath (testIndex: number, userAgent: string, qarantinAttempt: string): string {
    return pathJoin(WORKING_DIR, VIDEO_FOLDER, `${testIndex}_${userAgent}/${qarantinAttempt}.mp4`);
}

module.exports = function plaginFactory (): ReporterPluginObject {
    const id = uuid() as string;
    const uploads: Promise<void>[]  = [];
    let testIndex = 0;

    const testRuns: Record<string, Record<string, BrowserRunInfo>> = {};

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

        async reportTestStart (name): Promise<void> {
            testIndex += 1;
            await sendTestStartCommand(id, { name });
        },

        async reportTestActionDone (apiActionName, actionInfo): Promise<void> {
            const { browser, test: { name, phase }, command } = actionInfo;

            if (!testRuns[name])
                testRuns[name] = {};

            if (!testRuns[name][actionInfo.browser.alias])
                testRuns[name][actionInfo.browser.alias] = { browser, actions: [] };

            const action: ActionInfo = {
                apiName:   apiActionName,
                testPhase: phase,
                command,
            };

            testRuns[name][actionInfo.browser.alias].actions.push(action);
        },

        async reportTestDone (name, testRunInfo): Promise<void> {
            if (ENABLE_SCREENSHOTS_UPLOAD && testRunInfo.screenshots.length) {
                for (const screenshotInfo of testRunInfo.screenshots) {
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

            if (testRunInfo.errs) {
                for (const err of testRunInfo.errs) {
                    for (const browserName in testRuns[name]) {
                        if (testRuns[name][browserName].browser.prettyUserAgent === err.userAgent) {
                            const actions = testRuns[name][browserName].actions;
                            const testError = curly(this.useWordWrap(false).setIndent(0).formatError(err));

                            actions[actions.length - 1].errors = [
                                createTestError(err, testError)
                            ];
                        }
                    }
                }
            }

            const dashboardTestRunInfo = createDashboardTestRunInfo(testRunInfo, testRuns[name]);

            const payload = { name, testRunInfo: dashboardTestRunInfo };

            await sendTestDoneCommand(id, payload );

            delete testRuns[name];
        },

        async reportTaskDone (endTime, passed, warnings, result): Promise<void> {
            await Promise.all(uploads);
            await sendTaskDoneCommand(id, { endTime, passed, warnings, result });
        }
    };
};
