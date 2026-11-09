import { useState } from 'react';
import { useApp } from '../state.jsx';
import { LEVELS } from '../levels.js';
import { LanguageSelect } from '../components/ui.jsx';

export default function Welcome() {
  const { settings, updateSettings } = useApp();
  const [level, setLevel] = useState('beginner');
  const [language, setLanguage] = useState(settings.language);

  return (
    <div className="flex h-full justify-center overflow-auto">
      <div className="my-auto w-[460px] py-8">
        <h1 className="m-0 mb-1.5 text-[24px] font-semibold tracking-[-0.015em]">Practise without the safety net</h1>
        <p className="m-0 mb-6 text-[14px] leading-relaxed text-mute">
          There is no autocomplete and no AI here, so what you learn is what you can do in the exam room.
        </p>
        <div className="mb-5 flex flex-col gap-1.5">
          {LEVELS.map(({ id, label, text }) => (
            <button key={id} type="button" className="choice" aria-pressed={level === id} onClick={() => setLevel(id)}>
              <div className="text-[14px] font-semibold">{label}</div>
              <div className="mt-0.5 text-mute">{text}</div>
            </button>
          ))}
        </div>
        <label className="mb-6 flex items-center justify-between">
          <span>Language to start with</span>
          <LanguageSelect value={language} onChange={setLanguage} className="w-[200px]" />
        </label>
        <button type="button" className="btn btn-go h-[30px] px-4" onClick={() => updateSettings({ level, language })}>
          Start practising
        </button>
      </div>
    </div>
  );
}
