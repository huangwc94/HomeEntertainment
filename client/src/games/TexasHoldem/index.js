import React from 'react';
import { makeStyles } from '@material-ui/core/styles';
import Player from './Player';

import Typography from '@material-ui/core/Typography';
import CardStack from '../../components/CardStack';
import Sound from 'react-sound';
import PromotionAndCountdown from '../../components/PromotionAndCountdown';
import PokerCard from '../../components/PokerCard';
import { connect } from 'react-redux';

const useStyles = makeStyles(theme => ({
    container: {
        paddingTop:'1vh',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-around',
        alignItems: 'center',
        height: '100vh',
        backgroundColor: '#456e4a'
    },
    rowContainer: {
        display: 'flex',
        flexDirection: 'row',
        flex: 1,
        width: '100vw',
        marginTop:'1vh',
        marginBottom:'1vh',
    },
    middleContainer: {
        flex: 2,
        display:'flex',
        width: '100vw',
        flexDirection: 'row',
    },
    boardContainer: {
        flex: 1,
    },
    playerContainer: {
        width: '100%',
        height: '30vh',
        display: 'flex',
        flexDirection: 'row',
        justifyContent: 'space-around'
    },
    playerContainerColumn: {
        flexDirection: 'column',
        width:'20vw',
        display: 'flex',
        justifyContent: 'center',
        alignItems:'center',
        marginLeft:'1vw',
        marginRight:'1vw',
    }
}));

function TexasHoldem(props) {

    const {remote} = props;
    const {gameState, players} = remote;
    const styles = useStyles();

    const playerArray = Object.values(players);

    const playerMap = {
        topPlayers:[],
        rightPlayers:[],
        bottomPlayers:[],
        leftPlayers:[],
    };

    // top right bottom left
    let pushNumber = [0,0,0,0] ;

    switch (playerArray.length) {
        case 2:
            pushNumber = [1,0,1,0];
            break;
        case 3:
            pushNumber = [1,1,1,0];
            break;
        case 4:
            pushNumber = [1,1,1,1];
            break;
        case 5:
            pushNumber = [2,1,1,1];
            break;
        case 6:
            pushNumber = [2,1,2,1];
            break;
        case 7:
            pushNumber = [3,1,2,1];
            break;
        case 8:
            pushNumber = [3,1,3,1];
            break;
    }

    playerMap.topPlayers.push(...playerArray.splice(0,pushNumber[0]));
    playerMap.rightPlayers.push(...playerArray.splice(0,pushNumber[1]));
    playerMap.bottomPlayers.push(...playerArray.splice(0,pushNumber[2]));
    playerMap.bottomPlayers.reverse();
    playerMap.leftPlayers.push(...playerArray.splice(0,pushNumber[3]));
    return (
        <div className={styles.container}>
            <div className={styles.rowContainer}>
                <div className={styles.playerContainer} style={{alignItems:'flex-end'}}>
                    {
                        Object.values(playerMap.topPlayers).map((player) => (<Player player={player} key={player.id} reverse={true}/>))
                    }
                </div>
            </div>
            <div className={[styles.middleContainer]}>
                <div className={[styles.playerContainerColumn]} style={{alignItems:'flex-end'}}>
                    {
                        Object.values(playerMap.leftPlayers).map((player) => (<Player player={player} key={player.id} vertical/>))
                    }
                </div>
                <div className={styles.boardContainer}>
                    <PromotionAndCountdown promotion={gameState.promotion} countDown={gameState.countDown}/>
                    <CardStack cards={gameState.communityCards} display={'full'}/>
                </div>
                <div className={[styles.playerContainerColumn]} style={{alignItems:'flex-start'}}>
                    {
                        Object.values(playerMap.rightPlayers).map((player) => (<Player player={player} key={player.id} vertical/>))
                    }
                </div>
            </div>

            <div className={styles.rowContainer}>
                <div className={styles.playerContainer}>
                    {
                        Object.values(playerMap.bottomPlayers).map((player) => (<Player player={player} key={player.id}/>))
                    }
                </div>
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
export default connect(mapState)(TexasHoldem);
