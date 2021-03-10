import fs from 'fs';
import fetch from 'isomorphic-fetch';
import { promisify } from 'util';

import {
    ENABLE_LOG,
    NO_SCREENSHOT_UPLOAD,
    NO_VIDEO_UPLOAD,
    TESTCAFE_DASHBOARD_AUTHENTICATION_TOKEN as AUTHENTICATION_TOKEN,
    TESTCAFE_DASHBOARD_BUILD_ID,
    TESTCAFE_DASHBOARD_URL,
    CI_INFO
} from './env';

import { ReporterPluginObject } from './types/internal';
import reporterObjectFactory from './reporter-object-factory';
import logger from './logger';
import { BuildId } from './types/common';

module.exports = function pluginFactory (): ReporterPluginObject {
    const settings = {
        authenticationToken: AUTHENTICATION_TOKEN,
        buildId:             TESTCAFE_DASHBOARD_BUILD_ID as BuildId,
        dashboardUrl:        TESTCAFE_DASHBOARD_URL,
        isLogEnabled:        ENABLE_LOG,
        noScreenshotUpload:  NO_SCREENSHOT_UPLOAD,
        noVideoUpload:       NO_VIDEO_UPLOAD,
        ciInfo:              CI_INFO
    };

    return reporterObjectFactory(promisify(fs.readFile), fetch, settings, logger);
};
