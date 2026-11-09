// A compact Emacs keymap: movement, kill and yank, and a mark for selecting.
const MOTIONS = {
  'C-a': 'cursorHome',
  'C-e': 'cursorEnd',
  'C-f': 'cursorRight',
  'C-b': 'cursorLeft',
  'C-n': 'cursorDown',
  'C-p': 'cursorUp',
  'M-f': 'cursorWordEndRight',
  'M-b': 'cursorWordStartLeft',
  'M-<': 'cursorTop',
  'M->': 'cursorBottom',
};

const EDITS = {
  'C-d': 'deleteRight',
  'M-d': 'deleteWordRight',
  'C-/': 'undo',
  'C-_': 'undo',
};

function chord(event) {
  const { browserEvent: e } = event;
  if (e.ctrlKey && !e.altKey) return `C-${e.key === ' ' ? 'SPC' : e.key.toLowerCase()}`;
  if (e.altKey && !e.ctrlKey) return `M-${e.key.toLowerCase()}`;
  return null;
}

export function attachEmacs(editor) {
  let marking = false;
  let killed = '';

  const run = (command) => editor.trigger('emacs', command, null);
  const insert = (text) => editor.executeEdits('emacs', [{ range: editor.getSelection(), text, forceMoveMarkers: true }]);
  const clearMark = () => {
    marking = false;
    const position = editor.getPosition();
    editor.setPosition(position);
  };
  const selected = () => editor.getModel().getValueInRange(editor.getSelection());

  const killToLineEnd = () => {
    const { lineNumber, column } = editor.getPosition();
    const model = editor.getModel();
    const end = model.getLineMaxColumn(lineNumber);
    killed = column === end ? '\n' : model.getValueInRange({ startLineNumber: lineNumber, startColumn: column, endLineNumber: lineNumber, endColumn: end });
    run(column === end ? 'deleteRight' : 'deleteAllRight');
  };

  const SPECIAL = {
    'C-SPC': () => { marking = true; },
    'C-g': clearMark,
    'C-k': killToLineEnd,
    'C-y': () => insert(killed),
    'C-w': () => { killed = selected(); insert(''); clearMark(); },
    'M-w': () => { killed = selected(); clearMark(); },
    'C-s': () => run('actions.find'),
  };

  const listener = editor.onKeyDown((event) => {
    const key = chord(event);
    if (!key) return;
    const motion = MOTIONS[key];
    const action = SPECIAL[key];
    const edit = EDITS[key];
    if (!motion && !action && !edit) return;
    event.preventDefault();
    event.stopPropagation();
    if (motion) run(marking ? `${motion}Select` : motion);
    else if (edit) run(edit);
    else action();
  });

  return { dispose: () => listener.dispose() };
}
