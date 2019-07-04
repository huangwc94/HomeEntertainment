import {Room} from './Room';
import {Socket} from 'socket.io';
import {ILoginCredential, SocketEvent} from '../network';
import {Logger} from '@overnightjs/logger';
import {Player} from './Player';

export interface IRoomMapping {
    [socketId: string]: Room;
}

export class RoomManager {

    private readonly rooms: IRoomMapping;

    private static roomManagerInstance: RoomManager;

    constructor() {
        this.rooms = {};
    }

    public onSocketConnect(socket: Socket) {
        socket.on(SocketEvent.DISCONNECT, () => this.onDisconnect(socket));
    }

    public onPlayerLogin(socket: Socket, creds: ILoginCredential) {
        const rm = Object.values(this.rooms).find((room) => room.getRoomName() === creds.data);
        const player = new Player(creds.name, socket);
        Logger.Info(`[RoomManager] Player Login: ${creds.name} -> ${creds.data}`);
        if (!!rm) {
            rm.onPlayerLogin(player);
            player.socket.on(SocketEvent.DISCONNECT, () => rm.onPlayerLeave(player));
            this.onSocketConnect(socket);
        } else {
            Logger.Warn(`[RoomManager] Cannot found room for: ${creds.data}`);
            socket.disconnect();
        }
    }

    public onRoomLogin(socket: Socket, creds: ILoginCredential) {
        if (Object.values(this.rooms).find((r) => (r.getRoomName() === creds.name))) {
            Logger.Warn('[RoomManager] Duplicate Room Creation Requested, kicked');
            socket.disconnect();
            return null;
        }
        try {
            this.rooms[socket.id] = new Room(creds.data, creds.name, socket);
            this.onSocketConnect(socket);
        } catch (e) {
            Logger.Warn(`[RoomManager] Failed to create room with game: ${e}`);
            socket.disconnect();
            return;
        }
        Logger.Info(`[RoomManager] New Room Created ${creds.name} : ${creds.data}`);
    }

    private onDisconnect(socket: Socket) {
        const room = this.rooms[socket.id];
        if (!!room) {
            Logger.Info(`[RoomManger] Room socket disconnected, room closed`);
            room.onRoomClose();
            delete this.rooms[socket.id];
            return;
        }
        Logger.Info(`[RoomManager] SocketIO Client Disconnected: ${socket.id}`);
    }

    public findRoomByPlayerId(playerId: string): Room | undefined {
        return Object.values(this.rooms).find((room) => playerId in room.getPlayers());
    }

    public static getInstance(): RoomManager {
        if (!RoomManager.roomManagerInstance) {
            RoomManager.roomManagerInstance = new RoomManager();
        }
        return RoomManager.roomManagerInstance;
    }
}


