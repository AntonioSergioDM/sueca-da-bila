import type { ReactNode } from 'react';

import Link from 'next/link';
import Image from 'next/image';

import { Stack } from '@mui/material';

import logo from '@/public/favicon.ico';
import { SiteRoute } from '@/shared/Routes';

import Footer from './Footer';

type LayoutProps = {
  children: ReactNode;
};

const Layout = ({ children }: LayoutProps) => (
  <Stack
    gap={10}
    useFlexGap
    margin="16px auto"
    direction="column"
    alignItems="center"
    justifyContent="center"
  >
    <Link href={SiteRoute.Home}>
      <Image alt="Logo" src={logo} priority width={200} height={200} />
    </Link>

    <Stack
      gap={3}
      useFlexGap
      direction="column"
      alignItems="center"
    >
      {children}
    </Stack>

    <Footer />
  </Stack>
);

export default Layout;
