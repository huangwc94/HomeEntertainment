import React from 'react';
import { makeStyles } from '@material-ui/core/styles';
import Button from '@material-ui/core/Button';
import ButtonGroup from '@material-ui/core/ButtonGroup';

import ChipStack from '../../components/ChipStack';
import NameAndAvatar from "../../components/NameAndAvatar";

const useStyles = makeStyles(theme => ({
    container: {
        display:'flex',
        flex:1,
        width:'100%',
        flexDirection:'column',
        alignItems:'center',
        justifyContent:'center',
        textAlign:'center',
        backgroundColor: '#456e4a',
        color:'white',
        height:'100vh'
    },

    screen: {
        flex:1,
        width:'100%',
    },

    actionContainer: {
        width:'100%',
        height:'20vh'
    },
    chipStack: {
        display:'flex',
        width:'100%',
        justifyContent: 'center',
        alignItems:'center',
        marginBottom:'10vh',
        height:'20vh',
    },
    buttonGroup:{
        height:'10vmax',
        width: '100vw',
        borderRadius: 0,
    },
    askButtonGroup:{
        width:'50vw',
    }

}));



export default function BlackJackController(props) {

    const {state, send, id} = props;

    const styles = useStyles();

    const addChip = (value) => {
        if(myStatus().betValue + value > 300){
            alert("最高下注上限为300!");
        }
        send({type: 'PlayerAddChip', payload: value});
    };

    const double = () => {
        send({type: 'PlayerDouble'});
    };

    const surrender = () => {
        send({type: 'PlayerSurrender'});
    };

    const bet = () => {
        send({type: 'PlayerBet'});
    };

    const hit = () => {
        send({type: 'PlayerHit'});
    };

    const stand = () => {
        send({type: 'PlayerStand'});
    };

    const myStatus = () => {
        return state.gameState.players.find((p) => p.id === id);
    };

    const NoAction = () => {
        return (<h4>当前没有可用操作</h4>);
    };

    const renderBet = () => {
        return (
            <ButtonGroup variant="contained" fullWidth color="primary" className={styles.buttonGroup}>
                <Button  onClick={bet}>确认</Button>
            </ButtonGroup>
        );
    };
    const renderAsk = () => {
        return (
            <ButtonGroup variant="contained" fullWidth color="primary" className={styles.buttonGroup}>
                <Button onClick={hit}>要牌</Button>
                <Button onClick={surrender} disabled={myStatus().hand.length > 2}>投降</Button>
                <Button onClick={double} disabled={myStatus().betValue > myStatus().chipValue || myStatus().hand.length > 2}>双倍</Button>
                <Button onClick={stand}>结束</Button>
            </ButtonGroup>
        );
    };

    const renderAction = () => {
        if(state.gameState.stage === 'BET' && myStatus().state !== '已经下注'){
            return renderBet();
        }
        if(state.gameState.stage === 'ASK' && myStatus().state === '正在要牌'){
            return renderAsk();
        }
        return NoAction();
    };

    const ChipValue = [5,25,50,100];

    const onStackClick = (index) => {
        if(myStatus().chips[index] > 0 && myStatus().state === '正在下注') {
            addChip(ChipValue[index]);
        }
    };
    console.log(state);
    return (
        <div className={styles.container}>
            <div className={styles.screen}>
                <NameAndAvatar name={state.players[id].name} avatar={state.players[id].avatar}/>
                <h2>现金：{myStatus().cash}</h2>
                <h2>筹码：{myStatus().chipValue}</h2>
                <h4>{myStatus().state}</h4>

            </div>
            <div className={styles.chipStack}>
                <ChipStack chips={myStatus().chips} onStackClick={onStackClick} />
            </div>
            <div className={styles.actionContainer}>
                {renderAction()}
            </div>
        </div>
    );
}
