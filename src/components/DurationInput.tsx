import { useEffect, useRef, useState, type ChangeEvent } from 'react';
import { useTranslation } from '../i18n';
import { formatDuration, parseDuration } from '../utils/format';

interface DurationInputProps {
  valueSeconds?: number;
  disabled?: boolean;
  onChange: (seconds: number | null) => void;
}

export default function DurationInput({ valueSeconds, disabled, onChange }: DurationInputProps) {
  const { t } = useTranslation();
  const [text, setText] = useState(valueSeconds != null ? formatDuration(valueSeconds) : '');
  const focusedRef = useRef(false);

  useEffect(() => {
    if (!focusedRef.current) {
      setText(valueSeconds != null ? formatDuration(valueSeconds) : '');
    }
  }, [valueSeconds]);

  const parsed = text.trim() === '' ? null : parseDuration(text);
  const showError = text.trim() !== '' && parsed === null;

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    const next = e.target.value;
    setText(next);
    onChange(next.trim() === '' ? null : parseDuration(next));
  };

  const handleFocus = () => { focusedRef.current = true; };
  const handleBlur = () => {
    focusedRef.current = false;
    setText(valueSeconds != null ? formatDuration(valueSeconds) : '');
  };

  return (
    <div className="flex flex-col gap-0.5 w-28">
      <label className="text-xs text-gray-500 dark:text-gray-400">{t('common.duration')}</label>
      <input
        type="text"
        inputMode="text"
        placeholder="12:30"
        value={text}
        disabled={disabled}
        onChange={handleChange}
        onFocus={handleFocus}
        onBlur={handleBlur}
        className={[
          'px-2 py-1 text-sm rounded border bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 outline-none transition-colors',
          showError
            ? 'border-red-500 focus:ring-1 focus:ring-red-500'
            : 'border-gray-300 dark:border-gray-600 focus:border-blue-500 focus:ring-1 focus:ring-blue-500',
          disabled ? 'opacity-50 cursor-not-allowed' : '',
        ].join(' ')}
      />
    </div>
  );
}
