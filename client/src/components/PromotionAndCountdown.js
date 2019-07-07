import React from 'react';
import Typography from '@material-ui/core/Typography';


export default class PromotionAndCountdown extends React.PureComponent {


    componentWillReceiveProps(nextProps, nextContext) {
        if (nextProps.countDown >= 0 && nextProps.countDown !== this.props.countDown) {
            const audio = new Audio('/sounds/tick.mp3');
            const r = audio.play();
        }
    }

    render() {

        const {promotion, countDown} = this.props;

        return (
            <React.Fragment>
                <Typography variant="h3" id="modal-title" style={{color: 'white', textAlign: 'center'}}>
                    {promotion}
                </Typography>
                <Typography
                    variant="h3"
                    id="modal-title"
                    style={{color: 'white', textAlign: 'center', margin: '2vh'}}
                >
                    {countDown >= 0 && countDown}
                </Typography>
            </React.Fragment>
        );
    }
}
