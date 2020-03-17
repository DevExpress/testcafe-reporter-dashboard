import { decoratorFn } from "./types/testcafe";

const empty = (str: string) => '';
const raw = (str: string) => str;
const syntax = (type: string) => raw;

const curly = (str: string) => `{${removeTrailingComma(str)}}`
const squared = (str: string) => `[${removeTrailingComma(str)}]`
const quoted = (str: string) => `"${str.replace(/"/g,'&quot').replace(/\\/g,`\\\\`).replace(/\t/g,"\\t")}"`;

const comma = (modifier: decoratorFn) => (str: string) => `${modifier(str)}, `
const element = (modifier: decoratorFn) => (name: string) => comma((str: string) => `${quoted(name)}: ${modifier(str)}`);

const quotedElement = element(quoted);
const squaredElement = element(squared);

export const removeTrailingComma: decoratorFn = (str) => {
    str = str.trimEnd();
    return str.endsWith(',') ? str.substring(0, str.length - 1) : str;
}

export function errorDecorator() {
    return {
        'span user-agent': quotedElement('user-agent'),

        'span subtitle': quotedElement('subtitle'),
        'div message': element((str: string) => quoted(str.replace(/\n/g, '<br/>')))('message'),

        'div screenshot-info': quotedElement('screenshot-info'),
        'a screenshot-path': quotedElement('screenshot-path'),

        'code': quotedElement('code'),

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
        'div code-line-num': element((str: string) => curly(quotedElement('num')(str)))('line'),
        'div code-line-num-base': element((str: string) => curly(`${quotedElement('num')(str)}"base": "True"`))('line'),
        'div code-line-src': quotedElement('code'),

        'div stack': squaredElement('callstack'),
        'div stack-line': comma(curly),
        'div stack-line-last': comma(curly),
        'div stack-line-name': quotedElement('name'),
        'div stack-line-location': quotedElement('location'),

        'strong': empty,
        'a': raw
    };
}
