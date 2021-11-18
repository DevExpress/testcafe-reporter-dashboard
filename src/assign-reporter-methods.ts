import { ReporterMethods, ReporterPluginObject } from './types/internal';
import logger from './logger';
import { createReporterMethodName } from './texts';
import InitializationError from './initialization-error';

export default function assignReporterMethods (
    reporterObject: ReporterPluginObject,
    reporterMethods: ReporterMethods,
    isLogEnabled: boolean
): void {
    for (const methodName of Object.keys(reporterMethods)) {
        reporterObject[methodName] = async function (...args) {
            if (isLogEnabled)
                logger.log(`${methodName}: ${JSON.stringify(args)}`);

            try {
                await reporterMethods[methodName].apply(this, args);
            }
            catch (e) {
                if (e instanceof InitializationError)
                    throw e;
                else
                    logger.error(createReporterMethodName(methodName, e && e.toString()));
            }
        };
    }
}
