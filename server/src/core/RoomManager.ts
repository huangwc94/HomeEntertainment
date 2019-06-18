import {Room} from './Room';
import {Socket} from 'socket.io';
import {ConnectType, ILoginCreds, SocketEvent} from '../network';
import {Logger} from '@overnightjs/logger';
import {PlayerController} from './PlayerController';

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
        socket.on(SocketEvent.CLIENT_LOGIN, (creds: ILoginCreds) => this.onLogin(socket, creds));
    }

    private static verifyCredential(creds: ILoginCreds): boolean {
        return true;
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

    private onLogin(socket: Socket, creds: ILoginCreds) {
        if (RoomManager.verifyCredential(creds)) {
            switch (creds.type) {
                case ConnectType.SCREEN:
                    this.createRoom(creds, socket);
                    break;
                case ConnectType.CONTROLLER:
                    const rm = Object.values(this.rooms).find((room) => room.getRoomName() === creds.data);
                    const player = new PlayerController(creds.name, socket);
                    Logger.Info(`[RoomManager] Player Login: ${creds.name} -> ${creds.data}`);
                    if (!!rm) {
                        rm.onPlayerLogin(player);
                    } else {
                        Logger.Warn(`[RoomManager] Cannot found room for: ${creds.data}`);
                        socket.disconnect();
                    }
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

    public createRoom(creds: ILoginCreds, socket: Socket) {
        if (Object.values(this.rooms).find((r) => (r.getRoomName() === creds.name))) {
            Logger.Warn('[RoomManager] Duplicate Room Creation Requested, kicked');
            socket.disconnect();
            return null;
        }
        try {
            this.rooms[socket.id] = new Room(creds.data, creds.name, socket);
        } catch (e) {
            Logger.Warn(`[RoomManager] Failed to create room with game: ${e}`);
            socket.disconnect();
            return;
        }
        Logger.Info(`[RoomManager] New Room Created ${creds.name} : ${creds.data}`);
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


