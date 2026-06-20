import { useTranslation } from '../i18n';

interface ConfirmDialogProps {
  open: boolean;
  title: string;
  body: string;
  onConfirm: () => void;
  onCancel: () => void;
}

export default function ConfirmDialog({ open, title, body, onConfirm, onCancel }: ConfirmDialogProps) {
  const { t } = useTranslation();
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/50" onClick={onCancel} />
      <div className="relative z-10 bg-white dark:bg-gray-800 rounded-lg shadow-xl w-full max-w-sm p-6">
        <h2 className="text-lg font-semibold mb-2 text-gray-900 dark:text-gray-100">{title}</h2>
        <p className="text-sm text-gray-600 dark:text-gray-400 mb-6">{body}</p>
        <div className="flex justify-end gap-2">
          <button
            onClick={onCancel}
            className="px-4 py-1.5 text-sm rounded border border-gray-300 dark:border-gray-600 hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300 transition-colors"
          >
            {t('common.cancel')}
          </button>
          <button
            autoFocus
            onClick={onConfirm}
            className="px-4 py-1.5 text-sm rounded bg-amber-500 hover:bg-amber-600 text-white font-medium transition-colors"
          >
            {t('common.confirm')}
          </button>
        </div>
      </div>
    </div>
  );
}
