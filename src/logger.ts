function log (...params): void {
    console.log(...params);
}

function error (...params): void {
    console.error(...params);
}

function warn (...params): void {
    console.warn(...params);
}

export default { log, error, warn };
