import {IGame} from '../components/Game';
import {Room} from '../components/Room';
import {BlackJack} from './BlackJack';

export function gameFactory(gameType: string, room: Room): IGame {
    switch (gameType) {
        case 'BlackJack':
            return new BlackJack(room);
        default:
            throw new Error(`"${gameType}" is not a valid game type!`);
    }
}
