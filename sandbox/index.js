const fs             = require('fs');
const mock           = require('mock-require');
const createTestCafe = require('testcafe');

process.env.TESTCAFE_DASHBOARD_DEVEXTREME_URL   = 'http://localhost:3000';
process.env.TESTCAFE_DASHBOARD_DEVEXTREME_TOKEN = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJwcm9qZWN0SWQiOiJjM2ZlMDg1OC0wYzNmLTQ5YzUtODNjMi1lOWE1NzZmMjZlOGEiLCJpYXQiOjE1ODgxNDk3NTJ9.9sxG0seXYTnLbJtrkM_20wudmNG0fzAVWHXqCiMCp6A';

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
            .browsers(['chrome', 'chrome:headless'])
            //.video('video_artifacts', { pathPattern: '${TEST_INDEX}_${USERAGENT}/${QUARANTINE_ATTEMPT}.mp4' })
            .reporter('dashboard-sandbox')
            .run();
    })
    .then(failedCount => {
        console.log('Tests failed: ' + failedCount);

        testcafe && testcafe.close();
    });
