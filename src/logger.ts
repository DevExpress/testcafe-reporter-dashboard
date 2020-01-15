function log (...params) {
    return console.log.apply(console, arguments);
}

function error (...params) {
    return console.error.apply(console, arguments);
}

function warn (...params) {
    return console.warn.apply(console, arguments);
}

export default { log, error, warn };
