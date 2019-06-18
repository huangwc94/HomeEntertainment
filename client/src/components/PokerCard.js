import React from 'react';

const styles = {
    card: {
        height:'23vh',
    }
};

export const allPokerCardResource = () =>{
    const images = [];
    for(let i = 1; i < 13 ; i++){
        for(let s in ['clubs','diamonds','spades','hearts']){
            const fileName = `/cards/${i}_of_${s.toLowerCase()}.svg`;
            images.push(fileName)
        }
    }
    images.push('/cards/back.svg');
    images.push('/cards/black_joker.svg');
    images.push('/cards/red_joker.svg');

    const audios = [];

    audios.push('/sounds/cardSlide1.wav');
    audios.push('/sounds/cardSlide3.wav');

    return {images, audios};
};


export class PokerCard extends React.PureComponent {

    // constructor(props){
    //     super(props);
    //     this.state = {
    //         poseState: 'exit'
    //     };
    // }
    //
    componentDidMount() {
        const audio = new Audio('/sounds/cardSlide1.wav');
        const r = audio.play();
    }
    //
    // componentWillReceiveProps(nextProps, nextContext) {
    //     if(this.props.show !== nextProps.show){
    //         this.setState({poseState: 'exit'});
    //         setTimeout(()=>{
    //             this.setState({poseState: 'enter'});
    //         },300)
    //     }
    // }
    //
    componentWillUnmount() {
        const audio = new Audio('/sounds/cardSlide3.wav');
        const r = audio.play();
    }

    render() {
        const {suit, value, show} = this.props;

        const fileName = show ? `${value}_of_${suit.toLowerCase()}` : 'back';

        return (
            <div>
                <img src={`/cards/${fileName}.svg`} alt={fileName} style={styles.card}/>
            </div>
        )
    }


}

export default PokerCard;
