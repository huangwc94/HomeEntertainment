import React from 'react';
import {connect} from 'react-redux'
import RoomStatusModal from '../components/RoomStatusModal';
import {connectToServer, addSocketListener, disconnectServer} from "../network";
import {toggleFullScreen, setFullScreen} from "../store/actions";

import AppBar from '@material-ui/core/AppBar';
import Toolbar from '@material-ui/core/Toolbar';
import Typography from '@material-ui/core/Typography';
import Fullscreen from "react-full-screen";
import CloseIcon from '@material-ui/icons/Close';
import IconButton from '@material-ui/core/IconButton';
import FullScreenIcon from '@material-ui/icons/Fullscreen';
import {GameList, PrecacheAssets} from "../games";
import Preload from 'react-preload';
import CircularProgress from '@material-ui/core/CircularProgress';

const soundToLoad = (game) => (
    <audio preload="auto">
        {
            PrecacheAssets[game].audios.map((audio) => <source src={audio} key={audio}/>)
        }
    </audio>
);

const loadingIndicator = (
    <div style={
        {
            display: 'flex',
            height: '100vh',
            alignItems: 'center',
            justifyContent: 'center',
            color: 'white',

        }
    }>
        <CircularProgress style={{marginRight: '5vh'}} color="primary"/>
        <h2>正在载入资源...</h2>
    </div>
);


class Room extends React.Component {
    constructor(props) {
        super(props);

    }

    componentDidMount() {
        const {game} = this.props.match.params;
        const roomName = localStorage.getItem('HE-room-name');

        connectToServer({type: 0, name: roomName, data: game, token: 111});
        addSocketListener('disconnect', () => {
            this.props.history.push("/");
        });
    }

    back = () => {
        this.props.history.push('/');
    };

    componentWillUnmount() {
        disconnectServer();
    }

    render() {
        const roomName = localStorage.getItem('HE-room-name');
        const {game} = this.props.match.params;

        const GameContent = GameList[game];
        return (
            <Fullscreen
                enabled={this.props.fullScreen}
                onChange={isFull => this.props.setFullScreen(isFull)}
                onLeave={this.back}
            >
                <div className='room-container'>
                    <AppBar position="fixed" color="primary"
                            style={{justifyContent: 'center', height: this.props.fullScreen ? 25 : 50}}>
                        <Toolbar>
                            <Typography variant="h6" color="inherit" style={{flex: 1}}>
                                {`${roomName} - ${game}`}
                            </Typography>
                            <IconButton aria-label="Full Screen" onClick={this.props.toggleFullScreen}>
                                <FullScreenIcon style={{color: 'white'}}/>
                            </IconButton>
                            <IconButton aria-label="Back" onClick={this.back}>
                                <CloseIcon style={{color: 'white'}}/>
                            </IconButton>
                        </Toolbar>
                    </AppBar>
                    <div className='room-game'>
                        <Preload
                            loadingIndicator={loadingIndicator}
                            images={PrecacheAssets[game].images}
                        >
                            {
                                this.props.remote.isStarted ?
                                    <GameContent/>
                                    :
                                    <RoomStatusModal
                                        roomName={roomName}
                                        gameName={game}
                                        back={this.back}
                                        connected={this.props.connected}
                                        remote={this.props.remote}/>
                            }
                        </Preload>
                        {soundToLoad(game)}
                    </div>
                </div>

            </Fullscreen>
        )
    }
}

const mapState = (state) => ({
    ...state
});

const mapDispatch = dispatch => ({
    toggleFullScreen: () => dispatch(toggleFullScreen()),
    setFullScreen: (v) => dispatch(setFullScreen(v)),
});

export default connect(mapState, mapDispatch)(Room);
