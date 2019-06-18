import {IPlayerState, PlayerBase} from './PlayerBase';
import {IGame} from './Game';
import {SocketEvent} from '../network';
import {Socket} from 'socket.io';
import {gameFactory} from '../games';


export interface IFullRoomState {
    roomName: string;
    players: IPlayerState[];
    gameState: any;
}

export class Room {

    private players: PlayerBase[];

    private game: IGame;

    constructor(private gameType: string, private roomName: string, private socket: Socket) {
        this.players = [];
        this.game = gameFactory(gameType, this);
    }

    public getRoomId(): string {
        return this.socket.id;
    }

    public getRoomName(): string {
        return this.roomName;
    }

    public onPlayerEnter(player: PlayerBase) {
        this.players.push(player);
        this.game.onPlayerEnter(player);
        this.sendRoomUpdate();
        this.broadcastFullUpdate();
    }

    public onRoomClose() {
        this.game.onRoomClose();
    }

    public onPlayerLeave(player: PlayerBase) {
        this.game.onPlayerLeave(this.players.filter((p) => player.getPlayerId() === p.getPlayerId())[0]);

        this.players = this.players.filter((p) => p.getPlayerId() === player.getPlayerId());
        this.broadcastFullUpdate();
        this.sendRoomUpdate();
    }

    public getFullRoomState(): IFullRoomState {
        return {
            roomName: this.roomName,
            players: this.players.map((player) => player.getPlayerState()),
            gameState: this.game.getGameState(),
        };
    }

    public sendRoomUpdate(): void {
        const state = this.getFullRoomState();
        this.socket.emit(SocketEvent.SERVER_UPDATE, state);
    }

    public broadcastFullUpdate() {
        const state = this.getFullRoomState();

        this.players.map((player) => {
            player.send(SocketEvent.SERVER_UPDATE, state);
        });
    }

}
