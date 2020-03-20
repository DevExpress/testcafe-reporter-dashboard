const fs             = require('fs');
const mock           = require('mock-require');
const createTestCafe = require('testcafe');

process.env.TESTCAFE_DASHBOARD_URL                 = 'http://localhost:3000';
process.env.TESTCAFE_DASHBOARD_AUTHENTICATION_TOKEN = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJwcm9qZWN0SWQiOiIxNmY3MWNkNS0yODAyLTQ4ZmMtODE4MC0zMTU3ZTM1NjljYTUiLCJpYXQiOjE1ODIyMTA3MjN9.So-kVQzEv-V-jPO1JW7AN9vGVDHRQoxvOWp1bdEMcdM';

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
            .src(['./sandbox/test.ts'])
            .browsers(['chrome'])
            .reporter('dashboard-sandbox')
            .run();
    })
    .then(failedCount => {
        console.log('Tests failed: ' + failedCount);

        testcafe && testcafe.close();
    });
