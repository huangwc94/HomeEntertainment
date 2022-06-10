import React from 'react';
import { makeStyles } from '@material-ui/core/styles';
//import svg from "./cards/1_of_clubs.svg";
import posed, { PoseGroup } from 'react-pose';
import PokerCard from './PokerCard';

const useStyles = makeStyles(theme => ({
    container: {
        display: 'flex',
        position: 'relative',
        justifyContent: 'center',
        width: '100%',
        minWidth: '10vw'
    },
    description: {
        position: 'absolute',
        bottom: 0,
        width: '100%',
        zIndex: 50,
        textAlign: 'center',
        color:'white',
        backgroundColor: 'rgba(0,0,0,0.5)',
    }
}));

const Card = posed.div({

    left: {
        x: -300,
        y: -200,
        opacity: 0,
        transition: {
            y: 'easeOut',
        }
    },
    enter: {
        x: 0,
        y: 0,
        opacity: 1,
        transition: {
            y: 'easeIn'
        }
    },
    right: {
        x: 300,
        y: -200,
        opacity: 0,
        transition: {
            y: 'easeOut',
        }
    },
});

function CardStack(props) {

    const {cards, display, height, description} = props;

    const styles = useStyles();
    const cardWidth = !display ? '3vh' : null;
    const justifyContent = display ? 'space-around' : 'flex-start';
    return (
        <div className={styles.container} style={{justifyContent}}>
            <PoseGroup
                preEnterPose={'right'}
                exitPose={'left'}
            >
                {
                    cards.map(({suit, value, show}, index) => (
                        <Card
                              style={{zIndex: index , width: cardWidth}}
                              key={index}>
                            <PokerCard value={value}
                                       height={height}
                                       suit={suit}
                                       show={show}/>
                        </Card>))
                }
            </PoseGroup>
            {
                !!description &&
                <div className={styles.description}>
                    <h3>{description}</h3>
                </div>
            }

        </div>
    )
}

export default CardStack;
