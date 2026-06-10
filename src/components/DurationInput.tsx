import { useEffect, useRef, useState, type ChangeEvent } from 'react';
import TextField from '@mui/material/TextField';
import { useTranslation } from '../i18n';
import { formatDuration, parseDuration } from '../utils/format';

interface DurationInputProps {
  /** Current value in seconds, or undefined if unset. */
  valueSeconds?: number;
  disabled?: boolean;
  onChange: (seconds: number | null) => void;
}

export default function DurationInput({ valueSeconds, disabled, onChange }: DurationInputProps) {
  const { t } = useTranslation();
  const [text, setText] = useState(valueSeconds != null ? formatDuration(valueSeconds) : '');
  const focusedRef = useRef(false);

  // Sync from the stored value only when the user is not actively editing,
  // otherwise live commits would overwrite the text mid-typing.
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

  const handleFocus = () => {
    focusedRef.current = true;
  };

  const handleBlur = () => {
    focusedRef.current = false;
    // Normalise the displayed text to the committed value.
    setText(valueSeconds != null ? formatDuration(valueSeconds) : '');
  };

  return (
    <TextField
      size="small"
      label={t('common.duration')}
      placeholder="12:30"
      value={text}
      disabled={disabled}
      error={showError}
      onChange={handleChange}
      onFocus={handleFocus}
      onBlur={handleBlur}
      sx={{ width: 120 }}
      inputProps={{ inputMode: 'text' }}
    />
  );
}
