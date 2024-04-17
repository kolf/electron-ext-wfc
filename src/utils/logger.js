import evalInWindow from './eval.js';

export const logger = (...args) => {
  return evalInWindow((_args) => {
    console.log(`[IPC]`, ..._args);
  }, args);
};
