/**
 * Start the Express Web-Server
 *
 * created by Sean Maxwell Apr 14, 2019
 */

import HomeEntertainmentServer from './HomeEntertainmentServer';
import {saveUser} from './store';

const server = new HomeEntertainmentServer(80);

if (!process.env.NODE_ENV || process.env.NODE_ENV !== 'production') {
    saveUser({name: '微信用户', id: 'wechat1', avatar: '/avatar/wechat.png', cash: 1000});
}

server.start();

