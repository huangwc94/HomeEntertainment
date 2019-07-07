import { TexasHoldem, STAGE_DISTRIBUTE, SMALL_BLIND_BET } from '../index';
import { IStage, StageSystem } from '../../../components/StageSystem';
import { Player } from '../../../core/Player';
import { IInputAction } from '../../../network';
import { TexasHoldemRole } from '../TexasHoldemPlayer';

export const WAIT_START = '等待游戏开始...';

export class StartStage implements IStage {

    constructor(private game: TexasHoldem, private stageSystem: StageSystem<TexasHoldem>) {

    }

    public handlePlayerInput(player: Player, action: IInputAction): void {
        return;
    }

    public tick(): void {
        return;
    }

    public stageStart(): void {
        this.game.communityCards = [];
        this.stageSystem.countDown = 5;
        this.game.poker.reset();
        const players = Object.values(this.game.players);
        const lastDealerIndex = players.findIndex((p) => p.isDealer);
        players.forEach((p) => p.roundReset());
        // swap dealer and sb and bb

        if (lastDealerIndex < 0) {
            throw new Error('No Dealer existed, error!');
        }
        players[lastDealerIndex].role = TexasHoldemRole.NONE;

        const nextDealerIndex = (lastDealerIndex + 1) % players.length;
        players[nextDealerIndex].isDealer = true;

        const nextSmallBlindIndex = (players.length > 2 ? nextDealerIndex + 1 : nextDealerIndex) % players.length;
        const nextBigBlindIndex = (nextSmallBlindIndex + 1) % players.length;

        players[nextSmallBlindIndex].setSmallBlind();
        players[nextBigBlindIndex].setBigBlind();
    }

    public stageEnd(): void {
        return;
    }

    public endCountDown(): void {
        this.stageSystem.changeStage(STAGE_DISTRIBUTE);
    }

    public getPromotion(): string {
        return WAIT_START;
    }
}
