import { FULL_REMOTE_UPDATE, TOGGLE_FULLSCREEN, SET_FULLSCREEN, SET_CONNECTED, RESET_STATE } from './actions';


const homeEntertainmentDefaultState = () => ({
    remote: {
        name: '',
        game: '',
        players: {},
        gameState: {},
        maxPlayerNumber: 0,
        isStarted: false,
    },
    connected: false,
    fullScreen: false,
});

export const reducer = (state = homeEntertainmentDefaultState(), action) => {
    switch (action.type) {
        case FULL_REMOTE_UPDATE:
            return {...state, remote: action.remote};
        case TOGGLE_FULLSCREEN:
            return {...state, fullScreen: !state.fullScreen};
        case SET_FULLSCREEN:
            return {...state, fullScreen: action.fullScreen};
        case SET_CONNECTED:
            return {...state, connected: action.connected};
        case RESET_STATE:
            return homeEntertainmentDefaultState();
        default:
            return state;
    }
};
