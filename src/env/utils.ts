import { promisify } from 'util';
import { exec } from 'child_process';

const promiseExec = promisify(exec);

export function parseBooleanVariable (value: string): boolean {
    return value === 'false' || value === '0' ? false : !!value;
}

export async function getAuthorByCommit (
    commitSha: string
): Promise<string> {
    const { stdout, stderr } = await promiseExec(`git log -1 ${commitSha} --pretty="%aN"`);

    return stderr ? '' : stdout;
}
