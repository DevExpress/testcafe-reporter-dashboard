import { ReporterPluginObject } from './types/internal';

const noop = () => Promise.resolve();

const BLANK_REPORTER: ReporterPluginObject = {
    init:                 noop,
    reportTaskStart:      noop,
    reportFixtureStart:   noop,
    reportTestDone:       noop,
    reportTaskDone:       noop,
    reportWarnings:       noop,
    createErrorDecorator: () => ({})
};

export default BLANK_REPORTER;
