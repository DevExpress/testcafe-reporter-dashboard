const raw = (str: string) => str;

export function errorDecorator() {
    return {
        'span user-agent': raw,

        'span subtitle': raw,
        'div message': (str: string) => `<code class="message">${str}</code>`,

        'div screenshot-info': (str: string) => `<div class="screenshot-info">${str}</div>`,
        'a screenshot-path': (str: string) => {
            return `<a href="${str}" class="thumbnail">
                                <div class="overlay"></div>
                                <div class="zoom-icon"></div>
                            </a>`;
        },

        'code': (str: string) => `<code class="language-javascript">${str}</code>`,

        'span syntax-string': raw,
        'span syntax-punctuator': raw,
        'span syntax-keyword': raw,
        'span syntax-number': raw,
        'span syntax-regex': raw,
        'span syntax-comment': raw,
        'span syntax-invalid': raw,

        'div code-frame': (str: string) => `<div class="multiline_editor"><div class="go-to-code-btn language-javascript">${str}</div></div>`,
        'div code-line': (str: string) => `${str}\n`,
        'div code-line-last': raw,
        'div code-line-num': (str: string) => `   ${str} | `,
        'div code-line-num-base': (str: string) => ` > ${str} | `,
        'div code-line-src': raw,

        'div stack': (str: string) => '\n\n' + str,
        'div stack-line': (str: string) => `${str}\n`,
        'div stack-line-last': raw,
        'div stack-line-name': (str: string) => `   at <strong>${str}</strong>)}`,
        'div stack-line-location': raw,

        'strong': (str: string) => `<strong>${str}</strong>`,
        'a': (str: string) => `<a href="${str}">${str}</a>`
    };
}
