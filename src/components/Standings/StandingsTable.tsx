import { useMemo } from 'react';
import type { TieBreakReason } from '../../types';
import { useTournament } from '../../context/TournamentContext';
import { useTranslation } from '../../i18n';
import { computeStandings, qualifierCount } from '../../utils/standings';
import { formatDuration } from '../../utils/format';
import { makeNameLookup } from '../../utils/teams';

const CHIP_REASONS: TieBreakReason[] = ['headToHead', 'duration', 'random'];

export default function StandingsTable() {
  const { state } = useTournament();
  const { t } = useTranslation();
  const getName = useMemo(() => makeNameLookup(state.teams), [state.teams]);

  const standings = useMemo(
    () => computeStandings(state.teams, state.rrRounds, state.tieBreakSeed),
    [state.teams, state.rrRounds, state.tieBreakSeed],
  );

  const qualifyCount = qualifierCount(state.teams.length);

  const reasonLabel: Record<TieBreakReason, string> = {
    wins: t('standings.tb.wins'),
    headToHead: t('standings.tb.headToHead'),
    duration: t('standings.tb.duration'),
    random: t('standings.tb.random'),
    none: t('standings.tb.none'),
  };
  const reasonTooltip: Record<TieBreakReason, string> = {
    wins: t('standings.tbTooltip.wins'),
    headToHead: t('standings.tbTooltip.headToHead'),
    duration: t('standings.tbTooltip.duration'),
    random: t('standings.tbTooltip.random'),
    none: '',
  };

  return (
    <div>
      <h2 className="text-xl font-bold mb-3 text-gray-900 dark:text-gray-100">{t('standings.heading')}</h2>
      <div className="overflow-x-auto rounded-lg border border-gray-200 dark:border-gray-700">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 dark:bg-gray-800 text-gray-600 dark:text-gray-400 text-xs uppercase">
            <tr>
              <th className="px-3 py-2 text-left font-medium">{t('standings.rank')}</th>
              <th className="px-3 py-2 text-left font-medium">{t('standings.team')}</th>
              <th className="px-3 py-2 text-center font-medium">{t('standings.wins')}</th>
              <th className="px-3 py-2 text-center font-medium">{t('standings.losses')}</th>
              <th className="px-3 py-2 text-center font-medium">{t('standings.duration')}</th>
              <th className="px-3 py-2 text-center font-medium">{t('standings.tiebreak')}</th>
              <th className="px-3 py-2 text-center font-medium">{t('standings.qualifies')}</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
            {standings.map((entry) => {
              const qualifies = entry.rank <= qualifyCount;
              return (
                <tr
                  key={entry.teamId}
                  className={qualifies ? 'bg-blue-50 dark:bg-blue-900/20' : 'bg-white dark:bg-gray-900'}
                >
                  <td className="px-3 py-2 text-gray-700 dark:text-gray-300">{entry.rank}</td>
                  <td className="px-3 py-2 font-medium text-gray-900 dark:text-gray-100">{getName(entry.teamId)}</td>
                  <td className="px-3 py-2 text-center text-gray-700 dark:text-gray-300">{entry.wins}</td>
                  <td className="px-3 py-2 text-center text-gray-700 dark:text-gray-300">{entry.losses}</td>
                  <td className="px-3 py-2 text-center text-gray-700 dark:text-gray-300 font-mono">
                    {formatDuration(entry.totalWonDurationSeconds)}
                  </td>
                  <td className="px-3 py-2 text-center">
                    {CHIP_REASONS.includes(entry.tieBreakReason) ? (
                      <span
                        title={reasonTooltip[entry.tieBreakReason]}
                        className="inline-block text-xs px-2 py-0.5 rounded border border-gray-300 dark:border-gray-600 text-gray-600 dark:text-gray-400 cursor-default"
                      >
                        {reasonLabel[entry.tieBreakReason]}
                      </span>
                    ) : (
                      <span className="text-gray-400 dark:text-gray-600">{reasonLabel.none}</span>
                    )}
                  </td>
                  <td className="px-3 py-2 text-center">
                    {qualifies && (
                      <svg className="w-4 h-4 text-green-600 dark:text-green-400 inline-block" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                      </svg>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
