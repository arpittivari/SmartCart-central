import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import './index.css';
import { AuthProvider } from './contexts/AuthContext';
import { ThemeProvider } from '@mui/material/styles'; // 👈 Import ThemeProvider
import theme from './styles/theme'; // 👈 Import our custom theme
import { NotificationProvider } from './contexts/NotificationContext';
ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <ThemeProvider theme={theme}> {/* 👈 Wrap everything in the ThemeProvider */}
      <AuthProvider>
         <NotificationProvider>
          <App />
        </NotificationProvider>
      </AuthProvider>
    </ThemeProvider>
  </React.StrictMode>
);
       