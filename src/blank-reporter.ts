import { ReporterPluginObject } from './types/internal';

const noop = () => Promise.resolve();

const BLANK_REPORTER: ReporterPluginObject = {
    reportTaskStart:    noop,
    reportFixtureStart: noop,
    reportTestDone:     noop,
    reportTaskDone:     noop,

    createErrorDecorator: () => ({})
};

export default BLANK_REPORTER;
