import { IBlackJackPlayerAction, BlackJack, STAGE_END } from '../index';
import { ICard } from '../../../components/Poker';
import { Logger } from '@overnightjs/logger';
import { StageSystem, IStage } from '../../../components/StageSystem';
import { Player } from '../../../core/Player';
import { IInputAction } from '../../../network';

const DEALER_TURN = '庄家操作';

export interface IPlayerPosition {
    bet: number;
    handValue: number;
}

export class DealStage implements IStage {
    constructor(private game: BlackJack, private stageSystem: StageSystem<BlackJack>) {

    }

    public handlePlayerInput(player: Player, action: IInputAction): void {
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
            this.stageSystem.changeStage(STAGE_END);
            return;
        }

        if (handleValue >= 17) {
            Logger.Info(`[DealStage] Dealer done hit`);
            this.stageSystem.changeStage(STAGE_END);
        } else {
            const card: ICard = this.game.poker.randomGet();
            Logger.Info(`[DealStage] Dealer receive card: ${card.value} ${card.suit}`);
            this.game.dealerHand.push(card);
        }
    }

    public getPromotion(): string {
        return DEALER_TURN;
    }

    public endCountDown(): void {

    }
}
