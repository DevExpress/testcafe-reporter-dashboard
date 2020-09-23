import fs from 'fs';
import fetch from 'isomorphic-fetch';
import { promisify } from 'util';

import { DASHBOARD_LOCATION_NOT_DEFINED, AUTHENTICATION_TOKEN_NOT_DEFINED } from './texts';
import {
    TESTCAFE_DASHBOARD_AUTHENTICATION_TOKEN as AUTHENTICATION_TOKEN,
    TESTCAFE_DASHBOARD_URL,
    ENABLE_LOG
} from './env-variables';

import { ReporterPluginObject } from './types/testcafe';
import reporterObjectFactory from './reporter-object-factory';
import logger from './logger';

if (!TESTCAFE_DASHBOARD_URL)
    logger.error(DASHBOARD_LOCATION_NOT_DEFINED);

if (!AUTHENTICATION_TOKEN)
    logger.error(AUTHENTICATION_TOKEN_NOT_DEFINED);

module.exports = function plaginFactory (): ReporterPluginObject {
    return reporterObjectFactory(promisify(fs.readFile), fetch, AUTHENTICATION_TOKEN, TESTCAFE_DASHBOARD_URL, ENABLE_LOG);
};
