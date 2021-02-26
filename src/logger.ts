import { Logger } from './types/internal/dashboard';

function log (...params): void {
    console.log(...params);
}

function error (...params): void {
    console.error(...params);
}

function warn (...params): void {
    console.warn(...params);
}

const logger: Logger = { log, error, warn };

export default logger;
