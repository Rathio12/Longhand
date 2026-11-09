import { useEffect, useState } from 'react';
import { useApp } from '../state.jsx';

const NAV = [
  ['practice', 'Practice'],
  ['examples', 'Examples'],
  ['exam', 'Exam'],
  ['history', 'History'],
  ['settings', 'Settings'],
];

function WindowButton({ label, onClick, danger, children }) {
  return (
    <button
      type="button"
      aria-label={label}
      title={label}
      onClick={onClick}
      className={`no-drag flex h-full w-[46px] items-center justify-center text-mute hover:text-ink ${danger ? 'hover:bg-fail' : 'hover:bg-white/10'}`}
    >
      {children}
    </button>
  );
}

export function WindowControls() {
  const { flush } = useApp();
  const [maximized, setMaximized] = useState(false);
  useEffect(() => window.longhand.window.onMaximized(setMaximized), []);
  const close = async () => {
    await flush();
    window.longhand.window.close();
  };
  return (
    <div className="flex h-full">
      <WindowButton label="Minimize" onClick={window.longhand.window.minimize}>
        <svg width="10" height="10"><path d="M0 5.5h10" stroke="currentColor" /></svg>
      </WindowButton>
      <WindowButton label={maximized ? 'Restore' : 'Maximize'} onClick={window.longhand.window.toggleMaximize}>
        {maximized
          ? <svg width="10" height="10" fill="none" stroke="currentColor"><path d="M.5 2.5h7v7h-7zM2.5 2.5v-2h7v7h-2" /></svg>
          : <svg width="10" height="10" fill="none" stroke="currentColor"><path d="M.5.5h9v9h-9z" /></svg>}
      </WindowButton>
      <WindowButton label="Close" danger onClick={close}>
        <svg width="10" height="10" stroke="currentColor"><path d="M.5.5l9 9M9.5.5l-9 9" /></svg>
      </WindowButton>
    </div>
  );
}

export default function TitleBar({ view, onView, showNav }) {
  return (
    <header className="drag flex h-[34px] flex-none items-stretch border-b border-line bg-side">
      <div className="flex items-center pl-3 pr-5 font-semibold tracking-[-0.005em]">Longhand</div>
      {showNav && (
        <nav className="no-drag flex" role="tablist">
          {NAV.map(([id, label]) => (
            <button key={id} type="button" role="tab" className="tab" aria-selected={view === id} onClick={() => onView(id)}>
              {label}
            </button>
          ))}
        </nav>
      )}
      <div className="flex-1" />
      <WindowControls />
    </header>
  );
}
