import uuid from 'uuid';
import logger from './logger';

import sendResolveCommand from './send-resolve-command';
import { createReportUrlMessage } from './texts';
import { CommandTypes, AggregateNames } from './consts'
import { getUploadInfo, uploadFile } from './upload';

module.exports = function plaginFactory () {
    const id      = uuid() as string;
    const uploads = [];

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

        async reportTestDone (name, testRunInfo, meta) {
            const uploadIdList = [];

            if (testRunInfo.screenshots.length) {
                for (const screenshotInfo of testRunInfo.screenshots) {
                    const { screenshotPath } = screenshotInfo;
                    const uploadInfo         = await getUploadInfo(id);

                    if (uploadInfo.error) {
                        logger.error(`Failed to get upload info for ${screenshotPath}. ${uploadInfo.error.message}`);

                        continue;
                    }

                    uploadIdList.push(uploadInfo.uploadId);

                    uploads.push(uploadFile(screenshotPath, uploadInfo));
                }
            }

            await sendReportCommand(CommandTypes.reportTestDone, { name, testRunInfo, meta });
        },

        async reportTaskDone (endTime, passed, warnings, result) {
            await Promise.all(uploads);
            await sendReportCommand(CommandTypes.reportTaskDone, { endTime, passed, warnings, result });
        }
    };
}
