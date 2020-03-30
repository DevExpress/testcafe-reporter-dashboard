import { decoratorFn } from './types/testcafe';

const empty = (): string => '';
const raw = (str: string): string => str;

const removeTrailingComma: decoratorFn = (str) => {
    str = str.trimEnd();
    return str.endsWith(',') ? str.substring(0, str.length - 1) : str;
};

export const curly = (str: string): string => `{${removeTrailingComma(str)}}`;
const squared = (str: string): string => `[${removeTrailingComma(str)}]`;
const escaped = (str: string): string => `"${str.replace(/\//g, '\/')
    .replace(/\\/g, '\\\\')
    .replace(/\t/g, '\\t')
    .replace(/[\b]/g, '\\b')
    .replace(/\r/g, '\\r')
    .replace(/\n/g, '\\n')
    .replace(/\"/g, '\\"')}"`;

const comma = (modifier: decoratorFn) => (str: string): string => `${modifier(str)}, `;
const element = (modifier: decoratorFn) => (name: string): decoratorFn => comma((str: string) => `"${name}": ${modifier(str)}`);

const escapedElement = element(escaped);
const squaredElement = element(squared);

export function errorDecorator (): { [key: string]: decoratorFn } {
    return {
        'span user-agent': escapedElement('user-agent'),

        'span subtitle': escapedElement('subtitle'),
        'div message':   escapedElement('message'),

        'div screenshot-info': escapedElement('screenshot-info'),
        'a screenshot-path':   escapedElement('screenshot-path'),

        'code': escapedElement('code'),

        'span syntax-string':     raw,
        'span syntax-punctuator': raw,
        'span syntax-keyword':    raw,
        'span syntax-number':     raw,
        'span syntax-regex':      raw,
        'span syntax-comment':    raw,
        'span syntax-invalid':    raw,

        'div code-frame':         squaredElement('codeframe'),
        'div code-line':          comma(curly),
        'div code-line-last':     comma(curly),
        'div code-line-num':      element((str: string) => curly(escapedElement('num')(str)))('line'),
        'div code-line-num-base': element((str: string) => curly(`${escapedElement('num')(str)}"base": "True"`))('line'),
        'div code-line-src':      escapedElement('code'),

        'div stack':               squaredElement('callstack'),
        'div stack-line':          comma(curly),
        'div stack-line-last':     comma(curly),
        'div stack-line-name':     escapedElement('name'),
        'div stack-line-location': escapedElement('location'),

        'strong': empty,
        'a':      raw
    };
}
