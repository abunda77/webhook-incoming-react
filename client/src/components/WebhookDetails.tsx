import React from 'react';
import {
  Box,
  Typography,
  IconButton,
  Tooltip,
  Tabs,
  Tab,
  useTheme,
} from '@mui/material';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import OpenInNewIcon from '@mui/icons-material/OpenInNew';
import { useWebhook } from '../contexts/WebhookContext';

export const WebhookDetails: React.FC = () => {
  const { selectedWebhook } = useWebhook();
  const [tabValue, setTabValue] = React.useState(0);
  const theme = useTheme();
  const isDark = theme.palette.mode === 'dark';
  const baseUrl = process.env.NODE_ENV === 'production' 
    ? process.env.REACT_APP_SERVER_URL 
    : process.env.REACT_APP_SERVER_URL_LOCAL || 'http://localhost:5000';

  const handleCopyUrl = () => {
    if (selectedWebhook) {
      const fullUrl = `${baseUrl}${selectedWebhook.url}`;
      navigator.clipboard.writeText(fullUrl);
    }
  };

  if (!selectedWebhook) {
    return (
      <Box sx={{ p: 3, color: 'text.secondary', textAlign: 'center' }}>
        <Typography>Select a webhook to view details</Typography>
      </Box>
    );
  }

  return (
    <Box sx={{ height: '100vh', display: 'flex', flexDirection: 'column' }}>
      {/* Header section */}
      <Box sx={{ p: 3, borderBottom: 1, borderColor: 'divider' }}>
        <Typography variant="h6" sx={{ mb: 2, color: 'primary.main' }}>
          Request Details & Headers
        </Typography>
        <Box sx={{ mb: 3 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
            <Typography 
              variant="caption" 
              sx={{ 
                color: 'primary.main',
                bgcolor: isDark ? 'rgba(74, 158, 255, 0.1)' : 'rgba(41, 121, 255, 0.1)',
                px: 1,
                py: 0.5,
                borderRadius: 1,
                mr: 2
              }}
            >
              POST
            </Typography>
            <Typography 
              variant="body2" 
              sx={{ 
                flex: 1,
                fontFamily: 'monospace',
                color: 'text.primary',
              }}
            >
              {`${baseUrl}${selectedWebhook.url}`}
            </Typography>
            <Tooltip title="Copy URL">
              <IconButton size="small" onClick={handleCopyUrl} sx={{ color: 'text.secondary' }}>
                <ContentCopyIcon fontSize="small" />
              </IconButton>
            </Tooltip>
            <Tooltip title="Open in new tab">
              <IconButton 
                size="small" 
                onClick={() => window.open(`${baseUrl}${selectedWebhook.url}`, '_blank')}
                sx={{ color: 'text.secondary', ml: 1 }}
              >
                <OpenInNewIcon fontSize="small" />
              </IconButton>
            </Tooltip>
          </Box>
        </Box>

        <Tabs 
          value={tabValue} 
          onChange={(_, newValue) => setTabValue(newValue)}
          sx={{
            borderBottom: 1,
            borderColor: 'divider',
            '& .MuiTabs-indicator': {
              backgroundColor: 'primary.main',
            },
          }}
        >
          <Tab 
            label="Raw Content" 
            sx={{ 
              color: 'text.secondary',
              '&.Mui-selected': {
                color: 'primary.main',
              },
            }}
          />
          <Tab 
            label="Headers"
            sx={{ 
              color: 'text.secondary',
              '&.Mui-selected': {
                color: 'primary.main',
              },
            }}
          />
          <Tab 
            label="Query Strings"
            sx={{ 
              color: 'text.secondary',
              '&.Mui-selected': {
                color: 'primary.main',
              },
            }}
          />
        </Tabs>
      </Box>

      {/* Content section */}
      <Box sx={{ flex: 1, overflow: 'auto', bgcolor: 'background.default' }}>
        {selectedWebhook.payloads.map((payload, index) => (
          <Box
            key={index}
            sx={{
              p: 3,
              borderBottom: 1,
              borderColor: 'divider',
              '&:last-child': {
                borderBottom: 'none',
              },
            }}
          >
            <Box sx={{ mb: 2 }}>
              <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                {new Date(payload.timestamp).toLocaleString()}
              </Typography>
            </Box>
            
            {tabValue === 0 && (
              <pre
                style={{
                  margin: 0,
                  padding: 16,
                  backgroundColor: theme.palette.background.paper,
                  borderRadius: 4,
                  color: theme.palette.text.primary,
                  overflow: 'auto',
                  fontSize: '13px',
                  fontFamily: 'monospace',
                }}
              >
                {JSON.stringify(payload.body, null, 2)}
              </pre>
            )}
            
            {tabValue === 1 && (
              <pre
                style={{
                  margin: 0,
                  padding: 16,
                  backgroundColor: theme.palette.background.paper,
                  borderRadius: 4,
                  color: theme.palette.text.primary,
                  overflow: 'auto',
                  fontSize: '13px',
                  fontFamily: 'monospace',
                }}
              >
                {JSON.stringify(payload.headers, null, 2)}
              </pre>
            )}
            
            {tabValue === 2 && (
              <pre
                style={{
                  margin: 0,
                  padding: 16,
                  backgroundColor: theme.palette.background.paper,
                  borderRadius: 4,
                  color: theme.palette.text.primary,
                  overflow: 'auto',
                  fontSize: '13px',
                  fontFamily: 'monospace',
                }}
              >
                {JSON.stringify(payload.query, null, 2)}
              </pre>
            )}
          </Box>
        ))}
      </Box>
    </Box>
  );
};
