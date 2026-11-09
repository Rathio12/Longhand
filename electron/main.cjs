const { app, BrowserWindow, ipcMain, dialog, protocol, net, session, Menu, shell } = require('electron');
const fs = require('node:fs');
const path = require('node:path');
const { pathToFileURL } = require('node:url');
const { Store } = require('./store.cjs');
const { allLanguages } = require('./languages.cjs');
const runner = require('./runner.cjs');
const { createUpdater } = require('./updater.cjs');
const { repoUrl } = require('./app-config.json');

const DEV = process.argv.includes('--dev');
const DEV_URL = 'http://localhost:5173';
const DIST = path.join(__dirname, '..', 'dist');
const MAX_PACK_BYTES = 5 * 1024 * 1024;
const CSP = [
  "default-src 'self'",
  "script-src 'self'",
  "style-src 'self' 'unsafe-inline'",
  "img-src 'self' data:",
  "font-src 'self' data:",
  "worker-src 'self' blob:",
  "connect-src 'self'",
  "object-src 'none'",
  "base-uri 'none'",
  "form-action 'none'",
].join('; ');

protocol.registerSchemesAsPrivileged([
  { scheme: 'app', privileges: { standard: true, secure: true, supportFetchAPI: true, stream: true } },
]);

let win;
let store;
let examLocked = false;
let probeCache = null;
let updater;

const language = (id) => allLanguages(store.data.customLanguages).find((l) => l.id === id);
const send = (channel, payload) => {
  if (win && !win.isDestroyed()) win.webContents.send(channel, payload);
};

function serveApp() {
  protocol.handle('app', async (request) => {
    const { pathname } = new URL(request.url);
    const relative = decodeURIComponent(pathname).replace(/^\/+/, '') || 'index.html';
    const target = path.resolve(DIST, relative);
    if (target !== DIST && !target.startsWith(DIST + path.sep)) return new Response('Not found', { status: 404 });
    const response = await net.fetch(pathToFileURL(target).toString());
    const headers = new Headers(response.headers);
    headers.set('Content-Security-Policy', CSP);
    return new Response(response.body, { status: response.status, headers });
  });
}

// The app never talks to the internet. Compilers and user programs are separate
// processes and are not affected by this.
function blockNetwork() {
  session.defaultSession.webRequest.onBeforeRequest(
    { urls: ['http://*/*', 'https://*/*', 'ws://*/*', 'wss://*/*'] },
    (details, callback) => {
      const local = DEV && /^(http|ws):\/\/localhost:5173\//.test(details.url);
      callback({ cancel: !local });
    },
  );
}

const BLOCKED_IN_EXAM = (input) => {
  const key = input.key.toLowerCase();
  const ctrl = input.control || input.meta;
  return key === 'f5' || key === 'f11' || key === 'f12'
    || (ctrl && ['r', 'w', 'q', 'n', 't', 'p'].includes(key) && !input.shift)
    || (ctrl && input.shift && ['i', 'j', 'c', 'r'].includes(key))
    || (input.alt && key === 'f4');
};

function createWindow() {
  win = new BrowserWindow({
    width: 1360,
    height: 860,
    minWidth: 1080,
    minHeight: 600,
    frame: false,
    icon: path.join(__dirname, 'icon.png'),
    backgroundColor: '#121417',
    show: false,
    webPreferences: {
      preload: path.join(__dirname, 'preload.cjs'),
      contextIsolation: true,
      nodeIntegration: false,
      sandbox: true,
      devTools: DEV,
      spellcheck: false,
    },
  });

  Menu.setApplicationMenu(null);
  win.once('ready-to-show', () => win.show());
  win.on('maximize', () => send('window:maximized', true));
  win.on('unmaximize', () => send('window:maximized', false));
  win.on('blur', () => send('window:focus', false));
  win.on('focus', () => send('window:focus', true));
  win.on('close', (event) => {
    if (!examLocked) return;
    event.preventDefault();
    send('exam:close-attempt');
  });

  win.webContents.on('before-input-event', (event, input) => {
    if (input.type !== 'keyDown') return;
    if (examLocked && BLOCKED_IN_EXAM(input)) {
      event.preventDefault();
      return;
    }
    if (!DEV && (input.key === 'F5' || ((input.control || input.meta) && input.key.toLowerCase() === 'r'))) {
      event.preventDefault();
    }
  });
  win.webContents.setWindowOpenHandler(() => ({ action: 'deny' }));
  win.webContents.on('will-navigate', (event) => event.preventDefault());

  win.loadURL(DEV ? DEV_URL : 'app://longhand/index.html');
}

function registerIpc() {
  ipcMain.on('window:minimize', () => win.minimize());
  ipcMain.on('window:toggle-maximize', () => (win.isMaximized() ? win.unmaximize() : win.maximize()));
  ipcMain.on('window:close', () => win.close());

  ipcMain.handle('store:get', () => store.data);
  ipcMain.handle('store:set', (_e, key, value) => {
    store.set(key, value);
    if (key === 'customLanguages') probeCache = null;
  });

  // Without `probe` this answers at once. Checking every compiler takes a few seconds.
  ipcMain.handle('languages:list', async (_e, probe) => {
    const languages = allLanguages(store.data.customLanguages);
    if (!probe) return probeCache ?? languages.map(runner.describe);
    probeCache = await runner.probeLanguages(languages, store.data.settings.commandOverrides);
    return probeCache;
  });

  ipcMain.on('open:github', (_e, url) => {
    if (typeof url === 'string' && /^https:\/\/github\.com\/[\w.-]+\/[\w.-]+(\/[\w./-]*)?$/.test(url)) {
      shell.openExternal(url);
    }
  });

  const overrides = () => store.data.settings.commandOverrides;
  const seconds = () => Math.min(120, Math.max(1, Number(store.data.settings.timeLimitSec) || 10)) * 1000;

  ipcMain.handle('run:program', (_e, { runId, languageId, code, stdin, files }) => {
    const lang = language(languageId);
    if (!lang) return { phase: 'unknown-language' };
    return runner.runProgram(
      { runId, language: lang, code, stdin, files, timeoutMs: seconds(), overrides: overrides() },
      (event) => send('run:output', event),
    );
  });
  ipcMain.handle('run:tests', (_e, { runId, languageId, code, tests }) => {
    const lang = language(languageId);
    if (!lang) return { phase: 'unknown-language' };
    return runner.runTests({ runId, language: lang, code, tests, timeoutMs: seconds(), overrides: overrides() });
  });
  ipcMain.on('run:stop', (_e, runId) => runner.stop(runId));

  ipcMain.handle('update:status', () => updater.getStatus());
  ipcMain.handle('update:check', () => updater.check());
  ipcMain.on('update:install', () => updater.install());

  ipcMain.handle('packs:open', async () => {
    const { canceled, filePaths } = await dialog.showOpenDialog(win, {
      title: 'Import question pack',
      filters: [{ name: 'Question pack', extensions: ['json'] }],
      properties: ['openFile'],
    });
    if (canceled) return null;
    const { size } = fs.statSync(filePaths[0]);
    if (size > MAX_PACK_BYTES) return { error: 'That file is over 5 MB, so it was not imported.' };
    return { name: path.basename(filePaths[0], '.json'), text: fs.readFileSync(filePaths[0], 'utf8') };
  });
  ipcMain.handle('packs:save', async (_e, suggestedName, text) => {
    const { canceled, filePath } = await dialog.showSaveDialog(win, {
      title: 'Export question pack',
      defaultPath: suggestedName,
      filters: [{ name: 'Question pack', extensions: ['json'] }],
    });
    if (canceled) return false;
    fs.writeFileSync(filePath, text, 'utf8');
    return true;
  });

  ipcMain.handle('exam:lock', () => {
    examLocked = true;
    win.setKiosk(true);
    win.setAlwaysOnTop(true, 'screen-saver');
    win.focus();
  });
  ipcMain.handle('exam:unlock', () => {
    examLocked = false;
    win.setAlwaysOnTop(false);
    win.setKiosk(false);
  });
}

app.whenReady().then(() => {
  store = new Store(path.join(app.getPath('userData'), 'longhand-data.json'));
  runner.setRuntimesDir(app.isPackaged ? path.join(process.resourcesPath, 'runtimes') : path.join(__dirname, '..', 'runtimes'));
  updater = createUpdater({
    repoUrl,
    isEnabled: () => store.data.settings.autoUpdate,
    isExamRunning: () => examLocked || Boolean(store.data.activeExam),
    onStatus: (status) => send('update:status', status),
  });
  updater.start();
  blockNetwork();
  if (!DEV) serveApp();
  registerIpc();
  createWindow();
});

app.on('before-quit', () => store?.flush());
app.on('window-all-closed', () => app.quit());
