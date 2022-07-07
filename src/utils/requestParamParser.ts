const isNumber = (value: unknown): value is number => !Number.isNaN(value);

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
