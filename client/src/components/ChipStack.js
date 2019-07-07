import React from 'react';
import { makeStyles } from '@material-ui/core/styles';
//import svg from "./cards/1_of_clubs.svg";
import posed, { PoseGroup } from 'react-pose';
import Chip from './Chip';

const useStyles = makeStyles(theme => ({
    container: {
        display: 'flex',
        flexDirection: 'row',
        height: '10vh',
        width: '100%',
        justifyContent: 'space-around',

    },
    stack: {
        display: 'flex',
        flexDirection: 'column-reverse',
        justifyContent: 'end',
        width: '24%',
    },
    chip: {
        height: '1vh'
    }
}));

const ChipAnimated = posed.div({
    enter: {
        y: 0,
        opacity: 1,
        transition: {
            y: 'easeIn',
            duration: 100,
        }
    },
    exit: {
        y: -100,
        opacity: 0,
        transition: {
            y: 'easeOut',

        }
    },
});

function chipRenderer(value, number, className) {
    const res = [];
    for (let index = 0; index < number; index++) {
        res.push(<ChipAnimated className={className} style={{zIndex: index + 100}} key={index}><Chip
            value={value}/></ChipAnimated>)
    }
    return res;
}


function ChipStack(props) {

    const {chips, style, onStackClick} = props;

    const styles = useStyles();

    return (
        <div className={styles.container} style={style}>
            <div className={styles.stack} onClick={() => {
                onStackClick && onStackClick(0)
            }}>
                <PoseGroup>
                    {
                        chipRenderer(5, chips[0], styles.chip)
                    }
                </PoseGroup>
            </div>
            <div className={styles.stack} onClick={() => {
                onStackClick && onStackClick(1)
            }}>
                <PoseGroup>
                    {
                        chipRenderer(25, chips[1], styles.chip)
                    }
                </PoseGroup>
            </div>
            <div className={styles.stack} onClick={() => {
                onStackClick && onStackClick(2)
            }}>
                <PoseGroup>
                    {
                        chipRenderer(50, chips[2], styles.chip)
                    }
                </PoseGroup>
            </div>
            <div className={styles.stack} onClick={() => {
                onStackClick && onStackClick(3)
            }}>
                <PoseGroup>
                    {
                        chipRenderer(100, chips[3], styles.chip)
                    }
                </PoseGroup>
            </div>
        </div>
    )
}

export default ChipStack;
