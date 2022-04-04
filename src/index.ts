import fs from 'fs';
import fetch from 'isomorphic-fetch';
import { promisify } from 'util';

import { ReporterPluginObject } from './types/internal';
import reporterObjectFactory from './reporter-object-factory';
import logger from './logger';
import getReporterSettings from './get-reporter-settings';
import { ReporterPluginOptions } from './types';

module.exports = function pluginFactory (options: ReporterPluginOptions = {}): ReporterPluginObject {
    const settings = getReporterSettings(options);

    return reporterObjectFactory(promisify(fs.readFile), fetch, settings, logger, require('testcafe/package.json').version);
};
