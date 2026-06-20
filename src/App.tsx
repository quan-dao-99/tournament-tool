import { useState } from 'react';
import LanguageSwitcher from './components/LanguageSwitcher';
import ThemeToggle from './components/ThemeToggle';
import ConfirmDialog from './components/ConfirmDialog';
import ExportImportDialog, { type IoMode } from './components/ExportImportDialog';
import SetupPage from './components/Setup/SetupPage';
import RoundRobinPage from './components/RoundRobin/RoundRobinPage';
import BracketView from './components/Bracket/BracketView';
import { useTournament } from './context/TournamentContext';
import { useTranslation } from './i18n';
import type { TournamentState, TournamentStage } from './types';

function previousStage(state: TournamentState): TournamentStage | null {
  switch (state.currentStage) {
    case 'round-robin':
      return 'setup';
    case 'quarterfinals':
      return 'round-robin';
    case 'semifinals':
      return state.quarterFinalMatches ? 'quarterfinals' : 'round-robin';
    case 'finals':
      return state.semiFinalMatches
        ? 'semifinals'
        : state.quarterFinalMatches
          ? 'quarterfinals'
          : 'round-robin';
    case 'complete':
      return 'finals';
    default:
      return null;
  }
}

export default function App() {
  const { state, dispatch } = useTournament();
  const { t } = useTranslation();
  const [ioMode, setIoMode] = useState<IoMode | null>(null);
  const [resetOpen, setResetOpen] = useState(false);

  const prev = previousStage(state);

  const renderStage = () => {
    switch (state.currentStage) {
      case 'setup':
        return <SetupPage />;
      case 'round-robin':
        return <RoundRobinPage />;
      case 'quarterfinals':
      case 'semifinals':
      case 'finals':
      case 'complete':
        return <BracketView activeStage={state.currentStage} />;
      default:
        return <SetupPage />;
    }
  };

  return (
    <div className="min-h-screen bg-white dark:bg-gray-950 text-gray-900 dark:text-gray-100">
      <header className="bg-blue-700 dark:bg-blue-900 text-white shadow">
        <div className="max-w-6xl mx-auto px-4 h-14 flex items-center gap-2">
          {prev && (
            <button
              title={t('app.back')}
              className="p-1.5 rounded hover:bg-white/20 transition-colors"
              onClick={() => dispatch({ type: 'GO_TO_STAGE', stage: prev })}
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
              </svg>
            </button>
          )}

          <svg className="w-5 h-5 shrink-0" fill="currentColor" viewBox="0 0 24 24">
            <path d="M12 2a10 10 0 100 20A10 10 0 0012 2zm1 14.93V17a1 1 0 11-2 0v-.07A8.001 8.001 0 014.07 11H4a1 1 0 110-2h.07A8.001 8.001 0 0111 4.07V4a1 1 0 112 0v.07A8.001 8.001 0 0119.93 11H20a1 1 0 110 2h-.07A8.001 8.001 0 0113 16.93z" />
          </svg>

          <span className="font-semibold text-base flex-1 truncate">{t('app.title')}</span>

          <div className="flex items-center gap-1 shrink-0">
            <LanguageSwitcher />
            <ThemeToggle />
            <button
              title={t('io.export')}
              className="p-1.5 rounded hover:bg-white/20 transition-colors"
              onClick={() => setIoMode('export')}
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M4 16v2a2 2 0 002 2h12a2 2 0 002-2v-2M8 8l4-4m0 0l4 4m-4-4v12" />
              </svg>
            </button>
            <button
              title={t('io.import')}
              className="p-1.5 rounded hover:bg-white/20 transition-colors"
              onClick={() => setIoMode('import')}
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M4 16v2a2 2 0 002 2h12a2 2 0 002-2v-2M8 12l4 4m0 0l4-4m-4 4V4" />
              </svg>
            </button>
            <button
              className="flex items-center gap-1 px-2 py-1 rounded text-sm hover:bg-white/20 transition-colors"
              onClick={() => setResetOpen(true)}
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
              {t('app.reset')}
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 py-8">
        {renderStage()}
      </main>

      <ExportImportDialog
        open={ioMode !== null}
        mode={ioMode ?? 'export'}
        onClose={() => setIoMode(null)}
      />

      <ConfirmDialog
        open={resetOpen}
        title={t('app.resetConfirmTitle')}
        body={t('app.resetConfirmBody')}
        onConfirm={() => {
          dispatch({ type: 'RESET' });
          setResetOpen(false);
        }}
        onCancel={() => setResetOpen(false)}
      />
    </div>
  );
}
