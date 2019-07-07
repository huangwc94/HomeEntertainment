import React from 'react';
import { connect } from 'react-redux'
import RoomStatusModal from '../components/RoomStatusModal';
import { connectToServer, addSocketListener, disconnectServer } from '../network';
import { toggleFullScreen, setFullScreen } from '../store/actions';

import AppBar from '@material-ui/core/AppBar';
import Toolbar from '@material-ui/core/Toolbar';
import Typography from '@material-ui/core/Typography';
import Fullscreen from 'react-full-screen';
import CloseIcon from '@material-ui/icons/Close';
import IconButton from '@material-ui/core/IconButton';
import FullScreenIcon from '@material-ui/icons/Fullscreen';
import { GameList, PrecacheAssets } from '../games';
import Preload from 'react-preload';
import CircularProgress from '@material-ui/core/CircularProgress';
import posed from 'react-pose';

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


const AnimatedAppBar = posed.div({
    show: {
        y: 0,
        zIndex: 99999,

    },
    hide: {
        y: -50,
        zIndex: 99999,

    }
});

class Room extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            shouldHide: false,
        };
        this.lastAct = +new Date();
        this.tickHandler = null;
    }

    componentDidMount() {
        const {game} = this.props.match.params;
        const roomName = localStorage.getItem('HE-room-name');

        connectToServer({type: 0, name: roomName, data: game, token: 111});
        addSocketListener('disconnect', () => {
            this.props.history.push('/');
        });

        this.tickHandler = setInterval(() => {
            const thisActTime = +new Date();
            if (thisActTime - this.lastAct > 3000) {
                this.setState({
                    shouldHide: true
                })
            }
        }, 1000);
        document.onmousemove = () => {
            this.lastAct = +new Date();
            this.setState({
                shouldHide: false
            });
        }
    }

    onMouseMove(e) {

    }

    back = () => {
        this.props.history.push('/');
    };

    componentWillUnmount() {
        document.onmousemove = null;
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
                <div className='room-container' style={{cursor: this.state.shouldHide ? 'none' : 'default'}}>
                    <AnimatedAppBar pose={this.state.shouldHide ? 'hide' : 'show'}>
                        <AppBar position="fixed" color="primary"
                                style={{
                                    justifyContent: 'center',
                                    height: this.props.fullScreen ? 25 : 50,
                                    zIndex: 99999
                                }}>
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
                    </AnimatedAppBar>
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
