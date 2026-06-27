import { useMemo, useState, type ReactNode } from 'react';
import type { FinalsState, Match, TeamId, TournamentStage } from '../../types';
import { useTournament } from '../../context/TournamentContext';
import { useTranslation } from '../../i18n';
import { makeNameLookup } from '../../utils/teams';
import ConfirmDialog from '../ConfirmDialog';

const BOX_W = 200;

type NameLookup = (id: TeamId | undefined) => string;

function TeamSlot({
  name,
  winner,
  onClick,
  disabled,
}: {
  name: string;
  winner?: boolean;
  onClick?: () => void;
  disabled?: boolean;
}) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={[
        'flex items-center justify-between gap-1 w-full px-2 py-1.5 text-sm text-left transition-colors',
        winner
          ? 'bg-green-600 text-white hover:bg-green-700'
          : 'bg-transparent text-gray-800 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700',
        disabled ? 'cursor-default' : '',
      ].join(' ')}
    >
      <span className="truncate flex-1">{name}</span>
      {winner && (
        <svg className="w-3.5 h-3.5 shrink-0" fill="currentColor" viewBox="0 0 24 24">
          <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 14H9V8h2v8zm4 0h-2V8h2v8z" />
        </svg>
      )}
    </button>
  );
}

function PlaceholderBox() {
  const { t } = useTranslation();
  return (
    <div style={{ width: BOX_W }} className="border border-gray-300 dark:border-gray-600 rounded overflow-hidden opacity-60">
      <div className="px-2 py-1.5 text-sm text-gray-400 border-b border-gray-200 dark:border-gray-700">{t('bracket.tbd')}</div>
      <div className="px-2 py-1.5 text-sm text-gray-400">{t('bracket.tbd')}</div>
    </div>
  );
}

interface BracketMatchBoxProps {
  match?: Match;
  getName: NameLookup;
  requireConfirm: boolean;
  cascadeTitle: string;
  cascadeBody: string;
  onCommit: (winnerId: TeamId) => void;
  onClear: () => void;
}

function BracketMatchBox({ match, getName, requireConfirm, cascadeTitle, cascadeBody, onCommit, onClear }: BracketMatchBoxProps) {
  const [pending, setPending] = useState<(() => void) | null>(null);

  if (!match) return <PlaceholderBox />;

  const winnerId = match.result?.winnerId ?? null;
  const guard = (action: () => void) => (requireConfirm ? setPending(() => action) : action());
  const pick = (teamId: TeamId) => {
    if (winnerId === teamId) guard(() => onClear());
    else guard(() => onCommit(teamId));
  };

  return (
    <>
      <div
        style={{ width: BOX_W }}
        className={[
          'border rounded overflow-hidden',
          winnerId ? 'border-green-400 dark:border-green-600' : 'border-gray-300 dark:border-gray-600',
        ].join(' ')}
      >
        <div className="divide-y divide-gray-200 dark:divide-gray-700">
          <TeamSlot name={getName(match.team1Id)} winner={winnerId === match.team1Id} onClick={() => pick(match.team1Id)} />
          <TeamSlot name={getName(match.team2Id)} winner={winnerId === match.team2Id} onClick={() => pick(match.team2Id)} />
        </div>
      </div>
      <ConfirmDialog
        open={pending !== null}
        title={cascadeTitle}
        body={cascadeBody}
        onConfirm={() => { pending?.(); setPending(null); }}
        onCancel={() => setPending(null)}
      />
    </>
  );
}

function FinalsBox({ finals, editable, getName }: { finals: FinalsState; editable: boolean; getName: NameLookup }) {
  const { dispatch } = useTournament();
  const { t } = useTranslation();
  const { team1Id, team2Id, games, winnerId } = finals;
  const w1 = games.filter((g) => g.winnerId === team1Id).length;
  const w2 = games.filter((g) => g.winnerId === team2Id).length;
  const decided = Boolean(winnerId);

  const add = (team: TeamId) => {
    if (!decided && editable) dispatch({ type: 'SET_FINALS_GAME', gameIndex: games.length, winnerId: team });
  };
  const undo = () => dispatch({ type: 'CLEAR_FINALS_GAME', gameIndex: games.length - 1 });

  return (
    <div
      style={{ width: BOX_W }}
      className={[
        'border rounded overflow-hidden',
        decided ? 'border-green-500 dark:border-green-500' : 'border-gray-300 dark:border-gray-600',
      ].join(' ')}
    >
      <div className="divide-y divide-gray-200 dark:divide-gray-700">
        <TeamSlot name={`${getName(team1Id)} (${w1})`} winner={winnerId === team1Id} onClick={() => add(team1Id)} disabled={decided || !editable} />
        <TeamSlot name={`${getName(team2Id)} (${w2})`} winner={winnerId === team2Id} onClick={() => add(team2Id)} disabled={decided || !editable} />
      </div>
      <div className="flex items-center justify-between px-2 py-1 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800">
        <span className="text-xs text-gray-500 dark:text-gray-400">{t('finals.subtitle')} · {w1}–{w2}</span>
        {editable && games.length > 0 && (
          <button onClick={undo} className="text-xs text-blue-600 dark:text-blue-400 hover:underline">
            {t('common.clear')}
          </button>
        )}
      </div>
    </div>
  );
}

function ChampionBox({ name }: { name?: string }) {
  const { t } = useTranslation();
  return (
    <div
      style={{ width: BOX_W }}
      className={[
        'border rounded p-4 text-center',
        name ? 'border-green-500 dark:border-green-500' : 'border-gray-300 dark:border-gray-600',
      ].join(' ')}
    >
      <svg className={['w-6 h-6 mx-auto mb-1', name ? 'text-green-500' : 'text-gray-400'].join(' ')} fill="currentColor" viewBox="0 0 24 24">
        <path d="M19 5h-2V3H7v2H5C3.9 5 3 5.9 3 7v1c0 2.55 1.92 4.63 4.39 4.94A6.006 6.006 0 0011 17v2H7v2h10v-2h-4v-2a6.006 6.006 0 003.61-4.06C19.08 12.63 21 10.55 21 8V7c0-1.1-.9-2-2-2zm-2 3.79V8h-1V5h1v.21c.61.29 1 .9 1 1.59 0 .9-.62 1.65-1.5 1.99zM5 8v-.79C4.12 6.86 3.5 6.1 3.5 5.21c0-.69.39-1.3 1-1.59V5H3.5V8l.5 1H3c0-1.1.9-2 2-2z" />
      </svg>
      <div className="text-xs uppercase tracking-wider text-gray-500 dark:text-gray-400 mb-1">{t('bracket.champion')}</div>
      <div className="text-sm font-semibold truncate text-gray-900 dark:text-gray-100">{name ?? t('bracket.tbd')}</div>
    </div>
  );
}

function Connector({ count, straight }: { count: number; straight?: boolean }) {
  return (
    <div className="flex flex-col" style={{ minWidth: 40 }}>
      {Array.from({ length: count }, (_, i) => (
        <div key={i} className="flex-1 relative">
          {straight ? (
            <div className="absolute left-0 right-0 top-1/2 border-t-2 border-gray-300 dark:border-gray-600" />
          ) : (
            <>
              <div className="absolute left-1/2 top-1/4 bottom-1/4 border-l-2 border-gray-300 dark:border-gray-600" />
              <div className="absolute left-0 w-1/2 top-1/4 border-t-2 border-gray-300 dark:border-gray-600" />
              <div className="absolute left-0 w-1/2 top-3/4 border-t-2 border-gray-300 dark:border-gray-600" />
              <div className="absolute left-1/2 right-0 top-1/2 border-t-2 border-gray-300 dark:border-gray-600" />
            </>
          )}
        </div>
      ))}
    </div>
  );
}

function RoundColumn({ title, active, items }: { title: string; active?: boolean; items: ReactNode[] }) {
  return (
    <div className="flex flex-col" style={{ minWidth: BOX_W + 16 }}>
      <div className={['text-center text-xs uppercase tracking-wider mb-2 font-medium', active ? 'text-blue-600 dark:text-blue-400' : 'text-gray-400 dark:text-gray-500'].join(' ')}>
        {title}
      </div>
      <div className="flex-1 flex flex-col">
        {items.map((node, i) => (
          <div key={i} className="flex-1 flex items-center justify-center">
            {node}
          </div>
        ))}
      </div>
    </div>
  );
}

export default function BracketView({ activeStage }: { activeStage: TournamentStage }) {
  const { state, dispatch } = useTournament();
  const { t } = useTranslation();
  const getName = useMemo(() => makeNameLookup(state.teams), [state.teams]);

  const hasQF = state.teams.length > 8;
  const hasSF = state.teams.length > 4;
  const qfMatches: (Match | undefined)[] = state.quarterFinalMatches ?? (hasQF ? [undefined, undefined, undefined, undefined] : []);
  const sfMatches: (Match | undefined)[] = state.semiFinalMatches ?? (hasSF ? [undefined, undefined] : []);
  const finals = state.finalsState;
  const finalsActive = activeStage === 'finals' || activeStage === 'complete';

  const renderBoxes = (
    matches: (Match | undefined)[],
    stage: 'quarterfinals' | 'semifinals',
    requireConfirm: boolean,
    cascadeBody: string,
  ): ReactNode[] =>
    matches.map((m, i) => (
      <BracketMatchBox
        key={m?.id ?? `ph-${stage}-${i}`}
        match={m}
        getName={getName}
        requireConfirm={requireConfirm}
        cascadeTitle={t('dialog.cascadeTitle')}
        cascadeBody={cascadeBody}
        onCommit={(winnerId) => {
          if (m) dispatch({ type: 'SET_BRACKET_RESULT', stage, matchId: m.id, winnerId, durationSeconds: 0 });
        }}
        onClear={() => {
          if (m) dispatch({ type: 'CLEAR_BRACKET_RESULT', stage, matchId: m.id });
        }}
      />
    ));

  const allQFComplete = (state.quarterFinalMatches?.length ?? 0) > 0 && (state.quarterFinalMatches ?? []).every((m) => m.result);
  const allSFComplete = (state.semiFinalMatches?.length ?? 0) > 0 && (state.semiFinalMatches ?? []).every((m) => m.result);

  let advance: ReactNode = null;
  if (activeStage === 'quarterfinals') {
    advance = (
      <button
        disabled={!allQFComplete}
        onClick={() => dispatch({ type: 'ADVANCE_FROM_QF' })}
        className="px-6 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed text-white font-medium transition-colors"
      >
        {t('bracket.advanceToSF')}
      </button>
    );
  } else if (activeStage === 'semifinals') {
    advance = (
      <button
        disabled={!allSFComplete}
        onClick={() => dispatch({ type: 'ADVANCE_FROM_SF' })}
        className="px-6 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed text-white font-medium transition-colors"
      >
        {t('bracket.advanceToFinals')}
      </button>
    );
  }

  const columns: ReactNode[] = [];
  if (hasQF) {
    columns.push(
      <RoundColumn key="qf" title={t('bracket.quarterfinals')} active={activeStage === 'quarterfinals'}
        items={renderBoxes(qfMatches, 'quarterfinals',
          state.semiFinalMatches !== undefined || state.finalsState !== undefined,
          t('dialog.cascadeBody', { stage: t('dialog.stage.semifinals') }),
        )}
      />,
    );
    columns.push(<Connector key="c-qf" count={2} />);
  }
  if (hasSF) {
    columns.push(
      <RoundColumn key="sf" title={t('bracket.semifinals')} active={activeStage === 'semifinals'}
        items={renderBoxes(sfMatches, 'semifinals',
          state.finalsState !== undefined,
          t('dialog.cascadeBody', { stage: t('dialog.stage.finals') }),
        )}
      />,
    );
    columns.push(<Connector key="c-sf" count={1} />);
  }
  columns.push(
    <RoundColumn key="finals" title={t('finals.heading')} active={finalsActive}
      items={[
        finals
          ? <FinalsBox key="finals-box" finals={finals} editable={finalsActive} getName={getName} />
          : <PlaceholderBox key="finals-ph" />,
      ]}
    />,
  );
  columns.push(<Connector key="c-finals" count={1} straight />);
  columns.push(
    <RoundColumn key="champ" title={t('bracket.champion')}
      items={[<ChampionBox key="champ-box" name={finals?.winnerId ? getName(finals.winnerId) : undefined} />]}
    />,
  );

  return (
    <div className="flex flex-col gap-6">
      {finals?.winnerId && (
        <div className="flex items-center gap-2 bg-green-50 dark:bg-green-900/30 border border-green-300 dark:border-green-700 rounded-lg px-4 py-3">
          <svg className="w-5 h-5 text-green-600 dark:text-green-400 shrink-0" fill="currentColor" viewBox="0 0 24 24">
            <path d="M19 5h-2V3H7v2H5C3.9 5 3 5.9 3 7v1c0 2.55 1.92 4.63 4.39 4.94A6.006 6.006 0 0011 17v2H7v2h10v-2h-4v-2a6.006 6.006 0 003.61-4.06C19.08 12.63 21 10.55 21 8V7c0-1.1-.9-2-2-2z" />
          </svg>
          <span className="text-lg font-bold text-green-800 dark:text-green-200">
            {t('finals.champion', { name: getName(finals.winnerId) })}
          </span>
        </div>
      )}

      <div className="flex items-stretch overflow-x-auto pb-4 min-h-72 gap-0">
        {columns}
      </div>

      {advance && <div>{advance}</div>}
    </div>
  );
}
