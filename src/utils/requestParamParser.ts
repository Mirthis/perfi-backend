const isNumber = (value: unknown): value is number => !Number.isNaN(value);
const isString = (value: unknown): value is string =>
  typeof value === 'string' || value instanceof String;
const isDate = (value: string): boolean => Boolean(Date.parse(value));

export const getFirstDayOfMonth = (
  date: Date,
  monthDelta: number = 0,
): Date => {
  const startDate = new Date(date.getFullYear(), date.getMonth(), 1, 0, 0, 0);
  startDate.setMonth(date.getMonth() + monthDelta);
  return startDate;
};

export const getLastDayOfMonth = (date: Date, monthDelta: number = 0): Date => {
  const endDate = new Date(
    date.getFullYear(),
    date.getMonth() + 1 + monthDelta,
    0,
  );
  // endDate.setMonth(date.getMonth() );
  return endDate;
};

export const parseString = (value: unknown, name: string): string => {
  if (!value || !isString(value)) {
    throw new Error(`Invalid parameter ${name}`);
  }
  return value;
};

export const parseNumber = (value: unknown, name: string): number => {
  if (!value || !isNumber(value)) {
    throw new Error(`Invalid parameter ${name}`);
  }
  return value;
};

export const parseBoolean = (value: unknown, name: string): boolean => {
  if (value === undefined || !(typeof value === 'boolean')) {
    throw new Error(`Invalid parameter ${name}`);
  }
  return value;
};

export const parseNumbersArray = (value: unknown, name: string): number[] => {
  if (value && Array.isArray(value)) {
    return value.map((i) => parseNumber(i, name));
  }

  throw new Error(`Invalid parameter ${name}`);
};

export const parseDate = (value: unknown, name: string): string => {
  if (!value || !isString(value) || !isDate(value)) {
    throw new Error(`Invalid parameter ${name}`);
  }
  return value;
};
