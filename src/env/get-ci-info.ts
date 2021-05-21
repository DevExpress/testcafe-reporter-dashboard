import { CIInfo } from '../types/task-start-args';
import { detectCISystem } from './ci-detection';
import { CIInfoProviders } from './ci-info-providers';

export function getCIInfo (): CIInfo | undefined {
    let info: CIInfo | undefined;

    const CISystem = detectCISystem();

    if (CISystem)
        return CIInfoProviders[CISystem]();

    return info;
}
