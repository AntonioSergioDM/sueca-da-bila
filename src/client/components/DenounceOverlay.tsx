import { Box, Button, Modal } from '@mui/material';

type LayoutProps = {
  open: boolean;
  playerLeft: { name: string; index: number };
  playerRight: { name: string; index: number };
  onClose: () => void;
  denounce: (idx: number) => void;
};

const DenounceOverlay = ({
  open, onClose, denounce, playerLeft, playerRight,
}: LayoutProps) => {
  const denounceThem = (idx: number) => (() => {
    denounce(idx);
    onClose();
  });

  return (
    <Modal
      className="flex items-center justify-center"
      open={open}
      onClose={onClose}
      aria-labelledby="Someone cheated"
      aria-describedby="Denounce them!"
    >
      <Box className="w-fit bg-black p-4 border border-solid border-red-600">
        <h2 id="child-modal-title">Did you see a cheater?</h2>
        <p id="child-modal-description">
          If you are right you will win 4 games.
          <br />
          However, if you are wrong your opponents will win 1 game.
        </p>
        <div className="flex flex-row gap-4">
          <Button onClick={denounceThem(playerLeft.index)} color="primary">
            {`I saw ${playerLeft.name}!`}
            <br />
            Shoot left!
          </Button>
          <Button onClick={onClose} color="warning">
            I&apos;m not sure...
            <br />
            Let it slide.
          </Button>
          <Button onClick={denounceThem(playerRight.index)} color="primary">
            {`I saw ${playerRight.name}!`}
            <br />
            Shoot right!
          </Button>
        </div>
      </Box>
    </Modal>
  );
};

export default DenounceOverlay;
