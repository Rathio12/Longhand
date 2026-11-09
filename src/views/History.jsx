import { useState } from 'react';
import { useApp } from '../state.jsx';
import { explainError, explainResult } from '../errorHelp.js';
import { Help } from '../components/CodePane.jsx';
import CodeEditor from '../components/CodeEditor.jsx';
import { FilesBlock, Markdown, TabStrip, clockTime, dateTime } from '../components/ui.jsx';
import { RUNGS } from './Practice.jsx';

const score = (exam) => {
  const passed = exam.questions.reduce((n, q) => n + q.passed, 0);
  const total = exam.questions.reduce((n, q) => n + q.total, 0);
  return total ? Math.round((passed / total) * 100) : 0;
};

const duration = (ms) => {
  const minutes = Math.floor(ms / 60000);
  const seconds = Math.floor(ms / 1000) % 60;
  return `${minutes} min ${seconds} s`;
};

const toLines = (text) => {
  const lines = text.replace(/\r\n?/g, '\n').split('\n').map((line) => line.trimEnd());
  while (lines.length && lines.at(-1) === '') lines.pop();
  return lines;
};

// Says in one sentence where the student's output first went wrong.
function firstDifference(expected, actual) {
  if (actual.length === 0) return 'Your program printed nothing.';
  const shared = Math.min(expected.length, actual.length);
  for (let i = 0; i < shared; i++) {
    if (expected[i] !== actual[i]) return `Line ${i + 1} should be "${expected[i]}", but your program printed "${actual[i]}".`;
  }
  if (actual.length < expected.length) return `Your output stops after line ${actual.length}. Line ${actual.length + 1} should be "${expected[actual.length]}".`;
  return `Your output is too long. It should end after line ${expected.length}, but it goes on with "${actual[expected.length]}".`;
}

function ComparedLines({ lines, other }) {
  return (
    <pre className="code-block max-h-52 overflow-auto">
      {lines.length === 0 && <span className="text-mute">(nothing)</span>}
      {lines.map((line, i) => (
        <div key={i} className={line === other[i] ? '' : 'bg-[#dc262638]'}>{line || ' '}</div>
      ))}
    </pre>
  );
}

function verdict(test) {
  if (test.passed) return 'passed';
  if (test.timedOut) return 'too slow';
  if (test.truncated) return 'too much output';
  if (test.crashed) return 'crashed';
  return 'wrong answer';
}

function TestComparison({ test, index }) {
  const expected = toLines(test.expected);
  const actual = toLines(test.actual);
  const onlyWrong = !test.passed && !test.timedOut && !test.truncated && !test.crashed;
  return (
    <details open={!test.passed} className="border-b border-line">
      <summary className="flex h-[26px] items-center gap-2 hover:bg-white/[0.03]">
        <span className={`inline-block size-2 flex-none ${test.passed ? 'bg-pass' : 'bg-fail'}`} />
        <span className="flex-1">
          {test.sample ? 'Example' : 'Hidden test'} {index + 1}, <span className={test.passed ? 'text-mute' : 'text-fail-ink'}>{verdict(test)}</span>
        </span>
        <span className="text-mute">{test.durationMs} ms</span>
      </summary>
      <div className="pt-1 pb-3">
        {onlyWrong && <p className="m-0 mb-2 select-text">{firstDifference(expected, actual)}</p>}
        <Help text={explainResult(test) || explainError(test.stderr)} />
        <div className="mt-2 flex gap-2">
          <div className="min-w-0 flex-1">
            <div className="mb-0.5 text-mute">{test.files ? 'Files' : 'Input'}</div>
            {test.files ? <FilesBlock files={test.files} /> : <pre className="code-block max-h-52 overflow-auto">{test.input || ' '}</pre>}
          </div>
          <div className="min-w-0 flex-1">
            <div className="mb-0.5 text-mute">Expected</div>
            <ComparedLines lines={expected} other={actual} />
          </div>
          <div className="min-w-0 flex-1">
            <div className="mb-0.5 text-mute">Your output</div>
            <ComparedLines lines={actual} other={expected} />
          </div>
        </div>
        {test.stderr && <pre className="code-block mt-2 max-h-40 overflow-auto text-fail-ink">{test.stderr}</pre>}
      </div>
    </details>
  );
}

function QuestionReview({ question, number, onPractise }) {
  const { languages, problems } = useApp();
  const [showCode, setShowCode] = useState(false);
  const allPassed = question.passed === question.total;
  const lineCount = question.code.split('\n').length;
  const stillExists = problems.some((p) => p.id === question.problemId);

  return (
    <details open={!allPassed} className="mb-2 border border-line">
      <summary className="flex h-[34px] items-center gap-2.5 bg-side px-3 hover:bg-[#1c2026]">
        <span className={`inline-block size-2.5 flex-none ${allPassed ? 'bg-pass' : 'bg-fail'}`} />
        <span className="font-semibold">{number}. {question.title}</span>
        <span className="flex-1 text-mute">{question.difficulty}, {question.language}</span>
        <span className={allPassed ? 'text-pass' : ''}>{question.note ?? `${question.passed} of ${question.total} tests`}</span>
      </summary>
      <div className="p-3">
        {question.compileOutput && (
          <div className="mb-3">
            <p className="m-0 mb-1 text-fail-ink">Your code did not compile, so no tests could run.</p>
            <Help text={explainError(question.compileOutput)} />
            <pre className="code-block mt-2 max-h-52 overflow-auto text-fail-ink">{question.compileOutput}</pre>
          </div>
        )}
        {!question.compileOutput && !question.note && question.tests.map((test, i) => <TestComparison key={i} test={test} index={i} />)}

        {!allPassed && question.hints.length > 0 && (
          <div className="mt-4">
            <h3 className="m-0 mb-1.5 text-[13px] font-semibold">How to approach it</h3>
            {question.hints.map((hint, i) => (
              <div key={i} className="mb-2">
                <div className="text-mute">{RUNGS[i][0]}</div>
                <Markdown>{hint}</Markdown>
              </div>
            ))}
          </div>
        )}

        <div className="mt-3 flex gap-1.5">
          <button type="button" className="btn" aria-expanded={showCode} onClick={() => setShowCode(!showCode)}>{showCode ? 'Hide my code' : 'Show my code'}</button>
          {stillExists && <button type="button" className="btn" onClick={() => onPractise(question.problemId)}>Practise this problem</button>}
        </div>
        {showCode && (
          <div className="mt-2 border border-line" style={{ height: Math.min(380, lineCount * 21 + 30) }}>
            <CodeEditor
              modelKey={question.problemId}
              initialValue={question.code}
              language={languages.find((l) => l.id === question.languageId)?.monaco ?? 'plaintext'}
              readOnly
            />
          </div>
        )}
      </div>
    </details>
  );
}

function ExamDetail({ exam, onPractise }) {
  const failed = exam.questions.some((q) => q.passed < q.total);
  return (
    <div className="max-w-[920px] p-5">
      <div className="mb-1 flex items-baseline gap-3">
        <span className="font-code text-[34px] font-bold tracking-[-0.03em]">{score(exam)}%</span>
        <span className="text-mute">{dateTime(exam.startedAt)}, took {duration(exam.finishedAt - exam.startedAt)} of {exam.minutes} min</span>
      </div>
      <p className="m-0 mb-4 text-mute">
        {failed
          ? 'Hidden tests are shown now, so you can see exactly where each answer differs from the expected result.'
          : 'Every answer passed every test.'}
      </p>
      {exam.questions.map((question, i) => <QuestionReview key={i} question={question} number={i + 1} onPractise={onPractise} />)}
      <h2 className="m-0 mt-6 mb-2 text-[14px] font-semibold">Exam log</h2>
      <ol className="m-0 list-none p-0">
        {exam.events.map((event, i) => (
          <li key={i} className="flex gap-4 border-b border-line py-1">
            <time className="font-code text-[12px] leading-[19px] text-mute">{clockTime(event.at)}</time>
            <span>{event.type}</span>
          </li>
        ))}
      </ol>
    </div>
  );
}

export default function History({ openExamId, onGoToExam, onPractise }) {
  const { exams, runs } = useApp();
  const [tab, setTab] = useState('exams');
  const [selectedId, setSelectedId] = useState(openExamId);
  const exam = exams.find((e) => e.id === selectedId) ?? exams[0];

  return (
    <div className="flex h-full flex-col">
      <TabStrip active={tab} onChange={setTab} tabs={[['exams', 'Exams'], ['runs', 'Test runs']]} />
      <div className="min-h-0 flex-1">
        {tab === 'exams' && exams.length === 0 && (
          <div className="p-6">
            <p className="m-0 mb-3 text-[14px]">You haven't sat an exam yet. Your scores, mistakes and logs will appear here.</p>
            <button type="button" className="btn" onClick={onGoToExam}>Set up an exam</button>
          </div>
        )}
        {tab === 'exams' && exams.length > 0 && (
          <div className="flex h-full">
            <aside className="h-full w-[252px] flex-none overflow-y-auto border-r border-line bg-side py-1">
              {exams.map((e) => (
                <button key={e.id} type="button" className="tree-row" style={{ paddingLeft: 12 }} aria-current={e.id === exam.id} onClick={() => setSelectedId(e.id)}>
                  <span className="flex-1 truncate">{dateTime(e.startedAt)}</span>
                  <span className="font-semibold">{score(e)}%</span>
                </button>
              ))}
            </aside>
            <div className="min-w-0 flex-1 overflow-y-auto select-text"><ExamDetail key={exam.id} exam={exam} onPractise={onPractise} /></div>
          </div>
        )}
        {tab === 'runs' && (
          <div className="h-full overflow-y-auto p-5">
            {runs.length === 0 ? <p className="m-0 text-[14px]">Press Run tests on any problem and the result is logged here.</p> : (
              <table className="row-table max-w-[820px]">
                <thead><tr><th>When</th><th>Problem</th><th>Language</th><th>Result</th></tr></thead>
                <tbody>
                  {runs.map((r) => (
                    <tr key={r.at}>
                      <td>{dateTime(r.at)}</td>
                      <td>{r.title}</td>
                      <td>{r.language}</td>
                      <td className={r.passed === r.total && r.total > 0 ? 'text-pass' : ''}>{r.note ?? `${r.passed} of ${r.total} passed`}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
