import {PlayerController} from './PlayerController';
import {IInputAction} from '../network';
import {IRoomConfig} from './Room';


export interface IGame {

    getRoomConfig(): IRoomConfig;

    getGameName(): string;

    getGameState(): any;

    onPlayerEnter(player: PlayerController): void;

    onPlayerLeave(player: PlayerController): void;

    handlePlayerInput(player: PlayerController, action: IInputAction): void;

    start(): void;

    end(): void;

    isPlaying(): boolean;

    numberOfPlayerAllow(): number;

    tick(): void;
}
