import Image from 'next/image';
import type { ReactNode } from 'react';

import { Stack } from '@mui/material';

import logo from '@/public/favicon.ico';
import Link from 'next/link';
import { SiteRoute } from '@/shared/Routes';

type LayoutProps = {
  children: ReactNode;
};

const Layout = ({ children }: LayoutProps) => (
  <Stack
    gap={10}
    useFlexGap
    maxWidth="sm"
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
      maxWidth={350}
      direction="column"
    >
      {children}
    </Stack>
  </Stack>
);

export default Layout;
