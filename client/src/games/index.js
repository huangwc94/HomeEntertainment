import BlackJack from "./BlackJack";
import BlackJackController from "./BlackJack/BlackJackController";
import {allPokerCardResource} from "../components/PokerCard";
import {allChipResource} from "../components/Chip";


export const GameList = {
    BlackJack: BlackJack,
};

export const ControllerList = {
    BlackJack: BlackJackController,
};


export const PrecacheAssets = {
    BlackJack: {
        images:[...allPokerCardResource().images,...allChipResource().images],
        audios:[...allChipResource().audios, ...allPokerCardResource().audios]
    },
};

