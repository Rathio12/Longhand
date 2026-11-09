import { TRACKS, DIFFICULTIES } from './data/problems.js';

const isText = (v) => typeof v === 'string';
const SAFE_FILE_NAME = /^[\w. -]+(\/[\w. -]+)*$/;

function readFiles(files, where) {
  if (files === undefined) return undefined;
  if (typeof files !== 'object' || files === null || Array.isArray(files)) throw new Error(`${where}: "files" must map file names to their text.`);
  for (const [name, content] of Object.entries(files)) {
    if (!SAFE_FILE_NAME.test(name) || name.split('/').includes('..')) throw new Error(`${where}: "${name}" is not an allowed file name.`);
    if (!isText(content)) throw new Error(`${where}: the contents of "${name}" must be text.`);
  }
  return files;
}

// Packs come from other people, so nothing is trusted. A pack can only carry
// text and test cases. It can never add or change a command the app runs.
export function parsePack(fileName, text) {
  let raw;
  try {
    raw = JSON.parse(text);
  } catch {
    throw new Error('This file is not valid JSON.');
  }
  const list = Array.isArray(raw) ? raw : raw.problems;
  if (!Array.isArray(list) || list.length === 0) throw new Error('The pack needs a "problems" list with at least one problem.');
  if (list.length > 500) throw new Error('A pack can hold at most 500 problems.');

  const name = isText(raw.name) && raw.name.trim() ? raw.name.trim().slice(0, 80) : fileName;
  const packId = `pack-${Date.now().toString(36)}`;

  const problems = list.map((p, index) => {
    const label = `Problem ${index + 1}`;
    if (!isText(p.title) || !p.title.trim()) throw new Error(`${label} has no "title".`);
    if (!isText(p.statement) || !p.statement.trim()) throw new Error(`${label} has no "statement".`);
    if (!Array.isArray(p.tests) || p.tests.length === 0) throw new Error(`${label} has no "tests".`);
    p.tests.forEach((t, i) => {
      if (!isText(t.input) || !isText(t.output)) throw new Error(`${label}, test ${i + 1}: "input" and "output" must be text.`);
    });
    const hints = Array.isArray(p.hints) ? p.hints.filter(isText).slice(0, 3) : [];
    return {
      id: `${packId}:${index}`,
      packId,
      title: p.title.trim().slice(0, 120),
      track: name,
      difficulty: DIFFICULTIES.includes(p.difficulty) ? p.difficulty : 'Advanced',
      statement: p.statement,
      constraints: isText(p.constraints) ? p.constraints : '',
      language: isText(p.language) ? p.language.slice(0, 40) : undefined,
      starter: isText(p.starter) ? p.starter : undefined,
      hints,
      tests: p.tests.map((t, i) => ({
        input: t.input,
        output: t.output,
        sample: Boolean(t.sample),
        files: readFiles(t.files, `${label}, test ${i + 1}`),
      })),
    };
  });

  return { id: packId, name, importedAt: Date.now(), problems };
}

export function serializePack(name, problems) {
  return JSON.stringify({
    name,
    problems: problems.map(({ title, difficulty, statement, constraints, language, starter, hints, tests }) => ({
      title, difficulty, statement, constraints, language, starter, hints, tests,
    })),
  }, null, 2);
}

export const trackOrder = (track) => {
  const index = TRACKS.indexOf(track);
  return index === -1 ? TRACKS.length : index;
};
