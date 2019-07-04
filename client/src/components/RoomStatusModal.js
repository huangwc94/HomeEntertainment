import React from 'react';
import Modal from '@material-ui/core/Modal';
import {ServerAddress, WechatRedirectUrl} from "../network";
import {makeStyles} from '@material-ui/core/styles';
import Typography from '@material-ui/core/Typography';
import QRCode from 'qrcode.react';
import ListItemIcon from '@material-ui/core/ListItemIcon';
import ListItem from '@material-ui/core/ListItem';
import List from '@material-ui/core/List';
import ListItemText from '@material-ui/core/ListItemText';
import DoneIcon from '@material-ui/icons/Done';
import ErrorIcon from '@material-ui/icons/Error';
import CircularProgress from '@material-ui/core/CircularProgress';
import CloseIcon from '@material-ui/icons/Close';
import IconButton from '@material-ui/core/IconButton';
import ListItemAvatar from '@material-ui/core/ListItemAvatar';
import Avatar from '@material-ui/core/Avatar';

function getModalStyle() {
    return {
        top: `${50}%`,
        left: `${50}%`,
        transform: `translate(-${50}%, -${50}%)`,
        justifyContent: 'center',
        alignItems: 'center',
        flexDirection: 'column',
        display: 'flex',
    };
}

const useStyles = makeStyles(theme => ({
    paper: {
        position: 'absolute',
        width: '70vh',
        backgroundColor: theme.palette.background.paper,
        boxShadow: theme.shadows[5],
        padding: theme.spacing(4),
        outline: 'none',
    },
    root: {
        justifyContent: 'center',
        alignItems: 'center'
    },
    list: {

        alignItems: 'center',
        width: '80%'
    },
    button: {
        position: 'absolute',
        right: 0,
        top: 0

    },
    avatar: {
        width: '10vw',
        height: '10vw',
        margin: 10,
    }
}));

function generateList(players) {
    return Object.values(players).map((p) => (
        <ListItem key={p.name}>
            <ListItemAvatar>
                <Avatar src={p.avatar} alt={p.name}/>
            </ListItemAvatar>
            <ListItemText
                primary={p.name}
                color='primary'
            />
            <ListItemIcon>
                {p.ready ? <DoneIcon color='primary'/> : <ErrorIcon color="error"/>}
            </ListItemIcon>
        </ListItem>
    ))
}

export default function RoomStatusModal(props) {
    const {remote, back, connected, gameName, roomName} = props;
    const {name, players, maxPlayerNumber} = remote;
    const classes = useStyles();
    const connectionString = process.env.NODE_ENV === 'development' ? ServerAddress + "/controller/" + name + "/" + gameName : `${WechatRedirectUrl}${roomName}!${gameName}`;
    const [modalStyle] = React.useState(getModalStyle);
    return (
        <Modal open={true}>
            {connected ?
                <div style={modalStyle} className={classes.paper}>
                    <IconButton className={classes.button} aria-label="Delete" onClick={() => back()}>
                        <CloseIcon style={{color: 'black'}}/>
                    </IconButton>
                    <Typography variant="h4" id="modal-title" style={{color: 'black', textAlign: 'center'}}>
                        {roomName}
                    </Typography>
                    <QRCode value={connectionString} size={258} includeMargin={true}/>
                    <span>扫码加入</span>
                    {process.env.NODE_ENV === 'development' &&
                    <a href={connectionString} target='_blank'>{connectionString}</a>}
                    <Typography variant="h5" id="modal-title" style={{color: 'black', textAlign: 'center'}}>
                        Player: {players.length}/{maxPlayerNumber}
                    </Typography>
                    <List className={classes.list}>
                        {generateList(players)}
                    </List>
                </div>
                :
                <div style={modalStyle} className={classes.paper}>
                    <h2 style={{display: 'flex', alignItems: 'center', justifyItems: 'center'}}><CircularProgress
                        style={{marginRight: '5vh'}} color="secondary"/>正在连接服务器</h2>
                </div>
            }

        </Modal>
    );
}

