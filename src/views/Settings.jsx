import { useEffect, useMemo, useState } from 'react';
import { useApp } from '../state.jsx';
import { PROBLEMS } from '../data/problems.js';
import { parsePack, serializePack } from '../packs.js';
import { REPO_URL } from '../config.js';
import { LEVELS } from '../levels.js';
import { monaco } from '../monaco.js';
import { ConfirmButton } from '../components/ui.jsx';

const api = window.longhand;
const EMPTY_FORM = { name: '', file: '', monaco: 'plaintext', compile: '', run: '', template: '' };

function Group({ title, children }) {
  return (
    <section className="settings-group">
      <h2>{title}</h2>
      {children}
    </section>
  );
}

function Row({ label, hint, children }) {
  return (
    <label className="setting-row py-0.5">
      <span>
        <span className="block">{label}</span>
        {hint && <span className="block text-mute">{hint}</span>}
      </span>
      {children}
    </label>
  );
}

// Lets someone type freely, even passing through invalid values such as the
// "1" on the way to "16", and only saves a number that is in range.
function NumberField({ value, min, max, onCommit }) {
  const [draft, setDraft] = useState(String(value));
  return (
    <input
      type="number"
      min={min}
      max={max}
      className="field w-[140px]"
      value={draft}
      onChange={(e) => {
        setDraft(e.target.value);
        const number = e.target.valueAsNumber;
        if (number >= min && number <= max) onCommit(number);
      }}
      onBlur={() => setDraft(String(value))}
    />
  );
}

function updateMessage(status) {
  switch (status?.state) {
    case 'unavailable':
      return status.reason === 'no-repo' ? 'Updates will work once the project has a GitHub link.' : 'Updates only work in the installed app.';
    case 'checking': return 'Checking for updates';
    case 'latest': return 'You have the latest version.';
    case 'downloading': return `Downloading version ${status.version} (${status.percent ?? 0}%)`;
    case 'ready': return `Version ${status.version} is ready to install.`;
    case 'error': return "Couldn't check for updates. Make sure you're online and try again.";
    default: return '';
  }
}

function UpdatesGroup() {
  const { settings, updateSettings, flush } = useApp();
  const [status, setStatus] = useState(null);

  useEffect(() => {
    api.updates.status().then(setStatus);
    return api.updates.onStatus(setStatus);
  }, []);

  const toggle = async (enabled) => {
    updateSettings({ autoUpdate: enabled });
    if (enabled) {
      await flush();
      api.updates.check();
    }
  };
  const busy = ['checking', 'downloading', 'ready', 'unavailable'].includes(status?.state);

  return (
    <Group title="Updates">
      <Row label="Update automatically" hint="Off by default. This is the only feature that uses the internet, and it never runs during an exam.">
        <input type="checkbox" className="accent-accent" checked={settings.autoUpdate} onChange={(e) => toggle(e.target.checked)} />
      </Row>
      <div className="mt-2 flex items-center gap-2.5">
        <button type="button" className="btn" disabled={busy} onClick={() => api.updates.check()}>Check now</button>
        {status?.state === 'ready' && <button type="button" className="btn btn-go" onClick={() => api.updates.install()}>Restart and update</button>}
        <span className="text-mute">Version {status?.current}. {updateMessage(status)}</span>
      </div>
    </Group>
  );
}

function PacksGroup() {
  const { packs, update } = useApp();
  const [message, setMessage] = useState(null);

  const importPack = async () => {
    setMessage(null);
    const file = await api.packs.open();
    if (!file) return;
    if (file.error) {
      setMessage({ error: true, text: file.error });
      return;
    }
    try {
      const pack = parsePack(file.name, file.text);
      update('packs', (all) => [...all, pack]);
      setMessage({ text: `Imported "${pack.name}" with ${pack.problems.length} problems. They are in the Practice list.` });
    } catch (error) {
      setMessage({ error: true, text: `Not imported. ${error.message}` });
    }
  };

  return (
    <Group title="Question packs">
      <p className="m-0 mb-2.5 max-w-[62ch] text-mute">Share problems as JSON files. A teacher can make a pack for a class. The format is described in the README.</p>
      <div className="mb-2 flex gap-1.5">
        <button type="button" className="btn" onClick={importPack}>Import pack</button>
        <button type="button" className="btn" onClick={() => api.packs.save('longhand-questions.json', serializePack('Longhand questions', PROBLEMS))}>Export built-in questions</button>
      </div>
      {message && <p className={`m-0 mb-2 ${message.error ? 'text-fail-ink' : 'text-pass'}`}>{message.text}</p>}
      {packs.map((pack) => (
        <div key={pack.id} className="flex items-center gap-2 border-t border-line py-1.5">
          <span className="flex-1 truncate">{pack.name} <span className="text-mute">({pack.problems.length})</span></span>
          <button type="button" className="btn" onClick={() => api.packs.save(`${pack.name}.json`, serializePack(pack.name, pack.problems))}>Export</button>
          <ConfirmButton confirmLabel="Remove pack?" onConfirm={() => update('packs', (all) => all.filter((p) => p.id !== pack.id))}>Remove</ConfirmButton>
        </div>
      ))}
    </Group>
  );
}

function LanguagesGroup() {
  const { languages, settings, updateSettings, refreshLanguages, update } = useApp();
  const [checking, setChecking] = useState(false);
  const installed = languages.filter((l) => l.available).length;
  const groups = [...new Set(languages.map((l) => l.group))];

  const recheck = async () => {
    setChecking(true);
    await refreshLanguages();
    setChecking(false);
  };
  const setOverride = (id, value) => updateSettings({ commandOverrides: { ...settings.commandOverrides, [id]: value } });

  return (
    <Group title="Languages">
      <div className="mb-2.5 flex items-center justify-between">
        <span className="text-mute">{installed} of {languages.length} ready on this computer.</span>
        <button type="button" className="btn" disabled={checking} onClick={recheck}>{checking ? 'Checking' : 'Check again'}</button>
      </div>
      {groups.map((group) => (
        <div key={group} className="mb-3">
          <h3 className="m-0 mb-0.5 text-[13px] font-semibold">{group}</h3>
          {languages.filter((l) => l.group === group).map((l) => (
            <details key={l.id} className="border-b border-line">
              <summary className="flex h-[27px] items-center gap-2 hover:bg-white/[0.03]">
                <span className={`inline-block size-2 flex-none ${l.available ? 'bg-pass' : l.available === false ? 'bg-line-strong' : 'bg-transparent'}`} />
                <span className="flex-1">{l.name}</span>
                <span className="max-w-[300px] truncate text-mute">{l.available ? l.version : l.available === false ? 'Not installed' : 'Checking'}</span>
              </summary>
              <div className="pb-2.5 pl-4">
                {!l.available && l.install && <p className="m-0 mb-1.5 select-text">To install: <code className="font-code text-[12px]">{l.install}</code></p>}
                {!l.builtInRuntime && !l.custom && (
                  <label className="flex items-center gap-2">
                    <span className="text-mute">Path to {l.tool}</span>
                    <input className="field flex-1 font-code text-[12px]" placeholder={`Found automatically if ${l.tool} is on your PATH`} value={settings.commandOverrides[l.id] ?? ''} onChange={(e) => setOverride(l.id, e.target.value)} onBlur={recheck} />
                  </label>
                )}
                {l.custom && (
                  <ConfirmButton confirmLabel="Remove language?" onConfirm={async () => {
                    update('customLanguages', (all) => all.filter((c) => c.id !== l.id));
                    await recheck();
                  }}>Remove</ConfirmButton>
                )}
              </div>
            </details>
          ))}
        </div>
      ))}
    </Group>
  );
}

function AddLanguage() {
  const { update, refreshLanguages } = useApp();
  const [form, setForm] = useState(EMPTY_FORM);
  const [error, setError] = useState('');
  const highlighters = useMemo(() => monaco.languages.getLanguages().map((l) => l.id).sort(), []);
  const set = (key) => (e) => setForm({ ...form, [key]: e.target.value });

  const add = async () => {
    if (!form.name.trim() || !form.file.trim() || !form.run.trim()) {
      setError('Fill in the name, file name and run command.');
      return;
    }
    if (/[\\/]|\.\./.test(form.file)) {
      setError('The file name must be a plain name such as main.zig.');
      return;
    }
    setError('');
    update('customLanguages', (all) => [...all, { ...form, id: `custom-${Date.now().toString(36)}`, name: form.name.trim(), file: form.file.trim() }]);
    setForm(EMPTY_FORM);
    await refreshLanguages();
  };

  return (
    <Group title="Add any other language">
      <p className="m-0 mb-2.5 max-w-[62ch] text-mute">
        If it runs from a command line, it works here. In commands, use {'{file}'} for your code, {'{out}'} for a compiled program and {'{dir}'} for its folder.
        Each test sends its input on standard input.
      </p>
      <div className="flex flex-col gap-1">
        <Row label="Name"><input className="field w-[320px]" placeholder="Zig" value={form.name} onChange={set('name')} /></Row>
        <Row label="File name"><input className="field w-[320px] font-code text-[12px]" placeholder="main.zig" value={form.file} onChange={set('file')} /></Row>
        <Row label="Compile command, if it has one"><input className="field w-[320px] font-code text-[12px]" placeholder="zig build-exe {file} -femit-bin={out}" value={form.compile} onChange={set('compile')} /></Row>
        <Row label="Run command"><input className="field w-[320px] font-code text-[12px]" placeholder="{out}" value={form.run} onChange={set('run')} /></Row>
        <Row label="Syntax colours">
          <select className="field w-[320px]" value={form.monaco} onChange={set('monaco')}>
            {highlighters.map((id) => <option key={id}>{id}</option>)}
          </select>
        </Row>
        <label className="mt-1 block">
          <span className="mb-0.5 block">Starter code</span>
          <textarea rows={4} spellCheck={false} className="field w-full font-code text-[12px]" value={form.template} onChange={set('template')} />
        </label>
      </div>
      {error && <p className="m-0 mt-1.5 text-fail-ink">{error}</p>}
      <button type="button" className="btn mt-2" onClick={add}>Add language</button>
    </Group>
  );
}

export default function Settings() {
  const { settings, updateSettings } = useApp();
  return (
    <div className="h-full overflow-y-auto">
      <div className="mx-auto w-[640px] pb-10">
        <Group title="Experience">
          <Row label="Your level" hint={LEVELS.find((l) => l.id === settings.level)?.text}>
            <select className="field w-[140px]" value={settings.level} onChange={(e) => updateSettings({ level: e.target.value })}>
              {LEVELS.map((l) => <option key={l.id} value={l.id}>{l.label}</option>)}
            </select>
          </Row>
          <Row label="Show the game development topics" hint="Adds game logic problems and Unity, Unreal, Godot and LÖVE style examples.">
            <input type="checkbox" className="accent-accent" checked={settings.showGameTrack} onChange={(e) => updateSettings({ showGameTrack: e.target.checked })} />
          </Row>
        </Group>
        <Group title="Editor">
          <Row label="Keyboard">
            <select className="field w-[140px]" value={settings.keymap} onChange={(e) => updateSettings({ keymap: e.target.value })}>
              <option value="standard">Standard</option>
              <option value="vim">Vim</option>
              <option value="emacs">Emacs</option>
            </select>
          </Row>
          <Row label="Font size">
            <NumberField value={settings.fontSize} min={10} max={28} onCommit={(fontSize) => updateSettings({ fontSize })} />
          </Row>
        </Group>
        <Group title="Running code">
          <Row label="Time limit per run, in seconds" hint="Programs still running after this are stopped.">
            <NumberField value={settings.timeLimitSec} min={1} max={120} onCommit={(timeLimitSec) => updateSettings({ timeLimitSec })} />
          </Row>
        </Group>
        <PacksGroup />
        <LanguagesGroup />
        <AddLanguage />
        <UpdatesGroup />
        <Group title="Open source">
          <div className="flex gap-1.5">
            <button type="button" className="btn" disabled={!REPO_URL} onClick={() => api.openGithub(REPO_URL)}>Support it on GitHub</button>
            <button type="button" className="btn" disabled={!REPO_URL} onClick={() => api.openGithub(`${REPO_URL}/issues/new`)}>Report an issue on GitHub</button>
          </div>
        </Group>
      </div>
    </div>
  );
}
