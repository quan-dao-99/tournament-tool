import { useState } from 'react';
import type { MatchResult, TeamId } from '../types';
import ConfirmDialog from './ConfirmDialog';
import DurationInput from './DurationInput';

interface MatchRowProps {
  label?: string;
  team1Id: TeamId;
  team2Id: TeamId;
  getName: (id: TeamId | undefined) => string;
  result?: MatchResult;
  requireConfirm: boolean;
  cascadeTitle: string;
  cascadeBody: string;
  onCommit: (winnerId: TeamId, durationSeconds: number) => void;
  onClear: () => void;
}

export default function MatchRow({
  label,
  team1Id,
  team2Id,
  getName,
  result,
  requireConfirm,
  cascadeTitle,
  cascadeBody,
  onCommit,
  onClear,
}: MatchRowProps) {
  const [durationSeconds, setDurationSeconds] = useState<number | null>(
    result?.durationSeconds ?? null,
  );
  const [pending, setPending] = useState<(() => void) | null>(null);

  const guard = (action: () => void) => {
    if (requireConfirm) {
      setPending(() => action);
    } else {
      action();
    }
  };

  const handleWinner = (value: TeamId | null) => {
    if (value === null) {
      guard(() => onClear());
      return;
    }
    guard(() => onCommit(value, durationSeconds ?? 0));
  };

  const handleDuration = (seconds: number | null) => {
    setDurationSeconds(seconds);
    if (result) {
      guard(() => onCommit(result.winnerId, seconds ?? 0));
    }
  };

  const winnerId = result?.winnerId ?? null;

  const teamBtn = (teamId: TeamId) => {
    const isWinner = winnerId === teamId;
    return (
      <button
        key={teamId}
        onClick={() => handleWinner(winnerId === teamId ? null : teamId)}
        className={[
          'flex items-center gap-1 px-3 py-1.5 text-sm font-medium border rounded transition-colors',
          isWinner
            ? 'bg-green-600 border-green-600 text-white hover:bg-green-700'
            : 'bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700',
        ].join(' ')}
      >
        {isWinner && (
          <svg className="w-3.5 h-3.5 shrink-0" fill="currentColor" viewBox="0 0 24 24">
            <path d="M12 2a10 10 0 100 20A10 10 0 0012 2z" />
          </svg>
        )}
        {getName(teamId)}
      </button>
    );
  };

  return (
    <div className={[
      'rounded-lg border p-3',
      winnerId ? 'border-green-400 dark:border-green-600' : 'border-gray-200 dark:border-gray-700',
    ].join(' ')}>
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
        <div className="flex items-center gap-2 min-w-0">
          {label && (
            <span className="text-xs text-gray-400 w-16 shrink-0">{label}</span>
          )}
          <div className="flex gap-1">
            {teamBtn(team1Id)}
            {teamBtn(team2Id)}
          </div>
        </div>
        <DurationInput valueSeconds={result?.durationSeconds} onChange={handleDuration} />
      </div>

      <ConfirmDialog
        open={pending !== null}
        title={cascadeTitle}
        body={cascadeBody}
        onConfirm={() => {
          pending?.();
          setPending(null);
        }}
        onCancel={() => {
          setPending(null);
          setDurationSeconds(result?.durationSeconds ?? null);
        }}
      />
    </div>
  );
}
