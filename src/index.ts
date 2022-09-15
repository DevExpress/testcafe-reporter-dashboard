import fs from 'fs';
import fetch from 'isomorphic-fetch';
import { promisify } from 'util';
import path from 'path';

import {
    ENABLE_LOG,
    NO_SCREENSHOT_UPLOAD,
    NO_VIDEO_UPLOAD,
    TESTCAFE_DASHBOARD_AUTHENTICATION_TOKEN as AUTHENTICATION_TOKEN,
    TESTCAFE_DASHBOARD_BUILD_ID,
    TESTCAFE_DASHBOARD_URL,
    CI_INFO,
    RESPONSE_TIMEOUT,
    REQUEST_RETRY_COUNT
} from './env';

import { ReporterPluginObject } from './types/internal';
import reporterObjectFactory from './reporter-object-factory';
import logger from './logger';

module.exports = function pluginFactory (): ReporterPluginObject {
    const settings = {
        authenticationToken: AUTHENTICATION_TOKEN as string, //is validated in factory
        buildId:             TESTCAFE_DASHBOARD_BUILD_ID,
        dashboardUrl:        TESTCAFE_DASHBOARD_URL,
        isLogEnabled:        ENABLE_LOG,
        noScreenshotUpload:  NO_SCREENSHOT_UPLOAD,
        noVideoUpload:       NO_VIDEO_UPLOAD,
        responseTimeout:     RESPONSE_TIMEOUT,
        requestRetryCount:   REQUEST_RETRY_COUNT,
        ciInfo:              CI_INFO
    };

    const rootPackageName = require(path.resolve('package')).name;
    const tcVersion       = require(rootPackageName === 'testcafe'
                                    ? path.resolve('package')
                                    : 'testcafe/package').version;

    return reporterObjectFactory(promisify(fs.readFile), fetch, settings, logger, tcVersion);
};
