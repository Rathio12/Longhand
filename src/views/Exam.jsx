import { useCallback, useEffect, useRef, useState } from 'react';
import { starterFor, useApp } from '../state.jsx';
import { DIFFICULTIES } from '../data/problems.js';
import { levelLabel } from '../levels.js';
import CodePane from '../components/CodePane.jsx';
import { ProblemText } from './Practice.jsx';
import { ConfirmButton, LanguageSelect, Split, clockTime } from '../components/ui.jsx';

const api = window.longhand;
const LOW_TIME_MS = 5 * 60 * 1000;

// Tells a brand new exam apart from one that came back after the app was closed.
let examStartedThisSession = null;

function shuffle(items) {
  const copy = [...items];
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
}

function Field({ label, children }) {
  return (
    <label className="setting-row">
      <span>{label}</span>
      {children}
    </label>
  );
}

function Check({ checked, onChange, disabled, title, text }) {
  return (
    <label className={`flex gap-2 py-1.5 ${disabled ? 'opacity-50' : ''}`}>
      <input type="checkbox" className="mt-[3px] accent-accent" checked={checked} disabled={disabled} onChange={(e) => onChange(e.target.checked)} />
      <span>
        <span className="block">{title}</span>
        <span className="block text-mute">{text}</span>
      </span>
    </label>
  );
}

export function ExamSetup() {
  const { problems, settings, languages, update, flush } = useApp();
  const [minutes, setMinutes] = useState(45);
  const [count, setCount] = useState(3);
  const [track, setTrack] = useState('All');
  const [difficulty, setDifficulty] = useState(levelLabel(settings.level) ?? 'All');
  const [languageId, setLanguageId] = useState(settings.language);
  const [blockClipboard, setBlockClipboard] = useState(true);
  const [paper, setPaper] = useState(false);
  const [allowRun, setAllowRun] = useState(true);

  const tracks = [...new Set(problems.map((p) => p.track))];
  // A shell question can't be marked on a computer with no shell, so it stays out of the draw.
  const canRun = (p) => !p.language || languages.some((l) => l.id === p.language && l.available !== false);
  const pool = problems.filter((p) => canRun(p) && (track === 'All' || p.track === track) && (difficulty === 'All' || p.difficulty === difficulty));
  const validMinutes = Number.isFinite(minutes) && minutes >= 1 && minutes <= 300;

  const start = async () => {
    const now = Date.now();
    const id = `exam-${now}`;
    examStartedThisSession = id;
    update('activeExam', {
      id,
      startedAt: now,
      deadline: now + minutes * 60000,
      minutes,
      options: { blockClipboard, paper, allowRun: allowRun && !paper },
      questions: shuffle(pool).slice(0, count).map((problem) => {
        const language = problem.language ?? languageId;
        const code = problem.starter ?? starterFor(languages.find((l) => l.id === language), settings.level);
        return { problem, language, code, submittedAt: null };
      }),
      events: [{ at: now, type: 'Exam started' }],
    });
    await flush();
  };

  return (
    <div className="h-full overflow-y-auto">
      <div className="mx-auto w-[560px] py-8">
        <h1 className="m-0 mb-1 text-[22px] font-semibold tracking-[-0.015em]">Sit a practice exam</h1>
        <p className="m-0 mb-5 leading-relaxed text-mute">
          The app fills the screen and the clock cannot be paused. Closing the app won't stop it either.
          Hints and notes are not available, and leaving the window is written to your log.
          When you finish, every answer is compared with the expected result so you can see what went wrong.
        </p>

        <div className="border-t border-line py-3">
          <Field label="Time in minutes">
            <input type="number" min="1" max="300" className="field w-[90px]" value={Number.isNaN(minutes) ? '' : minutes} onChange={(e) => setMinutes(e.target.valueAsNumber)} />
          </Field>
          <Field label="Number of questions">
            <select className="field w-[90px]" value={count} onChange={(e) => setCount(Number(e.target.value))}>
              {[1, 2, 3, 4, 5, 6].map((n) => <option key={n}>{n}</option>)}
            </select>
          </Field>
          <Field label="Topic">
            <select className="field w-[200px]" value={track} onChange={(e) => setTrack(e.target.value)}>
              <option value="All">Everything</option>
              {tracks.map((t) => <option key={t}>{t}</option>)}
            </select>
          </Field>
          <Field label="Difficulty">
            <select className="field w-[200px]" value={difficulty} onChange={(e) => setDifficulty(e.target.value)}>
              <option value="All">Mixed</option>
              {DIFFICULTIES.map((d) => <option key={d}>{d}</option>)}
            </select>
          </Field>
          <Field label="Language">
            <LanguageSelect value={languageId} onChange={setLanguageId} className="w-[200px]" />
          </Field>
        </div>

        <div className="border-t border-line py-2">
          <Check checked={blockClipboard} onChange={setBlockClipboard} title="Block copy and paste" text="Every line has to be typed by hand." />
          <Check checked={paper} onChange={setPaper} title="Paper exam" text="No colours, no line numbers and no running code, like writing on paper." />
          <Check checked={allowRun && !paper} disabled={paper} onChange={setAllowRun} title="Let me run the example tests" text="Hidden tests are only used for marking when the exam ends." />
        </div>

        <div className="flex items-center gap-3 border-t border-line pt-4">
          <button type="button" className="btn btn-go h-[30px] px-4" disabled={pool.length === 0 || !validMinutes} onClick={start}>Start exam</button>
          <span className="text-mute">
            {pool.length === 0 && 'No problems match this topic and difficulty. Change one of them.'}
            {pool.length > 0 && pool.length < count && `Only ${pool.length} ${pool.length === 1 ? 'problem matches' : 'problems match'}, so the exam will be shorter.`}
            {!validMinutes && pool.length > 0 && 'Enter a time from 1 to 300 minutes.'}
          </span>
        </div>
      </div>
    </div>
  );
}

const formatLeft = (ms) => {
  const total = Math.max(0, Math.ceil(ms / 1000));
  const hours = Math.floor(total / 3600);
  const minutes = Math.floor((total % 3600) / 60);
  const seconds = total % 60;
  const pad = (n) => String(n).padStart(2, '0');
  return hours ? `${hours}:${pad(minutes)}:${pad(seconds)}` : `${pad(minutes)}:${pad(seconds)}`;
};

export function ExamRoom({ onFinished }) {
  const { activeExam: exam, update, flush, languages, settings } = useApp();
  const [index, setIndex] = useState(0);
  const [left, setLeft] = useState(exam.deadline - Date.now());
  const [marking, setMarking] = useState(false);
  const finishing = useRef(false);
  const examRef = useRef(exam);
  examRef.current = exam;

  const log = useCallback((type) => {
    update('activeExam', (current) => (current
      ? { ...current, events: [...current.events, { at: Date.now(), type }].slice(-1000) }
      : current));
  }, [update]);

  const finish = useCallback(async (reason) => {
    if (finishing.current) return;
    finishing.current = true;
    setMarking(true);
    log(reason);
    await flush();
    const current = { ...examRef.current };
    const graded = [];
    for (const question of current.questions) {
      const outcome = await api.run.tests({
        runId: crypto.randomUUID(),
        languageId: question.language,
        code: question.code,
        tests: question.problem.tests,
      });
      const passed = outcome.results?.filter((r) => r.passed).length ?? 0;
      graded.push({
        problemId: question.problem.id,
        title: question.problem.title,
        difficulty: question.problem.difficulty,
        hints: question.problem.hints,
        language: languages.find((l) => l.id === question.language)?.name ?? question.language,
        languageId: question.language,
        code: question.code,
        submittedAt: question.submittedAt,
        passed,
        total: question.problem.tests.length,
        note: outcome.phase === 'compile' ? 'Did not compile' : outcome.phase === 'missing' ? `${outcome.tool} is not installed` : null,
        compileOutput: outcome.compileOutput ?? null,
        // The answers are compared test by test on the results page.
        tests: question.problem.tests.map((test, i) => {
          const result = outcome.results?.[i];
          return {
            input: test.input.slice(0, 4000),
            expected: test.output.slice(0, 4000),
            files: test.files,
            sample: test.sample,
            actual: result?.actual ?? '',
            stderr: result?.stderr ?? '',
            passed: Boolean(result?.passed),
            timedOut: Boolean(result?.timedOut),
            truncated: Boolean(result?.truncated),
            crashed: Boolean(result?.crashed),
            durationMs: result?.durationMs ?? 0,
          };
        }),
      });
    }
    const finishedAt = Date.now();
    update('exams', (all) => [{
      id: current.id,
      startedAt: current.startedAt,
      finishedAt,
      minutes: current.minutes,
      options: current.options,
      questions: graded,
      events: [...examRef.current.events],
    }, ...all].slice(0, 100));
    update('activeExam', null);
    await flush();
    await api.exam.unlock();
    onFinished(current.id);
  }, [flush, languages, log, onFinished, update]);

  useEffect(() => {
    api.exam.lock();
    if (examStartedThisSession !== examRef.current.id) {
      examStartedThisSession = examRef.current.id;
      log('App reopened during the exam. The clock kept running.');
    }
  }, [log]);

  useEffect(() => {
    const tick = () => {
      const remaining = examRef.current.deadline - Date.now();
      setLeft(remaining);
      if (remaining <= 0) finish('Time ran out');
    };
    tick();
    const timer = setInterval(tick, 250);
    return () => clearInterval(timer);
  }, [finish]);

  useEffect(() => {
    const offFocus = api.window.onFocus((focused) => {
      if (!finishing.current) log(focused ? 'Came back to the exam window' : 'Left the exam window');
    });
    const offClose = api.exam.onCloseAttempt(() => log('Tried to close the app'));
    return () => { offFocus(); offClose(); };
  }, [log]);

  const blockClipboard = exam.options.blockClipboard;
  useEffect(() => {
    if (!blockClipboard) return undefined;
    let lastLogged = 0;
    const block = (event) => {
      event.preventDefault();
      event.stopImmediatePropagation();
      if (Date.now() - lastLogged > 5000) {
        lastLogged = Date.now();
        log('Copy or paste was blocked');
      }
    };
    const onKey = (event) => {
      const key = event.key.toLowerCase();
      if (((event.ctrlKey || event.metaKey) && ['c', 'x', 'v', 'insert'].includes(key)) || (event.shiftKey && key === 'insert')) block(event);
    };
    const events = ['copy', 'cut', 'paste', 'drop'];
    events.forEach((name) => window.addEventListener(name, block, true));
    window.addEventListener('keydown', onKey, true);
    return () => {
      events.forEach((name) => window.removeEventListener(name, block, true));
      window.removeEventListener('keydown', onKey, true);
    };
  }, [blockClipboard, log]);

  const question = exam.questions[index];
  const setQuestion = (changes) => {
    update('activeExam', (current) => ({
      ...current,
      questions: current.questions.map((q, i) => (i === index ? { ...q, ...changes } : q)),
    }));
  };

  const leftWindow = exam.events.filter((e) => e.type === 'Left the exam window').length;
  const low = left < LOW_TIME_MS;
  const samples = question.problem.tests.filter((t) => t.sample);
  const bandText = low ? 'text-white' : 'text-[#15120c]';

  return (
    <div className="flex h-full flex-col">
      <header className={`drag flex h-[46px] flex-none items-stretch ${low ? 'bg-fail' : 'bg-accent'} ${bandText}`}>
        <div className="flex items-center pl-3.5 pr-4">
          <span role="timer" aria-label="Time left" className="font-code text-[24px] font-bold tabular-nums tracking-[-0.02em]">{formatLeft(left)}</span>
        </div>
        <nav className="no-drag flex items-center gap-1">
          {exam.questions.map((q, i) => (
            <button
              key={q.problem.id}
              type="button"
              aria-current={i === index}
              onClick={() => setIndex(i)}
              className={`h-[28px] min-w-[32px] border border-black/40 px-2 font-semibold ${i === index ? 'bg-[#121417] text-ink' : 'hover:bg-black/15'}`}
            >
              {i + 1}{q.submittedAt ? ' ✓' : ''}
            </button>
          ))}
        </nav>
        <div className="flex-1" />
        <div className="no-drag flex items-center gap-3 pr-3">
          {leftWindow > 0 && <span className="font-medium">Left the window {leftWindow} {leftWindow === 1 ? 'time' : 'times'}</span>}
          <ConfirmButton confirmLabel="End the exam now?" onConfirm={() => finish('Finished by the student')} disabled={marking} className="text-ink">
            Finish exam
          </ConfirmButton>
        </div>
      </header>
      <main className="min-h-0 flex-1">
        <Split
          id="exam"
          initial={460}
          min={300}
          minOther={420}
          first={<div className="h-full overflow-y-auto bg-shell"><ProblemText problem={question.problem} /></div>}
          second={(
            <CodePane
              modelKey={`${exam.id}:${index}`}
              code={question.code}
              onCode={(code) => setQuestion({ code })}
              languageId={question.language}
              only={question.problem.language ? [question.problem.language] : undefined}
              onLanguage={(id) => setQuestion({ language: id, code: starterFor(languages.find((l) => l.id === id), settings.level) })}
              tests={samples}
              defaultInput={samples[0]?.input ?? ''}
              runFiles={samples[0]?.files}
              allowRun={exam.options.allowRun}
              strict
              paper={exam.options.paper}
              readOnly={Boolean(question.submittedAt) || marking}
              actions={question.submittedAt
                ? <span className="px-1 text-mute">Handed in at {clockTime(question.submittedAt)}</span>
                : (
                  <ConfirmButton
                    confirmLabel="Hand in? It can't be changed."
                    onConfirm={() => {
                      setQuestion({ submittedAt: Date.now() });
                      log(`Handed in question ${index + 1}`);
                    }}
                  >
                    Hand in
                  </ConfirmButton>
                )}
            />
          )}
        />
      </main>
      {marking && (
        <div className="absolute inset-0 flex items-center justify-center bg-shell">
          <p className="text-[15px]">Marking your answers</p>
        </div>
      )}
    </div>
  );
}
