import { BlackJack, BlackJackPlayerActionType, IBlackJackPlayerAction, STAGE_DISTRIBUTE } from '../index';
import { Logger } from '@overnightjs/logger';
import { StageSystem, IStage } from '../../../components/StageSystem';
import { Player } from '../../../core/Player';
import { IInputAction } from '../../../network';

export const START_BET = '请下注';
export const BET_MAXIMUM = 300;

export class BetStage implements IStage {

    constructor(private game: BlackJack, private stageSystem: StageSystem<BlackJack>) {

    }

    public handlePlayerInput(player: Player, action: IInputAction): void {

        const playerIndex = player.id;

        if (action.type === BlackJackPlayerActionType.PlayerAddChip) {
            if (action.payload > 0 && this.game.players[playerIndex].canBet() && this.game.players[playerIndex].bet.getCashValue() + action.payload <= BET_MAXIMUM) {
                this.game.players[playerIndex].addBet(action.payload);
                Logger.Info(`[BetStage]Player ${this.game.players[playerIndex].name} add bet ${action.payload}`);
            }
            return;
        }

        if (action.type === BlackJackPlayerActionType.PlayerBet) {
            if (this.game.players[playerIndex].bet.getCashValue() === 0) {
                Logger.Info(`[BetStage]Player ${this.game.players[playerIndex].name} can not confirm bet if no chip added`);
                return;
            }
            this.game.players[playerIndex].completeBet();
            Logger.Info(`[BetStage]Player ${this.game.players[playerIndex].name} confirm bet`);
            if (Object.values(this.game.players).every((p) => p.isCompleteBet() || !p.haveChip())) {
                Logger.Info(`[BetStage]All player bet!`);
                this.stageSystem.changeStage(STAGE_DISTRIBUTE);
            }
        }
    }

    public stageStart(): void {
        Object.values(this.game.players).forEach((p) => p.startBet());
        return;
    }

    public stageEnd(): void {
        return;
    }

    public tick(): void {
        return;
    }

    public endCountDown(): void {
        return;
    }

    public getPromotion(): string {
        return START_BET;
    }
}
