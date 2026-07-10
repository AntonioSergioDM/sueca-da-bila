import type { ReactNode } from 'react';
import { motion } from 'framer-motion';

import Link from 'next/link';
import Image from 'next/image';

import { Stack, Box } from '@mui/material';

import logo from '@/public/favicon.ico';
import { SiteRoute } from '@/shared/Routes';

import Footer from './Footer';

type LayoutProps = {
  children: ReactNode;
};

const Layout = ({ children }: LayoutProps) => (
  <Stack
    useFlexGap
    margin="0 auto"
    direction="column"
    alignItems="center"
    justifyContent="center"
    gap={{ xs: 3, sm: 6 }}
    sx={{ position: 'relative', zIndex: 1 }}
  >
    <motion.div
      initial={{ scale: 0.8, opacity: 0, rotateY: -20 }}
      animate={{ scale: 1, opacity: 1, rotateY: 0 }}
      transition={{ duration: 0.8, type: 'spring' }}
      whileHover={{ scale: 1.05 }}
      style={{ cursor: 'pointer' }}
    >
      <Link href={SiteRoute.Home}>
        <Box
          sx={{
            position: 'relative',
            filter: 'drop-shadow(0 8px 24px rgba(147, 51, 234, 0.4))',
            transition: 'filter 0.3s ease',
            '&:hover': {
              filter: 'drop-shadow(0 12px 32px rgba(147, 51, 234, 0.6))',
            },
            '& img': {
              height: 'auto !important',
              width: 'auto !important',
              maxWidth: '100%',
              maxHeight: { xs: 120, sm: 160, md: 200 },
            },
          }}
        >
          <Image alt="Logo" src={logo} priority width={200} height={200} />
        </Box>
      </Link>
    </motion.div>

    <Stack
      gap={3}
      useFlexGap
      direction="column"
      alignItems="center"
      sx={{ width: '100%' }}
    >
      {children}
    </Stack>

    <Footer />
  </Stack>
);

export default Layout;
