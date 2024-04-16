import evalInWindow from './eval.js';

export const checkWfc = () => {
  return evalInWindow(() => {
    return !!window.wfc;
  }).then((wfc) => {
    if (wfc) {
      return true;
    } else {
      return false;
    }
  });
};
