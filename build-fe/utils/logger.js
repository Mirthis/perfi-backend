"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getErrorMessage = void 0;
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const info = (...params) => {
    if (process.env.NODE_ENV !== 'test')
        console.log(...params);
};
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const error = (...params) => {
    if (process.env.NODE_ENV !== 'test')
        console.error(...params);
};
const isErrorWithMessage = (errorObj) => typeof errorObj === 'object' &&
    errorObj !== null &&
    'message' in errorObj &&
    typeof errorObj.message === 'string';
const toErrorWithMessage = (maybeError) => {
    if (isErrorWithMessage(maybeError))
        return maybeError;
    try {
        return new Error(JSON.stringify(maybeError));
    }
    catch {
        // fallback in case there's an error stringifying the maybeError
        // like with circular references for example.
        return new Error(String(maybeError));
    }
};
const getErrorMessage = (errorObj) => toErrorWithMessage(errorObj).message;
exports.getErrorMessage = getErrorMessage;
exports.default = {
    info,
    error,
};
