import { IGame } from '../core/Game';
import { Room } from '../core/Room';
import { BlackJack } from './BlackJack';
import {TexasHoldem} from './TexasHoldem';

export function gameFactory(gameType: string, room: Room): IGame {
    switch (gameType) {
        case 'BlackJack':
            return new BlackJack(room);
        case 'TexasHoldem':
            return new TexasHoldem(room);
        default:
            throw new Error(`"${gameType}" is not a valid game type!`);
    }
}
