import React from 'react';
import { makeStyles } from '@material-ui/core/styles';
import Button from '@material-ui/core/Button';
import ButtonGroup from '@material-ui/core/ButtonGroup';
import ChipStack from '../../components/ChipStack';
import NameAndAvatar from "../../components/NameAndAvatar";
import {sendAction} from "../../network";
import {connect} from "react-redux";

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



function BlackJackController(props) {

    const {remote, id} = props;

    const styles = useStyles();

    const addChip = (value) => {
        if(gamePlayerStatus().betValue + value > 300){
            alert("最高下注上限为300!");
        }
        sendAction({type: 'PlayerAddChip', payload: value});
    };

    const double = () => {
        sendAction({type: 'PlayerDouble'});
    };

    const surrender = () => {
        sendAction({type: 'PlayerSurrender'});
    };

    const bet = () => {
        sendAction({type: 'PlayerBet'});
    };

    const hit = () => {
        sendAction({type: 'PlayerHit'});
    };

    const stand = () => {
        sendAction({type: 'PlayerStand'});
    };

    const playerStatus = () => {
        return remote.players[id];
    };

    const gamePlayerStatus = () => {
        return playerStatus().gamePlayerState;
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
                <Button onClick={surrender} disabled={gamePlayerStatus().hand.length > 2}>投降</Button>
                <Button onClick={double} disabled={gamePlayerStatus().betValue > gamePlayerStatus().chipValue || gamePlayerStatus().hand.length > 2}>双倍</Button>
                <Button onClick={stand}>结束</Button>
            </ButtonGroup>
        );
    };

    const renderAction = () => {
        if(remote.gameState.stage === 'BET' && gamePlayerStatus().state !== '已经下注'){
            return renderBet();
        }
        if(remote.gameState.stage === 'ASK' && gamePlayerStatus().state === '正在要牌'){
            return renderAsk();
        }
        return NoAction();
    };

    const ChipValue = [5,25,50,100];

    const onStackClick = (index) => {

        if(gamePlayerStatus().chips[index] > 0 && gamePlayerStatus().state === '正在下注') {
            addChip(ChipValue[index]);
        }
    };
    return (
        <div className={styles.container}>
            <div className={styles.screen}>
                <NameAndAvatar name={playerStatus().name} avatar={playerStatus().avatar}/>
                <h2>现金：{gamePlayerStatus().cash}</h2>
                <h2>筹码：{gamePlayerStatus().chipValue}</h2>
                <h4>{gamePlayerStatus().state}</h4>

            </div>
            <div className={styles.chipStack}>
                <ChipStack chips={gamePlayerStatus().chips} onStackClick={onStackClick} />
            </div>
            <div className={styles.actionContainer}>
                {renderAction()}
            </div>
        </div>
    );
}

const mapState = (state) => ({
    ...state
});
export default connect(mapState)(BlackJackController);
