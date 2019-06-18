

export const ServerAddress = process.env.NODE_ENV === 'development' ? 'http://localhost' :  window.location.protocol +"//"+window.location.host;

export const WechatRedirectUrl = 'https://open.weixin.qq.com/connect/oauth2/authorize?appid=wx4a0a2071d3b4eb25&redirect_uri=http%3A%2F%2Fhe.ddns.net%2Fwechat%2Fredirect&response_type=code&scope=snsapi_userinfo&state=';
