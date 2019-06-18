import {PlayerBase} from './PlayerBase';
import {Room} from './Room';


export interface IGame {

    getGameName(): string;

    getGameState(): any;

    onPlayerEnter(player: PlayerBase): void;

    onPlayerLeave(player: PlayerBase): void;

    onRoomClose(): void;
}
