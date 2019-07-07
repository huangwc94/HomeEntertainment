import { ALL } from 'tslint/lib/rules/completedDocsRule';
import { ICard, Poker } from '../../components/Poker';

import { ChipStack, IChipStack } from '../../components/ChipStack';

import { IGamePlayer } from '../../core/Player';

// @ts-ignore
import * as PokerSolver from 'pokersolver';
import { PLAYER_EVEN } from '../BlackJack/components/BlackJackPlayer';
import { SMALL_BLIND_BET, TexasHoldem } from './index';

// START GAME STATE
export const WAIT_GAME = '等待开始';

// BET STATE
export const WAIT_ACT = '等待行动';
export const IN_ACT = '正在行动';
export const BET_RAISE = '玩家加注';
export const WAIT_OTHER = '等待其他玩家';
export const ALL_IN = '玩家全压';


// END STATE
export const PLAYER_WIN = '玩家获胜！';
export const PLAYER_FOLD = '玩家弃牌';

export enum TexasHoldemRole {
    BIG_BLIND = 'BIG_BLIND',
    SMALL_BLIND = 'SMALL_BLIND',
    NONE = 'NONE',
}

export interface ITexasHoldemPlayerState {
    hand: ICard[];
    handResult: string;
    name: string;
    cash: number;
    bet: IChipStack;
    betValue: number;
    chips: IChipStack;
    chipValue: number;
    state: string;
    id: string;
    role: TexasHoldemRole;
    isDealer: boolean;
}

export class TexasHoldemPlayer implements IGamePlayer {

    public hand: ICard[];

    public bet: ChipStack;

    public chips: ChipStack;

    public state: string;

    public cash: number;

    public role: TexasHoldemRole;

    public isDealer: boolean;

    constructor(public id: string, public name: string, chipsValues: number, private game: TexasHoldem) {
        this.hand = [];
        // 5 25 50 100
        this.bet = new ChipStack([0, 0, 0, 0], false);
        this.chips = new ChipStack();
        this.state = WAIT_GAME;
        this.cash = this.chips.evenChip(chipsValues);
        this.role = TexasHoldemRole.NONE;
        this.isDealer = false;
    }

    public addBet(cashValue: number) {
        const res = this.chips.removeChipValue(cashValue);
        if (res < 0) {
            return;
        }
        this.cash += res;
        this.bet.addChipValue(cashValue);
    }

    // BET STAGE ACTIONS
    public onTurn() {
        this.state = IN_ACT;
    }

    public offTurn() {
        if (this.state === IN_ACT) {
            this.state = WAIT_OTHER;
        }
    }

    public check() {
        this.state = WAIT_OTHER;
    }

    public call() {
        const highestBet = this.game.highestBet();
        const callValue = highestBet - this.bet.getCashValue();

        const remaining = this.chips.removeChipValue(callValue);
        if (remaining < 0) {
            throw new Error('Cannot call: insufficient chips');
        }
        this.cash += remaining;
        this.bet.removeAllChips();
        const betRemain = this.bet.addChipValue(highestBet);
        if (betRemain > 0) {
            throw new Error(`Can not add value to bet ${this.bet.getCashValue()} ${betRemain}`);
        }
        this.state = this.chips.getCashValue() === 0 ? ALL_IN : WAIT_OTHER;
    }

    public fold() {
        this.state = PLAYER_FOLD;
    }

    public allIn() {
        this.state = ALL_IN;
        this.bet.addChipValue(this.chips.getCashValue());
        this.chips.removeAllChips();
    }

    public raiseChip(chip: number) {
        const highestBet = this.game.highestBet();
        if (this.chips.removeChip(chip)) {
            this.bet.addChip(chip);
        } else {
            throw new Error('Can not raise Chip as no chip available');
        }
        const valueRemainingToCall = highestBet - this.bet.getCashValue();
        if (valueRemainingToCall > 0) {
            this.cash += this.chips.removeChipValue(valueRemainingToCall);
            this.bet.addChipValue(valueRemainingToCall);
        }
        this.state = this.chips.getCashValue() === 0 ? ALL_IN : BET_RAISE;
    }

    public confirmRaise() {
        this.state = WAIT_OTHER;
    }

    public win(chipValue: number) {
        this.state = PLAYER_WIN;
        this.cash += this.chips.addChipValue(chipValue);
    }

    public setSmallBlind() {
        this.role = TexasHoldemRole.SMALL_BLIND;
        this.addBet(SMALL_BLIND_BET);
    }

    public setBigBlind() {
        this.role = TexasHoldemRole.BIG_BLIND;
        this.addBet(SMALL_BLIND_BET * 2);
    }

    public giveBackUncalledBet() {
        this.cash += this.chips.addChipValue(this.bet.getCashValue());
        this.bet.removeAllChips();
    }

    // OTHER ACTIONS
    public roundReset() {
        this.hand = [];
        this.bet.removeAllChips();
        this.state = WAIT_GAME;
        this.cash = this.chips.evenChip(this.cash);
        this.isDealer = false;
    }

    public getGamePlayerState(): ITexasHoldemPlayerState {
        return {
            id: this.id,
            hand: this.hand,
            name: this.name,
            cash: this.cash,
            chips: this.chips.getStack(),
            chipValue: this.chips.getCashValue(),
            bet: this.bet.getStack(),
            betValue: this.bet.getCashValue(),
            state: this.state,
            handResult: this.hand.length === 2 && this.getHandResult().name,
            role: this.role,
            isDealer: this.isDealer,
        };
    }

    public getHandResult(): PokerSolver.Hand {
        const cards = this.game.communityCards.map((card) => Poker.cardToString(card));
        this.hand.forEach((card) => cards.push(Poker.cardToString(card)));
        return PokerSolver.Hand.solve(cards);
    }

    // state condition
    public canRaise(): boolean {
        return (this.chips.getCashValue() + this.bet.getCashValue() - this.game.highestBet()) > SMALL_BLIND_BET;
    }

    public canCall(): boolean {
        return (this.chips.getCashValue() + this.bet.getCashValue()) >= this.game.highestBet();
    }

    public canAllIn(): boolean {
        return true; // player always can ALL IN
    }

    public canCheck(): boolean {
        return this.bet.getCashValue() === this.game.highestBet();
    }

    public shouldAct(): boolean {
        return this.state === WAIT_ACT;
    }

    public canAct(): boolean {
        return ![ALL_IN, PLAYER_FOLD].includes(this.state);
    }

    public shouldShow(): boolean {
        return this.state !== PLAYER_FOLD && this.hand.length === 2 && this.hand.some((card) => !card.show);
    }

    public inGame(): boolean {
        return [WAIT_ACT, WAIT_OTHER, ALL_IN].includes(this.state);
    }
}
