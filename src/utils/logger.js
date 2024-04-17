import evalInWindow from './eval.js';

export const logger = (...args) => {
  return evalInWindow(() => {
    console.log(...args);
  });
};
