import {Server} from 'socket.io';

export enum SocketEvent {
    SERVER_UPDATE = 'SERVER_UPDATE',
    SERVER_ACTION = 'SERVER_ACTION',
    CLIENT_LOGIN = 'CLIENT_LOGIN',
}

export enum ConnectType {
    SCREEN,
    CONTROLLER,
}

export interface ILoginCreds {
    name: string;
    token: string;
    type: ConnectType;
    data: string;
}


let _socketServer: Server;


export function GetSocketServer() {
    return _socketServer;
}

export function SetSocketServer(server: Server) {
    _socketServer = server;
}

