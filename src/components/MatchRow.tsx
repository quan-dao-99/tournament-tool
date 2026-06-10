import { useState, type MouseEvent } from 'react';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Stack from '@mui/material/Stack';
import ToggleButton from '@mui/material/ToggleButton';
import ToggleButtonGroup from '@mui/material/ToggleButtonGroup';
import Typography from '@mui/material/Typography';
import EmojiEventsIcon from '@mui/icons-material/EmojiEvents';
import type { MatchResult, TeamId } from '../types';
import ConfirmDialog from './ConfirmDialog';
import DurationInput from './DurationInput';

interface MatchRowProps {
  label?: string;
  team1Id: TeamId;
  team2Id: TeamId;
  getName: (id: TeamId | undefined) => string;
  result?: MatchResult;
  /** When true, a change requires confirmation (it will reset later stages). */
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

  const handleWinner = (_e: MouseEvent<HTMLElement>, value: TeamId | null) => {
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

  return (
    <Card variant="outlined" sx={{ borderColor: winnerId ? 'success.light' : undefined }}>
      <CardContent>
        <Stack
          direction={{ xs: 'column', md: 'row' }}
          spacing={2}
          alignItems={{ xs: 'stretch', md: 'center' }}
          justifyContent="space-between"
        >
          <Stack direction="row" spacing={1} alignItems="center" sx={{ minWidth: 0 }}>
            {label && (
              <Typography variant="caption" color="text.secondary" sx={{ width: 64 }}>
                {label}
              </Typography>
            )}
            <ToggleButtonGroup exclusive value={winnerId} onChange={handleWinner} size="small">
              <ToggleButton value={team1Id} color="success">
                {winnerId === team1Id && <EmojiEventsIcon fontSize="small" sx={{ mr: 0.5 }} />}
                {getName(team1Id)}
              </ToggleButton>
              <ToggleButton value={team2Id} color="success">
                {winnerId === team2Id && <EmojiEventsIcon fontSize="small" sx={{ mr: 0.5 }} />}
                {getName(team2Id)}
              </ToggleButton>
            </ToggleButtonGroup>
          </Stack>
          <DurationInput valueSeconds={result?.durationSeconds} onChange={handleDuration} />
        </Stack>
      </CardContent>

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
    </Card>
  );
}
