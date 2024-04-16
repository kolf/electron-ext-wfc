const run = () => {
  window.chrome.devtools.inspectedWindow.eval(`window.ipcRenderer`, (result, exception) => {
    if (exception) {
      console.log(exception);
    } else {
      if (result) {
        chrome.devtools.panels.create('🐊 IPC', 'logo.png', 'panel.html');
      }
    }
  });
};

run();
