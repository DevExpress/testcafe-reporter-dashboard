import { ReadFileMethod } from '../src/types/internal/dashboard';
import { CI_DETECTION_VARIABLES, CI_INFO_VARIABLES } from './data/ci-variables';

const originalVariables = {};

export const mockReadFile = (() => void 0) as unknown as ReadFileMethod;

export const clearCIDetectionVariables = () => {
    for (const CIVariable of CI_DETECTION_VARIABLES) {
        originalVariables[CIVariable.name] = process.env[CIVariable.name];

        delete process.env[CIVariable.name];
    }
};

export const restoreCIDetectionVariables = () => {
    for (const CIVariable of CI_DETECTION_VARIABLES)
        process.env[CIVariable.name] = originalVariables[CIVariable.name];
};

export const clearCIInfoVariables = () => {
    for (const CI of CI_INFO_VARIABLES) {
        for (const variable of Object.keys(CI.variables)) {
            originalVariables[variable] = process.env[variable];

            delete process.env[variable];
        }
    }
};

export const restoreCIInfoVariables = () => {
    for (const CI of CI_INFO_VARIABLES) {
        for (const variable of Object.keys(CI.variables))
            process.env[variable] = originalVariables[variable];
    }
};
