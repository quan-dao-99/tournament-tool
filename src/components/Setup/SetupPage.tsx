import { useMemo, useState } from 'react';
import { useTournament } from '../../context/TournamentContext';
import { useTranslation } from '../../i18n';
import { maxRounds } from '../../utils/scheduling';
import ConfirmDialog from '../ConfirmDialog';

function parseTeamNames(raw: string): string[] {
  return raw
    .split('\n')
    .map((line) => line.trim())
    .filter((line) => line !== '');
}

export default function SetupPage() {
  const { state, dispatch } = useTournament();
  const { t } = useTranslation();
  const inProgress = state.rrRounds.length > 0;

  const [teamsText, setTeamsText] = useState(state.teams.map((team) => team.name).join('\n'));
  const [rounds, setRounds] = useState(state.roundsCount);
  const [restartConfirm, setRestartConfirm] = useState(false);

  const teamNames = useMemo(() => parseTeamNames(teamsText), [teamsText]);
  const teamCount = teamNames.length;
  const roundCap = maxRounds(teamCount);

  const errors = useMemo(() => {
    const list: string[] = [];
    if (teamCount > 0 && teamCount < 4) {
      list.push(t('setup.errMin'));
    }
    if (teamCount >= 4 && teamCount % 2 !== 0) {
      list.push(t('setup.errEven'));
    }
    const seen = new Set<string>();
    for (const name of teamNames) {
      const key = name.toLowerCase();
      if (seen.has(key)) {
        list.push(t('setup.errDuplicate', { name }));
        break;
      }
      seen.add(key);
    }
    if (teamCount >= 4 && (rounds < 1 || rounds > roundCap)) {
      list.push(t('setup.errRounds', { max: roundCap }));
    }
    return list;
  }, [teamNames, teamCount, rounds, roundCap, t]);

  const canStart = teamCount >= 4 && errors.length === 0;

  const startTournament = () => {
    dispatch({
      type: 'START_TOURNAMENT',
      teamNames,
      roundsCount: Math.min(Math.max(1, rounds), roundCap),
    });
  };

  const handleStart = () => {
    if (!canStart) return;
    if (inProgress) {
      setRestartConfirm(true);
    } else {
      startTournament();
    }
  };

  return (
    <div className="max-w-xl mx-auto bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl shadow p-8">
      <h1 className="text-2xl font-bold mb-6 text-gray-900 dark:text-gray-100">{t('setup.heading')}</h1>

      <div className="flex flex-col gap-5">
        <div className="flex flex-col gap-1">
          <label className="text-sm font-medium text-gray-700 dark:text-gray-300">{t('setup.teamsLabel')}</label>
          <textarea
            rows={6}
            placeholder={t('setup.teamsPlaceholder')}
            value={teamsText}
            onChange={(e) => setTeamsText(e.target.value)}
            className="px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-1 focus:ring-blue-500 resize-none"
          />
          <span className="text-xs text-gray-500 dark:text-gray-400">{t('setup.teamsHelper')}</span>
        </div>

        <p className="text-sm text-gray-500 dark:text-gray-400">
          {t('setup.teamCount', { count: teamCount })}
        </p>

        <div className="flex flex-col gap-1 w-56">
          <label className="text-sm font-medium text-gray-700 dark:text-gray-300">{t('setup.roundsLabel')}</label>
          <input
            type="number"
            min={1}
            max={roundCap}
            value={rounds}
            onChange={(e) => setRounds(Number(e.target.value))}
            className="px-3 py-1.5 text-sm border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-1 focus:ring-blue-500"
          />
          <span className="text-xs text-gray-500 dark:text-gray-400">{t('setup.roundsHelper', { max: roundCap })}</span>
        </div>

        {errors.length > 0 && (
          <div className="flex flex-col gap-1">
            {errors.map((err) => (
              <div key={err} className="text-sm text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-900/30 border border-red-300 dark:border-red-700 rounded px-3 py-2">
                {err}
              </div>
            ))}
          </div>
        )}

        <div className="flex gap-3">
          <button
            disabled={!canStart}
            onClick={handleStart}
            className="px-5 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed text-white font-medium transition-colors"
          >
            {t('setup.start')}
          </button>
          {inProgress && (
            <button
              onClick={() => dispatch({ type: 'GO_TO_STAGE', stage: 'round-robin' })}
              className="px-5 py-2 rounded-lg border border-blue-600 text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/30 font-medium transition-colors"
            >
              {t('setup.resume')}
            </button>
          )}
        </div>
      </div>

      <ConfirmDialog
        open={restartConfirm}
        title={t('setup.restartTitle')}
        body={t('setup.restartBody')}
        onConfirm={() => {
          startTournament();
          setRestartConfirm(false);
        }}
        onCancel={() => setRestartConfirm(false)}
      />
    </div>
  );
}
