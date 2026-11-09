import { useEffect, useRef, useState } from 'react';
import Editor from '@monaco-editor/react';
import { EDITOR_OPTIONS, monaco } from '../monaco.js';
import { useApp } from '../state.jsx';
import { attachEmacs } from '../emacs.js';

export default function CodeEditor({ modelKey, initialValue, onChange, language, readOnly, strict, paper, onCursor }) {
  const { settings } = useApp();
  const [editor, setEditor] = useState(null);
  const vimStatus = useRef(null);
  const { keymap } = settings;

  useEffect(() => {
    if (!editor || keymap === 'standard') return undefined;
    let binding;
    let cancelled = false;
    (async () => {
      if (keymap === 'vim') {
        const { initVimMode } = await import('monaco-vim');
        if (!cancelled) binding = initVimMode(editor, vimStatus.current);
      } else {
        binding = attachEmacs(editor);
      }
    })();
    return () => {
      cancelled = true;
      binding?.dispose();
    };
  }, [editor, keymap]);

  return (
    <div className="flex h-full flex-col">
      <div className="min-h-0 flex-1">
        <Editor
          key={modelKey}
          theme="longhand"
          language={paper ? 'plaintext' : language}
          // The editor owns its text. Passing `value` here drops keystrokes when
          // someone types faster than React renders. A new `modelKey` loads new text.
          defaultValue={initialValue}
          onChange={(next) => onChange?.(next ?? '')}
          loading={null}
          onMount={(instance) => {
            setEditor(instance);
            // Ctrl+Space normally opens suggestions. Here it does nothing.
            instance.addCommand(monaco.KeyMod.CtrlCmd | monaco.KeyCode.Space, () => {});
            instance.onDidChangeCursorPosition((e) => onCursor?.(e.position));
            if (!readOnly) instance.focus();
          }}
          options={{
            ...EDITOR_OPTIONS,
            fontSize: settings.fontSize,
            readOnly,
            contextmenu: !strict,
            lineNumbers: paper ? 'off' : 'on',
            autoClosingBrackets: strict ? 'never' : 'languageDefined',
            autoClosingQuotes: strict ? 'never' : 'languageDefined',
            matchBrackets: paper ? 'never' : 'always',
            folding: !strict,
          }}
        />
      </div>
      {keymap === 'vim' && <div ref={vimStatus} className="terminal h-[22px] flex-none border-t border-line bg-side px-2 leading-[21px] text-mute" />}
    </div>
  );
}
