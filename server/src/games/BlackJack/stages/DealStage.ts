import {IBlackJackPlayerAction, IStage, BlackJackPlayerActionType, BlackJack, STAGE_END} from '../index';
import {ICard} from '../../../components/Poker';
import {WAIT_OTHER} from '../components/BlackJackPlayer';
import {Logger} from '@overnightjs/logger';

const DEALER_TURN = '庄家操作';

export interface IPlayerPosition {
    bet: number;
    handValue: number;
}

export class DealStage implements IStage {
    constructor(private game: BlackJack) {

    }

    public handlePlayerInput(playerIndex: string, action: IBlackJackPlayerAction): void {
        return;
    }

    public stageStart(): void {
        this.game.dealerHand.forEach((card: ICard) => card.show = true);
    }

    public stageEnd(): void {
    }


    public tick(): void {
        const handleValue = BlackJack.handValue(this.game.dealerHand);
        Logger.Info(`[DealStage] Dealer Hand Value: ${handleValue}`);
        if (handleValue >= 21) {
            Logger.Info(`[DealStage] Dealer Busted`);
            this.game.setStage(STAGE_END);
            return;
        }

        if (handleValue >= 17) {
            Logger.Info(`[DealStage] Dealer done hit`);
            this.game.setStage(STAGE_END);
        } else {
            const card: ICard | null = this.game.poker.randomGet();
            if (!!card) {
                Logger.Info(`[DealStage] Dealer receive card: ${card.value} ${card.suit}`);
                this.game.dealerHand.push(card);
            }
        }
    }

    public getPromotion(): string {
        return DEALER_TURN;
    }

    public endCountDown(): void {

    }
}