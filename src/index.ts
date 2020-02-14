import uuid from 'uuid';
import logger from './logger';

import { ENABLE_SCREENSHOTS_UPLOAD } from './env-variables';

import sendResolveCommand from './send-resolve-command';
import { createReportUrlMessage } from './texts';
import { CommandTypes, AggregateNames } from './types/dashboard';
import { getUploadInfo, uploadFile } from './upload';
import { ReporterPluginObject, BrowserRunInfo } from './types/testcafe';

module.exports = function plaginFactory (): ReporterPluginObject {
    const id       = uuid() as string;
    const uploads  = [];

    const testRuns: Record<string, Record<string, BrowserRunInfo>> = {};

    async function sendReportCommand (type: CommandTypes, payload: Record<string, any>) {
        return sendResolveCommand({
            aggregateId: id,
            aggregateName: AggregateNames.Report,

            type,
            payload
        });
    }

    return {
        async reportTaskStart (startTime, userAgents, testCount) {
            await sendReportCommand(CommandTypes.reportTaskStart, { startTime, userAgents, testCount });

            logger.log(createReportUrlMessage(id));
        },

        async reportFixtureStart (name, path, meta) {

            await sendReportCommand(CommandTypes.reportFixtureStart, { name, path, meta });
        },

        async reportTestStart (name, meta) {
            await sendReportCommand(CommandTypes.reportTestStart, { name, meta });
        },

        async reportTestActionDone (apiActionName, actionInfo) {
            const { browser, test: { name, phase }, command, errors } = actionInfo;

            if (!testRuns[name])
                testRuns[name] = {};

            if (!testRuns[name][actionInfo.browser.alias])
                testRuns[name][actionInfo.browser.alias] = { browser, actions: [] }

            testRuns[name][actionInfo.browser.alias].actions.push({
                apiName:   apiActionName,
                testPhase: phase,

                command,
                errors
            });
        },

        async reportTestDone (name, testRunInfo, meta) {
            if (ENABLE_SCREENSHOTS_UPLOAD && testRunInfo.screenshots.length) {
                for (const screenshotInfo of testRunInfo.screenshots) {
                    const { screenshotPath } = screenshotInfo;
                    const uploadInfo         = await getUploadInfo(id, screenshotPath);

                    if (!uploadInfo) continue;

                    screenshotInfo.uploadId = uploadInfo.uploadId;

                    uploads.push(uploadFile(screenshotPath, uploadInfo, id));
                }
            }

            testRunInfo.browserRuns = testRuns[name];

            await sendReportCommand(CommandTypes.reportTestDone, { name, testRunInfo, meta });

            delete testRuns[name];
        },

        async reportTaskDone (endTime, passed, warnings, result) {
            await Promise.all(uploads);
            await sendReportCommand(CommandTypes.reportTaskDone, { endTime, passed, warnings, result });
        }
    };
}
