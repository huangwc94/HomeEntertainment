/**
 * Example controller
 *
 * created by Sean Maxwell Apr 14, 2019
 */

import {Request, Response, Router} from 'express';
import {getStore, IUserInfo, readUser, saveUser} from '../store';

export class AdminController {
    public router = Router();

    private token: string | undefined = process.env.NODE_ENV === 'production' ? process.env.HE_PASSWORD : 'admin';

    constructor() {
        this.router.get('/admin/list', (res, req) => this.list(res, req));
        this.router.post('/admin/modify', (res, req) => this.modify(res, req));
    }

    private list(req: Request, res: Response) {
        if (this.checkToken(req.headers.authorization)) {
            res.header('Access-Control-Allow-Origin', '*');
            res.end(JSON.stringify(getStore()));
        } else {
            res.status(403).send({message: 'Wrong Password', req: req.headers});
        }
    }

    private modify(req: Request, res: Response) {
        if (this.checkToken(req.headers.authorization)) {
            const returnData: { [id: string]: IUserInfo } = {};
            Object.keys(req.body).forEach((userId) => {
                const usr = readUser(userId);
                if (!!usr) {
                    Object.assign(usr, req.body[userId]);
                    saveUser(usr);
                    returnData[userId] = usr;
                }
            });
            res.header('Access-Control-Allow-Origin', '*');
            res.end(JSON.stringify(returnData));
        } else {
            res.status(403).send({message: 'Wrong Password', req: req.headers});
        }
    }

    private checkToken(password: string | string[] | undefined): boolean {

        if (typeof password !== 'string' || !this.token) {
            return false;
        }

        return password === this.token;
    }
}
