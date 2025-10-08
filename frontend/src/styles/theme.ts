import { createTheme, alpha } from '@mui/material/styles'; // 👈 Make sure 'alpha' is imported

const theme = createTheme({
  palette: {
    mode: 'dark',
    primary: {
      main: '#4dd0e1',
    },
    secondary: {
      main: '#f5365c',
    },
    background: {
      default: '#022d4bff',
      paper: '#001d3d',
    },
    text: {
      primary: '#e9ecef',
      secondary: '#adb5bd',
    },
    divider: 'rgba(255, 255, 255, 0.12)',
  },
  typography: {
    fontFamily: '"Poppins", sans-serif',
    h4: { fontWeight: 600 },
    h6: { fontWeight: 600 },
  },
  shape: {
    borderRadius: 8,
  },
  components: {
    MuiAppBar: {
      styleOverrides: {
        root: {
          background: '#001d3d',
          boxShadow: 'none',
        },
      },
    },
    MuiDrawer: {
      styleOverrides: {
        paper: {
          background: '#001d3d',
          borderRight: 'none',
        },
      },
    },
    MuiButton: {
      styleOverrides: {
        root: {
          textTransform: 'none',
          fontWeight: 'bold',
        },
        // 👇 FIX: Removed the complex callback to prevent the type error
        containedPrimary: {
          boxShadow: '0 4px 14px 0 rgba(77, 208, 225, 0.3)', // Using a static shadow
          '&:hover': {
            boxShadow: 'none',
          },
        },
      },
    },
    MuiPaper: {
      styleOverrides: {
        root: {
          backgroundImage: 'none',
          boxShadow: '0 0 2rem 0 rgba(0,0,0, .15)',
        },
      },
    },
    MuiTableCell: {
      styleOverrides: {
        head: {
          fontWeight: 'bold',
          color: '#adb5bd',
          textTransform: 'uppercase',
          fontSize: '0.75rem',
        },
      },
    },
    MuiListItemButton: {
      styleOverrides: {
        root: {
          color: '#adb5bd',
          margin: '4px 8px',
          borderRadius: 6,
          '&.Mui-selected': {
            color: '#ffffff',
            backgroundColor: alpha('#4dd0e1', 0.1),
            '& .MuiListItemIcon-root': {
              color: '#ffffff',
            },
            '&::before': {
              content: '""',
              position: 'absolute',
              left: 0,
              top: '15%',
              bottom: '15%',
              width: '3px',
              backgroundColor: '#4dd0e1',
              borderRadius: '3px',
            },
          },
          '&:hover': {
            backgroundColor: 'rgba(255, 255, 255, 0.05)',
          },
        },
      },
    },
    MuiListItemIcon: {
      styleOverrides: {
        root: {
          color: '#adb5bd',
        },
      },
    },
  },
});

export default theme;