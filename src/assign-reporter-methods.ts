import { ReporterMethods, ReporterPluginObject } from './types/internal';
import logger from './logger';
import { createReporterMethodName } from './texts';

export default function assignReporterMethods (reporterObject: ReporterPluginObject, reporterMethods: ReporterMethods, isLogEnabled: boolean) {
    for (const methodName of Object.keys(reporterMethods)) {
        reporterObject[methodName] = async function (...args) {
            if (isLogEnabled)
                logger.log(`${methodName}: ${JSON.stringify(args)}`);

            try {
                await reporterMethods[methodName].apply(this, args);
            }
            catch (e) {
                logger.error(createReporterMethodName(methodName, e && e.toString()));
            }
        };
    }
}
