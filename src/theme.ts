import { Roboto } from 'next/font/google';
import { createTheme } from '@mui/material/styles';
import { red } from '@mui/material/colors';

export const roboto = Roboto({
  weight: ['300', '400', '500', '700'],
  subsets: ['latin'],
  display: 'swap',
});

// Create a theme instance.
const theme = createTheme({
  components: {
    MuiModal: {
      defaultProps: {
        container: () => document.getElementById('__next'),
      },
    },
    MuiButton: {
      defaultProps: {
        fullWidth: true,
        variant: 'contained',
      },
    },
    MuiTextField: {
      defaultProps: {
        InputLabelProps: {
          shrink: true,
        },
      },
    },
  },
  palette: {
    mode: 'dark',
    primary: {
      main: '#5D0F80',
    },
    secondary: {
      main: '#2C043E',
    },
    error: {
      main: red.A400,
    },
  },
  typography: {
    fontFamily: roboto.style.fontFamily,
  },
});

export default theme;
