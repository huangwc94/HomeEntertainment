import {BlackJack, IBlackJackPlayerAction, STAGE_START} from '../index';

import {Logger} from '@overnightjs/logger';
import {ICard} from '../../../components/Poker';
import {StageSystem, IStage} from '../../../components/StageSystem';

const ROUND_END = '本局结束';

export class EndStage implements IStage {

    private completeCalculation: boolean;

    constructor(private game: BlackJack, private stageSystem: StageSystem<BlackJack>) {
        this.completeCalculation = false;
    }

    public handlePlayerInput(playerIndex: string, action: IBlackJackPlayerAction, data?: any): void {
    }

    public stageStart(): void {
        this.completeCalculation = false;
    }

    public stageEnd(): void {
        return;
    }

    public tick(): void {
        if (this.completeCalculation) {
            return;
        }
        this.game.dealerHand.forEach((c: ICard) => c.show = true);
        const dealerValue = BlackJack.handValue(this.game.dealerHand);
        const player = Object.values(this.game.players).find((p) => !p.inFinalState());

        if (!!player) {
            const playerPosition = {bet: player.bet, handValue: BlackJack.handValue(player.hand)};
            Logger.Info(`[EndStage] Player ${player.name} : ${playerPosition.handValue} vs dealer ${dealerValue}`);

            if (dealerValue > 21) {
                player.win();
                return;
            }
            if (dealerValue < playerPosition.handValue) {
                player.win();
                return;
            } else if (playerPosition.handValue === dealerValue) {
                player.even();
            } else {
                player.lost();
            }
        } else {
            this.stageSystem.countDown = 5;
            this.completeCalculation = true;
            Logger.Info(`[EndStage] Calculation Done!`);
        }
    }

    public getPromotion(): string {
        return ROUND_END;
    }

    public endCountDown(): void {
        this.stageSystem.changeStage(STAGE_START);
    }
}
