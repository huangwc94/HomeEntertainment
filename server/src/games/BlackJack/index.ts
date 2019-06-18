import {BlackJackTable} from './components/BlackJackTable';
import {BlackJackPlayer} from './components/BlackJackPlayer';
import {IGame} from '../../components/Game';
import {PlayerBase} from '../../components/PlayerBase';
import {Room} from '../../components/Room';

export class BlackJack implements IGame {
    constructor(private room: Room) {
    }

    public getGameName(): string {
        return '';
    }

    public getGameState(): any {
    }

    public onPlayerEnter(player: PlayerBase): void {
    }

    public onPlayerLeave(player: PlayerBase): void {
    }

    public onRoomClose(): void {

    }


}
