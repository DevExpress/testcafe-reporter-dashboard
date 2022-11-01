import fs from 'fs';
import fetch from 'isomorphic-fetch';
import { promisify } from 'util';

import { ReporterPluginObject } from './types/internal';
import { reporterObjectFactory } from './reporter-object-factory';
import logger from './logger';
import { getReporterSettings } from './get-reporter-settings';
import { ReporterPluginOptions } from './types';
import path from 'path';

const TESTCAFE_PACKAGE_PATH = 'testcafe/package';

function getTestCafeVersion () {
    let packageName = '';

    try {
        packageName = require(path.resolve('package')).name;

        if (packageName !== 'testcafe')
            packageName = TESTCAFE_PACKAGE_PATH;
    }
    catch (err) {
        packageName = TESTCAFE_PACKAGE_PATH;
    }

    return require(packageName).version;
}

module.exports = function pluginFactory (options: ReporterPluginOptions = {}): ReporterPluginObject {
    const settings  = getReporterSettings(options);
    const tcVersion = getTestCafeVersion();

    return reporterObjectFactory(promisify(fs.readFile), promisify(fs.exists), fetch, settings, logger, tcVersion);
};
