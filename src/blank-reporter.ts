import { ReporterPluginObject } from './types/internal';

const noop = () => void 0;

const BLANK_REPORTER: ReporterPluginObject = {
    reportTaskStart:    noop,
    reportFixtureStart: noop,
    reportTestDone:     noop,
    reportTaskDone:     noop,

    createErrorDecorator: noop
};

export default BLANK_REPORTER;
