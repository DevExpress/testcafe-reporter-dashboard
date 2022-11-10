import assert from 'assert';
import {
    EXPECTED_TASK_DONE_RUN_STATE_DATA,
    EXPECTED_TASK_STARTED_RUN_STATE_DATA,
    EXPECTED_TEST_DONE_RUN_STATE_DATA,
    EXPECTED_TEST_STARTED_RUN_STATE_DATA,
    REPORT_TASK_DONE_ARGS_DATA,
    REPORT_TASK_START_ARGS_DATA,
    REPORT_TEST_DONE_ARGS_DATA,
    REPORT_TEST_START_ARGS_DATA
} from './data';
import { RunStateBuilder } from '../../src/run-state-builder';

describe('Run state builder tests', () => {
    it('reportTaskStarted', async () => {
        // arrange
        const runStateBuilder = new RunStateBuilder('run_1');

        // act
        runStateBuilder.reportTaskStarted(REPORT_TASK_START_ARGS_DATA);

        const actualState = runStateBuilder.getRunState();

        // assert
        assert.deepStrictEqual(actualState, EXPECTED_TASK_STARTED_RUN_STATE_DATA);
    });

    it('reportTestStarted', async () => {
        // arrange
        const runStateBuilder = new RunStateBuilder('run_1');

        // act
        runStateBuilder.reportTaskStarted(REPORT_TASK_START_ARGS_DATA);
        runStateBuilder.reportTestStarted(REPORT_TEST_START_ARGS_DATA);

        const actualState = runStateBuilder.getRunState();

        // assert
        assert.deepStrictEqual(actualState, EXPECTED_TEST_STARTED_RUN_STATE_DATA);
    });

    it('reportTestDone', async () => {
        // arrange
        const runStateBuilder = new RunStateBuilder('run_1');

        // act
        runStateBuilder.reportTaskStarted(REPORT_TASK_START_ARGS_DATA);
        runStateBuilder.reportTestStarted(REPORT_TEST_START_ARGS_DATA);
        runStateBuilder.reportTestDone(REPORT_TEST_DONE_ARGS_DATA);

        const actualState = runStateBuilder.getRunState();

        // assert
        assert.deepStrictEqual(actualState, EXPECTED_TEST_DONE_RUN_STATE_DATA);
    });

    it('reportTaskDone', async () => {
        // arrange
        const runStateBuilder = new RunStateBuilder('run_1');

        // act
        runStateBuilder.reportTaskStarted(REPORT_TASK_START_ARGS_DATA);
        runStateBuilder.reportTaskDone(REPORT_TASK_DONE_ARGS_DATA);

        const actualState = runStateBuilder.getRunState();

        // assert
        assert.deepStrictEqual(actualState, EXPECTED_TASK_DONE_RUN_STATE_DATA);
    });
});
