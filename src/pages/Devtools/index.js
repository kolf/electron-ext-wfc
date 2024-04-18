const run = () => {
  chrome.devtools.panels.create('🐊 IPC', 'logo.png', 'panel.html');
};

run();
