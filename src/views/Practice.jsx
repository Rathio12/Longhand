import { useCallback, useState } from 'react';
import { starterFor, useApp } from '../state.jsx';
import { DIFFICULTIES } from '../data/problems.js';
import { trackOrder } from '../packs.js';
import { LANGUAGE_BASICS } from '../data/languageBasics.js';
import CodePane from '../components/CodePane.jsx';
import CodeEditor from '../components/CodeEditor.jsx';
import { FilesBlock, Markdown, Split, TabStrip, dateTime } from '../components/ui.jsx';

function StatusMark({ status }) {
  if (status === 'solved') {
    return <svg className="flex-none text-pass" width="10" height="10" fill="none" stroke="currentColor" strokeWidth="1.8" aria-label="Solved"><path d="M1 5.5l3 3 5-7" /></svg>;
  }
  if (status === 'tried') return <span className="mx-[2px] inline-block size-1.5 flex-none rounded-full bg-accent" aria-label="Attempted" />;
  return <span className="inline-block size-2.5 flex-none" />;
}

function ProblemTree({ selectedId, onSelect }) {
  const { problems, progress } = useApp();
  const [search, setSearch] = useState('');
  const [difficulty, setDifficulty] = useState('All');
  const [closed, setClosed] = useState({});

  const shown = problems.filter((p) => (difficulty === 'All' || p.difficulty === difficulty)
    && p.title.toLowerCase().includes(search.trim().toLowerCase()));
  const tracks = [...new Set(shown.map((p) => p.track))].sort((a, b) => trackOrder(a) - trackOrder(b));

  return (
    <aside className="flex h-full flex-col bg-side">
      <div className="flex flex-none gap-1 border-b border-line p-1.5">
        <input aria-label="Search problems" className="field w-0 min-w-0 flex-1" placeholder="Search" value={search} onChange={(e) => setSearch(e.target.value)} />
        <select aria-label="Filter by difficulty" className="field w-[112px]" value={difficulty} onChange={(e) => setDifficulty(e.target.value)}>
          <option>All</option>
          {DIFFICULTIES.map((d) => <option key={d}>{d}</option>)}
        </select>
      </div>
      <div className="min-h-0 flex-1 overflow-y-auto py-1">
        {tracks.length === 0 && <p className="px-3 text-mute">No problems match. Clear the search or change the difficulty.</p>}
        {tracks.map((track) => {
          const items = shown.filter((p) => p.track === track);
          const solved = items.filter((p) => progress[p.id]?.status === 'solved').length;
          const isClosed = closed[track];
          return (
            <section key={track}>
              <button type="button" aria-expanded={!isClosed} className="flex h-[25px] w-full items-center gap-1.5 px-2 text-left font-semibold hover:bg-white/[0.03]" onClick={() => setClosed({ ...closed, [track]: !isClosed })}>
                <svg width="8" height="8" className="flex-none text-mute" style={{ transform: isClosed ? 'none' : 'rotate(90deg)' }} fill="currentColor"><path d="M2 0l5 4-5 4z" /></svg>
                <span className="min-w-0 flex-1 truncate">{track}</span>
                <span className="font-normal text-mute">{solved}/{items.length}</span>
              </button>
              {!isClosed && items.map((p) => (
                <button key={p.id} type="button" className="tree-row" aria-current={p.id === selectedId} onClick={() => onSelect(p.id)}>
                  <StatusMark status={progress[p.id]?.status} />
                  <span className="min-w-0 flex-1 truncate">{p.title}</span>
                  <span className="text-[11.5px] text-mute">{p.difficulty}</span>
                </button>
              ))}
            </section>
          );
        })}
      </div>
    </aside>
  );
}

export function ProblemText({ problem }) {
  const samples = problem.tests.filter((t) => t.sample);
  return (
    <div className="p-4">
      <h1 className="m-0 text-[19px] font-semibold tracking-[-0.01em]">{problem.title}</h1>
      <p className="m-0 mt-0.5 mb-3.5 text-mute">{problem.difficulty}, {problem.track}</p>
      <Markdown>{problem.statement}</Markdown>
      {samples.map((sample, i) => (
        <div key={i} className="mt-3 flex max-w-[66ch] gap-2">
          <div className="min-w-0 flex-1">
            <div className="mb-0.5 text-mute">{sample.files ? `Example ${i + 1} files` : `Example ${i + 1} input`}</div>
            {sample.files ? <FilesBlock files={sample.files} /> : <pre className="code-block">{sample.input}</pre>}
          </div>
          <div className="min-w-0 flex-1">
            <div className="mb-0.5 text-mute">Expected output</div>
            <pre className="code-block">{sample.output}</pre>
          </div>
        </div>
      ))}
      {problem.constraints && (
        <div className="mt-4">
          <h2 className="m-0 mb-1 text-[13px] font-semibold">Constraints</h2>
          <Markdown>{problem.constraints}</Markdown>
        </div>
      )}
    </div>
  );
}

export const RUNGS = [
  ['The idea', 'A nudge toward the right way of thinking.'],
  ['Useful tools', 'Standard library functions that fit this problem.'],
  ['The steps', 'The method in plain language. You still write the code.'],
];

function HintLadder({ problem, revealed, onReveal }) {
  if (problem.hints.length === 0) return <p className="m-0 p-4 text-mute">This problem has no hints.</p>;
  return (
    <div className="p-4">
      <p className="m-0 mb-4 max-w-[60ch] text-mute">Try each hint only when you are stuck. The full solution is never shown.</p>
      {problem.hints.map((hint, i) => {
        const open = i < revealed;
        return (
          <div key={i} className="rung" data-open={open}>
            <span className="rung-mark" />
            <div className="font-semibold">{RUNGS[i][0]}</div>
            {open ? (
              <div className="mt-1"><Markdown>{hint}</Markdown></div>
            ) : (
              <>
                <p className="m-0 mt-0.5 mb-1.5 text-mute">{RUNGS[i][1]}</p>
                {i === revealed && <button type="button" className="btn" onClick={() => onReveal(i + 1)}>Show this hint</button>}
              </>
            )}
          </div>
        );
      })}
    </div>
  );
}

function RunsList({ problemId }) {
  const { runs } = useApp();
  const mine = runs.filter((r) => r.problemId === problemId);
  if (mine.length === 0) return <p className="m-0 p-4 text-mute">Your test runs for this problem will be listed here.</p>;
  return (
    <div className="p-4">
      <table className="row-table">
        <thead><tr><th>When</th><th>Language</th><th>Result</th></tr></thead>
        <tbody>
          {mine.map((r) => (
            <tr key={r.at}>
              <td>{dateTime(r.at)}</td>
              <td>{r.language}</td>
              <td className={r.passed === r.total && r.total > 0 ? 'text-pass' : ''}>{r.note ?? `${r.passed} of ${r.total} passed`}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function LanguageExample({ language, onOpen }) {
  const code = LANGUAGE_BASICS[language?.id];
  if (!code) {
    return <p className="m-0 p-4 text-mute">There is no example for {language?.name ?? 'this language'} yet. The Examples screen has several in other languages.</p>;
  }
  return (
    <div className="flex h-full flex-col">
      <div className="flex flex-none items-center gap-3 border-b border-line px-3 py-2">
        <p className="m-0 flex-1 text-mute">How {language.name} reads input and uses loops, lists and maps. It doesn't solve this problem.</p>
        <button type="button" className="btn" onClick={() => onOpen(language.id)}>Open and run it</button>
      </div>
      <div className="min-h-0 flex-1">
        <CodeEditor modelKey={`example:${language.id}`} initialValue={code} language={language.monaco} readOnly />
      </div>
    </div>
  );
}

export default function Practice({ onOpenExample }) {
  const { problems, progress, settings, languages, update, updateSettings } = useApp();
  const [tab, setTab] = useState('problem');
  const problem = problems.find((p) => p.id === settings.lastProblem) ?? problems[0];
  const record = progress[problem.id] ?? {};
  // Some topics only make sense in one language, such as the shell for Linux commands.
  const locked = languages.some((l) => l.id === problem.language) ? problem.language : null;
  const languageId = locked ?? (languages.some((l) => l.id === record.language) ? record.language : settings.language);
  const language = languages.find((l) => l.id === languageId);
  const code = record.code?.[languageId] ?? problem.starter ?? starterFor(language, settings.level);

  const patch = useCallback((id, changes) => {
    update('progress', (all) => ({ ...all, [id]: { ...all[id], ...changes } }));
  }, [update]);

  const setCode = (next) => {
    update('progress', (all) => {
      const current = all[problem.id] ?? {};
      return { ...all, [problem.id]: { ...current, code: { ...current.code, [languageId]: next } } };
    });
  };

  const onTestsDone = (result) => {
    const passed = result.results?.filter((r) => r.passed).length ?? 0;
    const total = problem.tests.length;
    const note = result.phase === 'compile' ? 'Did not compile' : result.phase === 'missing' ? 'Compiler missing' : undefined;
    if (result.phase === 'missing') return;
    update('runs', (runs) => [{ at: Date.now(), problemId: problem.id, title: problem.title, language: language?.name, passed, total, note }, ...runs].slice(0, 300));
    update('progress', (all) => {
      const current = all[problem.id] ?? {};
      const solved = result.phase === 'tests' && passed === total;
      return { ...all, [problem.id]: { ...current, status: solved || current.status === 'solved' ? 'solved' : 'tried' } };
    });
  };

  const hintsUsed = record.hints ?? 0;
  const showIntro = settings.level === 'beginner' && problem.track === 'First steps';

  return (
    <div className="flex h-full">
      <div className="h-full w-[284px] flex-none border-r border-line">
        <ProblemTree selectedId={problem.id} onSelect={(id) => { updateSettings({ lastProblem: id }); setTab('problem'); }} />
      </div>
      <div className="min-w-0 flex-1">
        <Split
          id="desk"
          initial={440}
          min={300}
          minOther={420}
          first={(
            <div className="flex h-full flex-col">
              <TabStrip
                active={tab}
                onChange={setTab}
                tabs={[['problem', 'Problem'], ['hints', hintsUsed ? `Hints (${hintsUsed}/${problem.hints.length})` : 'Hints'], ['example', 'Example code'], ['notes', 'Notes'], ['runs', 'Runs']]}
              />
              <div className="min-h-0 flex-1 overflow-y-auto">
                {tab === 'problem' && (
                  <>
                    <ProblemText problem={problem} />
                    {showIntro && (
                      <p className="mx-4 mt-0 mb-4 max-w-[66ch] border-l-2 border-accent pl-2.5">
                        The code on the right already reads the input. Change it to print the answer, then press Run tests to check your work.
                      </p>
                    )}
                  </>
                )}
                {tab === 'hints' && <HintLadder problem={problem} revealed={hintsUsed} onReveal={(n) => patch(problem.id, { hints: n })} />}
                {tab === 'notes' && (
                  <div className="flex h-full flex-col p-3">
                    <textarea
                      aria-label="Notes for this problem"
                      spellCheck={false}
                      className="field min-h-0 flex-1 resize-none text-[13.5px] leading-relaxed"
                      placeholder="What tripped you up? Write it here to review before the exam."
                      value={record.notes ?? ''}
                      onChange={(e) => patch(problem.id, { notes: e.target.value })}
                    />
                  </div>
                )}
                {tab === 'example' && <LanguageExample language={language} onOpen={onOpenExample} />}
                {tab === 'runs' && <RunsList problemId={problem.id} />}
              </div>
            </div>
          )}
          second={(
            <CodePane
              modelKey={problem.id}
              code={code}
              onCode={setCode}
              languageId={languageId}
              only={locked ? [locked] : undefined}
              onLanguage={(id) => { patch(problem.id, { language: id }); updateSettings({ language: id }); }}
              tests={problem.tests}
              runFiles={problem.tests.find((t) => t.sample)?.files}
              defaultInput={problem.tests.find((t) => t.sample)?.input ?? ''}
              onTestsDone={onTestsDone}
              onReset={() => {
                update('progress', (all) => {
                  const current = all[problem.id] ?? {};
                  const nextCode = { ...current.code };
                  delete nextCode[languageId];
                  return { ...all, [problem.id]: { ...current, code: nextCode } };
                });
              }}
            />
          )}
        />
      </div>
    </div>
  );
}
