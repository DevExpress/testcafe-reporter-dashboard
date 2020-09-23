import fs from 'fs';
import fetch from 'isomorphic-fetch';
import { promisify } from 'util';

import { AUTHENTICATION_TOKEN_NOT_DEFINED, DASHBOARD_LOCATION_NOT_DEFINED } from './texts';

import {
    ENABLE_LOG,
    NO_SCREENSHOT_UPLOAD,
    NO_VIDEO_UPLOAD,
    TESTCAFE_DASHBOARD_AUTHENTICATION_TOKEN as AUTHENTICATION_TOKEN,
    TESTCAFE_DASHBOARD_BUILD_ID,
    TESTCAFE_DASHBOARD_URL
} from './env-variables';

import { ReporterPluginObject } from './types/testcafe';
import reporterObjectFactory from './reporter-object-factory';
import logger from './logger';

if (!TESTCAFE_DASHBOARD_URL)
    logger.error(DASHBOARD_LOCATION_NOT_DEFINED);

if (!AUTHENTICATION_TOKEN)
    logger.error(AUTHENTICATION_TOKEN_NOT_DEFINED);

module.exports = function plaginFactory (): ReporterPluginObject {
    const settings = {
        authenticationToken: AUTHENTICATION_TOKEN,
        buildId:             TESTCAFE_DASHBOARD_BUILD_ID,
        dashboardUrl:        TESTCAFE_DASHBOARD_URL,
        isLogEnabled:        ENABLE_LOG,
        noScreenshotUpload:  NO_SCREENSHOT_UPLOAD,
        noVideoUpload:       NO_VIDEO_UPLOAD
    };

    return reporterObjectFactory(promisify(fs.readFile), fetch, settings, logger);
};
