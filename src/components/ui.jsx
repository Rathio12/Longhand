import { useEffect, useRef, useState } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { useApp } from '../state.jsx';

// Statements can come from imported packs, so images and links are rendered inert.
const MD_COMPONENTS = { a: ({ children }) => <span>{children}</span> };
export function Markdown({ children }) {
  return (
    <div className="prose">
      <ReactMarkdown remarkPlugins={[remarkGfm]} disallowedElements={['img']} components={MD_COMPONENTS}>
        {children}
      </ReactMarkdown>
    </div>
  );
}

// Asks for a second click instead of popping up a dialog.
export function ConfirmButton({ children, confirmLabel, onConfirm, className = '', disabled }) {
  const [armed, setArmed] = useState(false);
  useEffect(() => {
    if (!armed) return undefined;
    const timer = setTimeout(() => setArmed(false), 3500);
    return () => clearTimeout(timer);
  }, [armed]);
  return (
    <button
      type="button"
      disabled={disabled}
      className={`btn ${armed ? 'btn-warn' : ''} ${className}`}
      onClick={() => {
        if (armed) {
          setArmed(false);
          onConfirm();
        } else {
          setArmed(true);
        }
      }}
    >
      {armed ? confirmLabel : children}
    </button>
  );
}

export function Split({ id, direction = 'row', anchor = 'start', initial, min = 220, minOther = 300, fixed, first, second }) {
  const { settings, updateSettings } = useApp();
  const container = useRef(null);
  const [size, setSize] = useState(settings.layout[id] ?? initial);
  const dragging = useRef(false);
  const current = fixed ?? size;

  const onMove = (event) => {
    if (!dragging.current) return;
    const box = container.current.getBoundingClientRect();
    const whole = direction === 'row' ? box.width : box.height;
    const from = direction === 'row' ? event.clientX - box.left : event.clientY - box.top;
    const wanted = anchor === 'start' ? from : whole - from;
    setSize(Math.round(Math.min(whole - minOther, Math.max(min, wanted))));
  };
  const onUp = () => {
    if (!dragging.current) return;
    dragging.current = false;
    updateSettings({ layout: { ...settings.layout, [id]: size } });
  };

  const axis = direction === 'row' ? 'width' : 'height';
  const limit = direction === 'row' ? 'maxWidth' : 'maxHeight';
  // The cap keeps the other panel usable when the window shrinks after a drag.
  const sized = { [axis]: current, [limit]: `calc(100% - ${minOther}px)`, flex: 'none' };
  const handle = (
    <div
      className="splitter"
      data-dir={direction}
      style={fixed !== undefined ? { pointerEvents: 'none' } : undefined}
      onPointerDown={(event) => { event.currentTarget.setPointerCapture(event.pointerId); dragging.current = true; }}
      onPointerMove={onMove}
      onPointerUp={onUp}
    />
  );
  return (
    <div ref={container} className="flex h-full min-h-0 w-full min-w-0" style={{ flexDirection: direction }}>
      <div className="min-h-0 min-w-0" style={anchor === 'start' ? sized : { flex: 1 }}>{first}</div>
      {handle}
      <div className="min-h-0 min-w-0" style={anchor === 'end' ? sized : { flex: 1 }}>{second}</div>
    </div>
  );
}

export function TabStrip({ tabs, active, onChange, right }) {
  return (
    <div className="flex h-[30px] flex-none items-stretch border-b border-line bg-side" role="tablist">
      {tabs.map(([id, label]) => (
        <button key={id} type="button" role="tab" className="tab" aria-selected={active === id} onClick={() => onChange(id)}>
          {label}
        </button>
      ))}
      <div className="flex-1" />
      {right}
    </div>
  );
}

export function LanguageSelect({ value, onChange, only, disabled, className = '' }) {
  const { languages } = useApp();
  const shown = only ? languages.filter((l) => only.includes(l.id)) : languages;
  const groups = [...new Set(shown.map((l) => l.group))];
  return (
    <select aria-label="Language" disabled={disabled} className={`field ${className}`} value={value} onChange={(e) => onChange(e.target.value)}>
      {groups.map((group) => (
        <optgroup key={group} label={group}>
          {shown.filter((l) => l.group === group).map((l) => (
            <option key={l.id} value={l.id}>{l.name}{l.available === false ? ' (not installed)' : ''}</option>
          ))}
        </optgroup>
      ))}
    </select>
  );
}

export function FilesBlock({ files }) {
  const text = Object.entries(files)
    .map(([name, content]) => (content ? `${name}\n  ${content.trimEnd().replaceAll('\n', '\n  ')}` : name))
    .join('\n');
  return <pre className="code-block">{text || '(empty folder)'}</pre>;
}

export const clockTime = (at) => new Date(at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
export const dateTime = (at) => new Date(at).toLocaleString([], { dateStyle: 'medium', timeStyle: 'short' });
