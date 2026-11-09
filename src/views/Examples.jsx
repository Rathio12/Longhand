import { useState } from 'react';
import { starterFor, useApp } from '../state.jsx';
import { EXAMPLES } from '../data/examples.js';
import CodePane from '../components/CodePane.jsx';
import { Markdown, Split } from '../components/ui.jsx';

const SCRATCH = {
  id: 'scratch',
  title: 'Blank file',
  level: 'Try anything',
  body: 'A blank file in any language. Nothing here is marked or saved between sessions.\n\nUse the Input tab below the editor to give your program something to read.',
  stdin: '',
};

export default function Examples({ initialLanguage }) {
  const { settings, languages } = useApp();
  const list = [SCRATCH, ...EXAMPLES.filter((e) => settings.showGameTrack || e.track !== 'Game logic')];
  const [selectedId, setSelectedId] = useState(EXAMPLES[0].id);
  const [edits, setEdits] = useState({});
  const [picked, setPicked] = useState(initialLanguage ? { 'language-basics': initialLanguage } : {});

  const example = list.find((e) => e.id === selectedId) ?? list[0];
  const variantIds = example.variants ? Object.keys(example.variants) : null;
  const fallback = variantIds ? (variantIds.includes(settings.language) ? settings.language : variantIds[0]) : settings.language;
  const languageId = picked[example.id] ?? fallback;
  const key = `${example.id}:${languageId}`;
  const language = languages.find((l) => l.id === languageId);
  const original = example.variants?.[languageId] ?? starterFor(language, settings.level);
  const code = edits[key] ?? original;
  const levels = [...new Set(list.map((e) => e.level))];

  return (
    <div className="flex h-full">
      <aside className="h-full w-[252px] flex-none overflow-y-auto border-r border-line bg-side py-1">
        {levels.map((level) => (
          <section key={level} className="mb-1">
            <h2 className="m-0 flex h-[25px] items-center px-2.5 text-[13px] font-semibold">{level}</h2>
            {list.filter((e) => e.level === level).map((e) => (
              <button key={e.id} type="button" className="tree-row" style={{ paddingLeft: 18 }} aria-current={e.id === example.id} onClick={() => setSelectedId(e.id)}>
                <span className="truncate">{e.title}</span>
              </button>
            ))}
          </section>
        ))}
      </aside>
      <div className="min-w-0 flex-1">
        <Split
          id="examples"
          initial={420}
          min={300}
          minOther={420}
          first={(
            <div className="h-full overflow-y-auto p-4">
              <h1 className="m-0 mb-3 text-[19px] font-semibold tracking-[-0.01em]">{example.title}</h1>
              <Markdown>{example.body}</Markdown>
            </div>
          )}
          second={(
            <CodePane
              modelKey={example.id}
              code={code}
              onCode={(next) => setEdits((all) => ({ ...all, [key]: next }))}
              languageId={languageId}
              onLanguage={(id) => setPicked((all) => ({ ...all, [example.id]: id }))}
              only={variantIds ?? undefined}
              defaultInput={example.stdin}
              onReset={() => setEdits((all) => {
                const next = { ...all };
                delete next[key];
                return next;
              })}
            />
          )}
        />
      </div>
    </div>
  );
}
