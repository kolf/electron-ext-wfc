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
      const reg = /^[0-9][\s\S]+/;

      if (args.length === 1 && firstArg.methodName) {
        message = {
          ...message,
          channel,
          type: 'request',
          reqId: firstArg.reqId,
          method: firstArg.methodName,
          args: firstArg.methodArgs,
          result: ret,
        };
      } else if (args.length === 1 && firstArg.cbArgs) {
        message = {
          ...message,
          channel,
          type: 'response',
          reqId: firstArg.reqId,
          result: firstArg.cbArgs[0],
        };
      } else if (typeof firstArg === 'string') {
        const isMethod = !reg.test(firstArg);
        message = {
          ...message,
          channel,
          method: isMethod ? firstArg : '',
          args: isMethod ? restArgs : args,
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

    ipcRenderer.on('protoAsyncCallback', (ev, args) => {
      handleMessage('protoAsyncCallback', [args]);
    });
  });
};

const stopCapturingIpc = () => {
  return evalInWindow(() => {
    window.__WFC__.IPCMessages = undefined;
  });
};

const clearIpcMessages = () => {
  return evalInWindow(() => {
    window.__WFC__.IPCMessages = [];
  });
};

const getIpcMessages = () => {
  return evalInWindow(() => {
    return window.__WFC__.IPCMessages;
  }).then((messages) => {
    if (messages) return messages;
    return startCapturingIpc().then(() => []);
  });
};

export { startCapturingIpc, stopCapturingIpc, getIpcMessages, clearIpcMessages };
