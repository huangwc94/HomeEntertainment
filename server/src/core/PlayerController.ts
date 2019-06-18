import {Socket} from 'socket.io';
import {SocketEvent} from '../network';
import {saveUser, readUser} from '../store';

export interface IPlayerControllerState {
    name: string;
    id: string;
    ready: boolean;
    cash: number;
    avatar: string;
}


export class PlayerController {

    public ready: boolean;

    public name: string;

    public avatar: string;

    public cash: number;

    constructor(private id: string, private socket: Socket) {
        const userInfo = readUser(this.id);
        if (!!userInfo) {
            this.name = userInfo.name;
            this.avatar = userInfo.avatar;
            this.cash = userInfo.cash;
        } else {
            this.name = id;
            this.avatar = '/avatar/default.png';
            this.cash = 1000;
        }

        this.ready = false;
    }

    public getSocket(): Socket {
        return this.socket;
    }

    public send(type: SocketEvent, data: any) {
        this.socket.emit(type, data);
    }

    public getId(): string {
        return this.id;
    }

    public getState(): IPlayerControllerState {
        return {name: this.name, id: this.getId(), ready: this.ready, avatar: this.avatar, cash: this.cash};
    }

    public disconnect() {
        this.socket.disconnect();
    }

    public saveUser() {
        saveUser({id: this.id, name: this.name, avatar: this.avatar, cash: this.cash});
    }
}
