import { BrowserInfo } from './types';
import path from 'path';

export function addArrayValueByKey<T> (collection: Record<string, T[]>, key: string, value: T): void {
    if (!collection[key])
        collection[key] = [value];
    else if (!collection[key].includes(value))
        collection[key].push(value);
};

export function getShouldUploadLayoutTestingData (layoutTestingEnabled: boolean | undefined, browsers: (BrowserInfo & { testRunId: string })[]): boolean {
    return !!layoutTestingEnabled && browsers?.length <= 1;
};

export function makePathRelativeStartingWith (inputPath: string, startWith: string): string | undefined {
    const relativePathMatch = inputPath.match(new RegExp(`\\${path.sep}(${startWith}.*)`)) ?? void 0;

    return relativePathMatch && relativePathMatch[1];
}

export function replaceLast (string: string, search: string, replace: string): string {
    return string.replace(new RegExp(`(${search})(?!.*\\1)`), replace);
}

export function getPostfixedPath (basePath: string, postfix: string): string {
    return basePath.replace(/.png$/, `${postfix}.png`);
}
