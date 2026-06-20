import { useTranslation } from '../i18n';
import type { Language } from '../types';

export default function LanguageSwitcher() {
  const { language, setLanguage } = useTranslation();

  const btn = (lang: Language, label: string) => (
    <button
      key={lang}
      onClick={() => setLanguage(lang)}
      className={[
        'px-2 py-0.5 text-xs font-medium border transition-colors',
        language === lang
          ? 'bg-white text-blue-700 border-white'
          : 'bg-transparent text-white/80 border-white/40 hover:bg-white/20',
      ].join(' ')}
    >
      {label}
    </button>
  );

  return (
    <div className="flex rounded overflow-hidden border border-white/40">
      {btn('en', 'EN')}
      {btn('vi', 'VI')}
    </div>
  );
}
