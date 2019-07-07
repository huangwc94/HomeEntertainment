import React from 'react';
import Button from '@material-ui/core/Button';
import Input from '@material-ui/core/Input';

import './Controller.css';
import DoneIcon from '@material-ui/icons/Done';
import ErrorIcon from '@material-ui/icons/Error';
import { sendReady } from '../network';
import ListItemIcon from '@material-ui/core/ListItemIcon';
import ListItem from '@material-ui/core/ListItem';
import List from '@material-ui/core/List';
import ListItemText from '@material-ui/core/ListItemText';
import { ControllerList } from '../games';
import ListItemAvatar from '@material-ui/core/ListItemAvatar';
import Avatar from '@material-ui/core/Avatar';
import * as queryString from 'query-string'

import { connect } from 'react-redux';
import { connectToServer } from '../network';

class Controller extends React.Component {

    playerName;

    constructor(props) {
        super(props);
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

        if (!!values.id) {
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
        connectToServer({type: 1, name: name, data: room, token: 111});
    };

    onEnterClick = () => {
        if (!this.playerName) {
            alert('玩家名称不能为空！');
            return;
        }

        const {room} = this.props.match.params;
        this.id = this.playerName;
        this.connect(this.playerName, room);

    };

    onReady = () => {
        sendReady();
    };

    renderGame = () => {
        const {game} = this.props.match.params;

        const GameController = ControllerList[game];

        return <GameController id={this.id}/>;
    };

    renderForm = () => {
        const values = queryString.parse(this.props.location.search);

        if (!!values.id) {
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
        } else {
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
            this.props.connected ?
                <div className="Controller">
                    <div className="player-ready-container">
                        <h1>准备</h1>
                        <List className='controller-player-list'>
                            {this.generateList(this.props.remote.players)}
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
                    this.props.remote.isStarted ?
                        this.renderGame()
                        :
                        this.renderLogin()
                }
            </div>
        );
    }
}

const mapState = (state) => ({
    ...state
});

export default connect(mapState)(Controller);
