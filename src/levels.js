export const LEVELS = [
  { id: 'beginner', label: 'Beginner', text: 'New to coding. Comments in the starter code, and errors explained in plain English.' },
  { id: 'intermediate', label: 'Intermediate', text: 'You know the basics. Comments in the starter code, and errors explained.' },
  { id: 'advanced', label: 'Advanced', text: 'You solve problems regularly. Bare starter code, with errors still explained.' },
  { id: 'expert', label: 'Expert', text: 'No help at all. Bare starter code and raw compiler output.' },
];

export const levelLabel = (id) => LEVELS.find((level) => level.id === id)?.label;
export const showsErrorHelp = (id) => id !== 'expert';
export const showsStarterComments = (id) => id === 'beginner' || id === 'intermediate';
