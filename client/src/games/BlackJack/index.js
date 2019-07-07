import React from 'react';
import {makeStyles} from '@material-ui/core/styles';
import Player from './Player';

import Typography from '@material-ui/core/Typography';
import CardStack from "../../components/CardStack";
import Sound from 'react-sound';
import PromotionAndCountdown from "../../components/PromotionAndCountdown";
import PokerCard from "../../components/PokerCard";
import {connect} from "react-redux";


const useStyles = makeStyles(theme => ({
    container: {
        display: 'flex',
        position: 'float',
        flexDirection: 'column',
        justifyContent: 'space-around',
        alignItems: 'center',
        height: '100vh',
        backgroundColor: '#456e4a'
    },
    dealerContainer: {
        paddingTop: '5vh',
        height:'27vh',
        justifyContent: 'center',
        alignItems: 'center',
        justifyItems: 'center',
        width: '50%',
        display: 'flex',
        flexDirection: ' row',
    },
    boardContainer: {
        flex: 1,
        flexGrow: 1,
        width: '100%',
    },
    playerContainer: {
        width: '100%',
        height: '55vh',
        display: 'flex',
        flexDirection: 'row',
        justifyContent: 'space-around'
    },
    remainingCardsContainer: {
        display:'flex',
        justifyContent:'center',
        alignItems:'center',
        position: 'absolute',
        top:'7vh',
        right:'5vh',
        textAlign: 'center',
        color: 'white'
    }
}));

function BlackJack(props) {

    const {remote} = props;
    const {gameState, players} = remote;
    const styles = useStyles();
    return (
        <div className={styles.container}>
            <div className={styles.remainingCardsContainer}>
                <PokerCard value={1} suit={'clubs'} show={false} />
                <h1 styles={{margin:10}}> X {gameState.cardLeft}</h1>
            </div>
            <div className={styles.dealerContainer}>
                <Typography variant="h3" id="modal-title" style={{color: 'white', marginRight: '20%'}}>
                    {gameState.dealValue !== 0 && gameState.dealValue} {gameState.dealValue > 21 && "庄家爆牌！"} {gameState.dealValue === 21 && "庄家 Black Jack！"}
                </Typography>
                <CardStack cards={gameState.dealHand}/>
            </div>

            <div className={styles.boardContainer}>
                <PromotionAndCountdown promotion={gameState.promotion} countDown={gameState.countDown}/>
            </div>

            <div className={styles.playerContainer}>
                {
                    Object.values(players).map((player) => (<Player player={player} key={player.id}/>))
                }
            </div>
            <Sound
                url={'/music/card-game.mp3'}
                loop
                autoPlay='autoplay'
                volume={40}
                autoLoad
                playStatus={Sound.status.PLAYING}
            />
        </div>
    )
}

const mapState = (state) => ({
    ...state
});
export default connect(mapState)(BlackJack);
