import React from 'react';
import {
  List,
  ListItem,
  ListItemButton,
  ListItemText,
  Button,
  Box,
  Typography,
  TextField,
  InputAdornment,
  IconButton,
  useTheme,
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import AddIcon from '@mui/icons-material/Add';
import { useWebhook } from '../contexts/WebhookContext';

export const WebhookList: React.FC = () => {
  const { webhooks, createWebhook, selectedWebhook, setSelectedWebhook } = useWebhook();
  const theme = useTheme();
  const isDark = theme.palette.mode === 'dark';

  const handleCreateWebhook = async () => {
    try {
      await createWebhook();
    } catch (error) {
      console.error('Failed to create webhook:', error);
    }
  };

  return (
    <Box 
      sx={{ 
        width: '100%', 
        maxWidth: 360, 
        height: '100vh',
        bgcolor: 'background.default',
        borderRight: 1,
        borderColor: 'divider',
        display: 'flex',
        flexDirection: 'column',
      }}
    >
      <Box sx={{ p: 2, borderBottom: 1, borderColor: 'divider' }}>
        <Typography variant="subtitle2" sx={{ mb: 2, color: 'text.secondary' }}>
          INBOX ({webhooks.length}/100)
        </Typography>
        <TextField
          size="small"
          placeholder="Search Query"
          fullWidth
          sx={{
            mb: 2,
            '& .MuiOutlinedInput-root': {
              '& fieldset': {
                borderColor: 'divider',
              },
              '&:hover fieldset': {
                borderColor: 'primary.main',
              },
              '&.Mui-focused fieldset': {
                borderColor: 'primary.main',
              },
            },
          }}
          InputProps={{
            endAdornment: (
              <InputAdornment position="end">
                <IconButton size="small">
                  <SearchIcon />
                </IconButton>
              </InputAdornment>
            ),
          }}
        />
        <Button
          variant="contained"
          color="primary"
          fullWidth
          onClick={handleCreateWebhook}
          startIcon={<AddIcon />}
          sx={{
            textTransform: 'none',
          }}
        >
          New Webhook
        </Button>
      </Box>
      <List 
        component="nav" 
        aria-label="webhook list"
        sx={{
          overflowY: 'auto',
          flex: 1,
          '&::-webkit-scrollbar': {
            width: '8px',
          },
          '&::-webkit-scrollbar-track': {
            background: 'transparent',
          },
          '&::-webkit-scrollbar-thumb': {
            background: theme.palette.divider,
            borderRadius: '4px',
          },
          '&::-webkit-scrollbar-thumb:hover': {
            background: theme.palette.action.hover,
          },
        }}
      >
        {webhooks.map((webhook) => (
          <ListItem
            key={webhook.id}
            disablePadding
            sx={{
              borderBottom: 1,
              borderColor: 'divider',
              '&:last-child': {
                borderBottom: 'none',
              },
            }}
          >
            <ListItemButton 
              onClick={() => setSelectedWebhook(webhook)}
              selected={selectedWebhook?.id === webhook.id}
              sx={{
                py: 2,
                '&.Mui-selected': {
                  bgcolor: isDark ? 'rgba(255, 255, 255, 0.08)' : 'rgba(0, 0, 0, 0.04)',
                  '&:hover': {
                    bgcolor: isDark ? 'rgba(255, 255, 255, 0.12)' : 'rgba(0, 0, 0, 0.08)',
                  },
                },
                '&:hover': {
                  bgcolor: isDark ? 'rgba(255, 255, 255, 0.04)' : 'rgba(0, 0, 0, 0.02)',
                },
              }}
            >
              <ListItemText
                primary={
                  <Typography variant="body2">
                    {webhook.id}
                  </Typography>
                }
                secondary={
                  <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                    {`${webhook.payloads.length} requests`}
                  </Typography>
                }
              />
            </ListItemButton>
          </ListItem>
        ))}
      </List>
    </Box>
  );
};
