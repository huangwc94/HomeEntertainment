/**
 * Server file for Home Entertainment Server
 *
 * created by Weicheng Huang
 */
import {WebServer} from './core/WebServer';
import {SocketServer} from './core/SocketServer';
import * as path from 'path';


class HomeEntertainmentServer {
    public static readonly PORT: number = 8080;

    private readonly io: SocketServer;

    private readonly web: WebServer;

    constructor(private readonly port?: number) {
        this.web = new WebServer(path.join(__dirname, '..', 'public'));
        this.io = new SocketServer(this.web.getServer());
    }

    public start(): void {
        this.web.start(this.port || +HomeEntertainmentServer.PORT);
        this.io.start();
    }
}

export default HomeEntertainmentServer;
