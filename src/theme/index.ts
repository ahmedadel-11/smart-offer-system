import { createTheme, ThemeOptions } from '@mui/material/styles';

// Color palette from design documentation
const palette = {
  primary: {
    main: '#1976D2',
    light: '#42A5F5',
    dark: '#1565C0',
    contrastText: '#FFFFFF',
  },
  secondary: {
    main: '#9C27B0',
    light: '#BA68C8',
    dark: '#7B1FA2',
    contrastText: '#FFFFFF',
  },
  success: {
    main: '#4CAF50',
    light: '#81C784',
    dark: '#388E3C',
    contrastText: '#FFFFFF',
  },
  warning: {
    main: '#FF9800',
    light: '#FFB74D',
    dark: '#F57C00',
    contrastText: '#000000',
  },
  error: {
    main: '#F44336',
    light: '#E57373',
    dark: '#D32F2F',
    contrastText: '#FFFFFF',
  },
  info: {
    main: '#2196F3',
    light: '#64B5F6',
    dark: '#1976D2',
    contrastText: '#FFFFFF',
  },
  grey: {
    50: '#FAFAFA',
    100: '#F5F5F5',
    200: '#EEEEEE',
    300: '#E0E0E0',
    400: '#BDBDBD',
    500: '#9E9E9E',
    600: '#757575',
    700: '#616161',
    800: '#424242',
    900: '#212121',
  },
  background: {
    default: '#F5F5F5',
    paper: '#FFFFFF',
  },
  text: {
    primary: 'rgba(0, 0, 0, 0.87)',
    secondary: 'rgba(0, 0, 0, 0.6)',
    disabled: 'rgba(0, 0, 0, 0.38)',
  },
  divider: 'rgba(0, 0, 0, 0.12)',
};

// Panel item type colors (used in drag-drop zones)
export const panelItemTypeColors = {
  incoming: {
    main: '#4CAF50',
    light: '#E8F5E9',
    border: '#A5D6A7',
  },
  outgoing: {
    main: '#2196F3',
    light: '#E3F2FD',
    border: '#90CAF9',
  },
  enclosure: {
    main: '#FF9800',
    light: '#FFF3E0',
    border: '#FFCC80',
  },
  busbarAndCables: {
    main: '#9C27B0',
    light: '#F3E5F5',
    border: '#CE93D8',
  },
  unassigned: {
    main: '#9E9E9E',
    light: '#FAFAFA',
    border: '#E0E0E0',
  },
};

// Status colors
export const statusColors = {
  Draft: { main: '#9E9E9E', light: '#F5F5F5' },
  Pending: { main: '#FF9800', light: '#FFF3E0' },
  Approved: { main: '#4CAF50', light: '#E8F5E9' },
  Rejected: { main: '#F44336', light: '#FFEBEE' },
  Completed: { main: '#1976D2', light: '#E3F2FD' },
};

const themeOptions: ThemeOptions = {
  palette,
  typography: {
    fontFamily: '"Roboto", "Helvetica", "Arial", sans-serif',
    h1: {
      fontSize: '2.5rem',
      fontWeight: 700,
      lineHeight: 1.2,
    },
    h2: {
      fontSize: '2rem',
      fontWeight: 600,
      lineHeight: 1.3,
    },
    h3: {
      fontSize: '1.75rem',
      fontWeight: 600,
      lineHeight: 1.3,
    },
    h4: {
      fontSize: '1.5rem',
      fontWeight: 600,
      lineHeight: 1.4,
    },
    h5: {
      fontSize: '1.25rem',
      fontWeight: 600,
      lineHeight: 1.4,
    },
    h6: {
      fontSize: '1rem',
      fontWeight: 600,
      lineHeight: 1.5,
    },
    subtitle1: {
      fontSize: '1rem',
      fontWeight: 500,
      lineHeight: 1.5,
    },
    subtitle2: {
      fontSize: '0.875rem',
      fontWeight: 500,
      lineHeight: 1.5,
    },
    body1: {
      fontSize: '1rem',
      lineHeight: 1.5,
    },
    body2: {
      fontSize: '0.875rem',
      lineHeight: 1.5,
    },
    caption: {
      fontSize: '0.75rem',
      lineHeight: 1.5,
    },
    button: {
      textTransform: 'none',
      fontWeight: 600,
    },
  },
  shape: {
    borderRadius: 8,
  },
  shadows: [
    'none',
    '0px 1px 3px rgba(0, 0, 0, 0.08)',
    '0px 2px 6px rgba(0, 0, 0, 0.08)',
    '0px 4px 12px rgba(0, 0, 0, 0.08)',
    '0px 8px 24px rgba(0, 0, 0, 0.08)',
    '0px 12px 36px rgba(0, 0, 0, 0.12)',
    '0px 16px 48px rgba(0, 0, 0, 0.12)',
    '0px 20px 60px rgba(0, 0, 0, 0.16)',
    '0px 24px 72px rgba(0, 0, 0, 0.16)',
    '0px 28px 84px rgba(0, 0, 0, 0.16)',
    '0px 32px 96px rgba(0, 0, 0, 0.16)',
    '0px 36px 108px rgba(0, 0, 0, 0.16)',
    '0px 40px 120px rgba(0, 0, 0, 0.16)',
    '0px 44px 132px rgba(0, 0, 0, 0.16)',
    '0px 48px 144px rgba(0, 0, 0, 0.16)',
    '0px 52px 156px rgba(0, 0, 0, 0.16)',
    '0px 56px 168px rgba(0, 0, 0, 0.16)',
    '0px 60px 180px rgba(0, 0, 0, 0.16)',
    '0px 64px 192px rgba(0, 0, 0, 0.16)',
    '0px 68px 204px rgba(0, 0, 0, 0.16)',
    '0px 72px 216px rgba(0, 0, 0, 0.16)',
    '0px 76px 228px rgba(0, 0, 0, 0.16)',
    '0px 80px 240px rgba(0, 0, 0, 0.16)',
    '0px 84px 252px rgba(0, 0, 0, 0.16)',
    '0px 88px 264px rgba(0, 0, 0, 0.16)',
  ],
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: 8,
          padding: '8px 16px',
          fontWeight: 600,
        },
        contained: {
          boxShadow: '0px 2px 6px rgba(0, 0, 0, 0.08)',
          '&:hover': {
            boxShadow: '0px 4px 12px rgba(0, 0, 0, 0.12)',
          },
        },
        outlined: {
          borderWidth: 2,
          '&:hover': {
            borderWidth: 2,
          },
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          borderRadius: 12,
          boxShadow: '0px 2px 6px rgba(0, 0, 0, 0.08)',
        },
      },
    },
    MuiPaper: {
      styleOverrides: {
        root: {
          borderRadius: 12,
        },
        elevation1: {
          boxShadow: '0px 2px 6px rgba(0, 0, 0, 0.08)',
        },
        elevation2: {
          boxShadow: '0px 4px 12px rgba(0, 0, 0, 0.08)',
        },
      },
    },
    MuiTextField: {
      styleOverrides: {
        root: {
          '& .MuiOutlinedInput-root': {
            borderRadius: 8,
          },
        },
      },
    },
    MuiChip: {
      styleOverrides: {
        root: {
          borderRadius: 6,
          fontWeight: 500,
        },
      },
    },
    MuiTab: {
      styleOverrides: {
        root: {
          textTransform: 'none',
          fontWeight: 500,
          minHeight: 48,
        },
      },
    },
    MuiTableHead: {
      styleOverrides: {
        root: {
          '& .MuiTableCell-root': {
            fontWeight: 600,
            backgroundColor: '#F5F5F5',
          },
        },
      },
    },
    MuiTableCell: {
      styleOverrides: {
        root: {
          padding: '8px 12px',
          '@media (min-width: 600px)': {
            padding: '12px 16px',
          },
        },
      },
    },
    MuiDialog: {
      styleOverrides: {
        paper: {
          borderRadius: 16,
        },
      },
    },
    MuiDrawer: {
      styleOverrides: {
        paper: {
          borderRadius: 0,
        },
      },
    },
    MuiTooltip: {
      defaultProps: {
        enterTouchDelay: 50,
        leaveTouchDelay: 1500,
      },
      styleOverrides: {
        tooltip: {
          borderRadius: 6,
          fontSize: '0.75rem',
        },
      },
    },
    MuiAlert: {
      styleOverrides: {
        root: {
          borderRadius: 8,
        },
      },
    },
    MuiAvatar: {
      styleOverrides: {
        root: {
          fontWeight: 600,
        },
      },
    },
    MuiLinearProgress: {
      styleOverrides: {
        root: {
          borderRadius: 4,
          height: 8,
        },
      },
    },
    MuiBadge: {
      styleOverrides: {
        badge: {
          fontWeight: 600,
        },
      },
    },
    MuiToggleButton: {
      styleOverrides: {
        root: {
          textTransform: 'none',
          fontWeight: 500,
          '&.Mui-selected': {
            fontWeight: 600,
          },
        },
      },
    },
  },
};

export const theme = createTheme(themeOptions);

export default theme;
