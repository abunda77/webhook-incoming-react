import React from 'react';
import { IconButton, Tooltip } from '@mui/material';
import Brightness4Icon from '@mui/icons-material/Brightness4';
import Brightness7Icon from '@mui/icons-material/Brightness7';
import { useTheme } from '@mui/material/styles';

interface ThemeToggleProps {
  onToggle: () => void;
}

export const ThemeToggle: React.FC<ThemeToggleProps> = ({ onToggle }) => {
  const theme = useTheme();
  const isDark = theme.palette.mode === 'dark';

  return (
    <Tooltip title={`Switch to ${isDark ? 'light' : 'dark'} mode`}>
      <IconButton
        onClick={onToggle}
        sx={{
          color: isDark ? '#fff' : '#000',
          '&:hover': {
            backgroundColor: isDark ? 'rgba(255, 255, 255, 0.08)' : 'rgba(0, 0, 0, 0.08)',
          },
        }}
      >
        {isDark ? <Brightness7Icon /> : <Brightness4Icon />}
      </IconButton>
    </Tooltip>
  );
};
