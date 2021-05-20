import { CIInfo } from '../types/task-start-args';

export function getBambooInfo (): CIInfo {
    const { env } = process;

    return {
        commitSHA:  env.bamboo_planRepository_revision,
        branchName: env.bamboo_planRepository_branch,
        author:     env.bamboo_planRepository_username
    };
};
