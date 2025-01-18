import { createTheme } from '@mui/material/styles';

const theme = createTheme({
  palette: {
    primary: {
      main: '#7C4DFF', // Purple
      light: '#B47CFF',
      dark: '#5E35B1',
    },
    secondary: {
      main: '#9575CD', // Soft Purple
      light: '#B39DDB',
      dark: '#7E57C2',
    },
    background: {
      default: '#FFFFFF',
      paper: '#F5F5F5',
    },
    text: {
      primary: '#424242',
      secondary: '#757575',
    },
    grey: {
      50: '#FAFAFA',
      100: '#F5F5F5',
      200: '#EEEEEE',
      300: '#E0E0E0',
      400: '#BDBDBD',
      500: '#9E9E9E',
    }
  },
  components: {
    MuiAppBar: {
      styleOverrides: {
        root: {
          backgroundColor: '#7C4DFF',
        },
      },
    },
    MuiButton: {
      styleOverrides: {
        contained: {
          backgroundColor: '#7C4DFF',
          '&:hover': {
            backgroundColor: '#5E35B1',
          },
        },
        outlined: {
          borderColor: '#7C4DFF',
          color: '#7C4DFF',
          '&:hover': {
            borderColor: '#5E35B1',
            backgroundColor: 'rgba(124, 77, 255, 0.04)',
          },
        },
      },
    },
    MuiCheckbox: {
      styleOverrides: {
        root: {
          color: '#7C4DFF',
          '&.Mui-checked': {
            color: '#7C4DFF',
          },
        },
      },
    },
    MuiTableHead: {
      styleOverrides: {
        root: {
          backgroundColor: '#F5F5F5',
        },
      },
    },
    MuiTableCell: {
      styleOverrides: {
        root: {
          borderBottom: '1px solid #E0E0E0',
        },
        head: {
          fontWeight: 'bold',
          color: '#424242',
        },
      },
    },
  },
});

export default theme;

