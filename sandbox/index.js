const fs             = require('fs');
const mock           = require('mock-require');
const createTestCafe = require('testcafe');

process.env.TESTCAFE_DASHBOARD_URL                 = 'http://localhost:3000';
process.env.TESTCAFE_DASHBOARD_AUTHORIZATION_TOKEN = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJwcm9qZWN0SWQiOiIxNDIxZDFkYS0wNjQ3LTQxYzQtYWUzOS03NTBlMzNjOTA2NzkiLCJpYXQiOjE1ODA3Mjk4NDZ9.8xaJBSfbRT5xMvCtlE09P9ju6qsfKIJsrI2gb6oBpmo';

const REPORTER_DIRECTORY = './node_modules/testcafe-reporter-dashboard-sandbox';

if (!fs.existsSync(REPORTER_DIRECTORY))
    fs.mkdirSync(REPORTER_DIRECTORY);

mock('testcafe-reporter-dashboard-sandbox', '../lib/index.js');

let testcafe = null;

createTestCafe()
    .then(tc => {
        testcafe = tc;

        const runner = tc.createRunner();

        return runner
            .src(['C:/testcafe-reporter-dashboard/sandbox/test.js'])
            .browsers(['chrome', 'firefox', 'chrome:headless'])
            .reporter('dashboard-sandbox')
            .run();
    })
    .then(failedCount => {
        console.log('Tests failed: ' + failedCount);

        testcafe && testcafe.close();
    });
