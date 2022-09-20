import { MAX_BUILD_ID_LENGTH } from './types/consts';
import {
    AUTHENTICATION_TOKEN_INVALID,
    AUTHENTICATION_TOKEN_NOT_DEFINED,
    BUILD_ID_IS_NOT_A_STRING_ERROR,
    createLongBuildIdError,
    createTestCafeVersionIncompatibledError,
    createTestCafeVersionInvalidError,
    DASHBOARD_LOCATION_NOT_DEFINED
} from './texts';
import { DashboardSettings, Logger } from './types/internal/dashboard';
import semver from 'semver';
import { decode as decodeJWTAuthenticationToken } from 'jsonwebtoken';


// TODO: we should ask TC Dashboard
export const TC_OLDEST_COMPATIBLE_VERSION = '1.14.2';

type Token = {
    projectId: string;
    tokenSecret?: string;
};

function isValidAuthenticationToken (input: object): input is Token {
    return input && input['projectId'];
}

function decodeBase64AuthenticationToken (input: string): object | null {
    try {
        return JSON.parse(Buffer.from(input, 'base64').toString());
    }
    catch (error) {
        return null;
    }
}

export function decodeAuthenticationToken (input: string): Token {
    const token = decodeJWTAuthenticationToken(input) || decodeBase64AuthenticationToken(input);

    if (isValidAuthenticationToken(token))
        return token;

    throw new Error(AUTHENTICATION_TOKEN_INVALID);
}

function assertTokenString (input: string): void {
    decodeAuthenticationToken(input);
}

export function validateSettings (settings: DashboardSettings, tcVersion: string, logger: Logger): boolean {
    const { authenticationToken, buildId, dashboardUrl } = settings;

    let areSettingsValid = true;

    if (!authenticationToken) {
        logger.error(AUTHENTICATION_TOKEN_NOT_DEFINED);

        areSettingsValid = false;
    }
    else
        assertTokenString(authenticationToken);

    if (!dashboardUrl) {
        logger.error(DASHBOARD_LOCATION_NOT_DEFINED);

        areSettingsValid = false;
    }

    if (buildId) {
        if (typeof buildId !== 'string') {
            logger.error(BUILD_ID_IS_NOT_A_STRING_ERROR);

            areSettingsValid = false;
        }

        if (buildId.length > MAX_BUILD_ID_LENGTH) {
            logger.error(createLongBuildIdError(buildId));

            areSettingsValid = false;
        }
    }

    if (!semver.valid(tcVersion))
        throw new Error(createTestCafeVersionInvalidError(tcVersion));
    else if (semver.lt(tcVersion, TC_OLDEST_COMPATIBLE_VERSION))
        throw new Error(createTestCafeVersionIncompatibledError(tcVersion));

    return areSettingsValid;
};
