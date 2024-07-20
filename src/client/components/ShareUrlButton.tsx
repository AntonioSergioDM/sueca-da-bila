import { useCallback, useMemo } from 'react';

import { CopyAll } from '@mui/icons-material';
import { Card, IconButton, Typography } from '@mui/material';

import { SiteRoute } from '@/shared/Routes';

type ShareUrlButtonProps = {
  lobbyHash: string;
};

const ShareUrlButton = ({ lobbyHash }: ShareUrlButtonProps) => {
  const shareURL = useMemo(() => (
    `${process.env.NEXT_PUBLIC_URL}${SiteRoute.JoinLobby}/${lobbyHash}`
  ), [lobbyHash]);

  const onCopy = useCallback(async () => {
    await navigator.clipboard.writeText(shareURL);
  }, [shareURL]);

  return (
    <Card
      sx={{
        p: 1,
        gap: 1,
        flexGrow: 1,
        width: '100%',
        paddingLeft: 2,
        display: 'flex',
        direction: 'row',
        alignItems: 'center',
      }}
    >
      <Typography flexGrow={1}>Share link</Typography>

      <IconButton onClick={onCopy}><CopyAll /></IconButton>
    </Card>
  );
};

export default ShareUrlButton;
