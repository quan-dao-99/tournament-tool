import { createTheme, type Theme } from '@mui/material/styles';
import type { ThemeMode } from './types';

export function buildTheme(mode: ThemeMode): Theme {
  return createTheme({
    palette: {
      mode,
      primary: { main: mode === 'light' ? '#1565c0' : '#90caf9' },
      secondary: { main: mode === 'light' ? '#7b1fa2' : '#ce93d8' },
      success: { main: mode === 'light' ? '#2e7d32' : '#66bb6a' },
    },
    shape: { borderRadius: 10 },
    typography: {
      h4: { fontWeight: 700 },
      h5: { fontWeight: 700 },
      h6: { fontWeight: 600 },
    },
  });
}
