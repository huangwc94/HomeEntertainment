import React from 'react';
import {Button, TextField} from "@material-ui/core";

import './App.css';

class App extends React.Component {

    roomName;

    constructor(props){
        super(props);
    }

    componentDidMount() {
        this.roomName = localStorage.getItem('HE-room-name') || '';
    }

    valueChange = (value) => {
        this.roomName = value.target.value;
        localStorage.setItem('HE-room-name', value.target.value);
    };

    onGameSelected = (gameName) => {

        if(!this.roomName){
            alert("房间名称为空！");
            return;
        }
        this.props.history.push('/room/'+gameName);

    };

    render() {

        const gameList = {
            BlackJack: '21 点',
        };

        const defaultName = localStorage.getItem('HE-room-name') || '';

        return (
            <div className="App">
                <h1>客厅娱乐系统</h1>
                <div className='room-input'>
                    <TextField
                        required
                        id="outlined-required"
                        label="房间名称"
                        defaultValue={defaultName}
                        onChange={this.valueChange}
                        margin="normal"
                        className='input'
                        variant="outlined"
                    /></div>
                <div className='game-container'>
                    {
                        Object.keys(gameList).map((k) => (
                            <Button  variant="contained" color="primary" key={k} onClick={() => this.onGameSelected(k)}>{gameList[k]}</Button>
                        ))
                    }
                </div>
            </div>
        );
    }
}

export default App;
