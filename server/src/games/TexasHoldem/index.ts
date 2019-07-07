import { Logger } from '@overnightjs/logger';
// @ts-ignore
import * as PokerSolver from 'pokersolver';
import { ICard, Poker } from '../../components/Poker';
import { StageSystem } from '../../components/StageSystem';
import { IGame } from '../../core/Game';
import { Player } from '../../core/Player';
import { IRoomConfig, Room } from '../../core/Room';
import { IInputAction } from '../../network';
import { ActStage } from './stages/ActStage';
import { DistributeStage } from './stages/DistributeStage';
import { EndStage } from './stages/EndStage';
import { FlipStage } from './stages/FlipStage';
import { GameOverStage } from './stages/GameOverStage';
import { ShowDownStage } from './stages/ShowDownStage';
import { StartStage } from './stages/StartStage';
import { PLAYER_FOLD, TexasHoldemPlayer, TexasHoldemRole } from './TexasHoldemPlayer';

export const STAGE_START = 'START';
export const STAGE_DISTRIBUTE = 'DISTRIBUTE';
export const STAGE_ACT = 'ACT';
export const STAGE_FLIP = 'FLIP';
export const STAGE_SHOWDOWN = 'SHOWDOWN';
export const STAGE_END = 'END';
export const STAGE_OVER = 'OVER';

export const SMALL_BLIND_BET = 5;

export enum TexasHoldemPlayerActionType {
    PlayerFold = 'PlayerFold',
    PlayerCheck = 'PlayerCheck',
    PlayerCall = 'PlayerCall',
    PlayerAllIn = 'PlayerAllIn',
    PlayerRaise = 'PlayerRaise',
    PlayerRaiseConfirm = 'PlayerRaiseConfirm',
}

interface ITexasHoldemGameState {
    communityCards: ICard[];
    countDown: number;
    promotion: string;
    stage: string;
    highestBet: number;
}

export interface ITexasHoldemHandResult {
    rank: number;
    name: string;
    description: string;

}

export class TexasHoldem implements IGame {

    public communityCards: ICard[];

    public players: { [id: string]: TexasHoldemPlayer };

    public poker: Poker;

    private readonly stageSystem: StageSystem<TexasHoldem>;

    constructor(public room: Room) {
        this.players = {};
        this.poker = new Poker(1);
        this.communityCards = [];
        this.stageSystem = new StageSystem<TexasHoldem>(
            this,
            () => this.room.broadcastFullUpdate(),
            () => this.room.broadcastFullUpdate(),
        );
        this.stageSystem.stages = {
            [STAGE_START]: new StartStage(this, this.stageSystem),
            [STAGE_ACT]: new ActStage(this, this.stageSystem),
            [STAGE_DISTRIBUTE]: new DistributeStage(this, this.stageSystem),
            [STAGE_FLIP]: new FlipStage(this, this.stageSystem),
            [STAGE_SHOWDOWN]: new ShowDownStage(this, this.stageSystem),
            [STAGE_END]: new EndStage(this, this.stageSystem),
            [STAGE_OVER]: new GameOverStage(this, this.stageSystem),
        };
        this.stageSystem.currentStage = STAGE_START;
    }

    private static isValidAction(action: any): boolean {
        if (typeof action.type === 'string') {
            if (action.type in TexasHoldemPlayerActionType) {
                if (action.type === TexasHoldemPlayerActionType.PlayerRaise) {
                    return typeof action.payload === 'number';
                } else {
                    return true;
                }
            }
        }
        Logger.Warn(`[Texas Holdem] Receive invalid input action: ${action.type} ${action.payload}`);
        return false;
    }

    public getRoomConfig(): IRoomConfig {
        return {
            tickFrequency: 1000,
            numberOfPlayerAllow: 8,
            gameName: 'TexasHoldem',
            shareGamePlayerState: false,
            numberOfPlayerRequired: 2,
        };
    }

    public findWinnerBetween(players: TexasHoldemPlayer[]): TexasHoldemPlayer[] {

        // From wiki: https://en.wikipedia.org/wiki/Texas_hold_%27em#Play_of_the_hand
        // If the five community cards form the player's best hand,
        // then the player is said to be playing the board and can only hope to split the pot,
        // because each other player can also use the same five cards to construct the same hand.[10]

        // Also From wiki: https://en.wikipedia.org/wiki/Kicker_(poker)
        // A kicker, also called a side card,
        // is a card in a poker hand that does not itself take part in determining the rank of the hand,
        // but that may be used to break ties between hands of the same rank.[1][2]
        // For example, the hand Q-Q-10-5-2 is ranked as a pair of queens.
        // The 10, 5, and 2 are kickers. This hand would defeat any hand with no pair, or with a lower-ranking pair,
        // and lose to any higher-ranking hand.
        // But the kickers can be used to break ties between other hands that also have a pair of queens.
        // For example, Q-Q-K-3-2 would win (because its K kicker outranks the 10),
        // but Q-Q-10-4-3 would lose (because its 4 is outranked by the 5).

        const playerInCompare = players.filter((player) => player.state !== PLAYER_FOLD);
        const handWithPlayerReference = playerInCompare.map((p) => [p.getHandResult(), p]);
        const winnerHands = PokerSolver.Hand.winners(handWithPlayerReference.map((h) => h[0]));
        return handWithPlayerReference.filter((p) => winnerHands.includes(p[0])).map((p) => p[1]);
    }

    public calculateWinner() {
        let remainingPlayers: TexasHoldemPlayer[] = this.getPlayerArray();

        while (remainingPlayers.length > 1) {
            let currentPot = 0;
            remainingPlayers.sort((p1, p2) => p1.bet.getCashValue() - p2.bet.getCashValue());
            const minValue = remainingPlayers[0].bet.getCashValue();

            remainingPlayers.forEach((player) => {
                const remainingCash = player.bet.removeChipValue(minValue);
                currentPot += minValue;
                // player will donate chip value tail to the pot
                if (remainingCash > 0) {
                    currentPot += remainingCash;
                }
            });

            const winners = this.findWinnerBetween(remainingPlayers);
            const winnerPot = Math.floor(currentPot / winners.length);
            winners.forEach((winner) => {
                winner.win(winnerPot);
            });

            // winner pot tail will be win by the first winner
            winners[0].win(currentPot - winnerPot * winners.length);

            remainingPlayers = remainingPlayers.filter((p) => p.bet.getCashValue() > 0);
        }

        if (remainingPlayers.length === 1) {
            remainingPlayers[0].giveBackUncalledBet();
        }
    }

    public onPlayerEnter(player: Player): void {
        if (player.cash < SMALL_BLIND_BET * 2) {
            Logger.Info(`[TexasHoldem] Player ${player.name} is coming with no chips, kicked`);
            player.disconnect();
            return;
        }
        const gamePlayer = new TexasHoldemPlayer(player.id, player.name, player.cash, this);
        this.players[player.id] = gamePlayer;
        player.gamePlayer = gamePlayer;
    }

    public onPlayerLeave(player: Player): void {
        if (this.stageSystem.currentStage === STAGE_ACT) {
            const betStage = this.stageSystem.getCurrentStage() as ActStage;
            if (!!betStage && betStage.getCurrentTurn() === player.gamePlayer) {
                betStage.nextActPlayer();
            }
        }
        player.cash = this.players[player.id].cash + this.players[player.id].chips.getCashValue();
        player.saveUser();
        delete this.players[player.id];

        if (this.getPlayerArray().length === 1) {
            this.stageSystem.changeStage(STAGE_OVER);
        }
    }

    private getPromote(): string {
        return this.stageSystem.getPromotion();
    }

    public getGameState(): ITexasHoldemGameState {
        return {
            communityCards: this.communityCards,
            countDown: this.stageSystem.countDown,
            stage: this.stageSystem.currentStage,
            promotion: this.getPromote(),
            highestBet: this.highestBet(),
        };
    }

    public getPlayerArray(): TexasHoldemPlayer[] {
        return Object.values(this.players);
    }

    public handlePlayerInput(player: Player, action: IInputAction): void {
        if (!!TexasHoldem.isValidAction(action)) {
            Logger.Info(`[Texas Holdem] Player Input Received ${player.name}: ${action.type} ${action.payload}`);
            this.stageSystem.handlePlayerInput(player, action);
        }
    }

    public end(): void {
        this.stageSystem.endStage();
        Logger.Info(`[Texas Holdem] Game End!`);
    }

    public tick(delta: number): void {
        this.stageSystem.tick();
    }

    public start(): void {
        Logger.Info(`[Texas Holdem] Game Start!`);
        const randomDealerIndex = Math.floor(Math.random() * Math.floor(this.getPlayerArray().length - 1));
        this.getPlayerArray()[randomDealerIndex].isDealer = true;
        this.stageSystem.currentStage = STAGE_START;
        this.stageSystem.startStage();
    }

    public getDealer(): TexasHoldemPlayer {
        const dealer = this.getPlayerArray().find((p) => p.isDealer);
        if (!dealer) {
            throw new Error('Can not find dealer in game');
        }
        return dealer;
    }

    public lastReceiveCardPlayer(): TexasHoldemPlayer {
        // last receive card player is dealer
        return this.getDealer();
    }

    public firstActPlayer(): TexasHoldemPlayer {
        // first Act player is the next of big blind
        const bbIndex = this.getPlayerArray().findIndex((p) => p.role === TexasHoldemRole.BIG_BLIND);
        if (bbIndex < 0) {
            throw new Error('Can not find big blind in game');
        }
        const nextOfBigBlind = (bbIndex + 1) % this.getPlayerArray().length;
        return this.getPlayerArray()[nextOfBigBlind];
    }

    public getPlayerArrayStartingAt(player: TexasHoldemPlayer | null, offset: number = 0): TexasHoldemPlayer[] {

        if (!player) {
            return this.getPlayerArray();
        }

        const startingPlayerIndex = this.getPlayerArray().indexOf(player);
        if (startingPlayerIndex < 0) {
            throw new Error('Can not find player in game');
        }
        const playerLength = this.getPlayerArray().length;
        const startingIndex = (startingPlayerIndex + playerLength + (offset % playerLength)) % playerLength;

        const players = [this.getPlayerArray()[startingIndex]];
        players.push(...this.getPlayerArray().filter((p, index) => index > startingIndex));
        players.push(...this.getPlayerArray().filter((p, index) => index < startingIndex));
        return players;
    }

    public getCardDistributeSequence(): TexasHoldemPlayer[] {
        return this.getPlayerArrayStartingAt(this.lastReceiveCardPlayer(), 1);
    }

    public highestBet(): number {
        return Math.max(...this.getPlayerArray().map((p) => p.bet.getCashValue()));
    }

    public dispatchCardToCommunity() {
        const card = this.poker.randomGet();
        this.communityCards.push(card);
    }
}
