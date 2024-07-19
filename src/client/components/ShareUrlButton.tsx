import { useCallback, useMemo } from 'react';

import { CopyAll } from '@mui/icons-material';
import { Box, IconButton } from '@mui/material';

import { SiteRoute } from '@/shared/Routes';

type ShareUrlButtonProps = {
  url: string;
};

const ShareUrlButton = ({ url }: ShareUrlButtonProps) => {
  const shareURL = useMemo(() => (
    `${process.env.NEXT_PUBLIC_URL}${SiteRoute.JoinLobby}/${url}`
  ), [url]);

  const onCopy = useCallback(async () => {
    await navigator.clipboard.writeText(shareURL);
  }, [shareURL]);

  return (
    <Box
      component="div"
      sx={{
        display: 'flex',
        p: 1,
        gap: 1,
        alignItems: 'center',
        bgcolor: (theme) => (theme.palette.mode === 'dark' ? '#101010' : '#fff'),
        color: (theme) => (theme.palette.mode === 'dark' ? 'grey.300' : 'grey.800'),
        border: '1px solid',
        borderColor: (theme) => (theme.palette.mode === 'dark' ? 'grey.800' : 'grey.300'),
        borderRadius: 2,
        fontSize: '0.875rem',
        fontWeight: '700',
      }}
    >
      Share link

      <IconButton onClick={onCopy}><CopyAll /></IconButton>
    </Box>
  );
};

export default ShareUrlButton;
