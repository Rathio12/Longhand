// Compiles and runs code with the computer's own compilers, falling back to the
// ones shipped with the app. No shell is involved: every command is an argument list.
const { spawn, spawnSync } = require('node:child_process');
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');
const { EXE } = require('./languages.cjs');

const MAX_OUTPUT = 1024 * 1024;
const COMPILE_TIMEOUT = 120000;
const active = new Map();

// Tools shipped in the runtimes folder. Each is only used when the computer
// doesn't have a working copy of its own.
const BUNDLED = {
  python: { exe: 'python/python.exe', probe: ['--version'] },
  gcc: { exe: 'mingw/bin/gcc.exe', probe: ['--version'] },
  'g++': { exe: 'mingw/bin/g++.exe', probe: ['--version'] },
  javac: { exe: 'java/bin/javac.exe', probe: ['-version'] },
  java: { exe: 'java/bin/java.exe', probe: ['-version'] },
  lua: { exe: 'lua/lua.exe', probe: ['-v'] },
  bash: { exe: 'mingw/bin/sh.exe', probe: ['--version'], note: 'BusyBox shell' },
  dotnet: { exe: 'dotnet/dotnet.exe', probe: ['--version'] },
  go: { exe: 'go/bin/go.exe', probe: ['version'] },
  rustc: { exe: 'rust/bin/rustc.exe', probe: ['--version'] },
  kotlinc: { exe: 'kotlin/bin/kotlinc.bat', probe: ['-version'] },
  dart: { exe: 'dart/bin/dart.exe', probe: ['--version'] },
  ruby: { exe: 'ruby/bin/ruby.exe', probe: ['--version'] },
  php: { exe: 'php/php.exe', probe: ['--version'] },
  perl: { exe: 'perl/bin/perl.exe', probe: ['--version'] },
  Rscript: { exe: 'r/bin/Rscript.exe', probe: ['--version'] },
  godot: { exe: 'godot/godot_console.exe', probe: ['--version'] },
};

let runtimesDir = path.join(__dirname, '..', 'runtimes');
let toolChoice = null;

function setRuntimesDir(dir) {
  runtimesDir = dir;
  toolChoice = null;
}

const childEnv = (extra = {}) => ({
  ...process.env,
  PYTHONUTF8: '1',
  PYTHONIOENCODING: 'utf-8',
  DOTNET_NOLOGO: '1',
  DOTNET_CLI_TELEMETRY_OPTOUT: '1',
  ...extra,
});

function findOnPath(command) {
  if (path.isAbsolute(command)) return fs.existsSync(command) ? command : null;
  const dirs = (process.env.PATH || '').split(path.delimiter).filter(Boolean);
  const exts = process.platform === 'win32'
    ? ['', ...(process.env.PATHEXT || '.EXE;.CMD;.BAT').split(';').map((e) => e.toLowerCase())]
    : [''];
  for (const dir of dirs) {
    for (const ext of exts) {
      const candidate = path.join(dir, command + ext);
      try {
        if (fs.statSync(candidate).isFile()) return candidate;
      } catch { /* keep looking */ }
    }
  }
  return null;
}

function killTree(child) {
  if (!child.pid) return;
  try {
    if (process.platform === 'win32') {
      spawnSync('taskkill', ['/pid', String(child.pid), '/T', '/F'], { windowsHide: true });
    } else {
      process.kill(-child.pid, 'SIGKILL');
    }
  } catch { /* already gone */ }
}

function exec(argv, { cwd, env, stdin = '', timeoutMs, onData, onChild }) {
  return new Promise((resolve) => {
    const started = Date.now();
    let [command, ...args] = argv;
    const resolved = path.isAbsolute(command) || command.includes('/') ? command : findOnPath(command);
    if (!resolved) {
      resolve({ missing: command, exitCode: null, stdout: '', stderr: '', durationMs: 0 });
      return;
    }

    const options = { cwd, env, windowsHide: true, detached: process.platform !== 'win32' };
    // .cmd and .bat files can only be started through cmd.exe.
    if (/\.(cmd|bat)$/i.test(resolved)) {
      const quoted = [resolved, ...args].map((a) => `"${a}"`).join(' ');
      args = ['/d', '/s', '/c', `"${quoted}"`];
      command = 'cmd.exe';
      options.windowsVerbatimArguments = true;
    } else {
      command = resolved;
    }

    let child;
    try {
      child = spawn(command, args, options);
    } catch (error) {
      resolve({ spawnError: error.message, exitCode: null, stdout: '', stderr: '', durationMs: 0 });
      return;
    }
    onChild?.(child);

    let stdout = '';
    let stderr = '';
    let total = 0;
    let timedOut = false;
    let truncated = false;
    let finished = false;

    const timer = timeoutMs ? setTimeout(() => { timedOut = true; killTree(child); }, timeoutMs) : null;

    const collect = (kind) => (chunk) => {
      if (truncated) return;
      total += chunk.length;
      if (total > MAX_OUTPUT) {
        truncated = true;
        killTree(child);
        return;
      }
      if (kind === 'out') stdout += chunk; else stderr += chunk;
      onData?.(kind, chunk);
    };

    child.stdout.setEncoding('utf8').on('data', collect('out'));
    child.stderr.setEncoding('utf8').on('data', collect('err'));
    child.stdin.on('error', () => {});
    child.stdin.end(stdin);

    const finish = (result) => {
      if (finished) return;
      finished = true;
      if (timer) clearTimeout(timer);
      resolve({ stdout, stderr, timedOut, truncated, durationMs: Date.now() - started, ...result });
    };
    child.on('error', (error) => finish({ spawnError: error.message, exitCode: null }));
    child.on('close', (exitCode, signal) => finish({ exitCode, signal }));
  });
}

let dotnetFramework;
async function targetFramework(env, tools) {
  if (dotnetFramework) return dotnetFramework;
  const { stdout } = await exec([tools.dotnet ?? 'dotnet', '--version'], { env, timeoutMs: 15000 });
  const major = /^(\d+)\./.exec(stdout.trim())?.[1] || '8';
  dotnetFramework = `net${major}.0`;
  return dotnetFramework;
}

// Maps a tool name to its bundled copy, for tools this computer lacks.
// Asking each one for its version also rejects Windows' placeholder python.exe.
function chooseTools(refresh = false) {
  if (refresh || !toolChoice) {
    toolChoice = (async () => {
      const env = childEnv();
      const picks = {};
      await Promise.all(Object.entries(BUNDLED).map(async ([name, { exe, probe }]) => {
        const bundled = path.join(runtimesDir, exe);
        if (!fs.existsSync(bundled)) return;
        if (!process.env.LONGHAND_USE_BUNDLED) {
          const system = await exec([name, ...probe], { env, timeoutMs: 8000 });
          if (system.exitCode === 0 && !system.missing && !system.spawnError) return;
        }
        picks[name] = bundled;
      }));
      return picks;
    })();
  }
  return toolChoice;
}

// Lets a bundled shell find its own grep and sort rather than the Windows commands.
function withToolFolderFirst(env, tool) {
  if (!tool) return env;
  const key = Object.keys(env).find((name) => name.toUpperCase() === 'PATH') ?? 'PATH';
  return { ...env, [key]: `${path.dirname(tool)}${path.delimiter}${env[key] ?? ''}` };
}

function expand(tokens, vars, language, overrides, tools) {
  const replacement = overrides?.[language.id]?.trim();
  return tokens.map((token) => {
    if (token === language.tool && replacement) return replacement;
    if (tools[token]) return tools[token];
    return token
      .replaceAll('{node}', process.execPath)
      .replaceAll('{file}', vars.file)
      .replaceAll('{dir}', vars.dir)
      .replaceAll('{out}', vars.out);
  });
}

async function prepare(language, code, { overrides, onData, onChild }) {
  const dir = await fs.promises.mkdtemp(path.join(os.tmpdir(), 'longhand-'));
  const vars = { dir, file: path.join(dir, language.file), out: path.join(dir, EXE) };
  const tools = await chooseTools();
  // kotlinc finds Java through JAVA_HOME.
  const javaHome = tools.java ? { JAVA_HOME: path.dirname(path.dirname(tools.java)) } : {};
  const env = withToolFolderFirst(childEnv({ ...javaHome, ...(language.builtInRuntime ? { ELECTRON_RUN_AS_NODE: '1' } : {}) }), tools[language.tool]);
  // The editor can produce Windows line endings, which break shell scripts.
  await fs.promises.writeFile(vars.file, (language.prelude ?? '') + code.replace(/\r\n/g, '\n'), 'utf8');

  for (const [name, content] of Object.entries(language.extra || {})) {
    const body = content.includes('{tfm}') ? content.replace('{tfm}', await targetFramework(env, tools)) : content;
    await fs.promises.writeFile(path.join(dir, name), body, 'utf8');
  }

  const context = { dir, vars, env, language, overrides, tools };
  if (!language.compile) return { ...context, ok: true };

  const compile = await exec(expand(language.compile, vars, language, overrides, tools), {
    cwd: dir, env, timeoutMs: COMPILE_TIMEOUT, onData, onChild,
  });
  return {
    ...context,
    ok: compile.exitCode === 0,
    compile,
  };
}

// Gives a test its own folder of files, rebuilt so one test can't affect the next.
async function setUpFiles(dir, files) {
  if (!files) return;
  const work = path.join(dir, 'work');
  await fs.promises.rm(work, { recursive: true, force: true, maxRetries: 5, retryDelay: 100 });
  await fs.promises.mkdir(work);
  for (const [name, content] of Object.entries(files)) {
    const target = path.resolve(work, name);
    if (!target.startsWith(work + path.sep)) continue;
    await fs.promises.mkdir(path.dirname(target), { recursive: true });
    await fs.promises.writeFile(target, content, 'utf8');
  }
}

function cleanup(dir) {
  fs.promises.rm(dir, { recursive: true, force: true, maxRetries: 5, retryDelay: 200 }).catch(() => {});
}

function launch(context, stdin, timeoutMs, onData, onChild) {
  const { language, vars, overrides, dir, env, tools } = context;
  return exec(expand(language.run, vars, language, overrides, tools), { cwd: dir, env, stdin, timeoutMs, onData, onChild });
}

function failedCompile(context) {
  const { compile } = context;
  if (compile.missing) return { phase: 'missing', tool: compile.missing };
  if (compile.timedOut) return { phase: 'compile', timedOut: true, compileOutput: 'The compiler took longer than two minutes and was stopped.' };
  return { phase: 'compile', compileOutput: `${compile.stdout}${compile.stderr}`.trim() || compile.spawnError || 'The compiler failed without printing a message.' };
}

function track(runId) {
  const entry = { stopped: false, child: null };
  active.set(runId, entry);
  return { entry, onChild: (child) => { entry.child = child; if (entry.stopped) killTree(child); } };
}

// Free run: output streams back through `emit` as it appears.
async function runProgram({ runId, language, code, stdin, files, timeoutMs, overrides }, emit) {
  const { entry, onChild } = track(runId);
  const onData = (kind, text) => emit({ runId, kind, text });
  let context;
  try {
    emit({ runId, kind: 'phase', text: language.compile ? 'compiling' : 'running' });
    context = await prepare(language, code, { overrides, onChild });
    if (!context.ok) return failedCompile(context);
    if (entry.stopped) return { phase: 'run', stopped: true };
    emit({ runId, kind: 'phase', text: 'running' });
    await setUpFiles(context.dir, files);
    const result = await launch(context, stdin, timeoutMs, onData, onChild);
    if (result.missing) return { phase: 'missing', tool: result.missing };
    return { phase: 'run', ...result, stopped: entry.stopped };
  } finally {
    active.delete(runId);
    if (context) cleanup(context.dir);
  }
}

const normalize = (text) => text
  .replace(/\r\n?/g, '\n')
  .split('\n')
  .map((line) => line.trimEnd())
  .join('\n')
  .trimEnd();

// Test run: compile once, then feed each test case in turn.
async function runTests({ runId, language, code, tests, timeoutMs, overrides }) {
  const { entry, onChild } = track(runId);
  let context;
  try {
    context = await prepare(language, code, { overrides, onChild });
    if (!context.ok) return failedCompile(context);
    const results = [];
    for (const test of tests) {
      if (entry.stopped) return { phase: 'tests', stopped: true, results };
      await setUpFiles(context.dir, test.files);
      const run = await launch(context, test.input, timeoutMs, undefined, onChild);
      if (run.missing) return { phase: 'missing', tool: run.missing };
      const crashed = run.exitCode !== 0 && !run.timedOut && !language.ignoreExitCode;
      results.push({
        passed: !run.timedOut && !crashed && !run.truncated && normalize(run.stdout) === normalize(test.output),
        actual: run.stdout.slice(0, 8000),
        stderr: run.stderr.slice(0, 8000),
        timedOut: run.timedOut,
        truncated: run.truncated,
        crashed,
        exitCode: run.exitCode,
        durationMs: run.durationMs,
      });
    }
    return { phase: 'tests', results };
  } finally {
    active.delete(runId);
    if (context) cleanup(context.dir);
  }
}

function stop(runId) {
  const entry = active.get(runId);
  if (!entry) return;
  entry.stopped = true;
  if (entry.child) killTree(entry.child);
}

function describe(language) {
  const { id, name, group, monaco, template, install, custom, file, builtInRuntime, tool } = language;
  // The install commands in languages.cjs are for Windows.
  const howToInstall = process.platform === 'win32' || custom ? install : `Install ${tool} with your system's package manager.`;
  return { id, name, group, monaco, template, install: howToInstall, custom, file, builtInRuntime, tool };
}

async function probeLanguages(languages, overrides = {}) {
  const env = childEnv({ ELECTRON_RUN_AS_NODE: '1' });
  const tools = await chooseTools(true);
  return Promise.all(languages.map(async (language) => {
    const { id, builtInRuntime } = language;
    const base = describe(language);
    if (builtInRuntime) return { ...base, available: true, version: 'Included with this app' };
    if (!language.tool) return { ...base, available: false, version: '' };
    if (!overrides[id]?.trim() && tools[language.tool]) {
      const note = BUNDLED[language.tool].note;
      return { ...base, available: true, version: note ? `Included with this app (${note})` : 'Included with this app' };
    }
    const tool = overrides[id]?.trim() || language.tool;
    const result = await exec([tool, ...(language.probe || ['--version'])], { env, timeoutMs: 8000 });
    const text = `${result.stdout}\n${result.stderr}`.trim().split('\n')[0] || '';
    const available = result.exitCode === 0 && !result.missing && !result.spawnError;
    return { ...base, available, version: available ? text.slice(0, 80) : '' };
  }));
}

module.exports = { runProgram, runTests, stop, describe, probeLanguages, setRuntimesDir, normalize };
