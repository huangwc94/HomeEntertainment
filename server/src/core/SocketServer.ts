import {Server} from 'http';
import {Socket} from 'socket.io';
import {Logger} from '@overnightjs/logger';
import {RoomManager} from './RoomManager';
import {ConnectType, ILoginCreds, SocketEvent} from '../network';
import {PlayerController} from './PlayerController';


export class SocketServer {
    private io: Server;

    constructor(server: Server) {
        this.io = require('socket.io')(server);
    }

    public start() {
        this.io.on(SocketEvent.CONNECT, (socket: Socket) => {
            RoomManager.getInstance().onSocketConnect(socket);
            socket.on(SocketEvent.CLIENT_LOGIN, (creds: ILoginCreds) => SocketServer.onLogin(socket, creds));
            Logger.Info(`[SocketServer] SocketIO Client Connected: ${socket.id}`);
        });
    }

    private static onLogin(socket: Socket, creds: ILoginCreds) {
        if (SocketServer.verifyCredential(creds)) {
            switch (creds.type) {
                case ConnectType.SCREEN:
                    RoomManager.getInstance().onRoomLogin(socket, creds);
                    break;
                case ConnectType.CONTROLLER:
                    RoomManager.getInstance().onPlayerLogin(socket, creds);
                    break;
                default:
                    Logger.Warn(`[RoomManager] Invalid login type ${creds.type}`);
                    socket.disconnect();
                    break;
            }
        } else {
            Logger.Warn(`[RoomManager] Invalid login creds: ${creds}`);
            socket.disconnect();
        }
    }

    private static verifyCredential(creds: ILoginCreds): boolean {
        return true;
    }
}
