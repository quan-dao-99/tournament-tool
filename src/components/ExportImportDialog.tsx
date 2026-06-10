import { useState } from 'react';
import Alert from '@mui/material/Alert';
import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogContentText from '@mui/material/DialogContentText';
import DialogTitle from '@mui/material/DialogTitle';
import TextField from '@mui/material/TextField';
import { useTournament } from '../context/TournamentContext';
import { useTranslation } from '../i18n';
import { parseTournament, serialize } from '../utils/storage';

export type IoMode = 'export' | 'import';

interface ExportImportDialogProps {
  open: boolean;
  mode: IoMode;
  onClose: () => void;
}

export default function ExportImportDialog({ open, mode, onClose }: ExportImportDialogProps) {
  const { state, dispatch } = useTournament();
  const { t } = useTranslation();
  const [importText, setImportText] = useState('');
  const [error, setError] = useState(false);
  const [copied, setCopied] = useState(false);

  const exportText = serialize(state);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(exportText);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1500);
    } catch {
      setCopied(false);
    }
  };

  const handleLoad = () => {
    try {
      const parsed = parseTournament(importText);
      dispatch({ type: 'LOAD_STATE', state: parsed });
      setImportText('');
      setError(false);
      onClose();
    } catch {
      setError(true);
    }
  };

  const handleClose = () => {
    setError(false);
    setImportText('');
    onClose();
  };

  return (
    <Dialog open={open} onClose={handleClose} fullWidth maxWidth="md">
      <DialogTitle>{mode === 'export' ? t('io.exportTitle') : t('io.importTitle')}</DialogTitle>
      <DialogContent>
        <DialogContentText sx={{ mb: 2 }}>
          {mode === 'export' ? t('io.exportHelp') : t('io.importHelp')}
        </DialogContentText>
        {mode === 'export' ? (
          <TextField
            multiline
            fullWidth
            minRows={10}
            maxRows={18}
            value={exportText}
            InputProps={{ readOnly: true }}
            inputProps={{ style: { fontFamily: 'monospace', fontSize: 12 } }}
          />
        ) : (
          <>
            <TextField
              multiline
              fullWidth
              minRows={10}
              maxRows={18}
              value={importText}
              onChange={(e) => setImportText(e.target.value)}
              inputProps={{ style: { fontFamily: 'monospace', fontSize: 12 } }}
            />
            {error && (
              <Alert severity="error" sx={{ mt: 2 }}>
                {t('io.importError')}
              </Alert>
            )}
          </>
        )}
      </DialogContent>
      <DialogActions>
        <Button onClick={handleClose}>{t('common.close')}</Button>
        {mode === 'export' ? (
          <Button onClick={handleCopy} variant="contained">
            {copied ? t('io.copied') : t('io.copy')}
          </Button>
        ) : (
          <Button onClick={handleLoad} variant="contained" disabled={importText.trim() === ''}>
            {t('io.load')}
          </Button>
        )}
      </DialogActions>
    </Dialog>
  );
}
