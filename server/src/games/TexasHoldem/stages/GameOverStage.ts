import { TexasHoldem, STAGE_DISTRIBUTE, SMALL_BLIND_BET } from '../index';
import { IStage, StageSystem } from '../../../components/StageSystem';
import { Player } from '../../../core/Player';
import { IInputAction } from '../../../network';

export const GAME_OVER = '游戏结束, {0} 获胜!';

export class GameOverStage implements IStage {

    constructor(private game: TexasHoldem, private stageSystem: StageSystem<TexasHoldem>) {

    }

    public handlePlayerInput(player: Player, action: IInputAction): void {
        return;
    }

    public tick(): void {
        return;
    }

    public stageStart(): void {
        return;
    }

    public stageEnd(): void {
        return;
    }

    public endCountDown(): void {
        return;
    }

    public getPromotion(): string {
        return GAME_OVER.replace('{0}', this.game.getPlayerArray()[0] && this.game.getPlayerArray()[0].name);
    }
}
