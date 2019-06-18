/**
 * Server file for Home Entertainment Server
 *
 * created by Weicheng Huang
 */

import {Server} from 'http';
import * as express from 'express';
import {ConnectType, GetSocketServer, ILoginCreds, SetSocketServer, SocketEvent} from './network';
import {Socket} from 'socket.io';
import {Logger} from '@overnightjs/logger';
import {Room} from './components/Room';
import {PlayerBase} from './components/PlayerBase';

interface IPlayerRoomMapping {
    [id: string]: Room;
}

interface IPlayerMapping {
    [id: string]: PlayerBase;
}

class HomeEntertainmentServer {
    public static readonly PORT: number = 8080;

    private readonly app: express.Application;

    private readonly server: Server;

    private readonly io: SocketIO.Server;

    private readonly socketsMapping: IPlayerRoomMapping;

    private readonly players: IPlayerMapping;

    private rooms: Room[];

    constructor(port?: number) {
        this.app = express();
        this.server = require('http').Server(this.app);
        this.socketsMapping = {};
        this.rooms = [];
        this.players = {};
        const finalPort = port || HomeEntertainmentServer.PORT;
        this.server.listen(finalPort, () => {
            Logger.Info(`Running server on port ${finalPort}`);
        });
        this.io = require('socket.io')(this.server);
        SetSocketServer(this.io);
    }

    private static verifyCredential(creds: ILoginCreds): boolean {
        return true;
    }

    public start(): void {


        this.app.use(express.static('public'));

        this.io.on('connect', (socket: Socket) => {
            Logger.Info(`SocketIO Client Connected: ${socket.id}`);

            socket.on('disconnect', () => {
                const room = this.rooms.find((r) => r.getRoomId() === socket.id)
                if (!!room) {
                    room.onRoomClose();
                }


                if (socket.id in this.socketsMapping) {
                    this.socketsMapping[socket.id].onPlayerLeave(this.players[socket.id]);
                    delete this.socketsMapping[socket.id];
                }
                if (socket.id in this.players) {
                    delete this.socketsMapping[socket.id];
                }
                Logger.Info(`SocketIO Client Disconnected: ${socket.id}`);
            });

            socket.on(SocketEvent.CLIENT_LOGIN, (creds: ILoginCreds) => {
                if (HomeEntertainmentServer.verifyCredential(creds)) {
                    switch (creds.type) {
                        case ConnectType.SCREEN:
                            try {
                                const r = new Room(creds.data, creds.name, socket);
                                this.rooms.push(r);
                            } catch (e) {
                                Logger.Warn(`Failed to create room with game: ${e}`);
                                socket.disconnect();
                            }
                            break;
                        case ConnectType.CONTROLLER:
                            const p = new PlayerBase(creds.name, socket);
                            const rm = this.rooms.find((r) => r.getRoomName() === creds.data);
                            if (!!rm) {
                                this.socketsMapping[socket.id] = rm;
                                rm.onPlayerEnter(p);
                            }
                            this.players[socket.id] = p;
                            break;
                        default:
                            Logger.Warn(`Invalid login type ${creds.type}`);
                            socket.disconnect();
                    }

                } else {
                    socket.disconnect();
                }
            });
        });

    }
}

export default HomeEntertainmentServer;
