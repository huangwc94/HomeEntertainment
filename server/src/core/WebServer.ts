import * as express from 'express';
import {Server} from 'http';
import * as bodyParser from 'body-parser';
import {WechatController} from '../controllers';
import {AdminController} from '../controllers/AdminController';
import {Logger} from '@overnightjs/logger';


export class WebServer {
    private readonly app: express.Application;

    private readonly server: Server;

    constructor(staticPath: string) {
        this.app = express();
        this.server = require('http').Server(this.app);

        const cors = require('cors');
        this.app.options('*', cors({allowedHeaders: ['authorization', 'Content-Type']}));
        this.app.use(bodyParser.json());
        this.app.use(express.static(staticPath));
        const wechat = new WechatController();
        this.app.use('/', wechat.router);
        const admin = new AdminController();
        this.app.use('/', admin.router);
        this.app.get('*', (req, res) => {
            res.sendFile(`${staticPath}/index.html`);
        });
    }

    public start(port: number) {
        this.server.listen(port, () => {
            Logger.Info(`Running server on port ${port}`);
        });
    }

    public getServer(): Server {
        return this.server;
    }
}
