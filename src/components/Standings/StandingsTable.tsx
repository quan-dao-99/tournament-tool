import { useMemo } from 'react';
import Box from '@mui/material/Box';
import Chip from '@mui/material/Chip';
import Paper from '@mui/material/Paper';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import Tooltip from '@mui/material/Tooltip';
import Typography from '@mui/material/Typography';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
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
    <Box>
      <Typography variant="h5" gutterBottom>
        {t('standings.heading')}
      </Typography>
      <TableContainer component={Paper} variant="outlined">
        <Table size="small">
          <TableHead>
            <TableRow>
              <TableCell>{t('standings.rank')}</TableCell>
              <TableCell>{t('standings.team')}</TableCell>
              <TableCell align="center">{t('standings.wins')}</TableCell>
              <TableCell align="center">{t('standings.losses')}</TableCell>
              <TableCell align="center">{t('standings.duration')}</TableCell>
              <TableCell align="center">{t('standings.tiebreak')}</TableCell>
              <TableCell align="center">{t('standings.qualifies')}</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {standings.map((entry) => {
              const qualifies = entry.rank <= qualifyCount;
              return (
                <TableRow
                  key={entry.teamId}
                  sx={{
                    bgcolor: qualifies ? 'action.selected' : undefined,
                  }}
                >
                  <TableCell>{entry.rank}</TableCell>
                  <TableCell>{getName(entry.teamId)}</TableCell>
                  <TableCell align="center">{entry.wins}</TableCell>
                  <TableCell align="center">{entry.losses}</TableCell>
                  <TableCell align="center">
                    {formatDuration(entry.totalWonDurationSeconds)}
                  </TableCell>
                  <TableCell align="center">
                    {CHIP_REASONS.includes(entry.tieBreakReason) ? (
                      <Tooltip title={reasonTooltip[entry.tieBreakReason]}>
                        <Chip size="small" variant="outlined" label={reasonLabel[entry.tieBreakReason]} />
                      </Tooltip>
                    ) : (
                      reasonLabel.none
                    )}
                  </TableCell>
                  <TableCell align="center">
                    {qualifies && <CheckCircleIcon color="success" fontSize="small" />}
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </TableContainer>
    </Box>
  );
}
