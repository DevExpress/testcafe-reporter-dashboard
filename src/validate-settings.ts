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

type Token = {
    projectId: string;
    tokenSecret?: string;
};

type TokenValidator = (input: object) => input is Record<string, any>;

function isJWTToken (input: object): input is Token {
    return input && input['projectId'];
}

function isBase64Token (input: object): input is Token {
    return isJWTToken(input) && !!input['tokenSecret'];
}

export function assertTokenObject (input: object, validator: TokenValidator): asserts input is Token {
    if (!validator(input))
        throw new Error(AUTHENTICATION_TOKEN_INVALID);
}

export function decodeJWTAuthenticationToken (input: string): Token {
    const parsed: object = decode(input);

    assertTokenObject(parsed, isJWTToken);

    return parsed;
}

export function decodeBase64AuthenticationToken (input: string): Token {
    const parsed: object = JSON.parse(Buffer.from(input, 'base64').toString());

    assertTokenObject(parsed, isBase64Token);

    return parsed;
}

export function decodeAuthenticationToken (input: string): Token {
    try {
        return decodeJWTAuthenticationToken(input);
    }
    catch (error) {
        return decodeBase64AuthenticationToken(input);
    }
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
