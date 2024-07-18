import { Server } from 'Socket.IO'
import { ClientMessages } from '../../shared/client/ClientMessages';
import { ServerMessages } from '../../shared/server/ServerMessages';


let lobbies:Array<Object>;

const SocketHandler = (req, res) => {
  if (res.socket.server.io) {
    console.log('Socket is already running');
  } else {
    console.log('Socket is initializing');
    const io = new Server(res.socket.server);
    io.on('connection', (socket) => {
        socket.on(ClientMessages.joinLobby, (args) => {
            console.log('receive a Ping;');
            console.log('Joined Lobby: ' + args);
            
            socket.emit(ServerMessages.lobbyJoined);
        })
    })
    res.socket.server.io = io;
  }
  res.end();
}



export default SocketHandler