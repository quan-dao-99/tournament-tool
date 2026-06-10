import { useMemo, useState } from 'react';
import Alert from '@mui/material/Alert';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Paper from '@mui/material/Paper';
import Stack from '@mui/material/Stack';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
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
    if (!canStart) {
      return;
    }
    if (inProgress) {
      setRestartConfirm(true);
    } else {
      startTournament();
    }
  };

  return (
    <Paper sx={{ p: 4, maxWidth: 640, mx: 'auto' }} elevation={2}>
      <Typography variant="h4" gutterBottom>
        {t('setup.heading')}
      </Typography>
      <Stack spacing={3} sx={{ mt: 2 }}>
        <TextField
          label={t('setup.teamsLabel')}
          helperText={t('setup.teamsHelper')}
          placeholder={t('setup.teamsPlaceholder')}
          multiline
          minRows={6}
          fullWidth
          value={teamsText}
          onChange={(e) => setTeamsText(e.target.value)}
        />
        <Typography variant="body2" color="text.secondary">
          {t('setup.teamCount', { count: teamCount })}
        </Typography>
        <TextField
          label={t('setup.roundsLabel')}
          helperText={t('setup.roundsHelper', { max: roundCap })}
          type="number"
          value={rounds}
          onChange={(e) => setRounds(Number(e.target.value))}
          inputProps={{ min: 1, max: roundCap }}
          sx={{ width: 220 }}
        />
        {errors.length > 0 && (
          <Box>
            {errors.map((err) => (
              <Alert key={err} severity="error" sx={{ mb: 1 }}>
                {err}
              </Alert>
            ))}
          </Box>
        )}
        <Stack direction="row" spacing={2}>
          <Button variant="contained" size="large" disabled={!canStart} onClick={handleStart}>
            {t('setup.start')}
          </Button>
          {inProgress && (
            <Button
              variant="outlined"
              size="large"
              onClick={() => dispatch({ type: 'GO_TO_STAGE', stage: 'round-robin' })}
            >
              {t('setup.resume')}
            </Button>
          )}
        </Stack>
      </Stack>

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
    </Paper>
  );
}
