import { useState } from 'react';
import AppBar from '@mui/material/AppBar';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Container from '@mui/material/Container';
import IconButton from '@mui/material/IconButton';
import Stack from '@mui/material/Stack';
import Toolbar from '@mui/material/Toolbar';
import Tooltip from '@mui/material/Tooltip';
import Typography from '@mui/material/Typography';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import EmojiEventsIcon from '@mui/icons-material/EmojiEvents';
import FileDownloadIcon from '@mui/icons-material/FileDownload';
import FileUploadIcon from '@mui/icons-material/FileUpload';
import RestartAltIcon from '@mui/icons-material/RestartAlt';
import LanguageSwitcher from './components/LanguageSwitcher';
import ThemeToggle from './components/ThemeToggle';
import ConfirmDialog from './components/ConfirmDialog';
import ExportImportDialog, { type IoMode } from './components/ExportImportDialog';
import SetupPage from './components/Setup/SetupPage';
import RoundRobinPage from './components/RoundRobin/RoundRobinPage';
import BracketView from './components/Bracket/BracketView';
import { useTournament } from './context/TournamentContext';
import { useTranslation } from './i18n';
import type { TournamentState, TournamentStage } from './types';

function previousStage(state: TournamentState): TournamentStage | null {
  switch (state.currentStage) {
    case 'round-robin':
      return 'setup';
    case 'quarterfinals':
      return 'round-robin';
    case 'semifinals':
      return state.quarterFinalMatches ? 'quarterfinals' : 'round-robin';
    case 'finals':
      return state.semiFinalMatches
        ? 'semifinals'
        : state.quarterFinalMatches
          ? 'quarterfinals'
          : 'round-robin';
    case 'complete':
      return 'finals';
    default:
      return null;
  }
}

export default function App() {
  const { state, dispatch } = useTournament();
  const { t } = useTranslation();
  const [ioMode, setIoMode] = useState<IoMode | null>(null);
  const [resetOpen, setResetOpen] = useState(false);

  const prev = previousStage(state);

  const renderStage = () => {
    switch (state.currentStage) {
      case 'setup':
        return <SetupPage />;
      case 'round-robin':
        return <RoundRobinPage />;
      case 'quarterfinals':
      case 'semifinals':
      case 'finals':
      case 'complete':
        return <BracketView activeStage={state.currentStage} />;
      default:
        return <SetupPage />;
    }
  };

  return (
    <Box sx={{ minHeight: '100vh', bgcolor: 'background.default' }}>
      <AppBar position="static">
        <Toolbar>
          {prev && (
            <Tooltip title={t('app.back')}>
              <IconButton
                color="inherit"
                edge="start"
                sx={{ mr: 1 }}
                onClick={() => dispatch({ type: 'GO_TO_STAGE', stage: prev })}
              >
                <ArrowBackIcon />
              </IconButton>
            </Tooltip>
          )}
          <EmojiEventsIcon sx={{ mr: 1 }} />
          <Typography variant="h6" sx={{ flexGrow: 1 }}>
            {t('app.title')}
          </Typography>
          <Stack direction="row" spacing={1} alignItems="center">
            <LanguageSwitcher />
            <ThemeToggle />
            <Tooltip title={t('io.export')}>
              <IconButton color="inherit" onClick={() => setIoMode('export')}>
                <FileDownloadIcon />
              </IconButton>
            </Tooltip>
            <Tooltip title={t('io.import')}>
              <IconButton color="inherit" onClick={() => setIoMode('import')}>
                <FileUploadIcon />
              </IconButton>
            </Tooltip>
            <Button
              color="inherit"
              startIcon={<RestartAltIcon />}
              onClick={() => setResetOpen(true)}
            >
              {t('app.reset')}
            </Button>
          </Stack>
        </Toolbar>
      </AppBar>

      <Container maxWidth="lg" sx={{ py: 4 }}>
        {renderStage()}
      </Container>

      <ExportImportDialog
        open={ioMode !== null}
        mode={ioMode ?? 'export'}
        onClose={() => setIoMode(null)}
      />

      <ConfirmDialog
        open={resetOpen}
        title={t('app.resetConfirmTitle')}
        body={t('app.resetConfirmBody')}
        onConfirm={() => {
          dispatch({ type: 'RESET' });
          setResetOpen(false);
        }}
        onCancel={() => setResetOpen(false)}
      />
    </Box>
  );
}
