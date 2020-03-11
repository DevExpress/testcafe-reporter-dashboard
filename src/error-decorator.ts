const raw = (str: string) => str;
const syntax = (type: string) => (str: string) => `{ text: "${str}", type: "${type}}", `;
const element = (name: string) => (str: string) => `${name}: "${str}", `;
const braced = (str: string) => `{${str}}`

export function errorDecorator() {
    return {
        'span user-agent': element('user-agent'),

        'span subtitle': element('subtitle'),
        'div message': (str: string) => `{ message: ${str}}`,

        'div screenshot-info': element('screenshot-info'),
        'a screenshot-path': element('screenshot-path'),

        'code': element('code'),

        'span syntax-string': syntax('string'),
        'span syntax-punctuator': syntax('string'),
        'span syntax-keyword': syntax('string'),
        'span syntax-number': syntax('string'),
        'span syntax-regex': syntax('string'),
        'span syntax-comment': syntax('string'),
        'span syntax-invalid': syntax('string'),

        'div code-frame': (str: string) => `code-frame: [${str}]`,
        'div code-line': braced,
        'div code-line-last': braced,
        'div code-line-num': str => `${element('code-line-num')(str)}`,
        'div code-line-num-base': str => `${element('code-line-num')(str)}, base=true`,
        'div code-line-src': (str: string) => `code: [${str}]}, `,

        'div stack': (str: string) => '\n\n' + str,
        'div stack-line': (str: string) => `${str}\n`,
        'div stack-line-last': raw,
        'div stack-line-name': (str: string) => `   at <strong>${str}</strong>)}`,
        'div stack-line-location': raw,

        'strong': (str: string) => `<strong>${str}</strong>`,
        'a': (str: string) => `<a href="${str}">${str}</a>`
    };
}
