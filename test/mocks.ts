import { ReadFileMethod } from '../src/types/internal/dashboard';
import { CI_VARIABLES } from './data/ci-variables';

const originalVariables = {};

export const mockReadFile = (() => void 0) as unknown as ReadFileMethod;

export const clearCIVariables = () => {
    for (const CIVariable of CI_VARIABLES) {
        originalVariables[CIVariable.name] = process.env[CIVariable.name];

        delete process.env[CIVariable.name];
    }
};

export const restoreCIVariables = () => {
    for (const CIVariable of CI_VARIABLES)
        process.env[CIVariable.name] = originalVariables[CIVariable.name];
};
