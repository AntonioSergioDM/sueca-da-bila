import useSocketManager from '@/hooks/useSocketManager';

export enum ClientEvents
{
  // General
  Ping = 'client.ping',

  // Lobby
  LobbyCreate = 'client.lobby.create',
  LobbyJoin = 'client.lobby.join',
  LobbyLeave = 'client.lobby.leave',

  // Game
  GameRevealCard = 'client.game.reveal_card',
}

export default function Ping() {
    const {sm} = useSocketManager();
  
    const onPing = () => {
      console.log('I am trying to Ping...');
      
      sm.emit({
        event: ClientEvents.Ping,
      });
    };
  
    return (
      <div>
        <button onClick={onPing}>ping</button>
      </div>
    )
  }