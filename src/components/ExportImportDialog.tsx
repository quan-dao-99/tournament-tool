import { useState } from 'react';
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

  if (!open) return null;

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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/50" onClick={handleClose} />
      <div className="relative z-10 bg-white dark:bg-gray-800 rounded-lg shadow-xl w-full max-w-2xl flex flex-col max-h-[90vh]">
        <div className="px-6 pt-5 pb-3 border-b border-gray-200 dark:border-gray-700">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
            {mode === 'export' ? t('io.exportTitle') : t('io.importTitle')}
          </h2>
        </div>
        <div className="px-6 py-4 flex-1 overflow-auto flex flex-col gap-3">
          <p className="text-sm text-gray-600 dark:text-gray-400">
            {mode === 'export' ? t('io.exportHelp') : t('io.importHelp')}
          </p>
          {mode === 'export' ? (
            <textarea
              readOnly
              value={exportText}
              rows={12}
              className="w-full font-mono text-xs p-2 border border-gray-300 dark:border-gray-600 rounded bg-gray-50 dark:bg-gray-900 text-gray-800 dark:text-gray-200 resize-none"
            />
          ) : (
            <>
              <textarea
                value={importText}
                onChange={(e) => setImportText(e.target.value)}
                rows={12}
                className="w-full font-mono text-xs p-2 border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-900 text-gray-800 dark:text-gray-200 resize-none focus:outline-none focus:ring-1 focus:ring-blue-500"
              />
              {error && (
                <div className="text-sm text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-900/30 border border-red-300 dark:border-red-700 rounded px-3 py-2">
                  {t('io.importError')}
                </div>
              )}
            </>
          )}
        </div>
        <div className="px-6 py-3 border-t border-gray-200 dark:border-gray-700 flex justify-end gap-2">
          <button
            onClick={handleClose}
            className="px-4 py-1.5 text-sm rounded border border-gray-300 dark:border-gray-600 hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300 transition-colors"
          >
            {t('common.close')}
          </button>
          {mode === 'export' ? (
            <button
              onClick={handleCopy}
              className="px-4 py-1.5 text-sm rounded bg-blue-600 hover:bg-blue-700 text-white font-medium transition-colors"
            >
              {copied ? t('io.copied') : t('io.copy')}
            </button>
          ) : (
            <button
              onClick={handleLoad}
              disabled={importText.trim() === ''}
              className="px-4 py-1.5 text-sm rounded bg-blue-600 hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed text-white font-medium transition-colors"
            >
              {t('io.load')}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
