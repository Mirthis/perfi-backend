"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.parseDate = exports.parseNumbersArray = exports.parseBoolean = exports.parseNumber = exports.parseString = exports.getLastDayOfMonth = exports.getFirstDayOfMonth = void 0;
const isNumber = (value) => !Number.isNaN(value);
const isString = (value) => typeof value === 'string' || value instanceof String;
const isDate = (value) => Boolean(Date.parse(value));
const getFirstDayOfMonth = (date, monthDelta = 0) => {
    const startDate = new Date(date.getFullYear(), date.getMonth(), 1, 0, 0, 0);
    startDate.setMonth(date.getMonth() + monthDelta);
    return startDate;
};
exports.getFirstDayOfMonth = getFirstDayOfMonth;
const getLastDayOfMonth = (date, monthDelta = 0) => {
    const endDate = new Date(date.getFullYear(), date.getMonth() + 1 + monthDelta, 0);
    // endDate.setMonth(date.getMonth() );
    return endDate;
};
exports.getLastDayOfMonth = getLastDayOfMonth;
const parseString = (value, name) => {
    if (!value || !isString(value)) {
        throw new Error(`Invalid parameter ${name}`);
    }
    return value;
};
exports.parseString = parseString;
const parseNumber = (value, name) => {
    if (!value || !isNumber(value)) {
        throw new Error(`Invalid parameter ${name}`);
    }
    return value;
};
exports.parseNumber = parseNumber;
const parseBoolean = (value, name) => {
    if (value === undefined || !(typeof value === 'boolean')) {
        throw new Error(`Invalid parameter ${name}`);
    }
    return value;
};
exports.parseBoolean = parseBoolean;
const parseNumbersArray = (value, name) => {
    if (value && isString(value) && Array.isArray(value.split(','))) {
        return value.split(',').map((i) => (0, exports.parseNumber)(i, name));
    }
    throw new Error(`Invalid parameter ${name}`);
};
exports.parseNumbersArray = parseNumbersArray;
const parseDate = (value, name) => {
    if (!value || !isString(value) || !isDate(value)) {
        throw new Error(`Invalid parameter ${name}`);
    }
    return value;
};
exports.parseDate = parseDate;
