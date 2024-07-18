import { Server } from 'Socket.IO'
import { ClientToServerEvents, InterServerEvents, ServerToClientEvents, SocketData } from '../../shared/server/SocketTypes';

let lobbies: Array<Object>;

const SocketHandler = (_req, res) => {
  if (res.socket!.server.io) {
    console.log('Socket is already running');
    res.end();
    return;
  }

  console.log('Socket is initializing');
  const io = new Server<
    ClientToServerEvents,
    ServerToClientEvents,
    InterServerEvents,
    SocketData
  >(
    res.socket!.server,
    {
      path: '/api/socket',
      addTrailingSlash: false,
    },
  );

  io.on('connection', (socket) => {
    const clientId = socket.id;
    console.log('A client connected');
    console.log(`A client connected. ID: ${clientId}`);

    socket.on('joinLobby', (lobbyHash) => {
      console.log('Joined Lobby: ' + lobbyHash);

      socket.emit('lobbyJoined');
    });
  })
  res.socket.server.io = io;
  res.end();
}



export default SocketHandler