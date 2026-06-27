import { useMemo, useState, type ReactNode } from 'react';
import { useTournament } from '../../context/TournamentContext';
import { useTranslation } from '../../i18n';
import { firstKnockoutStage } from '../../utils/standings';
import { makeNameLookup } from '../../utils/teams';
import MatchRow from '../MatchRow';
import StandingsTable from '../Standings/StandingsTable';
import DiscordExportButton from '../DiscordExportButton';

export default function RoundRobinPage() {
  const { state, dispatch } = useTournament();
  const { t } = useTranslation();
  const getName = useMemo(() => makeNameLookup(state.teams), [state.teams]);

  const hasDownstream =
    state.quarterFinalMatches !== undefined ||
    state.semiFinalMatches !== undefined ||
    state.finalsState !== undefined;

  const allComplete = state.rrRounds.every((round) =>
    round.matches.every((m) => m.result !== undefined),
  );

  const firstIncompleteRound = state.rrRounds.findIndex((round) =>
    round.matches.some((m) => m.result === undefined),
  );

  const advanceLabelKey = (() => {
    const stage = firstKnockoutStage(state.teams.length);
    if (stage === 'quarterfinals') return 'rr.advanceToQF';
    if (stage === 'semifinals') return 'rr.advanceToSF';
    return 'rr.advanceToFinals';
  })();

  const cascadeTitle = t('dialog.cascadeTitle');
  const cascadeBody = t('dialog.cascadeBody', { stage: t('dialog.stage.knockouts') });

  return (
    <div className="flex flex-col gap-8">
      <div>
        <div className="flex items-center justify-between mb-4">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">{t('rr.heading')}</h1>
          <DiscordExportButton stageLabel={t('rr.heading')} />
        </div>

        <div className="flex flex-col gap-2">
          {state.rrRounds.map((round, idx) => {
            const done = round.matches.filter((m) => m.result !== undefined).length;
            const total = round.matches.length;
            const defaultOpen = idx === Math.max(0, firstIncompleteRound);
            return (
              <Accordion
                key={round.roundNumber}
                defaultOpen={defaultOpen}
                summary={
                  <div className="flex items-center gap-2 w-full">
                    <span className="flex-1 font-medium text-sm text-gray-800 dark:text-gray-200">
                      {t('rr.round', { number: round.roundNumber })}
                    </span>
                    <span className={[
                      'text-xs px-2 py-0.5 rounded-full font-medium',
                      done === total
                        ? 'bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-400'
                        : 'bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-400',
                    ].join(' ')}>
                      {t('rr.roundProgress', { done, total })}
                    </span>
                  </div>
                }
              >
                <div className="flex flex-col gap-2 pt-2">
                  {round.matches.map((match) => (
                    <MatchRow
                      key={match.id}
                      team1Id={match.team1Id}
                      team2Id={match.team2Id}
                      getName={getName}
                      result={match.result}
                      requireConfirm={hasDownstream}
                      cascadeTitle={cascadeTitle}
                      cascadeBody={cascadeBody}
                      onCommit={(winnerId, durationSeconds) =>
                        dispatch({
                          type: 'SET_RR_RESULT',
                          matchId: match.id,
                          winnerId,
                          durationSeconds,
                        })
                      }
                      onClear={() => dispatch({ type: 'CLEAR_RR_RESULT', matchId: match.id })}
                    />
                  ))}
                </div>
              </Accordion>
            );
          })}
        </div>

        <div className="mt-5">
          <button
            disabled={!allComplete}
            onClick={() => dispatch({ type: 'ADVANCE_FROM_RR' })}
            className="px-6 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed text-white font-medium transition-colors"
          >
            {t(advanceLabelKey)}
          </button>
          {!allComplete && (
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">{t('rr.advanceHelper')}</p>
          )}
        </div>
      </div>

      <StandingsTable />
    </div>
  );
}

function Accordion({
  summary,
  children,
  defaultOpen,
}: {
  summary: ReactNode;
  children: ReactNode;
  defaultOpen?: boolean;
}) {
  const [open, setOpen] = useState(defaultOpen ?? false);

  return (
    <div className="border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden">
      <button
        onClick={() => setOpen((o) => !o)}
        className="w-full flex items-center gap-2 px-4 py-3 bg-gray-50 dark:bg-gray-800 hover:bg-gray-100 dark:hover:bg-gray-750 transition-colors text-left"
      >
        <svg
          className={['w-4 h-4 text-gray-500 shrink-0 transition-transform', open ? 'rotate-180' : ''].join(' ')}
          fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
        </svg>
        {summary}
      </button>
      {open && (
        <div className="px-4 pb-4">
          {children}
        </div>
      )}
    </div>
  );
}
