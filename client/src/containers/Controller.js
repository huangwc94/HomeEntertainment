import React from 'react';
import Button from "@material-ui/core/Button";
import Input from '@material-ui/core/Input';
import IO from 'socket.io-client';
import './Controller.css';
import DoneIcon from '@material-ui/icons/Done';
import ErrorIcon from '@material-ui/icons/Error';
import {ServerAddress} from "../network";
import ListItemIcon from '@material-ui/core/ListItemIcon';
import ListItem from '@material-ui/core/ListItem';
import List from '@material-ui/core/List';
import ListItemText from '@material-ui/core/ListItemText';
import {ControllerList} from "../games";
import ListItemAvatar from '@material-ui/core/ListItemAvatar';
import Avatar from '@material-ui/core/Avatar';
import * as queryString from 'query-string'

class Controller extends React.Component {

    playerName;

    constructor(props) {
        super(props);
        this.state = {
            playing: false,
            connected: false,
            remote: {
                name: '',
                players: [],
                gameState: {},
                maxPlayerNumber: 0,
                isStarted: false
            }
        };
    }

    generateList = (players) => {
        return Object.values(players).map((p) => (
            <ListItem key={p.name}>
                <ListItemAvatar>
                    <Avatar src={p.avatar} alt={p.name}/>
                </ListItemAvatar>
                <ListItemText
                    primary={p.name}
                />
                <ListItemIcon>
                    {p.ready ? <DoneIcon color='primary'/> : <ErrorIcon color="error"/>}
                </ListItemIcon>
            </ListItem>
        ))
    };

    componentDidMount() {
        this.playerName = localStorage.getItem('HE-player-name') || '';

        const values = queryString.parse(this.props.location.search);

        if(!!values.id){
            const {room} = this.props.match.params;
            this.id = values.id;
            this.connect(values.id, room);
        }

    }

    valueChange = (value) => {
        this.playerName = value.target.value;
        localStorage.setItem('HE-player-name', value.target.value);
    };

    connect = (name, room) => {
        this.io = new IO(ServerAddress);
        this.io.on('connect', () => {
            this.io.emit('CLIENT_LOGIN', {type: 1, name: name, data: room, token: 111});
            this.setState({playing: false, connected: true});
            this.io.on('SERVER_UPDATE', (data) => {
                const playing = data.isStarted;
                this.setState({remote: data, playing});
            });
        });
        this.io.on('disconnect', () => {
            this.setState({connected: false, playing: false});
        });
    };

    onEnterClick = () => {
        if (!this.playerName) {
            alert("玩家名称不能为空！");
            return;
        }

        const {room} = this.props.match.params;
        this.id = this.playerName;
        this.connect(this.playerName, room);

    };

    onReady = () => {
        if (!!this.io) {
            this.io.emit('CLIENT_READY');
        }
    };

    onSendAction = (payload) => {
        if (!!this.io) {
            this.io.emit('CLIENT_ACTION', payload);
        }
    };

    renderGame = () => {
        const {game} = this.props.match.params;

        const GameController = ControllerList[game];

        return <GameController state={this.state.remote} send={this.onSendAction} id={this.id}/>;
    };

    renderForm = () => {
        const values = queryString.parse(this.props.location.search);

        if(!!values.id) {
            return (
                <div className="Controller">
                    <div className="player-input-container">
                        <h1>错误</h1>
                        <h2>无法以微信登录模式加入游戏</h2>
                    </div>
                    <Button className="player-input-button" variant="contained" color="primary"
                            onClick={() => window.location.reload()}>刷新</Button>
                </div>
            );
        }else{
            const defaultName = localStorage.getItem('HE-player-name') || '';
            const {room, game} = this.props.match.params;
            return (
                <div className="Controller">
                    <div className="player-input-container">
                        <h1>{room} : {game}</h1>
                        <div className='player-input'>
                            <h2>玩家名称</h2>
                            <Input
                                defaultValue={defaultName}
                                onChange={this.valueChange}
                                className='input'
                            /></div>
                    </div>
                    <Button className="player-input-button" variant="contained" color="primary"
                            onClick={this.onEnterClick}>开始</Button>
                </div>
            );
        }
    };

    renderLogin = () => {
        return (
            this.state.connected ?
                <div className="Controller">
                    <div className="player-ready-container">
                        <h1>准备</h1>
                        <List className='controller-player-list'>
                            {this.generateList(this.state.remote.players)}
                        </List>
                    </div>
                    <Button className="player-input-button" variant="contained" color="primary"
                            onClick={this.onReady}>就绪</Button>
                </div>
                :
                    this.renderForm()
        );
    };

    render() {
        return (
            <div>
                {
                    this.state.playing ?
                        this.renderGame()
                        :
                        this.renderLogin()
                }
            </div>
        );
    }
}

export default Controller;
