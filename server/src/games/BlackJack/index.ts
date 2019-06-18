import {BlackJackPlayer, IBlackJackPlayerState} from './components/BlackJackPlayer';
import {IGame} from '../../core/Game';
import {PlayerController} from '../../core/PlayerController';
import {IRoomConfig, Room} from '../../core/Room';
import {ICard, Poker} from '../../components/Poker';
import {Logger} from '@overnightjs/logger';
import {StartStage} from './stages/StartStage';
import {BetStage} from './stages/BetStage';
import {DealStage} from './stages/DealStage';
import {AskStage} from './stages/AskStage';
import {EndStage} from './stages/EndStage';
import {DistributeStage} from './stages/DistributeStage';


export const STAGE_START = 'START';
export const STAGE_BET = 'BET';
export const STAGE_DISTRIBUTE = 'DISTRIBUTE';
export const STAGE_ASK = 'ASK';
export const STAGE_DEAL = 'DEAL';
export const STAGE_END = 'END';

export enum BlackJackPlayerActionType {
    PlayerBet = 'PlayerBet',
    PlayerStand = 'PlayerStand',
    PlayerHit = 'PlayerHit',
    PlayerAddChip = 'PlayerAddChip',
    PlayerSurrender = 'PlayerSurrender',
    PlayerDouble = 'PlayerDouble',
}

export interface IBlackJackPlayerAction {
    type: BlackJackPlayerActionType;
    data: any;
}


export interface IStage {
    handlePlayerInput(playerIndex: string, action: IBlackJackPlayerAction): void;

    stageStart(): void;

    stageEnd(): void;

    tick(): void;

    getPromotion(): string;

    endCountDown(): void;
}

interface IBlackJackGameState {
    playing: boolean;
    players: IBlackJackPlayerState[];
    dealHand: ICard[];
    dealValue: number;
    countDown: number;
    promotion: string;
    playerTurn: number;
    cardLeft: number;
    stage: string;
}

export class BlackJack implements IGame {

    public dealerHand: ICard[];

    public players: { [id: string]: BlackJackPlayer };

    public playing: boolean;

    public countDown: number;

    public poker: Poker;

    public playerTurn: number;

    public stages: { [id: string]: IStage };

    public currentStage: string;

    constructor(public room: Room) {
        this.playing = false;
        this.players = {};
        this.poker = new Poker(6);
        this.dealerHand = [];
        this.countDown = -1;
        this.playerTurn = 0;
        this.stages = {
            [STAGE_START]: new StartStage(this),
            [STAGE_BET]: new BetStage(this),
            [STAGE_DISTRIBUTE]: new DistributeStage(this),
            [STAGE_ASK]: new AskStage(this),
            [STAGE_DEAL]: new DealStage(this),
            [STAGE_END]: new EndStage(this),
        };

        this.currentStage = STAGE_START;
    }

    private static castAction(action: any): IBlackJackPlayerAction | null {
        if (typeof action.type === 'string') {
            switch (action.type) {
                case BlackJackPlayerActionType.PlayerAddChip:
                    return {type: BlackJackPlayerActionType.PlayerAddChip, data: action.payload as number};
                case BlackJackPlayerActionType.PlayerBet:
                    return {type: BlackJackPlayerActionType.PlayerBet, data: null};
                case BlackJackPlayerActionType.PlayerHit:
                    return {type: BlackJackPlayerActionType.PlayerHit, data: null};
                case BlackJackPlayerActionType.PlayerStand:
                    return {type: BlackJackPlayerActionType.PlayerStand, data: null};
                case BlackJackPlayerActionType.PlayerSurrender:
                    return {type: BlackJackPlayerActionType.PlayerSurrender, data: null};
                case BlackJackPlayerActionType.PlayerDouble:
                    return {type: BlackJackPlayerActionType.PlayerDouble, data: null};
                default:
                    Logger.Warn(`[Black Jack] Receive invalid input action: ${action}`);
                    return null;
            }
        }
        Logger.Warn(`[Black Jack] Receive invalid input action: ${action}`);
        return null;
    }

    public getRoomConfig(): IRoomConfig {
        return {
            tickFrequency: 1000,
        };
    }

    public static handValue(cards: ICard[], withHidden: boolean = false): number {
        let valueWithoutAce = 0;
        let numberOfAce = 0;
        cards.forEach((card) => {
            if (!card.show && !withHidden) {
                return;
            }
            if (card.value === 1) {
                numberOfAce++;
            } else {
                valueWithoutAce += card.value > 10 ? 10 : card.value;
            }
        });

        if (numberOfAce === 0) {
            return valueWithoutAce;
        }

        const possibleValueWithAce = [];
        for (let i = 0; i <= numberOfAce; i++) {
            const valueAs1 = i;
            const valueAs11 = (numberOfAce - i) * 11;
            possibleValueWithAce.push(valueWithoutAce + valueAs11 + valueAs1);
        }

        possibleValueWithAce.sort((a, b) => a - b);
        const smallestPossibleValue = possibleValueWithAce[0];

        while (possibleValueWithAce.length > 0) {
            const finalValue = possibleValueWithAce.pop() || 0;
            if (finalValue <= 21) {
                return finalValue;
            }
        }

        return smallestPossibleValue;
    }

    public onPlayerEnter(player: PlayerController): void {
        Logger.Info(`[BlackJack] Player Join Game : ${player.name}`);
        this.players[player.getId()] = new BlackJackPlayer(player.getId(), player.name, player.cash);
    }

    public onPlayerLeave(player: PlayerController): void {
        Logger.Info(`[BlackJack] Player Leave Game : ${player.name}`);
        if (this.currentStage === STAGE_ASK) {
            const askStage = this.stages[this.currentStage] as AskStage;
            if (!!askStage && askStage.getCurrentTUrn() === player.getId()) {
                askStage.nextBetPlayer();
            }
        }
        player.cash = this.players[player.getId()].cash + this.players[player.getId()].chips.getCashValue();
        player.saveUser();
        delete this.players[player.getId()];
    }

    public getGameName(): string {
        return 'BlackJack';
    }

    private getCurrentStage(): IStage | null {
        return this.currentStage in this.stages ? this.stages[this.currentStage] : null;
    }

    private getPromote(): string {
        const stage: IStage | null = this.getCurrentStage();

        if (!!stage) {
            return stage.getPromotion();
        }

        return '';
    }

    public getGameState(): IBlackJackGameState {
        return {
            playing: this.isPlaying(),
            players: Object.values(this.players).map((p) => p.getState()),
            dealHand: this.dealerHand,
            dealValue: BlackJack.handValue(this.dealerHand),
            countDown: this.countDown,
            stage: this.currentStage,
            playerTurn: this.playerTurn,
            promotion: this.getPromote(),
            cardLeft: this.poker.card_left(),
        };
    }

    public endStage(stageName?: string) {
        const name = stageName || this.currentStage;
        if (name in this.stages) {
            Logger.Info(`[BlackJack] Stage end: ${name}`);
            this.stages[name].stageEnd();
            this.countDown = -1;
            this.room.broadcastFullUpdate();
        }
    }

    public setStage(stageName: string) {
        if (this.currentStage in this.stages) {
            this.endStage(this.currentStage);
            Logger.Info(`[BlackJack] Stage change to: ${stageName}`);
            this.currentStage = stageName;
            Logger.Info(`[BlackJack] Stage start: ${stageName}`);
            this.stages[this.currentStage].stageStart();
            this.room.broadcastFullUpdate();
        }
    }

    public handlePlayerInput(player: PlayerController, action: any): void {
        const playerIndex = player.getId();
        const blackjackAction = BlackJack.castAction(action);
        if (!!blackjackAction) {
            Logger.Info(`[BlackJack] Player Input Received ${player.name}: ${blackjackAction.type} ${blackjackAction.data}`);
            this.stages[this.currentStage].handlePlayerInput(playerIndex, blackjackAction);
        }
    }

    public end(): void {
        this.endStage();
        this.room.broadcastFullUpdate();
        Logger.Info(`[BlackJack] Game End!`);
    }

    public isPlaying(): boolean {
        return this.playing;
    }

    public tick(): void {
        const stage: IStage | null = this.getCurrentStage();
        if (!!stage) {
            stage.tick();
            if (this.countDown > 0) {
                this.countDown -= 1;
            } else if (this.countDown === 0) {
                this.countDown = -1;
                stage.endCountDown();
            }
            this.room.broadcastFullUpdate();
        }
    }

    public start(): void {
        Logger.Info(`[BlackJack] Game Start!`);
        this.playing = true;
        this.setStage(STAGE_START);
    }

    public numberOfPlayerAllow(): number {
        return 5;
    }
}
