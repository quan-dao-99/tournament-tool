import ToggleButton from '@mui/material/ToggleButton';
import ToggleButtonGroup from '@mui/material/ToggleButtonGroup';
import type { MouseEvent } from 'react';
import { useTranslation } from '../i18n';
import type { Language } from '../types';

export default function LanguageSwitcher() {
  const { language, setLanguage } = useTranslation();

  const handleChange = (_e: MouseEvent<HTMLElement>, value: Language | null) => {
    if (value) {
      setLanguage(value);
    }
  };

  return (
    <ToggleButtonGroup
      size="small"
      exclusive
      value={language}
      onChange={handleChange}
      color="primary"
      sx={{ bgcolor: 'background.paper' }}
    >
      <ToggleButton value="en">EN</ToggleButton>
      <ToggleButton value="vi">VI</ToggleButton>
    </ToggleButtonGroup>
  );
}
