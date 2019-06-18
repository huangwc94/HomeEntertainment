import {Poker} from './Poker';
import {PlayerBase} from './PlayerBase';


export class PokerTable {

    private poker: Poker;

    constructor(public numberOfSets: number, public players: PlayerBase[]) {
        this.poker = new Poker(numberOfSets);
    }

}
