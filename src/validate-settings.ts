import { MAX_BUILD_ID_LENGTH } from './consts';
import {
    AUTHENTICATION_TOKEN_INVALID,
    AUTHENTICATION_TOKEN_NOT_DEFINED,
    createLongBuildIdError,
    createTestCafeVersionIncompatibledError,
    createTestCafeVersionInvalidError,
    DASHBOARD_LOCATION_NOT_DEFINED
} from './texts';
import { DashboardSettings, Logger } from './types/internal/dashboard';
import semver from 'semver';
import { decode } from 'jsonwebtoken';

// TODO: we should ask TC Dashboard
export const TC_OLDEST_COMPATIBLE_VERSION = '1.14.2';

export function decodeAuthenticationToken (token: string): { projectId: string; tokenId?: string } | undefined {
    let tokenData;

    try {
        tokenData = decode(token);
    }
    catch (e) {}

    if (tokenData && tokenData.projectId)
        return tokenData;

    try {
        tokenData = JSON.parse(Buffer.from(token, 'base64').toString());
    }
    catch (e) {}

    if (tokenData && tokenData.projectId && tokenData.tokenId)
        return tokenData;

    return void 0;
}

function validateAuthenticationToken (token: string): boolean {
    return !!decodeAuthenticationToken(token);
}

export function validateSettings (settings: DashboardSettings, tcVersion: string, logger: Logger): boolean {
    const { authenticationToken, buildId, dashboardUrl } = settings;

    let areSettingsValid = true;

    if (!authenticationToken) {
        logger.error(AUTHENTICATION_TOKEN_NOT_DEFINED);

        areSettingsValid = false;
    }
    else if (!validateAuthenticationToken(authenticationToken)) {
        logger.error(AUTHENTICATION_TOKEN_INVALID);

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
