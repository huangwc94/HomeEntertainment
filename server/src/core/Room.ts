import {IPlayerState, Player} from './Player';
import {IGame} from './Game';
import {IInputAction, NotificationType, SocketEvent} from '../network';
import {Socket} from 'socket.io';
import {gameFactory} from '../games';
import {Logger} from '@overnightjs/logger';
import Timeout = NodeJS.Timeout;

import * as _ from 'lodash';

export interface IRoomConfig {
    tickFrequency: number;
    numberOfPlayerAllow: number;
    gameName: string;
    shareGamePlayerState: boolean;
}

export interface IFullRoomState {
    name: string;
    game: string;
    players: IPlayerStateMapping;
    gameState: any;
    maxPlayerNumber: number;
    isStarted: boolean;
}

export interface IPlayerMapping {
    [id: string]: Player;
}

export interface IPlayerStateMapping {
    [id: string]: IPlayerState;
}

export class Room {

    private readonly players: IPlayerMapping;

    private game: IGame;

    private prevFullState: IFullRoomState | null;

    private readonly config: IRoomConfig;

    private tickHandle: Timeout | null;

    private lastTickTime: number;

    constructor(private gameType: string, private roomName: string, private socket: Socket) {
        this.players = {};
        this.game = gameFactory(gameType, this);
        this.config = this.game.getRoomConfig();
        this.prevFullState = null;
        this.tickHandle = null;
        this.lastTickTime = +new Date();
        this.broadcastFullUpdate();
    }

    public getRoomId(): string {
        return this.socket.id;
    }

    public getRoomName(): string {
        return this.roomName;
    }

    public onPlayerLogin(player: Player) {

        if (this.game.isPlaying() || this.config.numberOfPlayerAllow < Object.keys(this.players).length) {
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
        this.players[player.id] = player;
        this.bindEvent(player);
        this.game.onPlayerEnter(player);
        this.broadcastFullUpdate();
    }

    private isAllReady(): boolean {
        return Object.values(this.players).every((p) => p.ready) && Object.keys(this.players).length > 0;
    }

    private bindEvent(player: Player) {
        player.socket.on(SocketEvent.CLIENT_ACTION, (action: IInputAction) => {
            Logger.Info(`[Room]Player Action Received ${player.name} : ${action}`);
            this.game.handlePlayerInput(player, action);
            this.broadcastFullUpdate();
        });
        player.socket.on(SocketEvent.CLIENT_READY, () => {
            player.ready = true;
            Logger.Info(`[Room]Player Ready ${player.name}`);
            if (this.isAllReady()) {
                this.startGame();
            }
            this.broadcastFullUpdate();
        });
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
        this.tickHandle = setInterval(() => this.tick(), this.config.tickFrequency);
        this.broadcastFullUpdate();
    }

    public tick() {
        const thisTickTime = +new Date();
        this.lastTickTime = thisTickTime;
        this.game.tick(thisTickTime - this.lastTickTime);
        this.broadcastFullUpdate();
    }

    public endGame() {
        if (!!this.tickHandle) {
            clearInterval(this.tickHandle);
        }
        this.game.end();
        this.broadcastFullUpdate();
    }

    public onPlayerLeave(player: Player) {
        if (player.id in this.players) {
            Logger.Info(`[Room]Player Leave ${player.name}`);
            this.game.onPlayerLeave(player);
            delete this.players[player.id];
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
            res[p.id] = p.getState();
        });
        return res;
    }

    public getFullRoomState(): IFullRoomState {
        return {
            name: this.roomName,
            game: this.config.gameName,
            players: this.getPlayerStates(),
            gameState: this.game.getGameState(),
            maxPlayerNumber: this.config.numberOfPlayerAllow,
            isStarted: this.game.isPlaying(),
        };
    }

    public getPlayerRoomState(playerId: string): IFullRoomState {
        const state = this.getFullRoomState();

        if (!this.config.shareGamePlayerState) {
            Object.values(state.players).forEach((player) => {
                if (player.id !== playerId) {
                    player.gamePlayerState = {};
                }
            });
        }

        return state;
    }

    public broadcastFullUpdate() {
        const state = this.getFullRoomState();
        if (_.isEqual(this.prevFullState, state)) {
            return;
        }
        this.socket.emit(SocketEvent.SERVER_FULL_STATE_UPDATE, state);
        Object.values(this.players).forEach((player) => {
            const playerState = this.getPlayerRoomState(player.id);
            player.send(SocketEvent.SERVER_FULL_STATE_UPDATE, playerState);
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
            this.players[playerId].socket.emit(SocketEvent.NOTIFICATION, {type, message});
        }
    }

    public getPlayers(): IPlayerMapping {
        return this.players;
    }
}
