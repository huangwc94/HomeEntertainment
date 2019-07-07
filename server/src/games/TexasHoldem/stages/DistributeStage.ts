import {
    TexasHoldem,
    STAGE_ACT,
} from '../index';

import { ICard } from '../../../components/Poker';
import { Logger } from '@overnightjs/logger';
import { StageSystem, IStage } from '../../../components/StageSystem';
import { Player } from '../../../core/Player';
import { IInputAction } from '../../../network';


export const DISPATCH_CARD = '正在发牌';

export class DistributeStage implements IStage {

    constructor(private game: TexasHoldem, private stageSystem: StageSystem<TexasHoldem>) {

    }

    public handlePlayerInput(player: Player, action: IInputAction): void {
        return;
    }


    public stageStart(): void {
        return;
    }

    public stageEnd(): void {
        return;
    }

    public tick(): void {
        const turn = this.game.lastReceiveCardPlayer().hand.length;
        if (turn === 2) {
            this.stageSystem.changeStage(STAGE_ACT);
            return;
        }

        const player = this.game.getCardDistributeSequence().find((p) => p.hand.length === turn);
        if (!!player) {
            const card: ICard = this.game.poker.randomGet();
            card.show = false;
            player.hand.push(card);
            Logger.Info(`[DistributeStage] Player receive card : ${player.name} ${card.suit} ${card.value}`);
        }
    }

    public getPromotion(): string {
        return DISPATCH_CARD;
    }

    public endCountDown(): void {
        return;
    }
}
