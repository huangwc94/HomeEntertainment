export const RESET_STATE = 'RESET_STATE';
export const FULL_REMOTE_UPDATE = 'FULL_REMOTE_UPDATE';
export const SET_CONNECTED = 'SET_CONNECTED';
export const SET_FULLSCREEN = 'SET_FULLSCREEN';
export const TOGGLE_FULLSCREEN = 'TOGGLE_FULLSCREEN';

export const resetState = () => ({
    type: RESET_STATE
});

export const fullRemoteUpdate = (remote) => ({
    type: FULL_REMOTE_UPDATE,
    remote
});

export const setConnected = (connected) => ({
    type: SET_CONNECTED,
    connected
});

export const setFullScreen = (fullScreen) => ({
    type: SET_FULLSCREEN,
    fullScreen
});

export const toggleFullScreen = () => ({
    type: TOGGLE_FULLSCREEN,
});
