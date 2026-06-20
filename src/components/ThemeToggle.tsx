import { useThemeMode } from '../context/ThemeContext';
import { useTranslation } from '../i18n';

export default function ThemeToggle() {
  const { mode, toggleMode } = useThemeMode();
  const { t } = useTranslation();
  const label = mode === 'light' ? t('theme.toDark') : t('theme.toLight');

  return (
    <button
      onClick={toggleMode}
      title={label}
      aria-label={label}
      className="p-1.5 rounded hover:bg-white/20 transition-colors"
    >
      {mode === 'light' ? (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
        </svg>
      ) : (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M12 8a4 4 0 100 8 4 4 0 000-8z" />
        </svg>
      )}
    </button>
  );
}
