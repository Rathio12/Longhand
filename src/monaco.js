// Monaco is assembled by hand. Only editing features are imported: the modules
// behind suggestions, hover, inline completion and code actions are left out,
// so those features do not exist in this app in any mode.
import * as monaco from 'monaco-editor/esm/vs/editor/editor.api.js';
import 'monaco-editor/esm/vs/base/browser/ui/codicons/codicon/codicon.css';
import 'monaco-editor/esm/vs/base/browser/ui/codicons/codicon/codicon-modifiers.css';
import 'monaco-editor/esm/vs/editor/browser/coreCommands.js';
import 'monaco-editor/esm/vs/editor/browser/widget/codeEditor/codeEditorWidget.js';
import 'monaco-editor/esm/vs/editor/contrib/bracketMatching/browser/bracketMatching.js';
import 'monaco-editor/esm/vs/editor/contrib/caretOperations/browser/caretOperations.js';
import 'monaco-editor/esm/vs/editor/contrib/caretOperations/browser/transpose.js';
import 'monaco-editor/esm/vs/editor/contrib/clipboard/browser/clipboard.js';
import 'monaco-editor/esm/vs/editor/contrib/comment/browser/comment.js';
import 'monaco-editor/esm/vs/editor/contrib/contextmenu/browser/contextmenu.js';
import 'monaco-editor/esm/vs/editor/contrib/cursorUndo/browser/cursorUndo.js';
import 'monaco-editor/esm/vs/editor/contrib/find/browser/findController.js';
import 'monaco-editor/esm/vs/editor/contrib/folding/browser/folding.js';
import 'monaco-editor/esm/vs/editor/contrib/indentation/browser/indentation.js';
import 'monaco-editor/esm/vs/editor/contrib/lineSelection/browser/lineSelection.js';
import 'monaco-editor/esm/vs/editor/contrib/linesOperations/browser/linesOperations.js';
import 'monaco-editor/esm/vs/editor/contrib/multicursor/browser/multicursor.js';
import 'monaco-editor/esm/vs/editor/contrib/readOnlyMessage/browser/contribution.js';
import 'monaco-editor/esm/vs/editor/contrib/wordOperations/browser/wordOperations.js';
import 'monaco-editor/esm/vs/editor/standalone/browser/quickAccess/standaloneGotoLineQuickAccess.js';
import 'monaco-editor/esm/vs/editor/common/standaloneStrings.js';
import 'monaco-editor/esm/vs/basic-languages/monaco.contribution.js';
// A relative path keeps Vite's dev pre-bundler away from the worker.
import EditorWorker from '../node_modules/monaco-editor/esm/vs/editor/editor.worker.js?worker';
import { loader } from '@monaco-editor/react';

self.MonacoEnvironment = { getWorker: () => new EditorWorker() };

// By default this wrapper downloads Monaco from a CDN. This keeps it offline.
loader.config({ monaco });

monaco.languages.register({ id: 'gdscript', extensions: ['.gd'], aliases: ['GDScript'] });
monaco.languages.setLanguageConfiguration('gdscript', {
  comments: { lineComment: '#' },
  brackets: [['{', '}'], ['[', ']'], ['(', ')']],
  autoClosingPairs: [
    { open: '{', close: '}' }, { open: '[', close: ']' }, { open: '(', close: ')' },
    { open: '"', close: '"' }, { open: "'", close: "'" },
  ],
  onEnterRules: [{ beforeText: /:\s*(#.*)?$/, action: { indentAction: monaco.languages.IndentAction.Indent } }],
});
monaco.languages.setMonarchTokensProvider('gdscript', {
  keywords: ['if', 'elif', 'else', 'for', 'while', 'match', 'break', 'continue', 'pass', 'return', 'class', 'class_name', 'extends', 'is', 'in', 'as', 'not', 'and', 'or', 'self', 'signal', 'func', 'static', 'const', 'enum', 'var', 'await', 'preload', 'true', 'false', 'null'],
  types: ['int', 'float', 'bool', 'String', 'void', 'Array', 'Dictionary', 'Vector2', 'Vector2i', 'Vector3', 'Vector3i', 'Color', 'Rect2', 'Transform2D', 'Transform3D', 'Node', 'Node2D', 'Node3D', 'SceneTree', 'PackedStringArray', 'PackedInt32Array'],
  tokenizer: {
    root: [
      [/#.*$/, 'comment'],
      [/@[a-zA-Z_]\w*/, 'annotation'],
      [/\$[A-Za-z_/]+/, 'variable'],
      [/[a-zA-Z_]\w*/, { cases: { '@keywords': 'keyword', '@types': 'type', '@default': 'identifier' } }],
      [/0x[0-9a-fA-F_]+/, 'number.hex'],
      [/\d[\d_]*(\.\d+)?([eE][-+]?\d+)?/, 'number'],
      [/"""/, 'string', '@longString'],
      [/"/, 'string', '@doubleString'],
      [/'/, 'string', '@singleString'],
      [/[{}()[\]]/, '@brackets'],
    ],
    doubleString: [[/[^\\"]+/, 'string'], [/\\./, 'string.escape'], [/"/, 'string', '@pop']],
    singleString: [[/[^\\']+/, 'string'], [/\\./, 'string.escape'], [/'/, 'string', '@pop']],
    longString: [[/"""/, 'string', '@pop'], [/./, 'string']],
  },
});

monaco.editor.defineTheme('longhand', {
  base: 'vs-dark',
  inherit: true,
  rules: [
    { token: '', foreground: 'e3e3e0' },
    { token: 'comment', foreground: '6f7884' },
    { token: 'keyword', foreground: 'e8a04a' },
    { token: 'string', foreground: 'a9bd7c' },
    { token: 'string.escape', foreground: 'c8d7a0' },
    { token: 'number', foreground: 'd6b08c' },
    { token: 'type', foreground: '9fb4c7' },
    { token: 'type.identifier', foreground: '9fb4c7' },
    { token: 'annotation', foreground: 'c79ab0' },
    { token: 'delimiter', foreground: 'a2a9b3' },
  ],
  colors: {
    // Brackets stay one quiet colour rather than a rainbow.
    'editorBracketHighlight.foreground1': '#a2a9b3',
    'editorBracketHighlight.foreground2': '#a2a9b3',
    'editorBracketHighlight.foreground3': '#a2a9b3',
    'editorBracketHighlight.foreground4': '#a2a9b3',
    'editorBracketHighlight.foreground5': '#a2a9b3',
    'editorBracketHighlight.foreground6': '#a2a9b3',
    'editor.background': '#121417',
    'editor.foreground': '#e3e3e0',
    'editorLineNumber.foreground': '#4a515c',
    'editorLineNumber.activeForeground': '#8b94a0',
    'editor.lineHighlightBackground': '#181b20',
    'editor.lineHighlightBorder': '#00000000',
    'editorCursor.foreground': '#d97706',
    'editor.selectionBackground': '#d9770640',
    'editor.inactiveSelectionBackground': '#d9770622',
    'editorIndentGuide.background1': '#22262d',
    'editorIndentGuide.activeBackground1': '#3a404b',
    'editorBracketMatch.background': '#d9770620',
    'editorBracketMatch.border': '#d9770680',
    'editorWidget.background': '#181b20',
    'editorWidget.border': '#282c35',
    'scrollbarSlider.background': '#8b94a026',
    'scrollbarSlider.hoverBackground': '#8b94a040',
    'scrollbarSlider.activeBackground': '#8b94a059',
    focusBorder: '#d97706',
  },
});

// Same settings in every mode. Practice should feel like the exam.
export const EDITOR_OPTIONS = {
  quickSuggestions: false,
  suggestOnTriggerCharacters: false,
  snippetSuggestions: 'none',
  wordBasedSuggestions: 'off',
  hover: { enabled: false },
  acceptSuggestionOnEnter: 'off',
  acceptSuggestionOnCommitCharacter: false,
  tabCompletion: 'off',
  parameterHints: { enabled: false },
  inlineSuggest: { enabled: false },
  codeLens: false,
  lightbulb: { enabled: 'off' },
  links: false,
  colorDecorators: false,
  minimap: { enabled: false },
  scrollBeyondLastLine: false,
  automaticLayout: true,
  renderLineHighlight: 'line',
  fontFamily: "'JetBrains Mono Variable', Consolas, monospace",
  fontLigatures: false,
  padding: { top: 10, bottom: 10 },
  overviewRulerLanes: 0,
  hideCursorInOverviewRuler: true,
  scrollbar: { verticalScrollbarSize: 10, horizontalScrollbarSize: 10, useShadows: false },
  guides: { indentation: true, bracketPairs: false },
  bracketPairColorization: { enabled: false },
  cursorBlinking: 'solid',
  smoothScrolling: false,
  tabSize: 4,
  stickyScroll: { enabled: false },
};

export { monaco };
