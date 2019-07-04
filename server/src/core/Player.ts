import {Socket} from 'socket.io';
import {SocketEvent} from '../network';
import {saveUser, readUser} from '../store';

export interface IPlayerState {
    name: string;
    id: string;
    ready: boolean;
    cash: number;
    avatar: string;
    gamePlayerState: any;
}


export interface IGamePlayer {
    getGamePlayerState(): any;
}

export class Player {

    private _ready: boolean;

    private _name: string;

    private _avatar: string;

    private _cash: number;

    private _gamePlayer: IGamePlayer | null;

    constructor(private _id: string, private _socket: Socket) {
        const userInfo = readUser(this.id);
        if (!!userInfo) {
            this._name = userInfo.name;
            this._avatar = userInfo.avatar;
            this._cash = userInfo.cash;
        } else {
            this._name = _id;
            this._avatar = '/avatar/default.png';
            this._cash = 1000;
        }
        this._gamePlayer = null;
        this._ready = false;
    }

    get gamePlayer(): IGamePlayer | null {
        return this._gamePlayer;
    }

    set gamePlayer(value: IGamePlayer | null) {
        this._gamePlayer = value;
    }

    get ready(): boolean {
        return this._ready;
    }

    set ready(value: boolean) {
        this._ready = value;
    }

    get name(): string {
        return this._name;
    }

    set name(value: string) {
        this._name = value;
    }

    get avatar(): string {
        return this._avatar;
    }

    set avatar(value: string) {
        this._avatar = value;
    }

    get cash(): number {
        return this._cash;
    }

    set cash(value: number) {
        this._cash = value;
    }

    get id(): string {
        return this._id;
    }

    get socket(): SocketIO.Socket {
        return this._socket;
    }

    public send(type: SocketEvent, data: any) {
        this.socket.emit(type, data);
    }

    public getState(): IPlayerState {
        return {
            name: this.name,
            id: this.id,
            ready: this.ready,
            avatar: this.avatar,
            cash: this.cash,
            gamePlayerState: this._gamePlayer && this._gamePlayer.getGamePlayerState() || {},
        };
    }

    public disconnect() {
        this.socket.disconnect();
    }

    public saveUser() {
        saveUser({id: this.id, name: this.name, avatar: this.avatar, cash: this.cash});
    }
}
