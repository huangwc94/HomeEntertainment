import RoomStatusModal from '../components/RoomStatusModal';
import {ServerAddress} from "../network";
import React from 'react';
import IO from 'socket.io-client';
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
            PrecacheAssets[game].audios.map((audio) => <source src={audio} key={audio} />)
        }
    </audio>
);

const loadingIndicator =  (
    <div style={
        {
            display:'flex',
            height:'100vh',
            alignItems:'center',
            justifyContent:'center',
            color:'white',

        }
    }>
        <CircularProgress style={{marginRight:'5vh'}} color="primary"/>
        <h2>正在载入资源...</h2>
    </div>
);


class Room extends React.Component {

    initialToggleFullScreen;

    constructor(props){
        super(props);
        this.state = {
            remote:{
                name:'',
                players:[],
                gameState:{},
                maxPlayerNumber: 0,
                isStarted:false
            },
            isFull:false,
            shouldOpenRoomStatusModal: true,
            connected: false,
        };
        this.initialToggleFullScreen = false;
    }

    componentDidMount() {
        const {game} = this.props.match.params;
        const roomName = localStorage.getItem('HE-room-name');

        this.io = new IO(ServerAddress);

        this.io.on('connect', () => {
           this.io.emit('CLIENT_LOGIN',{type:0, name:roomName, data: game, token: 111});
           this.setState({connected:true});
           this.io.on('SERVER_UPDATE', (data) => {
                const shouldOpenRoomStatusModal = !data.isStarted;
                // if(!this.initialToggleFullScreen && data.isStarted){
                //     this.initialToggleFullScreen = true;
                //     this.toggleFullScreen();
                // }
                this.setState({remote: data, shouldOpenRoomStatusModal});
           });
        });

        this.io.on('disconnect', () => {
            this.props.history.push("/");
        });
    }

    toggleFullScreen = () => {
        console.log("Toggle Full Screen");
        this.setState((prev) => ({
            isFull:!prev.isFull
        }));
    };

    back = () => {
        this.props.history.push('/');
    };

    componentWillUnmount() {
        this.io.disconnect();
    }

    render() {
        const roomName = localStorage.getItem('HE-room-name');
        const {game} = this.props.match.params;

        const GameContent = GameList[game];
        return (
            <Fullscreen
                enabled={this.state.isFull}
                onChange={isFull => this.setState({isFull})}
                onLeave={this.back}
            >
                <div className='room-container'>
                    <AppBar position="fixed" color="primary" style={{ justifyContent:'center', height:this.state.isFull? 25 : 50 }}>
                        <Toolbar>
                            <Typography variant="h6" color="inherit" style={{flex:1}}>
                                {`${roomName} - ${game}`}
                            </Typography>
                            <IconButton aria-label="Full Screen" onClick={this.toggleFullScreen}>
                                <FullScreenIcon style={{color:'white'}}/>
                            </IconButton>
                            <IconButton aria-label="Back" onClick={this.back}>
                                <CloseIcon  style={{color:'white'}} />
                            </IconButton>
                        </Toolbar>
                    </AppBar>
                    <div className='room-game'>
                        <Preload
                            loadingIndicator={loadingIndicator}
                            images={PrecacheAssets[game].images}
                        >
                        {
                            this.state.remote.isStarted ? <GameContent state={this.state.remote} /> :
                            <RoomStatusModal roomName={roomName} back={this.back} open={this.state.shouldOpenRoomStatusModal} remote={this.state.remote} connected={this.state.connected} gameName={game}/>
                        }

                        </Preload>
                        {soundToLoad(game)}
                    </div>
                </div>

            </Fullscreen>
        )
    }
}
export default Room;
