// Everything the app remembers lives in one JSON file in the user's app-data folder.
const fs = require('node:fs');

const DEFAULTS = {
  settings: {
    level: null,
    language: 'python',
    keymap: 'standard',
    fontSize: 14,
    timeLimitSec: 10,
    showGameTrack: true,
    autoUpdate: false,
    commandOverrides: {},
    layout: {},
  },
  progress: {},
  runs: [],
  exams: [],
  packs: [],
  customLanguages: [],
  activeExam: null,
};

class Store {
  constructor(file) {
    this.file = file;
    this.timer = null;
    this.data = structuredClone(DEFAULTS);
    try {
      const saved = JSON.parse(fs.readFileSync(file, 'utf8'));
      this.data = { ...this.data, ...saved, settings: { ...DEFAULTS.settings, ...saved.settings } };
    } catch (error) {
      // A damaged file is kept aside rather than overwritten.
      if (error.code !== 'ENOENT') {
        try { fs.renameSync(file, `${file}.damaged-${Date.now()}`); } catch { /* nothing to keep */ }
      }
    }
  }

  set(key, value) {
    if (!Object.hasOwn(DEFAULTS, key)) return;
    this.data[key] = value;
    clearTimeout(this.timer);
    this.timer = setTimeout(() => this.flush(), 200);
  }

  flush() {
    clearTimeout(this.timer);
    const temp = `${this.file}.tmp`;
    fs.writeFileSync(temp, JSON.stringify(this.data));
    fs.renameSync(temp, this.file);
  }
}

module.exports = { Store };
