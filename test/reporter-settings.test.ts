import assert from 'assert';
import { getReporterSettings } from '../src/get-reporter-settings';
import { TaskProperties } from '../src/types';
import { clearLayoutSettingsVariables, restoreLayoutSettingsVariables, setLayoutSettingsVariables, stashLayoutSettingsVariables } from './mocks';
import mock from 'mock-require';

let getLayoutTestingSettings = require('../src/get-reporter-settings').getLayoutTestingSettings;

describe('getReporterSettings()', () => {
    it('should take options from reporter options', () => {
        const options = {
            token:              'token_from_args',
            url:                'https://ddev.testcafe.io',
            buildId:            'buildId_from_args',
            noVideoUpload:      true,
            noScreenshotUpload: true,
            isLogEnabled:       true,
            requestRetryCount:  1,
            responseTimeout:    10000
        };

        const expectedSettings = {
            authenticationToken: 'token_from_args',
            dashboardUrl:        'https://ddev.testcafe.io',
            buildId:             'buildId_from_args',
            noVideoUpload:       true,
            noScreenshotUpload:  true,
            isLogEnabled:        true,
            requestRetryCount:   1,
            responseTimeout:     10000
        };

        //Setting will contain a CI info. That's why we should omit it to check only required properties
        const actualSettings = getReporterSettings(options);

        for (const [key, value] of Object.entries(expectedSettings))
            assert.deepEqual(actualSettings[key], value);
    });

    describe('Layout testing options', () => {
        before(stashLayoutSettingsVariables);

        function reRequireModules () {
            mock.reRequire('../src/env');
            getLayoutTestingSettings = mock.reRequire('../src/get-reporter-settings').getLayoutTestingSettings;
        }

        after(() => {
            restoreLayoutSettingsVariables();
            reRequireModules();
        });

        afterEach(() => {
            clearLayoutSettingsVariables();
            reRequireModules();
        });

        it('should take env layout options', () => {
            setLayoutSettingsVariables('true', 'env/screenshot/relative/path', 'env/destination/relative/path', 'env/base/path');
            reRequireModules();

            const taskProperties = {
                configuration: {
                    'screenshots-comparer': {
                        screenshotsRelativePath: 'config/screenshot/relative/path',
                        destinationRelativePath: 'config/destination/relative/path',
                        path:                    'config/base/path'
                    }
                }
            };

            const expectedSettings = {
                layoutTestingEnabled: true,
                screenshotsDir:       'env/screenshot/relative/path',
                destinationDir:       'env/destination/relative/path',
                comparerBaseDir:      'env/base/path'
            };

            const actualSettings = getLayoutTestingSettings(taskProperties as any as TaskProperties);

            for (const [key, value] of Object.entries(expectedSettings))
                assert.deepEqual(actualSettings[key], value);
        });

        it('should take config layout options', () => {
            const taskProperties = {
                configuration: {
                    'screenshots-comparer': {
                        screenshotsRelativePath: 'config/screenshot/relative/path',
                        destinationRelativePath: 'config/destination/relative/path',
                        path:                    'config/base/path'
                    }
                }
            };

            const expectedSettings = {
                layoutTestingEnabled: false,
                screenshotsDir:       'config/screenshot/relative/path',
                destinationDir:       'config/destination/relative/path',
                comparerBaseDir:      'config/base/path'
            };

            const actualSettings = getLayoutTestingSettings(taskProperties as any as TaskProperties);

            for (const [key, value] of Object.entries(expectedSettings))
                assert.deepEqual(actualSettings[key], value);
        });

        it('should take default layout options', () => {
            const taskProperties = {
                configuration: {}
            };

            const expectedSettings = {
                layoutTestingEnabled: false,
                screenshotsDir:       '/screenshots',
                destinationDir:       '/artifacts/compared-screenshots',
                comparerBaseDir:      './testing'
            };

            const actualSettings = getLayoutTestingSettings(taskProperties as any as TaskProperties);

            for (const [key, value] of Object.entries(expectedSettings))
                assert.deepEqual(actualSettings[key], value);
        });
    });
});
