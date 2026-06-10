import { useMemo, useState, type ReactNode } from 'react';
import Alert from '@mui/material/Alert';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import ButtonBase from '@mui/material/ButtonBase';
import Divider from '@mui/material/Divider';
import Paper from '@mui/material/Paper';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import EmojiEventsIcon from '@mui/icons-material/EmojiEvents';
import type { FinalsState, Match, TeamId, TournamentStage } from '../../types';
import { useTournament } from '../../context/TournamentContext';
import { useTranslation } from '../../i18n';
import { makeNameLookup } from '../../utils/teams';
import ConfirmDialog from '../ConfirmDialog';

const BOX_WIDTH = 200;
const LINE = '2px solid';

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
    <ButtonBase
      onClick={onClick}
      disabled={disabled}
      sx={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: 0.5,
        width: '100%',
        px: 1,
        py: 0.75,
        textAlign: 'left',
        bgcolor: winner ? 'success.main' : 'transparent',
        color: winner ? 'success.contrastText' : 'text.primary',
        '&:hover': disabled ? {} : { bgcolor: winner ? 'success.dark' : 'action.hover' },
      }}
    >
      <Typography variant="body2" noWrap sx={{ flexGrow: 1 }}>
        {name}
      </Typography>
      {winner && <EmojiEventsIcon fontSize="small" />}
    </ButtonBase>
  );
}

function PlaceholderBox() {
  const { t } = useTranslation();
  return (
    <Paper variant="outlined" sx={{ width: BOX_WIDTH, opacity: 0.6 }}>
      <Stack divider={<Divider />}>
        <Typography variant="body2" color="text.secondary" sx={{ px: 1, py: 0.75 }}>
          {t('bracket.tbd')}
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ px: 1, py: 0.75 }}>
          {t('bracket.tbd')}
        </Typography>
      </Stack>
    </Paper>
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

function BracketMatchBox({
  match,
  getName,
  requireConfirm,
  cascadeTitle,
  cascadeBody,
  onCommit,
  onClear,
}: BracketMatchBoxProps) {
  const [pending, setPending] = useState<(() => void) | null>(null);

  if (!match) {
    return <PlaceholderBox />;
  }

  const winnerId = match.result?.winnerId ?? null;
  const guard = (action: () => void) => (requireConfirm ? setPending(() => action) : action());

  const pick = (teamId: TeamId) => {
    if (winnerId === teamId) {
      guard(() => onClear());
    } else {
      guard(() => onCommit(teamId));
    }
  };

  return (
    <Paper
      variant="outlined"
      sx={{ width: BOX_WIDTH, overflow: 'hidden', borderColor: winnerId ? 'success.light' : undefined }}
    >
      <Stack divider={<Divider />}>
        <TeamSlot
          name={getName(match.team1Id)}
          winner={winnerId === match.team1Id}
          onClick={() => pick(match.team1Id)}
        />
        <TeamSlot
          name={getName(match.team2Id)}
          winner={winnerId === match.team2Id}
          onClick={() => pick(match.team2Id)}
        />
      </Stack>

      <ConfirmDialog
        open={pending !== null}
        title={cascadeTitle}
        body={cascadeBody}
        onConfirm={() => {
          pending?.();
          setPending(null);
        }}
        onCancel={() => setPending(null)}
      />
    </Paper>
  );
}

function FinalsBox({
  finals,
  editable,
  getName,
}: {
  finals: FinalsState;
  editable: boolean;
  getName: NameLookup;
}) {
  const { dispatch } = useTournament();
  const { t } = useTranslation();
  const { team1Id, team2Id, games, winnerId } = finals;
  const w1 = games.filter((g) => g.winnerId === team1Id).length;
  const w2 = games.filter((g) => g.winnerId === team2Id).length;
  const decided = Boolean(winnerId);

  const add = (team: TeamId) => {
    if (!decided && editable) {
      dispatch({ type: 'SET_FINALS_GAME', gameIndex: games.length, winnerId: team });
    }
  };
  const undo = () => dispatch({ type: 'CLEAR_FINALS_GAME', gameIndex: games.length - 1 });

  return (
    <Paper variant="outlined" sx={{ width: BOX_WIDTH, borderColor: decided ? 'success.main' : undefined }}>
      <Stack divider={<Divider />}>
        <TeamSlot
          name={`${getName(team1Id)} (${w1})`}
          winner={winnerId === team1Id}
          onClick={() => add(team1Id)}
          disabled={decided || !editable}
        />
        <TeamSlot
          name={`${getName(team2Id)} (${w2})`}
          winner={winnerId === team2Id}
          onClick={() => add(team2Id)}
          disabled={decided || !editable}
        />
      </Stack>
      <Box
        sx={{
          p: 1,
          borderTop: '1px solid',
          borderColor: 'divider',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}
      >
        <Typography variant="caption" color="text.secondary">
          {t('finals.subtitle')} · {w1}–{w2}
        </Typography>
        {editable && games.length > 0 && (
          <Button size="small" onClick={undo}>
            {t('common.clear')}
          </Button>
        )}
      </Box>
    </Paper>
  );
}

function ChampionBox({ name }: { name?: string }) {
  const { t } = useTranslation();
  return (
    <Paper
      variant="outlined"
      sx={{
        width: BOX_WIDTH,
        p: 2,
        textAlign: 'center',
        borderColor: name ? 'success.main' : 'divider',
      }}
    >
      <EmojiEventsIcon color={name ? 'success' : 'disabled'} />
      <Typography variant="overline" display="block">
        {t('bracket.champion')}
      </Typography>
      <Typography variant="subtitle1" noWrap>
        {name ?? t('bracket.tbd')}
      </Typography>
    </Paper>
  );
}

/** Vertical bracket connector linking pairs of source matches to each destination. */
function Connector({ count, straight }: { count: number; straight?: boolean }) {
  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', minWidth: 40 }}>
      {Array.from({ length: count }, (_, i) => (
        <Box key={i} sx={{ flex: 1, position: 'relative' }}>
          {straight ? (
            <Box
              sx={{ position: 'absolute', left: 0, right: 0, top: '50%', borderTop: LINE, borderColor: 'divider' }}
            />
          ) : (
            <>
              <Box
                sx={{ position: 'absolute', left: '50%', top: '25%', height: '50%', borderLeft: LINE, borderColor: 'divider' }}
              />
              <Box
                sx={{ position: 'absolute', left: 0, width: '50%', top: '25%', borderTop: LINE, borderColor: 'divider' }}
              />
              <Box
                sx={{ position: 'absolute', left: 0, width: '50%', top: '75%', borderTop: LINE, borderColor: 'divider' }}
              />
              <Box
                sx={{ position: 'absolute', left: '50%', right: 0, top: '50%', borderTop: LINE, borderColor: 'divider' }}
              />
            </>
          )}
        </Box>
      ))}
    </Box>
  );
}

function RoundColumn({
  title,
  active,
  items,
}: {
  title: string;
  active?: boolean;
  items: ReactNode[];
}) {
  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', minWidth: BOX_WIDTH + 16 }}>
      <Typography
        align="center"
        variant="overline"
        sx={{ color: active ? 'primary.main' : 'text.secondary', fontWeight: active ? 700 : 400 }}
      >
        {title}
      </Typography>
      <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
        {items.map((node, i) => (
          <Box key={i} sx={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            {node}
          </Box>
        ))}
      </Box>
    </Box>
  );
}

export default function BracketView({ activeStage }: { activeStage: TournamentStage }) {
  const { state, dispatch } = useTournament();
  const { t } = useTranslation();
  const getName = useMemo(() => makeNameLookup(state.teams), [state.teams]);

  const hasQF = state.teams.length > 8;
  const hasSF = state.teams.length > 4;
  const qfMatches: (Match | undefined)[] =
    state.quarterFinalMatches ?? (hasQF ? [undefined, undefined, undefined, undefined] : []);
  const sfMatches: (Match | undefined)[] =
    state.semiFinalMatches ?? (hasSF ? [undefined, undefined] : []);
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
          if (m) {
            dispatch({ type: 'SET_BRACKET_RESULT', stage, matchId: m.id, winnerId, durationSeconds: 0 });
          }
        }}
        onClear={() => {
          if (m) {
            dispatch({ type: 'CLEAR_BRACKET_RESULT', stage, matchId: m.id });
          }
        }}
      />
    ));

  const allQFComplete =
    (state.quarterFinalMatches?.length ?? 0) > 0 &&
    (state.quarterFinalMatches ?? []).every((m) => m.result);
  const allSFComplete =
    (state.semiFinalMatches?.length ?? 0) > 0 &&
    (state.semiFinalMatches ?? []).every((m) => m.result);

  let advance: ReactNode = null;
  if (activeStage === 'quarterfinals') {
    advance = (
      <Button
        variant="contained"
        size="large"
        disabled={!allQFComplete}
        onClick={() => dispatch({ type: 'ADVANCE_FROM_QF' })}
      >
        {t('bracket.advanceToSF')}
      </Button>
    );
  } else if (activeStage === 'semifinals') {
    advance = (
      <Button
        variant="contained"
        size="large"
        disabled={!allSFComplete}
        onClick={() => dispatch({ type: 'ADVANCE_FROM_SF' })}
      >
        {t('bracket.advanceToFinals')}
      </Button>
    );
  }

  const columns: ReactNode[] = [];
  if (hasQF) {
    columns.push(
      <RoundColumn
        key="qf"
        title={t('bracket.quarterfinals')}
        active={activeStage === 'quarterfinals'}
        items={renderBoxes(
          qfMatches,
          'quarterfinals',
          state.semiFinalMatches !== undefined || state.finalsState !== undefined,
          t('dialog.cascadeBody', { stage: t('dialog.stage.semifinals') }),
        )}
      />,
    );
    columns.push(<Connector key="c-qf" count={2} />);
  }
  if (hasSF) {
    columns.push(
      <RoundColumn
        key="sf"
        title={t('bracket.semifinals')}
        active={activeStage === 'semifinals'}
        items={renderBoxes(
          sfMatches,
          'semifinals',
          state.finalsState !== undefined,
          t('dialog.cascadeBody', { stage: t('dialog.stage.finals') }),
        )}
      />,
    );
    columns.push(<Connector key="c-sf" count={1} />);
  }
  columns.push(
    <RoundColumn
      key="finals"
      title={t('finals.heading')}
      active={finalsActive}
      items={[
        finals ? (
          <FinalsBox key="finals-box" finals={finals} editable={finalsActive} getName={getName} />
        ) : (
          <PlaceholderBox key="finals-ph" />
        ),
      ]}
    />,
  );
  columns.push(<Connector key="c-finals" count={1} straight />);
  columns.push(
    <RoundColumn
      key="champ"
      title={t('bracket.champion')}
      items={[
        <ChampionBox key="champ-box" name={finals?.winnerId ? getName(finals.winnerId) : undefined} />,
      ]}
    />,
  );

  return (
    <Stack spacing={3}>
      {finals?.winnerId && (
        <Alert severity="success" icon={<EmojiEventsIcon fontSize="inherit" />}>
          <Typography variant="h6">{t('finals.champion', { name: getName(finals.winnerId) })}</Typography>
        </Alert>
      )}

      <Box sx={{ display: 'flex', alignItems: 'stretch', overflowX: 'auto', pb: 2, minHeight: 320 }}>
        {columns}
      </Box>

      {advance && <Box>{advance}</Box>}
    </Stack>
  );
}
