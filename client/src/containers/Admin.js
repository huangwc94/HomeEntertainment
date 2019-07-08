import React from 'react';
import { Button, TextField } from '@material-ui/core';
import DialogTitle from '@material-ui/core/DialogTitle';
import Dialog from '@material-ui/core/Dialog';
import './App.css';
import { ServerAddress } from '../network';
import NameAndAvatar from '../components/NameAndAvatar';


const PasswordPrompt = (props) => {

    const {onClose, ...other} = props;

    let password = '';

    const handleClose = () => {
        onClose(password);
    };

    const valueChange = (value) => {
        password = value.target.value;
    };

    return (
        <Dialog aria-labelledby="simple-dialog-title" {...other}>
            <DialogTitle id="simple-dialog-title">Please Enter Admin Password</DialogTitle>
            <TextField
                id="standard-password-input"
                label="Password"
                type="password"
                onChange={valueChange}
                margin="normal"
                variant="outlined"
                style={{margin: 15}}
            />
            <Button color='primary' onClick={handleClose}>Submit</Button>
        </Dialog>
    );
};


class Admin extends React.Component {

    token;

    constructor(props) {
        super(props);
        this.state = {
            open: true,
            users: {}
        };
        this.token = '';
    }

    componentDidMount() {

    }

    passwordInput(value) {
        this.token = value;
        this.setState({open: false});
        this.fetchData();
    }

    fetchData() {
        fetch(ServerAddress + '/admin/list', {
            headers: {
                'authorization': this.token
            },
        })
            .then(res => res.json())
            .then(res => this.setState({users: res}))
            .catch(e => {
                console.log(e);
                alert(e.toString())
            });
    }

    handleDepositMoney(id, currentCash) {
        fetch(ServerAddress + '/admin/modify', {
            headers: {
                'authorization': this.token,
                'Content-Type': 'application/json'
            },
            method: 'POST',
            body: JSON.stringify({[id]: {cash: currentCash + 1000}})
        })
            .then(() => this.fetchData())
            .catch(e => {
                console.log(e);
                alert(e.toString())
            });
    }

    handleWithdrawMoney(id, currentCash) {
        let newCash = currentCash - 1000;
        if (newCash < 0) {
            newCash = 0;
        }
        fetch(ServerAddress + '/admin/modify', {
            headers: {
                'authorization': this.token,
                'Content-Type': 'application/json'
            },
            method: 'POST',
            body: JSON.stringify({[id]: {cash: newCash}})
        })
            .then(() => this.fetchData())
            .catch(e => {
                console.log(e);
                alert(e.toString())
            });
    }

    renderUsers(user) {
        return (
            <div style={{
                display: 'flex',
                flexDirection: 'row',
                justifyContent: 'start',
                width: '50vw',
                borderBottomWidth: 2,
                borderBottomStyle: 'solid',
                borderColor: '#999'
            }} key={user.id}>
                <div style={{flex: 1, display: 'flex', alignItems: 'center'}}>
                    <NameAndAvatar name={user.name} avatar={user.avatar}/>
                </div>
                <p style={{marginRight: '5vw'}}>${user.cash}</p>
                <div style={{
                    display:'flex',
                    justifyContent:'flex-end',
                    alignItems:'center',
                    flex:1
                }}>
                    <Button variant='contained' color='primary' onClick={() => this.handleDepositMoney(user.id, user.cash)}>充值1000</Button>
                    <Button variant='contained' color='secondary' disabled={user.cash <= 0}
                            onClick={() => this.handleWithdrawMoney(user.id, user.cash)}>取款1000</Button>
                </div>

            </div>
        )
    }

    render() {
        return (
            <div className="App">
                <h1>系统管理</h1>
                <div style={{display: 'flex', flexDirection: 'row', alignItems: 'center'}}>
                    <Button onClick={() => this.props.history.push('/')}>首页</Button>
                    <Button onClick={() => this.fetchData()}>刷新</Button>
                </div>

                <div style={{
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'flex-start',
                    alignItems: 'center',
                    margin: '20vmin'
                }}>
                    {
                        Object.values(this.state.users).map((user) => this.renderUsers(user))
                    }
                </div>
                <PasswordPrompt open={this.state.open} onClose={(p) => this.passwordInput(p)}/>
            </div>
        );
    }
}

export default Admin;
