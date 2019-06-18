import React from 'react';
import { isMobile } from 'react-device-detect';

const styles = {
    chip: {
        height: isMobile ? '10vh' : '6vh',
    }
};

export const allChipResource = () =>{
    const images = [];

    let fileName = `/chips/chip_5.png`;
    images.push(fileName);

    fileName = `/chips/chip_25.png`;
    images.push(fileName);

    fileName = `/chips/chip_50.png`;
    images.push(fileName);

    fileName = `/chips/chip_100.png`;
    images.push(fileName);

    const audios = [];

    audios.push('/sounds/chipsStack4.wav');
    audios.push('/sounds/chipsStack2.wav');

    return {images, audios};
};


export class Chip extends React.PureComponent {


    componentDidMount() {
        const audio = new Audio('/sounds/chipsStack4.wav');
        const r = audio.play();
        r.catch((e) => {
           console.log(e);
        });
    }

    componentWillUnmount() {
        const audio = new Audio('/sounds/chipsStack2.wav');
        const r = audio.play();
    }

    render() {
        const {value} = this.props;

        return (
            <div>
                <img src={`/chips/chip_${value}.png`} alt={`chip_${value}.png`} style={styles.chip}/>
            </div>
        )
    }
}

export default Chip;
