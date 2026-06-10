import { useMemo } from 'react';
import Accordion from '@mui/material/Accordion';
import AccordionDetails from '@mui/material/AccordionDetails';
import AccordionSummary from '@mui/material/AccordionSummary';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Chip from '@mui/material/Chip';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import { useTournament } from '../../context/TournamentContext';
import { useTranslation } from '../../i18n';
import { firstKnockoutStage } from '../../utils/standings';
import { makeNameLookup } from '../../utils/teams';
import MatchRow from '../MatchRow';
import StandingsTable from '../Standings/StandingsTable';

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
    <Stack spacing={4}>
      <Box>
        <Typography variant="h4" gutterBottom>
          {t('rr.heading')}
        </Typography>

        <Stack spacing={1}>
          {state.rrRounds.map((round, idx) => {
            const done = round.matches.filter((m) => m.result !== undefined).length;
            const total = round.matches.length;
            return (
              <Accordion
                key={round.roundNumber}
                defaultExpanded={idx === Math.max(0, firstIncompleteRound)}
              >
                <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                  <Stack direction="row" spacing={2} alignItems="center" sx={{ width: '100%' }}>
                    <Typography sx={{ flexGrow: 1 }}>
                      {t('rr.round', { number: round.roundNumber })}
                    </Typography>
                    <Chip
                      size="small"
                      color={done === total ? 'success' : 'default'}
                      label={t('rr.roundProgress', { done, total })}
                    />
                  </Stack>
                </AccordionSummary>
                <AccordionDetails>
                  <Stack spacing={1.5}>
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
                  </Stack>
                </AccordionDetails>
              </Accordion>
            );
          })}
        </Stack>

        <Box sx={{ mt: 3 }}>
          <Button
            variant="contained"
            size="large"
            disabled={!allComplete}
            onClick={() => dispatch({ type: 'ADVANCE_FROM_RR' })}
          >
            {t(advanceLabelKey)}
          </Button>
          {!allComplete && (
            <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
              {t('rr.advanceHelper')}
            </Typography>
          )}
        </Box>
      </Box>

      <StandingsTable />
    </Stack>
  );
}
