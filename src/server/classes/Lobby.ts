import { v4 as uuid } from 'uuid';
import type Player from './Player';

export default class Lobby {
    hash:string;

    players:Array<Player> = [];

    results: Array<number> = [];
    // game:Game;

    constructor() {
        this.hash = uuid();
    }

    addPlayer(player:Player): boolean {
        if (this.players.length >= 4) {
            return false;
        }

        this.players.push(player);

        // debug
        console.log('Jogadores no Lobby:');
        this.players.forEach((player) => {
            console.log(player.name);
        });

        return true;
    }

    startGame() {
        // this.game.start();
    }
}
