import { MAX_BUILD_ID_LENGTH } from './consts';
import {
    AUTHENTICATION_TOKEN_NOT_DEFINED,
    createLongBuildIdError,
    createTestCafeVersionIncompatibledError,
    createTestCafeVersionInvalidError,
    DASHBOARD_LOCATION_NOT_DEFINED
} from './texts';
import { DashboardSettings, Logger } from './types/internal/dashboard';
import semver from 'semver';

// TODO: we should ask TC Dashboard
export const TC_OLDEST_COMPATIBLE_VERSION = '1.14.2';

export function validateSettings (settings: DashboardSettings, tcVersion: string, logger: Logger): boolean {
    const { authenticationToken, buildId, dashboardUrl } = settings;

    let areSettingsValid = true;

    if (!authenticationToken) {
        logger.error(AUTHENTICATION_TOKEN_NOT_DEFINED);

        areSettingsValid = false;
    }

    if (!dashboardUrl) {
        logger.error(DASHBOARD_LOCATION_NOT_DEFINED);

        areSettingsValid = false;
    }

    if (buildId && buildId.length > MAX_BUILD_ID_LENGTH) {
        logger.error(createLongBuildIdError(buildId));

        areSettingsValid = false;
    }

    if (!semver.valid(tcVersion))
        throw new Error(createTestCafeVersionInvalidError(tcVersion));
    else if (semver.lt(tcVersion, TC_OLDEST_COMPATIBLE_VERSION))
        throw new Error(createTestCafeVersionIncompatibledError(tcVersion));

    return areSettingsValid;
};
