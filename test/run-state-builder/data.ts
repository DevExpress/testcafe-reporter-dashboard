import { TaskDoneArgs, TaskStartArgs, TestDoneArgs, TestStartArgs } from '../../src/types';
import { RunState } from '../../src/types/run';

export const REPORT_TASK_START_ARGS_DATA: TaskStartArgs = {
    buildId: 'build_1' as any,
    ciInfo:  {
        commitSHA:  'commit_sha_1',
        branchName: 'master',
        author:     'Peter Parker'
    },
    startTime:  new Date('2022-11-04T12:59:07.782Z'),
    userAgents: [
        'Chrome 107.0.5304.87 / Monterey 12',
        'Chrome 107.0.5304.87 / Monterey 13'
    ],
    testCount:     6,
    taskStructure: [
        {
            fixture: {
                id:    'KB3pCMM' as any,
                name:  'Fixture 1' as any,
                tests: [
                    {
                        id:   'bDpy4xc' as any,
                        name: 'Test 1' as any,
                        skip: false
                    },
                    {
                        id:   'RVj7sr1' as any,
                        name: 'Test 2' as any,
                        skip: true
                    },
                    {
                        id:   'IEVEBxg',
                        name: 'Test 3',
                        skip: true
                    }
                ]
            }
        },
        {
            fixture: {
                id:    'Gu93KYC',
                name:  'Fixture 2',
                tests: [
                    {
                        id:   'cnzf9Nv',
                        name: 'Test 4',
                        skip: false
                    },
                    {
                        id:   'GXBjQMG',
                        name: 'Test 5',
                        skip: true
                    },
                    {
                        id:   'LJdWYzK',
                        name: 'Test 6',
                        skip: false
                    }
                ]
            }
        }
    ]
};

export const REPORT_TEST_START_ARGS_DATA: TestStartArgs = {
    testId:  'bDpy4xc' as any,
    skipped: false
};

export const REPORT_TEST_DONE_ARGS_DATA: TestDoneArgs = {
    duration:   12088,
    errorCount: 1,
    skipped:    false,
    testId:     'bDpy4xc' as any,
    unstable:   true,
    uploadId:   'upload_bDpy4xc'
};

export const REPORT_TASK_DONE_ARGS_DATA: TaskDoneArgs = {
    endTime:  new Date('2022-11-07T11:02:40.051Z'),
    passed:   3,
    warnings: [
        'The "src" and "browsers" options from the configuration file will be ignored.',
        'The "tsConfigPath" option is deprecated and will be removed in the next major release. Use the "compilerOptions.typescript.configPath" option instead.'
    ],
    warningsUploadId: 'warning_upload_bDpy4xc',
    result:           {
        passedCount:  3,
        failedCount:  2,
        skippedCount: 1
    },
    buildId: 'build_1' as any
};

export const EXPECTED_TASK_STARTED_RUN_STATE_DATA: Partial<RunState> = {
    buildId: 'build_1' as any,
    ciInfo:  {
        author:     'Peter Parker',
        branchName: 'master',
        commitSHA:  'commit_sha_1'
    },
    fixtures: {
        ['Gu93KYC' as any]: {
            id:      'Gu93KYC',
            name:    'Fixture 2',
            testIDs: [
                'cnzf9Nv',
                'GXBjQMG',
                'LJdWYzK'
            ]
        },
        ['KB3pCMM' as any]: {
            id:      'KB3pCMM',
            name:    'Fixture 1',
            testIDs: [
                'bDpy4xc',
                'RVj7sr1',
                'IEVEBxg'
            ]
        }
    },
    id:        'run_1',
    startTime: new Date('2022-11-04T12:59:07.782Z'),
    testCount: 6,
    tests:     {
        ['GXBjQMG' as any]: {
            'id':      'GXBjQMG' as any,
            'name':    'Test 5' as any,
            'skipped': true
        },
        ['IEVEBxg' as any]: {
            'id':      'IEVEBxg' as any,
            'name':    'Test 3' as any,
            'skipped': true
        },
        ['LJdWYzK' as any]: {
            'id':      'LJdWYzK' as any,
            'name':    'Test 6' as any,
            'skipped': false
        },
        ['RVj7sr1' as any]: {
            'id':      'RVj7sr1',
            'name':    'Test 2',
            'skipped': true
        },
        ['bDpy4xc' as any]: {
            'id':      'bDpy4xc',
            'name':    'Test 1',
            'skipped': false
        },
        ['cnzf9Nv' as any]: {
            'id':      'cnzf9Nv',
            'name':    'Test 4',
            'skipped': false
        }
    },
    userAgents: [
        'Chrome 107.0.5304.87 / Monterey 12',
        'Chrome 107.0.5304.87 / Monterey 13'
    ]
};

export const EXPECTED_TEST_STARTED_RUN_STATE_DATA: Partial<RunState> = {
    ...EXPECTED_TASK_STARTED_RUN_STATE_DATA,
    tests: {
        ...EXPECTED_TASK_STARTED_RUN_STATE_DATA.tests,
        ['bDpy4xc']: {
            id:         'bDpy4xc' as any,
            name:       'Test 1' as any,
            skipped:    false,
            inProgress: true
        }
    }
};

export const EXPECTED_TEST_DONE_RUN_STATE_DATA: Partial<RunState> = {
    ...EXPECTED_TASK_STARTED_RUN_STATE_DATA,
    tests: {
        ...EXPECTED_TASK_STARTED_RUN_STATE_DATA.tests,
        ['bDpy4xc']: {
            id:         'bDpy4xc' as any,
            name:       'Test 1' as any,
            skipped:    false,
            inProgress: false,

            duration:   12088,
            errorCount: 1,
            unstable:   true,
            uploadId:   'upload_bDpy4xc'
        }
    }
};

export const EXPECTED_TASK_DONE_RUN_STATE_DATA: Partial<RunState> = {
    ...EXPECTED_TASK_STARTED_RUN_STATE_DATA,

    endTime:  new Date('2022-11-07T11:02:40.051Z'),
    passed:   3,
    failed:   2,
    skipped:  1,
    warnings: [
        'The "src" and "browsers" options from the configuration file will be ignored.',
        'The "tsConfigPath" option is deprecated and will be removed in the next major release. Use the "compilerOptions.typescript.configPath" option instead.'
    ],
    warningsUploadId: 'warning_upload_bDpy4xc'
};
