import Link from 'next/link';

import { Button } from '@mui/material';

import { SiteRoute } from '@/shared/Routes';

import Layout from '../components/Layout';

const Home = () => (
  <Layout>
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
  </Layout>
);

export default Home;
