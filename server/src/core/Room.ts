import {IPlayerControllerState, PlayerController} from './PlayerController';
import {IGame} from './Game';
import {IInputAction, INotification, NotificationType, SocketEvent} from '../network';
import {Socket} from 'socket.io';
import {gameFactory} from '../games';
import {Logger} from '@overnightjs/logger';
import {IPlayerMapping, IPlayerStateMapping} from '../HomeEntertainmentServer';
import Timeout = NodeJS.Timeout;

import * as _ from 'lodash';

export interface IRoomConfig {
    tickFrequency: number;
}

export interface IFullRoomState {
    name: string;
    players: IPlayerStateMapping;
    gameState: any;
    maxPlayerNumber: number;
    isStarted: boolean;
}


export class Room {

    private readonly players: IPlayerMapping;

    private game: IGame;

    private prevFullState: IFullRoomState | null;

    private readonly config: IRoomConfig;

    public tickHandle: Timeout | null;

    constructor(private gameType: string, private roomName: string, private socket: Socket) {
        this.players = {};
        this.game = gameFactory(gameType, this);
        this.config = this.game.getRoomConfig();
        this.prevFullState = null;
        this.tickHandle = null;
        this.broadcastFullUpdate();
    }

    public getRoomId(): string {
        return this.socket.id;
    }

    public getRoomName(): string {
        return this.roomName;
    }

    public onPlayerLogin(player: PlayerController) {

        if (this.game.isPlaying() || this.game.numberOfPlayerAllow() < Object.keys(this.players).length) {
            Logger.Warn(`[Room] Cannot join new player as room reach maximum occupancy`);
            player.disconnect();
            return;
        }

        if (!!Object.values(this.players).find((p) => p.name === player.name)) {
            Logger.Warn(`[Room] Player ${player.name} is already entered, can not rejoin!`);
            player.disconnect();
            return;
        }

        Logger.Info(`[Room]New Player Join Room ${player.name} -> ${this.roomName}`);
        this.players[player.getId()] = player;
        this.bindEvent(player);
        this.game.onPlayerEnter(player);
        this.broadcastFullUpdate();
    }

    private isAllReady(): boolean {
        return Object.values(this.players).every((p) => p.ready) && Object.keys(this.players).length > 0;
    }

    private bindEvent(player: PlayerController) {
        player.getSocket().on(SocketEvent.CLIENT_ACTION, (action: IInputAction) => {
            Logger.Info(`[Room]Player Action Received ${player.name} : ${action}`);
            this.game.handlePlayerInput(player, action);
            this.broadcastFullUpdate();
        });
        player.getSocket().on(SocketEvent.CLIENT_READY, () => {
            player.ready = true;
            Logger.Info(`[Room]Player Ready ${player.name}`);
            if (this.isAllReady()) {
                this.startGame();
            }
            this.broadcastFullUpdate();
        });
        player.getSocket().on(SocketEvent.DISCONNECT, () => this.onPlayerLeave(player));
    }

    public onRoomClose() {
        this.endGame();
        Object.values(this.players).forEach((p) => p.disconnect());
    }

    public startGame() {
        this.game.start();
        if (!!this.tickHandle) {
            clearInterval(this.tickHandle);
        }
        this.tickHandle = setInterval(() => this.tick(), 1000);
        this.broadcastFullUpdate();
    }

    public tick() {
        this.game.tick();
        this.broadcastFullUpdate();
    }

    public endGame() {
        if (!!this.tickHandle) {
            clearInterval(this.tickHandle);
        }
        this.game.end();
        this.broadcastFullUpdate();
    }

    public onPlayerLeave(player: PlayerController) {
        if (player.getId() in this.players) {
            Logger.Info(`[Room]Player Leave ${player.name}`);
            this.game.onPlayerLeave(player);
            delete this.players[player.getId()];
            if (Object.keys(this.players).length === 0 && this.game.isPlaying()) {
                this.socket.disconnect();
                Logger.Info(`[Room]All player Leave, kick room socket!`);
                return;
            }
            this.broadcastFullUpdate();
        } else {
            Logger.Warn(`[Room] Player Leave : User ${player.getState()} is not belongs to ${this.getRoomName()}`);
        }
    }

    public getPlayerStates(): IPlayerStateMapping {
        const res: IPlayerStateMapping = {};
        Object.values(this.players).forEach((p) => {
            res[p.getId()] = p.getState();
        });
        return res;
    }

    public getFullRoomState(): IFullRoomState {
        return {
            name: this.roomName,
            players: this.getPlayerStates(),
            gameState: this.game.getGameState(),
            maxPlayerNumber: this.game.numberOfPlayerAllow(),
            isStarted: this.game.isPlaying(),
        };
    }

    public broadcastFullUpdate() {
        const state = this.getFullRoomState();
        if (_.isEqual(this.prevFullState, state)) {
            return;
        }
        this.socket.emit(SocketEvent.SERVER_FULL_STATE_UPDATE, state);
        Object.values(this.players).map((player) => {
            player.send(SocketEvent.SERVER_FULL_STATE_UPDATE, state);
        });
        this.prevFullState = state;
    }

    public sendScreenAction(action: IInputAction) {
        this.socket.emit(SocketEvent.SERVER_ACTION, action);
    }

    public sendScreenNotification(type: NotificationType, message: string) {
        this.socket.emit(SocketEvent.NOTIFICATION, {type, message});
    }

    public sendPlayerNotification(playerId: string, type: NotificationType, message: string) {

        if (!!this.players[playerId]) {
            this.players[playerId].getSocket().emit(SocketEvent.NOTIFICATION, {type, message});
        }
    }

    public getPlayers(): IPlayerMapping {
        return this.players;
    }
}
