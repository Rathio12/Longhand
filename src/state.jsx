import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react';
import { PROBLEMS } from './data/problems.js';
import { showsStarterComments } from './levels.js';

const api = window.longhand;
const Context = createContext(null);

export function StateProvider({ children }) {
  const [data, setData] = useState(null);
  const [languages, setLanguages] = useState([]);
  const pending = useRef(new Map());
  const timer = useRef(null);
  const latest = useRef(null);

  useEffect(() => {
    api.store.get().then((stored) => { latest.current = stored; setData(stored); });
    api.languages().then(setLanguages);
    api.languages(true).then(setLanguages);
  }, []);

  const flush = useCallback(() => {
    clearTimeout(timer.current);
    const entries = [...pending.current];
    pending.current.clear();
    return Promise.all(entries.map(([key, value]) => api.store.set(key, value)));
  }, []);

  useEffect(() => {
    window.addEventListener('beforeunload', flush);
    return () => window.removeEventListener('beforeunload', flush);
  }, [flush]);

  // Works from `latest` rather than React state so that two updates in one tick both land.
  const update = useCallback((key, next) => {
    const value = typeof next === 'function' ? next(latest.current[key]) : next;
    latest.current = { ...latest.current, [key]: value };
    setData(latest.current);
    pending.current.set(key, value);
    clearTimeout(timer.current);
    timer.current = setTimeout(flush, 300);
  }, [flush]);

  const refreshLanguages = useCallback(async () => {
    await flush();
    setLanguages(await api.languages(true));
  }, [flush]);

  const value = useMemo(() => {
    if (!data || languages.length === 0) return null;
    const packProblems = data.packs.flatMap((pack) => pack.problems);
    // The saved language may be a custom one that has since been removed.
    const language = languages.some((l) => l.id === data.settings.language) ? data.settings.language : 'python';
    const problems = [...PROBLEMS, ...packProblems]
      .filter((p) => data.settings.showGameTrack || p.track !== 'Game logic');
    const updateSettings = (patch) => update('settings', (s) => ({ ...s, ...patch }));
    return { ...data, settings: { ...data.settings, language }, problems, languages, update, updateSettings, flush, refreshLanguages };
  }, [data, languages, update, flush, refreshLanguages]);

  if (!value) return null;
  return <Context.Provider value={value}>{children}</Context.Provider>;
}

export const useApp = () => useContext(Context);

// Bare starter code for people who don't need the comments.
export function starterFor(language, level) {
  if (!language) return '';
  if (showsStarterComments(level)) return language.template;
  return language.template
    .split('\n')
    .filter((line) => !/^\s*(\/\/ |# |-- )/.test(line))
    .join('\n');
}

export function findProblem(problems, id) {
  return problems.find((p) => p.id === id);
}
