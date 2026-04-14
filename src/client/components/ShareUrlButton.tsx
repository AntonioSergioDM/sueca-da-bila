import { useCallback, useMemo } from 'react';
import { motion } from 'framer-motion';

import { CopyAll, IosShare } from '@mui/icons-material';
import {
  Card, IconButton, Typography, Box,
} from '@mui/material';

import { SiteRoute } from '@/shared/Routes';
import { useSnackbar } from 'notistack';

type ShareUrlButtonProps = {
  lobbyHash: string;
};

const ShareUrlButton = ({ lobbyHash }: ShareUrlButtonProps) => {
  const shareURL = useMemo(() => (
    `${process.env.NEXT_PUBLIC_URL}${SiteRoute.JoinLobby}/${lobbyHash}`
  ), [lobbyHash]);

  const { enqueueSnackbar } = useSnackbar();
  const onCopy = useCallback(async () => {
    let success = false;
    if (navigator.clipboard) {
      await navigator.clipboard.writeText(shareURL);
      success = true;
    }
    enqueueSnackbar({
      variant: success ? 'success' : 'error',
      message: success ? 'Copied to clipboard!' : 'Failed to copy to clipboard!',
      autoHideDuration: 2000,
    });
  }, [enqueueSnackbar, shareURL]);

  const onShare = useCallback(async () => {
    await navigator.share({
      url: shareURL,
      title: 'Sueca da Bila',
      text: 'Come and play!',
    });
  }, [shareURL]);

  return (
    <motion.div
      initial={{ y: 20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ delay: 0.1, duration: 0.5 }}
    >
      <Card
        sx={{
          p: 2,
          gap: 1,
          width: '100%',
          display: 'flex',
          flexDirection: 'row',
          alignItems: 'center',
          background: '',
          backdropFilter: 'blur(12px)',
          border: '2px solid rgba(147, 51, 234, 0.3)',
          borderRadius: 3,
          boxShadow: '0 4px 12px rgba(147, 51, 234, 0.2)',
          transition: 'all 0.3s ease',
          '&:hover': {
            boxShadow: '0 6px 20px rgba(147, 51, 234, 0.3)',
          },
        }}
      >
        <Box
          sx={{
            flexGrow: 1,
            background: 'rgba(0, 0, 0, 0.3)',
            borderRadius: 2,
            px: 2,
            py: 1,
          }}
        >
          <Typography
            sx={{
              fontFamily: 'monospace',
              fontSize: '0.9rem',
              wordBreak: 'break-all',
            }}
          >
            {shareURL}
          </Typography>
        </Box>

        <IconButton
          onClick={onCopy}
          sx={{
            background: 'linear-gradient(135deg, #9333ea 0%, #7c3aed 100%)',
            color: 'white',
            '&:hover': {
              background: 'linear-gradient(135deg, #a855f7 0%, #9333ea 100%)',
              transform: 'scale(1.05)',
            },
            transition: 'all 0.2s ease',
          }}
        >
          <CopyAll />
        </IconButton>

        <IconButton
          onClick={onShare}
          sx={{
            background: 'linear-gradient(135deg, #9333ea 0%, #7c3aed 100%)',
            color: 'white',
            '&:hover': {
              background: 'linear-gradient(135deg, #a855f7 0%, #9333ea 100%)',
              transform: 'scale(1.05)',
            },
            transition: 'all 0.2s ease',
          }}
        >
          <IosShare />
        </IconButton>
      </Card>
    </motion.div>
  );
};

export default ShareUrlButton;
