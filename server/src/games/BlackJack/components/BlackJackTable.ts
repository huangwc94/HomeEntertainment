import {PokerTable} from '../../../components/PokerTable';
import {PlayerBase} from '../../../components/PlayerBase';

export class BlackJackTable extends PokerTable {


    constructor(public numberOfSets: number, public players: PlayerBase[]) {
        super(numberOfSets, players);
    }
}
