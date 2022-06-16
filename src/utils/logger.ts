// eslint-disable-next-line @typescript-eslint/no-explicit-any
const info = (...params: any[]): void => {
  if (process.env.NODE_ENV !== 'test') console.log(...params);
};

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const error = (...params: any[]): void => {
  if (process.env.NODE_ENV !== 'test') console.error(...params);
};

type ErrorWithMessage = {
  message: string;
};

const isErrorWithMessage = (errorObj: unknown): errorObj is ErrorWithMessage =>
  typeof errorObj === 'object' &&
  errorObj !== null &&
  'message' in errorObj &&
  typeof (errorObj as Record<string, unknown>).message === 'string';

const toErrorWithMessage = (maybeError: unknown): ErrorWithMessage => {
  if (isErrorWithMessage(maybeError)) return maybeError;

  try {
    return new Error(JSON.stringify(maybeError));
  } catch {
    // fallback in case there's an error stringifying the maybeError
    // like with circular references for example.
    return new Error(String(maybeError));
  }
};

export const getErrorMessage = (errorObj: unknown) =>
  toErrorWithMessage(errorObj).message;

export default {
  info,
  error,
};
