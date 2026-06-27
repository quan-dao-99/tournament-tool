import { useState } from 'react';
import { useTournament } from '../context/TournamentContext';
import { useTranslation } from '../i18n';
import { buildDiscordMessage } from '../utils/discordExport';

interface DiscordExportDialogProps {
  open: boolean;
  onClose: () => void;
}

export default function DiscordExportDialog({ open, onClose }: DiscordExportDialogProps) {
  const { state } = useTournament();
  const { t } = useTranslation();
  const [copied, setCopied] = useState(false);

  if (!open) return null;

  const message = buildDiscordMessage(state, t);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(message);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1500);
    } catch {
      setCopied(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/50" onClick={onClose} />
      <div className="relative z-10 bg-white dark:bg-gray-800 rounded-lg shadow-xl w-full max-w-2xl flex flex-col max-h-[90vh]">
        <div className="px-6 pt-5 pb-3 border-b border-gray-200 dark:border-gray-700">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
            {t('discord.title')}
          </h2>
        </div>
        <div className="px-6 py-4 flex-1 overflow-auto flex flex-col gap-3">
          <p className="text-sm text-gray-600 dark:text-gray-400">
            {t('discord.help')}
          </p>
          <textarea
            readOnly
            value={message}
            rows={16}
            className="w-full font-mono text-xs p-2 border border-gray-300 dark:border-gray-600 rounded bg-gray-50 dark:bg-gray-900 text-gray-800 dark:text-gray-200 resize-none"
          />
        </div>
        <div className="px-6 py-3 border-t border-gray-200 dark:border-gray-700 flex justify-end gap-2">
          <button
            onClick={onClose}
            className="px-4 py-1.5 text-sm rounded border border-gray-300 dark:border-gray-600 hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300 transition-colors"
          >
            {t('common.close')}
          </button>
          <button
            onClick={handleCopy}
            className="px-4 py-1.5 text-sm rounded bg-indigo-600 hover:bg-indigo-700 text-white font-medium transition-colors"
          >
            {copied ? t('io.copied') : t('discord.copy')}
          </button>
        </div>
      </div>
    </div>
  );
}
