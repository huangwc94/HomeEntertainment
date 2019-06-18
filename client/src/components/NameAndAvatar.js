import React from 'react';
import Typography from '@material-ui/core/Typography';
import {makeStyles} from "@material-ui/core";
import Avatar from '@material-ui/core/Avatar';
const useStyles = makeStyles(theme => ({

    container: {
        display: 'flex',
        flexDirection:'row',
        justifyContent: 'center',
        alignItems: 'center',
    }
}));

export default function NameAndAvatar(props) {

    const styles = useStyles();
    const {name, avatar, textStyle} = props;
    const aUrl = avatar || '/avatar/default.png';

    return (
        <div className={styles.container}>
            <Avatar src={aUrl} alt={name} style={{margin:8}}/>
            <Typography variant='h5' style={textStyle}>
                {name}
            </Typography>
        </div>
    );

}
