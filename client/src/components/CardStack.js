import React from 'react';
import { makeStyles } from '@material-ui/core/styles';
//import svg from "./cards/1_of_clubs.svg";
import posed, {PoseGroup} from 'react-pose';
import PokerCard from "./PokerCard";

const useStyles = makeStyles(theme => ({
    container: {
        display:'flex',
    },
    card: {
        width:'3vh',
    }
}));

const Card = posed.div({
    enter: {
        y:'0',
        opacity: 1,
        transition:{
            y: 'easeIn'
        }
    },
    exit: {
        y:'-20vh',
        opacity: 0,
        transition:{
            y: 'easeOut'
        }
    },
});

function CardStack(props) {

    const {cards, style} = props;

    const styles = useStyles();

    return (
        <div className={styles.container} style={style}>
            <PoseGroup>
                {
                    cards.map(({suit, value, show}, index) => (<Card className={styles.card} style={{zIndex:index +100}} key={index}><PokerCard  value={value} suit={suit} show={show}/></Card>))
                }
            </PoseGroup>
        </div>
    )
}

export default CardStack;
