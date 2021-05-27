import { readFileSync } from 'fs';
import { CIInfo } from '../types/task-start-args';
import { detectCISystem } from './ci-detection';
import { CIInfoProviders } from './ci-info-providers';
import logger from '../logger';

export function getCIInfo (): CIInfo | undefined {
    let info: CIInfo | undefined;

    const CISystem = detectCISystem();

    if (CISystem)
        return CIInfoProviders[CISystem](readFileSync, logger);

    return info;
}
