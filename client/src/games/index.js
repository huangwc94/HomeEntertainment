import BlackJack from './BlackJack';
import BlackJackController from './BlackJack/BlackJackController';
import { allPokerCardResource } from '../components/PokerCard';
import { allChipResource } from '../components/Chip';
import TexasHoldem from './TexasHoldem';
import TexasHoldemController from './TexasHoldem/TexasHoldemController';


export const GameList = {
    BlackJack: BlackJack,
    TexasHoldem: TexasHoldem,
};

export const ControllerList = {
    BlackJack: BlackJackController,
    TexasHoldem: TexasHoldemController
};


export const PrecacheAssets = {
    BlackJack: {
        images: [...allPokerCardResource().images, ...allChipResource().images],
        audios: [...allChipResource().audios, ...allPokerCardResource().audios]
    },
    TexasHoldem: {
        images: [...allPokerCardResource().images, ...allChipResource().images, '/texasholdem/bb.svg', '/texasholdem/dealer.svg', '/texasholdem/sb.svg', '/texasholdem/fold.svg'],
        audios: [...allChipResource().audios, ...allPokerCardResource().audios]
    },
};

