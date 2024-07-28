import '../index.css';
import Head from 'next/head';
import type { AppProps } from 'next/app';
import { SnackbarProvider } from 'notistack';
import { Provider as ReduxProvider } from 'react-redux';

import CssBaseline from '@mui/material/CssBaseline';
import { ThemeProvider } from '@mui/material/styles';
import { AppCacheProvider } from '@mui/material-nextjs/v14-pagesRouter';

import { reduxWrapper } from '@/client/redux/store';
import { useSocket } from '@/client/tools/useSocket';

import theme from '../theme';

const MyApp = ({ Component, ...rest }: AppProps) => {
  const { store, props } = reduxWrapper.useWrappedStore(rest);

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
          <ReduxProvider store={store}>
            <Component {...props.pageProps} />
          </ReduxProvider>
        </SnackbarProvider>
      </ThemeProvider>
    </AppCacheProvider>
  );
};

export default MyApp;
