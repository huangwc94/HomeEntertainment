import React from 'react';
import {makeStyles} from '@material-ui/core/styles';
import Typography from '@material-ui/core/Typography';

import CardStack from "../../components/CardStack";
import ChipStack from "../../components/ChipStack";
import posed from 'react-pose';
import NameAndAvatar from "../../components/NameAndAvatar";


const useStyles = makeStyles(theme => ({
    container: {
        width: '19%',
        padding: 3,
        borderStyle: 'solid',
        borderWidth: 3,
        borderRadius: 5,
    },
    chipContainer: {
        width: '100%',
        paddingBottom: '4vh',
    }
}));


const AnimatedBorder = posed.div({
    blinkWhite:{
        borderColor: '#fff',
        transition: () => ({
            type: 'keyframes',
            values: ['#456e4a', '#fff', '#456e4a'],
            duration: 2000,
            loop: 'Infinity'
        }),
    },

    blinkBlue: {
        borderColor: '#140587',
        transition: () => ({
            type: 'keyframes',
            values: ['#140587', '#fff', '#140587'],
            duration: 2000,
            loop: 'Infinity'
        }),
    },

    blinkRed: {
        borderColor: '#a50b0b',
        transition: () => ({
            type: 'keyframes',
            values: ['#a50b0b', '#fff', '#a50b0b'],
            duration: 2000,
            loop: 'Infinity'
        }),
    },

    blinkGold: {
        borderColor: '#e2df06',
        transition: () => ({
            type: 'keyframes',
            values: ['#e2df06', '#fff', '#e2df06'],
            duration: 2000,
            loop: 'Infinity'
        }),
    },
    none: {

    }

});


function Player(props) {

    const {hand, bet, betValue, handValue, state} = props.player;
    const {name, avatar} = props.roomPlayer;

    const styles = useStyles();

    let borderColor = '#456e4a';
    let poseState = 'none';

    switch (state) {
        case '正在要牌':
            borderColor = 'white';
            poseState = 'blinkWhite';
            break;
        case '已经下注':
            borderColor = '#140587';
            poseState = 'none';
            break;
        case '爆牌':
            borderColor = '#a50b0b';
            poseState = 'blinkRed';
            break;
        case '庄家获胜':
            borderColor = '#a50b0b';
            poseState = 'blinkRed';
            break;
        case '21点！':
            borderColor = '#e2df06';
            poseState = 'blinkGold';
            break;
        case '玩家获胜！':
            borderColor = '#e2df06';
            poseState = 'blinkGold';
            break;
        case '平局':
            borderColor = '#42f4e5';
            poseState = 'none';
            break;
        default:
            borderColor = '#456e4a';
            poseState = 'none';
            break;
    }

    return (
        <AnimatedBorder className={styles.container} style={{borderColor}} >
            <div className={styles.chipContainer}>
                <ChipStack chips={bet}/>
            </div>
            <NameAndAvatar name={name} textStyle={{color:'white'}} avatar={avatar}/>
            <Typography variant="h6" id="modal-title" style={{color: 'white', textAlign: 'center'}}>
                下注：{betValue}
            </Typography>
            <Typography variant="h5" id="modal-title" style={{color: 'white', textAlign: 'center'}}>
                {handValue !== 0 && `手牌：${handValue}`}
            </Typography>
            <CardStack cards={hand}/>
        </AnimatedBorder>
    )
}

export default Player;
