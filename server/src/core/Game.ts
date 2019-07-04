import {Player} from './Player';
import {IInputAction} from '../network';
import {IRoomConfig} from './Room';


export interface IGame {

    getRoomConfig(): IRoomConfig;

    getGameState(): any;

    onPlayerEnter(player: Player): void;

    onPlayerLeave(player: Player): void;

    handlePlayerInput(player: Player, action: IInputAction): void;

    start(): void;

    end(): void;

    isPlaying(): boolean;

    tick(delta: number): void;
}
