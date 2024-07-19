import Image from 'next/image';
import type { ReactNode } from 'react';

import { Stack } from '@mui/material';

import logo from '@/public/favicon.ico';

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
    <Image alt="Logo" src={logo} priority width={200} height={200} />

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
