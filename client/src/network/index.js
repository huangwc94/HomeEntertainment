import IO from 'socket.io-client';
import {store} from '../store';
import {fullRemoteUpdate, resetState, setConnected} from "../store/actions";

export const ServerAddress = process.env.NODE_ENV === 'development' ? 'http://localhost' : window.location.protocol + "//" + window.location.host;

export const WechatRedirectUrl = 'https://open.weixin.qq.com/connect/oauth2/authorize?appid=wx4a0a2071d3b4eb25&redirect_uri=http%3A%2F%2Fhe.ddns.net%2Fwechat%2Fredirect&response_type=code&scope=snsapi_userinfo&state=';

let socket = null;

export const send = (type, payload) => {
    if (!!socket) {
        socket.emit(type, payload);
    }
};

export const sendAction = (payload) => {
    send('CLIENT_ACTION', payload);
};

export const sendReady = () => {
    send('CLIENT_READY');
};

export const disconnectServer = () => {
    if(!!socket){
        socket.disconnect();
    }
};

export const addSocketListener = (type, callback) => {
    if (!!socket) {
        socket.on(type, callback);
    }
};

export const connectToServer = (loginCreds, config = {}) => {
    socket = new IO(config.address || ServerAddress);
    socket.on('connect', () => {
        store.dispatch(setConnected(true));
        send('CLIENT_LOGIN', loginCreds);
        socket.on('SERVER_UPDATE', (remote) => {
            store.dispatch(fullRemoteUpdate(remote));
        });
        socket.on('disconnect', () => {
            store.dispatch(resetState());
        });
    });
};
