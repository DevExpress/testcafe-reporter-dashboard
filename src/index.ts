import uuid from 'uuid';
import logger from './logger';

import sendCommand from './send-resolve-command';
import { createReportUrlMessage } from './texts';

module.exports = function plaginFactory () {
    const id = uuid();

    return {
        async reportTaskStart (startTime, userAgents, testCount) {
            await sendCommand(id, 'reportTaskStart', { startTime, userAgents, testCount });

            logger.log(createReportUrlMessage(id));
        },

        async reportFixtureStart (name, path, meta) {
            await sendCommand(id, 'reportFixtureStart', { name, path, meta });
        },

        async reportTestStart (name, meta) {
            await sendCommand(id, 'reportTestStart', { name, meta });
        },

        async reportTestDone (name, testRunInfo, meta) {
            await sendCommand(id, 'reportTestDone', { name, testRunInfo, meta });
        },

        async reportTaskDone (endTime, passed, warnings, result) {
            await sendCommand(id, 'reportTaskDone', { endTime, passed, warnings, result });
        }
    };
}
