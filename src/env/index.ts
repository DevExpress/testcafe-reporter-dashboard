import { parseBooleanVariable, parseNumber } from './utils';
import { getCIInfo } from './get-ci-info';

const { env } = process;

export const ENABLE_LOG             = parseBooleanVariable(env.ENABLE_LOG);
export const TESTCAFE_DASHBOARD_URL = env.TESTCAFE_DASHBOARD_URL || 'https://ddev.testcafe.io';

export const NO_SCREENSHOT_UPLOAD = parseBooleanVariable(env.NO_SCREENSHOT_UPLOAD);
export const NO_VIDEO_UPLOAD      = parseBooleanVariable(env.NO_VIDEO_UPLOAD);

export const TESTCAFE_DASHBOARD_AUTHENTICATION_TOKEN = env.TESTCAFE_DASHBOARD_AUTHENTICATION_TOKEN;
export const TESTCAFE_DASHBOARD_BUILD_ID: string | undefined = env.TESTCAFE_DASHBOARD_BUILD_ID;

export const REQUEST_RETRY_COUNT = parseNumber(env.TESTCAFE_DASHBOARD_REQUEST_RETRY_COUNT) || 20;
export const RESPONSE_TIMEOUT    = parseNumber(env.TESTCAFE_DASHBOARD_RESPONSE_TIMEOUT) || 40 * 1000; // CloudFront response timeout + 10 sec

export const CI_INFO = getCIInfo();
