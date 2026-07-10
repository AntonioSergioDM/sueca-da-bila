import Link from 'next/link';
import { motion } from 'framer-motion';

import {
  Button, Box, Container, Typography,
} from '@mui/material';

import { SiteRoute } from '@/shared/Routes';

import Layout from '../components/Layout';

const Home = () => (
  <Box
    className="casino-lights"
    sx={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      position: 'relative',
      overflow: 'hidden',
    }}
  >
    {/* Animated background elements */}
    <Box
      sx={{
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        background: 'radial-gradient(circle at 20% 50%, rgba(147, 51, 234, 0.1) 0%, transparent 50%), radial-gradient(circle at 80% 50%, rgba(147, 51, 234, 0.1) 0%, transparent 50%)',
        animation: 'pulse-glow 4s ease-in-out infinite',
      }}
    />

    <Container maxWidth="sm">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
      >
        <Layout>
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.2, duration: 0.5, type: 'spring' }}
          >
            <Typography
              variant="h3"
              sx={{
                mb: 4,
                textAlign: 'center',
                fontWeight: 700,
                color: '#ffd700',
                textShadow: '0 2px 10px rgba(255, 215, 0, 0.5)',
              }}
            >
              Sueca da Bila
            </Typography>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4, duration: 0.5 }}
          >
            <Button
              LinkComponent={Link}
              href={SiteRoute.CreateLobby}
              variant="contained"
              size="large"
              sx={{
                background: 'linear-gradient(135deg, #9333ea 0%, #7c3aed 100%)',
                color: 'white',
                fontSize: '1.1rem',
                fontWeight: 600,
                padding: '16px 48px',
                borderRadius: '12px',
                textTransform: 'uppercase',
                letterSpacing: '1px',
                boxShadow: '0 8px 24px rgba(147, 51, 234, 0.4), inset 0 1px 0 rgba(255,255,255,0.2)',
                border: '2px solid rgba(255, 255, 255, 0.1)',
                transition: 'all 0.3s ease',
                '&:hover': {
                  background: 'linear-gradient(135deg, #a855f7 0%, #9333ea 100%)',
                  boxShadow: '0 12px 32px rgba(147, 51, 234, 0.6), inset 0 1px 0 rgba(255,255,255,0.3)',
                  transform: 'translateY(-2px)',
                },
                '&:active': {
                  transform: 'translateY(0)',
                },
              }}
            >
              Create Lobby
            </Button>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5, duration: 0.5 }}
          >
            <Button
              LinkComponent={Link}
              href={SiteRoute.JoinLobby}
              variant="outlined"
              size="large"
              sx={{
                color: '#9333ea',
                fontSize: '1.1rem',
                fontWeight: 600,
                padding: '16px 48px',
                borderRadius: '12px',
                textTransform: 'uppercase',
                letterSpacing: '1px',
                border: '2px solid #9333ea',
                backgroundColor: 'rgba(147, 51, 234, 0.05)',
                boxShadow: '0 4px 12px rgba(147, 51, 234, 0.2)',
                transition: 'all 0.3s ease',
                '&:hover': {
                  backgroundColor: 'rgba(147, 51, 234, 0.15)',
                  border: '2px solid #a855f7',
                  boxShadow: '0 6px 20px rgba(147, 51, 234, 0.4)',
                  transform: 'translateY(-2px)',
                },
                '&:active': {
                  transform: 'translateY(0)',
                },
              }}
            >
              Join Lobby
            </Button>
          </motion.div>
        </Layout>
      </motion.div>
    </Container>
  </Box>
);

export default Home;
