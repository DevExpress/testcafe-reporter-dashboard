import { ReporterMethods, ReporterPluginObject } from './types/testcafe';
import logger from './logger';
import { ENABLE_LOG } from './env-variables';

export default function assignReporterMethods (reporterMethods: ReporterMethods, reporterObject: ReporterPluginObject) {
    for (const methodName of Object.keys(reporterMethods)) {
        reporterObject[methodName] = async function (...args) {
            if (ENABLE_LOG)
                logger.log(`${methodName}: ${JSON.stringify(args)}`);

            try {
                await reporterMethods[methodName].apply(this, args);
            }
            catch (e) {
                logger.error(`${methodName} failed. Error: ${ENABLE_LOG ? e : e.message }`);
            }
        };
    }
}
