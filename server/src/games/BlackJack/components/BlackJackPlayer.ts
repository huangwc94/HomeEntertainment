import { ICard } from '../../../components/Poker';
import { BlackJack } from '../index';
import { ChipStack, IChipStack, CHIP_VALUES } from '../../../components/ChipStack';
import { Logger } from '@overnightjs/logger';
import { IGamePlayer } from '../../../core/Player';


// START GAME STATE
export const WAIT_BET = '等待下注';

// BET STATE
export const BET_TURN = '正在下注';
export const NOT_ENOUGH_MONEY = '筹码不足';
export const ALREADY_BET = '已经下注';


// ASK STATE : begin
export const WAIT_ASK = '等待要牌';

export const ASK_TURN = '正在要牌';

export const PLAYER_DOUBLE = '双倍下注';
export const WAIT_OTHER = '等待其他玩家';


export const BUSTED = '爆牌';
export const BLACK_JACK = '21点！';
export const INITIAL_BLACK_JACK = '21点！';

// END STATE
export const PLAYER_WIN = '玩家获胜！';
export const PLAYER_SURRENDER = '玩家投降';
export const PLAYER_LOST = '庄家获胜';
export const PLAYER_EVEN = '平局';

export const PLAYER_QUIT = '玩家退出';

export interface IBlackJackPlayerState {
    hand: ICard[];
    name: string;
    handValue: number;
    cash: number;
    bet: IChipStack;
    betValue: number;
    chips: IChipStack;
    chipValue: number;
    state: string;
    id: string;
}

export class BlackJackPlayer implements IGamePlayer {

    public hand: ICard[];

    public bet: ChipStack;

    public chips: ChipStack;

    public state: string;

    public cash: number;

    constructor(public id: string, public name: string, chipsValues: number) {
        this.hand = [];
        // 5 25 50 100
        this.bet = new ChipStack([0, 0, 0, 0], false);
        this.chips = new ChipStack();
        this.state = WAIT_BET;
        this.cash = this.chips.evenChip(chipsValues);
    }

    // DISTRIBUTE STAGE ACTION
    public startDistribute() {
        this.state = this.inRound() ? WAIT_ASK : WAIT_OTHER;
    }

    // ASK STAGE ACTIONS
    public onTurn() {
        this.state = ASK_TURN;
    }

    public offTurn() {
        if (this.state === ASK_TURN) {
            this.state = WAIT_OTHER;
        }
    }

    public double(): boolean {
        if (this.chips.getCashValue() >= this.bet.getCashValue()) {
            const betValue = this.bet.getCashValue();
            const remaining = this.chips.removeChipValue(betValue);
            if (remaining < 0) {
                return false;
            } else {
                this.bet.addChipValue(betValue);
                this.cash += remaining;
                this.state = PLAYER_DOUBLE;
                return true;
            }
        } else {
            return false;
        }
    }

    public receiveCard(card: ICard, isInitial: boolean = false) {
        if (!this.canReceiveCard()) {
            return;
        }

        this.hand.push(card);
        const handValue = BlackJack.handValue(this.hand);
        if (handValue === 21) {
            this.state = isInitial ? INITIAL_BLACK_JACK : BLACK_JACK;
        } else if (handValue > 21) {
            this.state = BUSTED;
        }
    }

    // END STAGE ACTIONS
    public win(rate: number = 1) {
        if (this.inRound() && !this.inFinalState()) {
            const betValue = this.bet.getCashValue();
            this.bet.removeAllChips();
            this.cash += this.chips.evenChip(betValue * rate + betValue);
            this.state = PLAYER_WIN;
        }
    }

    public surrender() {
        if (this.inRound() && !this.inFinalState()) {
            const betValue = this.bet.getCashValue();
            this.cash += this.chips.addChipValue(betValue / 2);
            this.bet.removeAllChips();
            this.state = PLAYER_SURRENDER;
        }
    }

    public even() {
        if (this.inRound() && !this.inFinalState()) {
            this.cash += this.chips.addChipValue(this.bet.getCashValue());
            this.bet.removeAllChips();
            this.state = PLAYER_EVEN;
        }
    }

    public lost() {
        if (this.inRound() && !this.inFinalState()) {
            this.bet.removeAllChips();
            this.cash += this.chips.evenChip();
            this.state = PLAYER_LOST;
        }
    }

    // BET STAGE ACTION
    public addBet(bet: number) {
        if (this.state !== BET_TURN) {
            return;
        }
        if (!CHIP_VALUES.includes(bet)) {
            Logger.Warn(`Player add invalid bet ${bet}`);
            return;
        }
        if (this.chips.removeChip(bet)) {
            this.bet.addChip(bet);
            return;
        } else {
            Logger.Warn(`Player dont have enough chips to bet`);
            this.state = NOT_ENOUGH_MONEY;
        }
    }

    public startBet() {
        this.state = BET_TURN;
    }

    public completeBet() {
        this.state = ALREADY_BET;
    }

    // OTHER ACTIONS
    public roundReset() {
        this.hand = [];
        this.bet.removeAllChips();
        this.state = WAIT_BET;
        this.cash = this.chips.evenChip(this.cash);
    }

    public canBet(): boolean {
        return [BET_TURN, NOT_ENOUGH_MONEY].includes(this.state);
    }

    public inFinalState(): boolean {
        return [PLAYER_WIN, PLAYER_LOST, PLAYER_EVEN, PLAYER_SURRENDER].includes(this.state) || !this.inRound();
    }

    public inRound(): boolean {
        return this.bet.getCashValue() > 0;
    }

    public isCompleteBet(): boolean {
        return [ALREADY_BET].includes(this.state);
    }

    public haveChip(): boolean {
        return this.chips.getCashValue() > 0;
    }

    public canReceiveCard(): boolean {
        return this.inRound();
    }

    public canAsk(): boolean {
        return this.inRound() && [WAIT_ASK, ASK_TURN].includes(this.state);
    }

    public getGamePlayerState(): IBlackJackPlayerState {
        return {
            id: this.id,
            hand: this.hand,
            name: this.name,
            cash: this.cash,
            chips: this.chips.getStack(),
            chipValue: this.chips.getCashValue(),
            handValue: BlackJack.handValue(this.hand),
            bet: this.bet.getStack(),
            betValue: this.bet.getCashValue(),
            state: this.state,
        };
    }
}
