import { RoomManager } from '../../../core/RoomManager';
import { TexasHoldem, STAGE_START, SMALL_BLIND_BET, STAGE_OVER } from '../index';

import { Logger } from '@overnightjs/logger';

import { StageSystem, IStage } from '../../../components/StageSystem';
import { Player } from '../../../core/Player';
import { IInputAction } from '../../../network';

const ROUND_END = '本局结束，没有筹码的玩家被移除';

export class EndStage implements IStage {

    private completeCalculation: boolean;

    constructor(private game: TexasHoldem, private stageSystem: StageSystem<TexasHoldem>) {
        this.completeCalculation = false;
    }

    public handlePlayerInput(player: Player, action: IInputAction): void {
        return;
    }

    public stageStart(): void {
        this.completeCalculation = false;
    }

    public stageEnd(): void {
        return;
    }

    public tick(): void {
        if (this.completeCalculation) {
            const kickList = this.game.getPlayerArray().filter((p) => p.chips.getCashValue() + p.cash < SMALL_BLIND_BET * 2);

            kickList.forEach((p) => {
                Logger.Info(`[EndStage] Kick Player ${p.name} with no money!`);
                this.game.room.getPlayers()[p.id].disconnect();
            });
        } else {
            this.game.calculateWinner();
            this.stageSystem.countDown = 10;
            this.completeCalculation = true;
        }
    }

    public getPromotion(): string {
        return ROUND_END;
    }

    public endCountDown(): void {
        if (this.game.getPlayerArray().length < 2) {
            this.stageSystem.changeStage(STAGE_OVER);
        } else {
            this.stageSystem.changeStage(STAGE_START);
        }
    }
}
