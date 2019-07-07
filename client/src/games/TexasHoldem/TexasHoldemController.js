import React, { useState } from 'react';
import { makeStyles } from '@material-ui/core/styles';
import Button from '@material-ui/core/Button';
import ButtonGroup from '@material-ui/core/ButtonGroup';
import ChipStack from '../../components/ChipStack';
import NameAndAvatar from '../../components/NameAndAvatar';
import { sendAction } from '../../network';
import { connect } from 'react-redux';
import CardStack from '../../components/CardStack';
import posed from 'react-pose';
import { tween } from 'popmotion';

const useStyles = makeStyles(theme => ({
    container: {
        display: 'flex',
        flex: 1,
        width: '100%',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        textAlign: 'center',
        backgroundColor: '#456e4a',
        color: 'white',
        height: '100vh'
    },

    screen: {
        flex: 1,

        width: '100%',
    },

    actionContainer: {
        width: '100%',
    },

    chipStack: {
        display: 'flex',
        width: '100%',
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: '15vh',
    },

    buttonGroup: {
        height: '10vmax',
        width: '100vw',
        borderRadius: 0,
    },

    askButtonGroup: {
        width: '50vw',
    },
    cardCoverContainer: {
        position: 'relative',
        overflow: 'hidden',
        display: 'flex'
    },
    cardCover: {
        position: 'absolute',
        top: 0,
        right: 0,
        bottom: 0,
        left: 0,
        backgroundColor: '#456e4a',
        zIndex: 100,
        display: 'flex',
        justifyContent:'center',
        alignItems:'center',
    }

}));

const CardCover = posed.div({
    draggable: 'y',
    dragBounds:{top:0},
    dragEnd: {
        y:0,
        transition: tween
    }
});

function TexasHoldemController(props) {

    const {remote, id} = props;

    const styles = useStyles();

    const [isRaising, setIsRaising] = useState(false);

    const fold = () => {
        sendAction({type: 'PlayerFold'});
    };

    const check = () => {
        sendAction({type: 'PlayerCheck'});
    };

    const call = () => {
        sendAction({type: 'PlayerCall'});
    };

    const allIn = () => {
        sendAction({type: 'PlayerAllIn'});
    };

    const raise = (value) => {
        sendAction({type: 'PlayerRaise', payload: value});
    };
    const raiseConfirm = () => {
        sendAction({type: 'PlayerRaiseConfirm'});
        setIsRaising(false);
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

    const renderRaise = () => {
        return (
            <ButtonGroup variant="contained" fullWidth color="primary" className={styles.buttonGroup}>
                <Button onClick={raiseConfirm}>确认</Button>
            </ButtonGroup>
        );
    };

    const renderAct = () => {
        return (
            <ButtonGroup variant="contained" fullWidth color="primary" className={styles.buttonGroup}>
                <Button onClick={fold}>弃牌</Button>
                <Button onClick={call} disabled={gamePlayerStatus().hand.length > 2}>跟注</Button>
                <Button onClick={() => {
                    setIsRaising(true);
                }}
                        disabled={gamePlayerStatus().betValue > gamePlayerStatus().chipValue || gamePlayerStatus().hand.length > 2}>加注</Button>
                <Button onClick={allIn}>全压！</Button>
                <Button onClick={check}>结束</Button>
            </ButtonGroup>
        );
    };

    const renderAction = () => {
        if (['正在行动', '玩家加注'].includes(gamePlayerStatus().state)) {
            return isRaising ? renderRaise() : renderAct();
        } else {
            return NoAction();
        }
    };

    const ChipValue = [5, 25, 50, 100];

    const onStackClick = (index) => {

        if (gamePlayerStatus().chips[index] > 0 && isRaising) {
            raise(ChipValue[index]);
        }
    };
    const backCard = [];
    gamePlayerStatus().hand.forEach((card) => {
        card.show = true;
        backCard.push({value: 1, suit: 'Clubs', show: false});
    });
    return (
        <div className={styles.container}>
            <div className={styles.screen}>
                <NameAndAvatar name={playerStatus().name} avatar={playerStatus().avatar}/>
                <h2>现金：{gamePlayerStatus().cash}</h2>
                <h2>筹码：{gamePlayerStatus().chipValue}</h2>
                <h4>{gamePlayerStatus().state}</h4>
                <div className={styles.cardCoverContainer}>
                    <CardStack cards={gamePlayerStatus().hand} display={'full'}
                               description={gamePlayerStatus().handResult} height={'30vh'}/>
                    <CardCover className={styles.cardCover}>
                        <CardStack cards={backCard} display={'full'}
                                   description={'下滑查看手牌'} height={'30vh'}/>
                    </CardCover>
                </div>

            </div>
            <div className={styles.chipStack}>
                <ChipStack chips={gamePlayerStatus().chips} onStackClick={onStackClick}/>
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
export default connect(mapState)(TexasHoldemController);
