// Updates come from the project's GitHub releases. This is off unless the user
// turns it on, and it is the only part of the app that uses the internet.
const { app } = require('electron');

const FIRST_CHECK_MS = 15 * 1000;
const CHECK_EVERY_MS = 6 * 60 * 60 * 1000;

function githubRepo(url) {
  const match = /^https:\/\/github\.com\/([\w.-]+)\/([\w.-]+?)(?:\.git)?\/?$/.exec(url ?? '');
  return match ? { owner: match[1], repo: match[2] } : null;
}

function createUpdater({ repoUrl, isEnabled, isExamRunning, onStatus }) {
  const repo = githubRepo(repoUrl);
  const unavailable = !app.isPackaged ? 'not-installed' : !repo ? 'no-repo' : null;
  let status = { state: unavailable ? 'unavailable' : 'idle', reason: unavailable, current: app.getVersion() };
  let updater = null;

  const setStatus = (changes) => {
    status = { state: status.state, current: status.current, ...changes };
    onStatus(status);
  };

  if (!unavailable) {
    ({ autoUpdater: updater } = require('electron-updater'));
    updater.autoDownload = true;
    updater.autoInstallOnAppQuit = true;
    updater.setFeedURL({ provider: 'github', ...repo });
    updater.on('checking-for-update', () => setStatus({ state: 'checking' }));
    updater.on('update-not-available', () => setStatus({ state: 'latest' }));
    updater.on('update-available', (info) => setStatus({ state: 'downloading', version: info.version, percent: 0 }));
    updater.on('download-progress', (progress) => setStatus({ state: 'downloading', version: status.version, percent: Math.round(progress.percent) }));
    updater.on('update-downloaded', (info) => setStatus({ state: 'ready', version: info.version }));
    updater.on('error', () => setStatus({ state: 'error' }));
  }

  const check = async () => {
    if (!updater || isExamRunning() || ['checking', 'downloading', 'ready'].includes(status.state)) return status;
    try {
      await updater.checkForUpdates();
    } catch {
      setStatus({ state: 'error' });
    }
    return status;
  };

  const install = () => {
    if (updater && status.state === 'ready' && !isExamRunning()) updater.quitAndInstall(true, true);
  };

  const start = () => {
    if (!updater) return;
    const tick = () => { if (isEnabled()) check(); };
    setTimeout(tick, FIRST_CHECK_MS);
    setInterval(tick, CHECK_EVERY_MS);
  };

  return { start, check, install, getStatus: () => status };
}

module.exports = { createUpdater };
