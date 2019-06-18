import {Server} from 'http';
import {Socket} from 'socket.io';
import {Logger} from '@overnightjs/logger';
import {RoomManager} from './RoomManager';
import {SocketEvent} from '../network';


export class SocketServer {
    private io: Server;

    constructor(server: Server) {
        this.io = require('socket.io')(server);
    }

    public start() {
        this.io.on(SocketEvent.CONNECT, (socket: Socket) => {
            RoomManager.getInstance().onSocketConnect(socket);
            Logger.Info(`[SocketServer] SocketIO Client Connected: ${socket.id}`);
        });
    }
}
