import React from 'react';
import { Box, CssBaseline, ThemeProvider, createTheme } from '@mui/material';
import { WebhookProvider } from './contexts/WebhookContext';
import { WebhookList } from './components/WebhookList';
import { WebhookDetails } from './components/WebhookDetails';
import { ThemeToggle } from './components/ThemeToggle';

const getTheme = (mode: 'light' | 'dark') => createTheme({
  palette: {
    mode,
    ...(mode === 'dark' 
      ? {
          background: {
            default: '#1e1e1e',
            paper: '#2d2d2d',
          },
          primary: {
            main: '#4a9eff',
          },
          text: {
            primary: '#ffffff',
            secondary: '#999999',
          },
        }
      : {
          background: {
            default: '#f5f5f5',
            paper: '#ffffff',
          },
          primary: {
            main: '#2979ff',
          },
          text: {
            primary: '#1a1a1a',
            secondary: '#666666',
          },
        }
    ),
  },
  typography: {
    fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif',
  },
  components: {
    MuiCssBaseline: {
      styleOverrides: {
        body: {
          margin: 0,
          padding: 0,
          minHeight: '100vh',
        },
      },
    },
  },
});

function App() {
  const [mode, setMode] = React.useState<'light' | 'dark'>(
    () => (localStorage.getItem('theme') as 'light' | 'dark') || 'dark'
  );
  
  const theme = React.useMemo(() => getTheme(mode), [mode]);

  React.useEffect(() => {
    localStorage.setItem('theme', mode);
  }, [mode]);

  const toggleTheme = () => {
    setMode((prevMode) => (prevMode === 'light' ? 'dark' : 'light'));
  };

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <WebhookProvider>
        <Box sx={{ display: 'flex', minHeight: '100vh', bgcolor: 'background.default' }}>
          <Box sx={{ position: 'fixed', top: 16, right: 16, zIndex: 1200 }}>
            <ThemeToggle onToggle={toggleTheme} />
          </Box>
          <WebhookList />
          <Box sx={{ flex: 1, overflowX: 'hidden' }}>
            <WebhookDetails />
          </Box>
        </Box>
      </WebhookProvider>
    </ThemeProvider>
  );
}

export default App;
