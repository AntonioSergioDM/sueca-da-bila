import { Box, Typography } from '@mui/material';

const Footer = () => (
  <Box sx={{ mt: 4 }}>
    <Typography
      variant="body2"
      align="center"
      sx={{
        color: 'rgba(255, 215, 0, 0.6)',
        fontWeight: 500,
        letterSpacing: '0.5px',
      }}
    >
      {'Sueca da Bila © '}
      {new Date().getFullYear()}
    </Typography>
    <Typography
      variant="caption"
      align="center"
      sx={{
        display: 'block',
        color: 'rgba(255, 255, 255, 0.4)',
        mt: 0.5,
      }}
    >
      {`Build ${process.env.BUILD_DATETIME}`}
    </Typography>
  </Box>
);

export default Footer;
