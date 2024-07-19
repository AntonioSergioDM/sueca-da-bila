import type { ReactNode } from 'react';

import Link from 'next/link';
import Image from 'next/image';

import { Box, Stack, Typography } from '@mui/material';

import logo from '@/public/favicon.ico';
import { SiteRoute } from '@/shared/Routes';

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
    <Box>
      <Typography variant="body2" color="text.secondary" align="center">
        {'Sueca da Bila © '}
        {new Date().getFullYear()}
      </Typography>
      <Typography variant="body2" color="text.secondary" align="center">
        {`Build ${process.env.BUILD_DATETIME}`}
      </Typography>
    </Box>
  </Stack>
);

export default Layout;
