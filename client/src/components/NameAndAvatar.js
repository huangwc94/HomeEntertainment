import React from 'react';
import Typography from '@material-ui/core/Typography';
import { makeStyles } from '@material-ui/core';
import Avatar from '@material-ui/core/Avatar';
import { Textfit } from 'react-textfit';

const useStyles = makeStyles(theme => ({

    container: {
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        flexDirection: 'column',
    },
    nameContainer: {
        display: 'flex',
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
    }
}));

export default function NameAndAvatar(props) {

    const styles = useStyles();
    const {name, avatar, textStyle, description} = props;
    const aUrl = avatar || '/avatar/default.png';

    return (

            <div className={styles.container}>
            <div className={styles.nameContainer}>
                <Avatar src={aUrl} alt={name} style={{margin: 8}}/>

                <Textfit mode={'single'} forceSingleModeWidth={false}>
                    <Typography variant={'h5'} style={textStyle}>{name}</Typography>
                </Textfit>

            </div>
                <Typography variant={'h6'} style={textStyle}>{description}</Typography>
            </div>
    );

}
