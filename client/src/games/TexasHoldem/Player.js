import React from 'react';
import { makeStyles } from '@material-ui/core/styles';
import Typography from '@material-ui/core/Typography';

import CardStack from '../../components/CardStack';
import ChipStack from '../../components/ChipStack';
import posed from 'react-pose';
import NameAndAvatar from '../../components/NameAndAvatar';
import Avatar from '@material-ui/core/Avatar';

const useStyles = makeStyles(theme => ({
    rowContainer: {
        width: '25vw',
        height: '26vh',
        padding: 3,
        borderStyle: 'solid',
        borderWidth: 3,
        borderRadius: 5,
        display: 'flex',
        flexDirection: 'row',
        justifyContent: 'space-evenly',
        alignItems: 'center',
        position:'relative',
    },
    colContainer: {
        width: '20vw',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'flex-start',
        padding: 3,
        borderStyle: 'solid',
        borderWidth: 3,
        borderRadius: 5,
        alignItems: 'center',
        height:'37vh',
        position:'relative',
    },
    chipContainer: {

    },
    nameAndBadge: {
        display:'flex',
        flexDirection:'row',
        justifyContent:'center',
        alignItems:'center'
    },
    badge: {
        width:'2vw',
        height:'2vw',
    },
    infoContainer: {
        width:'65%'
    },

    cardContainer: {
        width:'30%'
    },

    foldImage: {
        position:'absolute',
        top:'50%',
        left:'50%',
        transform: `translate(-${50}%, -${50}%)`,
        zIndex: 9999,
        width:'20vw'
    }
}));

function Player(props) {
    const {reverse, vertical} = props;
    const {name, avatar} = props.player;
    const {hand, bet, betValue, state, isDealer, role, handResult, chipValue, cash} = props.player.gamePlayerState;

    const styles = useStyles();

    let borderColor = '#456e4a';
    let poseState = 'none';

    switch (state) {
        case '正在行动':
            borderColor = 'white';
            poseState = 'blinkWhite';
            break;
        case '玩家加注':
            borderColor = '#a50b0b';
            poseState = 'blinkRed';
            break;
        case '玩家获胜！':
            borderColor = '#e2df06';
            poseState = 'blinkGold';
            break;
        default:
            borderColor = '#456e4a';
            poseState = 'none';
            break;
    }

    return (
        <div className={vertical ? styles.colContainer : styles.rowContainer} style={{borderColor}}>
            {
                state==='玩家弃牌' && <img className={styles.foldImage} src='/texasholdem/fold.svg'/>
            }
            {
                state==='玩家全压' && <img className={styles.foldImage} src='/texasholdem/allin.svg'/>
            }
            {
                reverse ?
                    <React.Fragment>
                        <div className={styles.infoContainer} style={vertical ? {width: '100%'} : {}}>
                            <div className={styles.nameAndBadge}>
                                <NameAndAvatar name={name} textStyle={{color: 'white'}} avatar={avatar} description={`资产：${chipValue + cash}`}/>
                                {isDealer && <img src={'/texasholdem/dealer.svg'} className={styles.badge}/>}
                                {role === 'BIG_BLIND' && <img src={'/texasholdem/bb.svg'} className={styles.badge}/>}
                                {role === 'SMALL_BLIND' && <img src={'/texasholdem/sb.svg'} className={styles.badge}/>}
                            </div>
                            <div className={styles.chipContainer}>
                                <ChipStack chips={bet}/>
                            </div>
                        </div>
                        <div className={styles.cardContainer}>
                            <CardStack cards={hand} description={hand.every((c) => c.show) && handResult} height={'15vh'}/>
                        </div>
                    </React.Fragment>

                    :
                    <React.Fragment>
                        <div className={styles.infoContainer} style={vertical ? {width: '100%'} : {}}>
                            <div className={styles.chipContainer}>
                                <ChipStack chips={bet}/>
                            </div>
                            <div className={styles.nameAndBadge}>
                                <NameAndAvatar name={name} textStyle={{color: 'white'}} avatar={avatar} description={`资产：${chipValue + cash}`}/>
                                {isDealer && <img src={'/texasholdem/dealer.svg'} className={styles.badge}/>}
                                {role === 'BIG_BLIND' && <img src={'/texasholdem/bb.svg'} className={styles.badge}/>}
                                {role === 'SMALL_BLIND' && <img src={'/texasholdem/sb.svg'} className={styles.badge}/>}
                            </div>
                        </div>
                        <div className={styles.cardContainer}>
                            <CardStack cards={hand} description={hand.every((c) => c.show) && handResult} height={'15vh'}/>
                        </div>
                    </React.Fragment>
            }

        </div>
    )
}

export default Player;
