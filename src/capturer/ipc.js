import evalInWindow from '../utils/eval.js';

const startCapturingIpc = () => {
  return evalInWindow(() => {
    if (window.__WFC__.IPCMessages != null) {
      window.__WFC__.IPCMessages = [];
      return;
    }

    window.__WFC__.IPCMessages = [];

    const handleMessage = (channel, args = [], ret = null) => {
      if (window.__WFC__.evaling) return;

      if (window.__WFC__.IPCMessages.length > 999999) {
        window.__WFC__ = {};
        return;
      }
      let message = {
        time: new Date().toLocaleString().split(' ')[1],
      };
      const [firstArg, ...restArgs] = args;
      if (args.length === 1 && firstArg.methodName) {
        message = {
          ...message,
          channel,
          method: firstArg.methodName,
          args: firstArg.methodArgs,
          result: ret,
        };
      } else if (typeof firstArg === 'string') {
        message = {
          ...message,
          channel,
          method: firstArg,
          args: restArgs || [],
          result: ret,
        };
      } else {
        message = {
          ...message,
          channel,
          method: '',
          args: args,
          result: ret,
        };
      }

      window.__WFC__.IPCMessages.push(message);
    };

    const ipcRenderer = require('electron').ipcRenderer;
    const _send = ipcRenderer.send;
    const _sendSync = ipcRenderer.sendSync;
    const _invoke = ipcRenderer.invoke;
    const _invokeTo = ipcRenderer.invokeTo;
    ipcRenderer.send = (channel, ...args) => {
      handleMessage(channel, args);
      _send.call(ipcRenderer, channel, ...args);
    };

    ipcRenderer.sendSync = (channel, ...args) => {
      const ret = _sendSync.call(ipcRenderer, channel, ...args);
      handleMessage(channel, args, ret);
      return ret;
    };
    ipcRenderer.invoke = (channel, ...args) => {
      const ret = _invoke.call(ipcRenderer, channel, ...args);
      handleMessage(channel, args, ret);
      return ret;
    };
    ipcRenderer.invokeTo = async ($ = window, channel, data) => {
      const ret = await _invokeTo($, channel, data);
      handleMessage(channel, data);
      return ret;
    };
  });
};

const stopCapturingIpc = () => {
  return evalInWindow(() => {
    window.__WFC__.IPCMessages = undefined;
    window.__WFC__.captureIPC = undefined;
  });
};

const clearIpcMessages = () => {
  return evalInWindow(() => {
    window.__WFC__.IPCMessages = [];
  });
};

const getIpcMessages = () => {
  return evalInWindow(() => {
    const messages = window.__WFC__.IPCMessages;
    // clear messages after getting them each time
    // if (messages) window.__WFC__.IPCMessages = [];
    return messages;
  }).then((messages) => {
    if (messages) return messages;

    // Start listening for messages if array is missing meaning
    // the window was reloaded
    return startCapturingIpc().then(() => []);
  });
};

export { startCapturingIpc, stopCapturingIpc, getIpcMessages, clearIpcMessages };
