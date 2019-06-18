import {Socket} from 'socket.io';
import {SocketEvent} from '../network';


export interface IPlayerState {
    playerName: string;
    playerId: string;
}


export class PlayerBase {

    constructor(public name: string, private socket: Socket) {

    }

    public send(type: SocketEvent, data: any) {
        this.socket.emit(type, data);
    }

    public getPlayerId(): string {
        return this.socket.id;
    }

    public getPlayerState(): IPlayerState {
        return {playerName: this.name, playerId: this.getPlayerId()};
    }
    public disconnect() {
        this.socket.disconnect();
    }
}
