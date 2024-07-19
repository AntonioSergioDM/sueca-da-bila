import Link from 'next/link';

import { Button } from '@mui/material';

import { SiteRoute } from '@/shared/Routes';

const Home = () => (
  <>
    <Button
      LinkComponent={Link}
      href={SiteRoute.CreateLobby}
    >
      Create lobby
    </Button>

    <Button
      color="secondary"
      LinkComponent={Link}
      href={SiteRoute.JoinLobby}
    >
      Join lobby
    </Button>
  </>
);

export default Home;
