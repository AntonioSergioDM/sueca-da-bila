import {ClientEvents} from '@sueca-da-bila/shared/client/ClientEvents';
import useSocketManager from '@/hooks/useSocketManager';

export default function Ping() {
    const {sm} = useSocketManager();
  
    const onPing = () => {
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