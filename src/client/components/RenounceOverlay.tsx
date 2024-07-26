import type { Card } from '@/shared/Card';
import { Box, Button, Modal } from '@mui/material';

type LayoutProps = {
  card: Card | null;
  onClose: () => void;
  onPlayCard: (card: Card, allowRenounce?: boolean) => void;
};

const RenounceOverlay = ({ card, onClose, onPlayCard }: LayoutProps) => {
  const doRenounce = () => {
    if (card !== null) {
      onPlayCard(card, true);
    }
    onClose();
  };

  return (
    <Modal
      className="flex items-center justify-center"
      open={!!card}
      onClose={onClose}
      aria-labelledby="Play anyway"
      aria-describedby="Do you want to cheat?"
    >
      <Box className="w-fit bg-black p-4 border border-solid border-red-600">
        <h2 id="child-modal-title">You must assist!</h2>
        <p id="child-modal-description">
          If the other team notices, you will lose 4 games.
        </p>
        <div className="flex flex-row gap-4">
          <Button onClick={doRenounce} color="warning">
            Fuck it!
            <br />
            I will risk it!
          </Button>
          <Button onClick={onClose} color="primary">Let me think again...</Button>
        </div>
      </Box>
    </Modal>
  );
};

export default RenounceOverlay;
