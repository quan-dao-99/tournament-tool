import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';
import { LanguageProvider } from './i18n';
import { ThemeModeProvider } from './context/ThemeContext';
import { TournamentProvider } from './context/TournamentContext';

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <LanguageProvider>
      <ThemeModeProvider>
        <TournamentProvider>
          <App />
        </TournamentProvider>
      </ThemeModeProvider>
    </LanguageProvider>
  </React.StrictMode>,
);
