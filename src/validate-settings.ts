import { MAX_BUILD_ID_LENGTH } from './consts';
import { AUTHENTICATION_TOKEN_NOT_DEFINED, createLongBuildIdError, DASHBOARD_LOCATION_NOT_DEFINED } from './texts';
import { DashboardSettings, Logger } from './types/internal/dashboard';

export default function validateSettings (settings: DashboardSettings, logger: Logger) {
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

    return areSettingsValid;
};
