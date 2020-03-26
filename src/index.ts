import uuid from 'uuid';
import logger from './logger';
import { join as pathJoin } from 'path';

import { ENABLE_SCREENSHOTS_UPLOAD, VIDEO_FOLDER } from './env-variables';

import sendResolveCommand from './send-resolve-command';
import { createReportUrlMessage } from './texts';
import {
    CommandTypes, AggregateNames, BrowserRunInfo,
    createDashboardTestRunInfo, createTestError, ActionInfo
} from './types/dashboard';
import { getUploadInfo, uploadFile } from './upload';
import { ReporterPluginObject } from './types/testcafe';
import { errorDecorator, removeTrailingComma } from './error-decorator';

const WORKING_DIR = process.cwd();

function formatUserAgent (prettyUserAgent: string) {
    return prettyUserAgent.replace(' / ', '_').replace(/\s/g, '_');
}

function getVideoPath (testIndex: number, userAgent: string, qarantinAttempt: string) {
    return pathJoin(WORKING_DIR, VIDEO_FOLDER, `${testIndex}_${userAgent}/${qarantinAttempt}.mp4`);
}

module.exports = function plaginFactory (): ReporterPluginObject {
    const id = uuid() as string;
    const uploads: Promise<void>[]  = [];
    let formattedUserAgents: string[] = [];
    let testIndex = 0;

    const testRuns: Record<string, Record<string, BrowserRunInfo>> = {};

    async function sendReportCommand (type: CommandTypes, payload: Record<string, any>): Promise<void> {
        return sendResolveCommand({
            aggregateId:   id,
            aggregateName: AggregateNames.Report,
            type,
            payload
        });
    }

    return {
        createErrorDecorator: errorDecorator,
        async reportTaskStart (startTime, userAgents, testCount): Promise<void> {
            formattedUserAgents = userAgents.map(formatUserAgent);
            await sendReportCommand(CommandTypes.reportTaskStart, { startTime, userAgents, testCount });
            logger.log(createReportUrlMessage(id));
        },

        async reportFixtureStart (name, path, meta): Promise<void> {
            await sendReportCommand(CommandTypes.reportFixtureStart, { name, path, meta });
        },

        async reportTestStart (name, meta): Promise<void> {
            testIndex += 1;
            await sendReportCommand(CommandTypes.reportTestStart, { name, meta });
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

        async reportTestDone (name, testRunInfo, meta): Promise<void> {
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

                for (const userAgent of formattedUserAgents) {
                    const quarantineAttempts = testRunInfo.quarantine ? Object.keys(testRunInfo.quarantine) : ['1'];

                    for (const attempt of quarantineAttempts) {
                        const videoPath  = getVideoPath(testIndex, userAgent, attempt);
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

                            actions[actions.length - 1].errors = [
                                createTestError(err, `{${removeTrailingComma(this.useWordWrap(false).setIndent(0).formatError(err))}}`)];
                        }
                    }
                }
            }
            const dashboardTestRunInfo = createDashboardTestRunInfo(testRunInfo, testRuns[name]);

            const payload = { name, testRunInfo: dashboardTestRunInfo, meta };

            await sendReportCommand(CommandTypes.reportTestDone, payload );

            delete testRuns[name];
        },

        async reportTaskDone (endTime, passed, warnings, result): Promise<void> {
            await Promise.all(uploads);
            await sendReportCommand(CommandTypes.reportTaskDone, { endTime, passed, warnings, result });
        }
    };
};
