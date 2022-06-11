// eslint-disable-next-line @typescript-eslint/no-explicit-any
const info = (...params: any[]): void => {
  if (process.env.NODE_ENV !== 'test') console.log(...params);
};

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const error = (...params: any[]): void => {
  if (process.env.NODE_ENV !== 'test') console.error(...params);
};

export default {
  info,
  error,
};
