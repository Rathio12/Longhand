import { useState } from 'react';
import { useApp } from './state.jsx';
import TitleBar from './components/TitleBar.jsx';
import Welcome from './views/Welcome.jsx';
import Practice from './views/Practice.jsx';
import Examples from './views/Examples.jsx';
import { ExamSetup, ExamRoom } from './views/Exam.jsx';
import History from './views/History.jsx';
import Settings from './views/Settings.jsx';

export default function App() {
  const { settings, activeExam, updateSettings } = useApp();
  const [view, setView] = useState('practice');
  const [openExamId, setOpenExamId] = useState(null);
  const [exampleLanguage, setExampleLanguage] = useState(null);

  const showResult = (id) => {
    setOpenExamId(id);
    setView('history');
  };

  if (activeExam) return <ExamRoom onFinished={showResult} />;

  return (
    <div className="flex h-full flex-col">
      <TitleBar view={view} onView={setView} showNav={Boolean(settings.level)} />
      <main className="min-h-0 flex-1">
        {!settings.level && <Welcome />}
        {settings.level && view === 'practice' && (
          <Practice onOpenExample={(id) => { setExampleLanguage(id); setView('examples'); }} />
        )}
        {settings.level && view === 'examples' && <Examples initialLanguage={exampleLanguage} />}
        {settings.level && view === 'exam' && <ExamSetup />}
        {settings.level && view === 'history' && (
          <History
            openExamId={openExamId}
            onGoToExam={() => setView('exam')}
            onPractise={(problemId) => {
              updateSettings({ lastProblem: problemId });
              setView('practice');
            }}
          />
        )}
        {settings.level && view === 'settings' && <Settings />}
      </main>
    </div>
  );
}
