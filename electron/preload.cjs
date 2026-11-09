const { contextBridge, ipcRenderer } = require('electron');

const listen = (channel) => (handler) => {
  const wrapped = (_event, payload) => handler(payload);
  ipcRenderer.on(channel, wrapped);
  return () => ipcRenderer.removeListener(channel, wrapped);
};

contextBridge.exposeInMainWorld('longhand', {
  window: {
    minimize: () => ipcRenderer.send('window:minimize'),
    toggleMaximize: () => ipcRenderer.send('window:toggle-maximize'),
    close: () => ipcRenderer.send('window:close'),
    onMaximized: listen('window:maximized'),
    onFocus: listen('window:focus'),
  },
  store: {
    get: () => ipcRenderer.invoke('store:get'),
    set: (key, value) => ipcRenderer.invoke('store:set', key, value),
  },
  languages: (probe = false) => ipcRenderer.invoke('languages:list', probe),
  openGithub: (url) => ipcRenderer.send('open:github', url),
  updates: {
    status: () => ipcRenderer.invoke('update:status'),
    check: () => ipcRenderer.invoke('update:check'),
    install: () => ipcRenderer.send('update:install'),
    onStatus: listen('update:status'),
  },
  run: {
    program: (request) => ipcRenderer.invoke('run:program', request),
    tests: (request) => ipcRenderer.invoke('run:tests', request),
    stop: (runId) => ipcRenderer.send('run:stop', runId),
    onOutput: listen('run:output'),
  },
  packs: {
    open: () => ipcRenderer.invoke('packs:open'),
    save: (name, text) => ipcRenderer.invoke('packs:save', name, text),
  },
  exam: {
    lock: () => ipcRenderer.invoke('exam:lock'),
    unlock: () => ipcRenderer.invoke('exam:unlock'),
    onCloseAttempt: listen('exam:close-attempt'),
  },
});
