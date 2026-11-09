import { useCallback, useEffect, useRef, useState } from 'react';
import { useApp } from '../state.jsx';
import { explainError, explainResult } from '../errorHelp.js';
import { showsErrorHelp } from '../levels.js';
import CodeEditor from './CodeEditor.jsx';
import { LanguageSelect, Split, TabStrip, ConfirmButton } from './ui.jsx';

const api = window.longhand;
const CONSOLE_HEADER = 30;

export function Help({ text }) {
  const { settings } = useApp();
  if (!text || !showsErrorHelp(settings.level)) return null;
  return <p className="mt-2 mb-0 max-w-[70ch] border-l-2 border-accent pl-2.5 font-ui text-[13px] text-ink select-text">{text}</p>;
}

function MissingTool({ language }) {
  const { refreshLanguages } = useApp();
  const [checking, setChecking] = useState(false);
  return (
    <div className="flex flex-none items-center gap-3 border-b border-line bg-[#d977061a] px-3 py-1.5">
      <p className="m-0 min-w-0 flex-1 select-text">
        {language.name} needs <strong className="font-semibold">{language.tool}</strong>, which isn't set up on this computer.
        {' '}To install it: <code className="font-code text-[12px]">{language.install}</code>
      </p>
      <button
        type="button"
        className="btn"
        disabled={checking}
        onClick={async () => {
          setChecking(true);
          await refreshLanguages();
          setChecking(false);
        }}
      >
        {checking ? 'Checking' : 'Check again'}
      </button>
    </div>
  );
}

function OutputPanel({ run }) {
  if (!run) return <p className="m-0 text-mute">Press Run to see what your program prints.</p>;
  const { chunks, result, phase } = run;
  const stderr = chunks.filter((c) => c.kind === 'err').map((c) => c.text).join('');
  return (
    <div className="terminal">
      {chunks.map((chunk, i) => (
        <span key={i} className={chunk.kind === 'err' ? 'text-fail-ink' : ''}>{chunk.text}</span>
      ))}
      {!result && <div className="text-mute">{phase === 'compiling' ? 'Compiling' : 'Running'}</div>}
      {result?.phase === 'missing' && <div className="text-fail-ink">Could not find "{result.tool}". Install it, or set its path in Settings.</div>}
      {result?.phase === 'compile' && (
        <>
          <div className="mb-1 text-fail-ink">Your code did not compile.</div>
          <div className="text-fail-ink">{result.compileOutput}</div>
          <Help text={explainError(result.compileOutput)} />
        </>
      )}
      {result?.phase === 'run' && (
        <>
          <div className="mt-1 text-mute">
            {result.stopped && 'Stopped.'}
            {!result.stopped && result.timedOut && 'Stopped at the time limit.'}
            {!result.stopped && result.truncated && 'Stopped because the output was too long.'}
            {!result.stopped && !result.timedOut && !result.truncated && result.exitCode === 0 && `Finished in ${result.durationMs} ms.`}
            {!result.stopped && !result.timedOut && !result.truncated && result.exitCode !== 0 && `Crashed with exit code ${result.exitCode}.`}
          </div>
          <Help text={explainResult(result) || (result.exitCode !== 0 ? explainError(stderr) : null)} />
        </>
      )}
    </div>
  );
}

function CaseValue({ label, children }) {
  return (
    <div className="min-w-0 flex-1">
      <div className="mb-0.5 font-ui text-mute">{label}</div>
      <pre className="code-block max-h-40 overflow-auto">{children || ' '}</pre>
    </div>
  );
}

function TestRow({ index, test, result }) {
  const [open, setOpen] = useState(!result.passed && test.sample);
  const name = test.sample ? `Example ${index + 1}` : `Hidden test ${index + 1}`;
  const why = result.passed ? '' : result.timedOut ? 'Too slow' : result.truncated ? 'Too much output' : result.crashed ? 'Crashed' : 'Wrong answer';
  return (
    <div className="border-b border-line">
      <button type="button" className="flex h-[26px] w-full items-center gap-2 text-left hover:bg-white/[0.03]" aria-expanded={open} onClick={() => setOpen(!open)}>
        <span className={`inline-block size-2 flex-none ${result.passed ? 'bg-pass' : 'bg-fail'}`} />
        <span className="flex-1">{name}{why && <span className="text-fail-ink">{`, ${why.toLowerCase()}`}</span>}</span>
        <span className="text-mute">{result.durationMs} ms</span>
      </button>
      {open && (
        <div className="pb-2.5">
          {test.sample ? (
            <div className="flex gap-2">
              <CaseValue label="Input">{test.input}</CaseValue>
              <CaseValue label="Expected">{test.output}</CaseValue>
              <CaseValue label="Your output">{result.actual}</CaseValue>
            </div>
          ) : (
            <p className="m-0 text-mute">The input for this test stays hidden, as it would in an exam. Think about the smallest, largest and unusual inputs.</p>
          )}
          <Help text={explainResult(result) || explainError(result.stderr)} />
          {result.stderr && <pre className="code-block mt-2 max-h-32 overflow-auto text-fail-ink">{result.stderr}</pre>}
        </div>
      )}
    </div>
  );
}

function TestsPanel({ tests, outcome, busy }) {
  if (busy && !outcome) return <p className="m-0 text-mute">Running the tests</p>;
  if (!outcome) return <p className="m-0 text-mute">Press Run tests to check your code.</p>;
  if (outcome.phase === 'missing') return <p className="m-0 text-fail-ink">Could not find "{outcome.tool}". Install it, or set its path in Settings.</p>;
  if (outcome.phase === 'compile') {
    return (
      <div className="terminal">
        <div className="mb-1 text-fail-ink">Your code did not compile, so no tests ran.</div>
        <div className="text-fail-ink">{outcome.compileOutput}</div>
        <Help text={explainError(outcome.compileOutput)} />
      </div>
    );
  }
  const passed = outcome.results.filter((r) => r.passed).length;
  const all = passed === outcome.results.length && outcome.results.length === tests.length;
  return (
    <div>
      <div className={`mb-1 font-semibold ${all ? 'text-pass' : 'text-ink'}`}>
        {all ? `All ${passed} tests passed` : `${passed} of ${tests.length} tests passed`}
      </div>
      {outcome.results.map((result, i) => <TestRow key={i} index={i} test={tests[i]} result={result} />)}
    </div>
  );
}

export default function CodePane({
  modelKey, code, onCode, languageId, onLanguage, only, tests, defaultInput = '', runFiles,
  onTestsDone, onReset, readOnly, strict, paper, allowRun = true, actions,
}) {
  const { languages } = useApp();
  const language = languages.find((l) => l.id === languageId);
  const [tab, setTab] = useState(tests ? 'tests' : 'output');
  const [input, setInput] = useState(defaultInput);
  const [run, setRun] = useState(null);
  const [outcome, setOutcome] = useState(null);
  const [busy, setBusy] = useState(false);
  const [collapsed, setCollapsed] = useState(false);
  const [cursor, setCursor] = useState({ lineNumber: 1, column: 1 });
  const [revision, setRevision] = useState(0);
  const currentRun = useRef(null);

  useEffect(() => {
    setInput(defaultInput);
    setRun(null);
    setOutcome(null);
    setCursor({ lineNumber: 1, column: 1 });
  }, [modelKey, defaultInput]);

  useEffect(() => api.run.onOutput((event) => {
    if (event.runId !== currentRun.current) return;
    setRun((previous) => {
      if (!previous) return previous;
      if (event.kind === 'phase') return { ...previous, phase: event.text };
      return { ...previous, chunks: [...previous.chunks, { kind: event.kind, text: event.text }] };
    });
  }), []);

  const startRun = useCallback(async () => {
    if (busy || !allowRun) return;
    const runId = crypto.randomUUID();
    currentRun.current = runId;
    setBusy(true);
    setCollapsed(false);
    setTab('output');
    setRun({ chunks: [], result: null, phase: 'running' });
    const result = await api.run.program({ runId, languageId, code, stdin: input, files: runFiles });
    setRun((previous) => ({ ...previous, result }));
    setBusy(false);
  }, [busy, allowRun, languageId, code, input, runFiles]);

  const startTests = useCallback(async () => {
    if (busy || !allowRun || !tests) return;
    const runId = crypto.randomUUID();
    currentRun.current = runId;
    setBusy(true);
    setCollapsed(false);
    setTab('tests');
    setOutcome(null);
    const result = await api.run.tests({ runId, languageId, code, tests });
    setOutcome(result);
    setBusy(false);
    onTestsDone?.(result);
  }, [busy, allowRun, tests, languageId, code, onTestsDone]);

  const startRef = useRef({ startRun, startTests });
  startRef.current = { startRun, startTests };

  useEffect(() => {
    const onKey = (event) => {
      if (event.key !== 'Enter' || !(event.ctrlKey || event.metaKey)) return;
      event.preventDefault();
      event.stopPropagation();
      if (event.shiftKey || !tests) startRef.current.startRun();
      else startRef.current.startTests();
    };
    window.addEventListener('keydown', onKey, true);
    return () => window.removeEventListener('keydown', onKey, true);
  }, [tests]);

  const stop = () => api.run.stop(currentRun.current);
  const consoleTabs = [...(tests ? [['tests', 'Tests']] : []), ['output', 'Output'], ['input', 'Input']];

  const editor = (
    <CodeEditor
      modelKey={`${modelKey}:${languageId}:${paper ? 'paper' : 'code'}:${revision}`}
      initialValue={code}
      onChange={onCode}
      language={language?.monaco ?? 'plaintext'}
      readOnly={readOnly}
      strict={strict}
      paper={paper}
      onCursor={setCursor}
    />
  );

  return (
    <div className="flex h-full flex-col">
      <div className="flex h-[36px] flex-none items-center gap-1.5 border-b border-line bg-side px-2">
        <LanguageSelect value={languageId} onChange={onLanguage} only={only} disabled={readOnly} className="max-w-[190px]" />
        {onReset && <ConfirmButton confirmLabel="Discard my code?" onConfirm={() => { onReset(); setRevision((r) => r + 1); }} disabled={readOnly}>Reset</ConfirmButton>}
        <div className="flex-1" />
        {actions}
        {allowRun && (busy
          ? <button type="button" className="btn btn-warn" onClick={stop}>Stop</button>
          : (
            <>
              <button type="button" className="btn" onClick={startRun} title={tests ? 'Ctrl+Shift+Enter' : 'Ctrl+Enter'}>Run</button>
              {tests && <button type="button" className="btn btn-go" onClick={startTests} title="Ctrl+Enter">Run tests</button>}
            </>
          ))}
      </div>
      {language?.available === false && <MissingTool language={language} />}
      <div className="min-h-0 flex-1">
        {allowRun ? (
          <Split
            id="console"
            direction="column"
            anchor="end"
            initial={240}
            min={110}
            minOther={140}
            fixed={collapsed ? CONSOLE_HEADER : undefined}
            first={editor}
            second={(
              <div className="flex h-full flex-col">
                <TabStrip
                  tabs={consoleTabs}
                  active={tab}
                  onChange={(next) => { setTab(next); setCollapsed(false); }}
                  right={(
                    <button type="button" className="px-3 text-mute hover:text-ink" aria-expanded={!collapsed} onClick={() => setCollapsed(!collapsed)}>
                      {collapsed ? 'Show' : 'Hide'}
                    </button>
                  )}
                />
                {!collapsed && (
                  <div className="min-h-0 flex-1 overflow-auto bg-shell p-2.5">
                    {tab === 'output' && <OutputPanel run={run} />}
                    {tab === 'tests' && tests && <TestsPanel tests={tests} outcome={outcome} busy={busy} />}
                    {tab === 'input' && (
                      <div className="flex h-full flex-col gap-1">
                        <label htmlFor="stdin" className="text-mute">Typed into your program when you press Run. Tests bring their own input.</label>
                        <textarea id="stdin" spellCheck={false} className="field min-h-0 flex-1 font-code" value={input} onChange={(e) => setInput(e.target.value)} />
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}
          />
        ) : editor}
      </div>
      <footer className="flex h-[22px] flex-none items-center gap-4 border-t border-line bg-side px-2.5 text-[12px] text-mute">
        <span>Ln {cursor.lineNumber}, Col {cursor.column}</span>
        <span>{language?.name}</span>
        <div className="flex-1" />
        <span>{language?.available === false ? 'Not installed' : language?.version ?? ''}</span>
      </footer>
    </div>
  );
}
