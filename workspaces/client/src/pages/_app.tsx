import "@/styles/globals.css";

import { AppProps } from 'next/app';
import Head from 'next/head';
import Script from 'next/script';
import { RecoilRoot } from 'recoil';
import { SocketManagerProvider } from '@/components/websocket/SocketManagerProvider';
import { useRouter } from 'next/router';
import { useEffect } from 'react';

export default function _App(props: AppProps) {
  const {Component, pageProps} = props;
  const router = useRouter();

  return (
    <RecoilRoot>
      <Head>
        <title>Memory Cards</title>
        <meta name="viewport" content="minimum-scale=1, initial-scale=1, width=device-width"/>
        <meta name="description" content="Memory cards game"/>
        <link rel="icon" href="/cards.svg"/>
      </Head>


      <SocketManagerProvider>
        <Component {...pageProps} />
      </SocketManagerProvider>
    </RecoilRoot>
  );
}
