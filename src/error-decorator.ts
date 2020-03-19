import { decoratorFn } from "./types/testcafe";

const empty = (str: string) => '';
const raw = (str: string) => str;
const syntax = (type: string) => raw;

const curly = (str: string) => `{${removeTrailingComma(str)}}`
const squared = (str: string) => `[${removeTrailingComma(str)}]`
const escaped = (str: string) => `"${str.replace(/\//g,`\/`)
                                        .replace(/\\/g,`\\\\`)
                                        .replace(/\t/g,"\\t")
                                        .replace(/[\b]/g,"\\b")
                                        .replace(/\r/g,"\\r")
                                        .replace(/\n/g, '\\n')
                                        .replace(/\"/g,`\\"`)}"`;

const comma = (modifier: decoratorFn) => (str: string) => `${modifier(str)}, `
const element = (modifier: decoratorFn) => (name: string) => comma((str: string) => `"${(name)}": ${modifier(str)}`);

const escapedElement = element(escaped);
const squaredElement = element(squared);

export const removeTrailingComma: decoratorFn = (str) => {
    str = str.trimEnd();
    return str.endsWith(',') ? str.substring(0, str.length - 1) : str;
}

export function errorDecorator() {
    return {
        'span user-agent': escapedElement('user-agent'),

        'span subtitle': escapedElement('subtitle'),
        'div message':escapedElement('message'),

        'div screenshot-info': escapedElement('screenshot-info'),
        'a screenshot-path': escapedElement('screenshot-path'),

        'code': escapedElement('code'),

        'span syntax-string': syntax('string'),
        'span syntax-punctuator': syntax('punctuator'),
        'span syntax-keyword': syntax('keyword'),
        'span syntax-number': syntax('number'),
        'span syntax-regex': syntax('regex'),
        'span syntax-comment': syntax('comment'),
        'span syntax-invalid': syntax('invalid'),

        'div code-frame': squaredElement('codeframe'),
        'div code-line': comma(curly),
        'div code-line-last': comma(curly),
        'div code-line-num': element((str: string) => curly(escapedElement('num')(str)))('line'),
        'div code-line-num-base': element((str: string) => curly(`${escapedElement('num')(str)}"base": "True"`))('line'),
        'div code-line-src': escapedElement('code'),

        'div stack': squaredElement('callstack'),
        'div stack-line': comma(curly),
        'div stack-line-last': comma(curly),
        'div stack-line-name': escapedElement('name'),
        'div stack-line-location': escapedElement('location'),

        'strong': empty,
        'a': raw
    };
}
