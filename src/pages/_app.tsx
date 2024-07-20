import '../index.css';
import Head from 'next/head';
import type { AppProps } from 'next/app';
import { SnackbarProvider } from 'notistack';

import CssBaseline from '@mui/material/CssBaseline';
import { ThemeProvider } from '@mui/material/styles';
import { AppCacheProvider } from '@mui/material-nextjs/v14-pagesRouter';

import { useSocket } from '@/client/tools/useSocket';

import theme from '../theme';

const MyApp = (props: AppProps) => {
  const { Component, pageProps } = props;

  // every page using socket to initialize it
  useSocket();

  return (
    <AppCacheProvider {...props}>
      <Head>
        <title>SUECA DA BILA</title>
        <meta name="viewport" content="initial-scale=1, width=device-width" />
      </Head>

      <ThemeProvider theme={theme}>
        <CssBaseline />

        <SnackbarProvider>
          <Component {...pageProps} />
        </SnackbarProvider>
      </ThemeProvider>
    </AppCacheProvider>
  );
};

export default MyApp;
