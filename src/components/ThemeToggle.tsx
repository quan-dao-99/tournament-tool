import IconButton from '@mui/material/IconButton';
import Tooltip from '@mui/material/Tooltip';
import Brightness4Icon from '@mui/icons-material/Brightness4';
import Brightness7Icon from '@mui/icons-material/Brightness7';
import { useThemeMode } from '../context/ThemeContext';
import { useTranslation } from '../i18n';

export default function ThemeToggle() {
  const { mode, toggleMode } = useThemeMode();
  const { t } = useTranslation();
  const label = mode === 'light' ? t('theme.toDark') : t('theme.toLight');

  return (
    <Tooltip title={label}>
      <IconButton color="inherit" onClick={toggleMode} aria-label={label}>
        {mode === 'light' ? <Brightness4Icon /> : <Brightness7Icon />}
      </IconButton>
    </Tooltip>
  );
}
