import { IconButton } from '@mui/material';
import { VolumeOff, VolumeUp } from '@mui/icons-material';
import { useSoundState } from '@/client/tools/useSound';

export const SoundBtn = () => {
  const [muted, toggleMute] = useSoundState();

  return (
    <IconButton onClick={toggleMute}>
      {muted ? <VolumeOff /> : <VolumeUp />}
    </IconButton>
  );
};
