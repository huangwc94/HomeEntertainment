import { IInputAction } from '../../../network';
import { StageSystem, IStage } from '../../../components/StageSystem';
import { Player } from '../../../core/Player';
import { STAGE_END, TexasHoldem } from '../index';
import { DISPATCHING_COMMUNITY_CARD } from './FlipStage';

export const PLAYER_FLIP = '正在翻牌';

export class ShowDownStage implements IStage {

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
        if (this.game.communityCards.length < 5) {
            this.game.dispatchCardToCommunity();
            return;
        }

        const flipPlayer = this.game.getPlayerArrayStartingAt(this.game.getDealer(), 1).find((p) => p.shouldShow());
        if (!!flipPlayer) {
            if (flipPlayer.hand[0].show) {
                flipPlayer.hand[1].show = true;
            } else {
                flipPlayer.hand[0].show = true;
            }
        } else {
            this.stageSystem.changeStage(STAGE_END);
        }
    }

    public getPromotion(): string {
        return this.game.communityCards.length < 5 ? DISPATCHING_COMMUNITY_CARD : PLAYER_FLIP;
    }

    public endCountDown(): void {
        return;
    }
}
