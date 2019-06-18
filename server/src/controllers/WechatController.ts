/**
 * Example controller
 *
 * created by Sean Maxwell Apr 14, 2019
 */

import {Request, Response, Router} from 'express';
import * as crypto from 'crypto';
import fetch from 'node-fetch';
import {readUser, saveUser} from '../store';

export class WechatController {
    public router = Router();

    private token: string = process.env.WECHAT_TOKEN || '';

    constructor() {
        this.router.get('/wechat/verify', (res, req) => this.verify(res, req));
        this.router.get('/wechat/redirect', (res, req) => this.redirect(res, req));
    }

    private verify(req: Request, res: Response) {
        if (this.checkToken(req.query.timestamp, req.query.nonce, req.query.signature)) {
            res.end(req.query.echostr);
        } else {
            res.end('It is not from Wechat');
        }
    }

    private redirect(req: Request, res: Response) {

        const roomInformation = req.query.state || '';
        const [room, gameName] = roomInformation.split('!');
        if (!room || !gameName) {
            res.send(req.query);
            return;
        }
        const code = req.query.code;
        if (!code) {
            res.send(req.query);
            return;
        }
        const getAccessCodeUrl = `https://api.weixin.qq.com/sns/oauth2/access_token?appid=${process.env.WECHAT_APP}&secret=${process.env.WECHAT_SECRET}&code=${code}&grant_type=authorization_code`;

        fetch(getAccessCodeUrl)
            .then((result) => result.json())
            .then((data) => {
                if (data.access_token) {
                    const getProfileUrl = `https://api.weixin.qq.com/sns/userinfo?access_token=${data.access_token}&openid=${data.openid}&lang=zh_CN`;
                    fetch(getProfileUrl)
                        .then((profileResult) => profileResult.json())
                        .then((profileData) => {
                            if (profileData.openid) {
                                let u = readUser(profileData.openid);
                                const cash = !!u ? u.cash : 1000;
                                u = {
                                    name: profileData.nickname,
                                    id: profileData.openid,
                                    avatar: profileData.headimgurl,
                                    cash,
                                };
                                saveUser(u);
                                res.redirect(`/controller/${room}/${gameName}?id=${u.id}`);
                            } else {
                                res.send(data);
                            }

                        }).catch((e) => {
                        res.send({error: e.toString(), data});
                    });
                } else {
                    res.send(data);
                }
            }).catch((e) => {
            res.send({error: e.toString(), step: 'get access token'});
        });
    }

    private checkToken(timestamp: string, nonce: string, signature: string) {
        const tmp = [this.token, timestamp, nonce].sort().join('');
        const sign = crypto.createHash('sha1').update(tmp).digest('hex');
        return sign === signature;
    }
}
