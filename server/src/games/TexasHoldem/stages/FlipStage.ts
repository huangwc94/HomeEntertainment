import { TexasHoldem, STAGE_ACT } from '../index';
import { IStage, StageSystem } from '../../../components/StageSystem';
import { Player } from '../../../core/Player';
import { IInputAction } from '../../../network';

export const DISPATCHING_COMMUNITY_CARD = '正在发公共牌';


enum FlipStep {
    FLOP,
    TURN,
    RIVER,
}

export class FlipStage implements IStage {

    private flipStep: FlipStep;

    constructor(private game: TexasHoldem, private stageSystem: StageSystem<TexasHoldem>) {
        this.flipStep = FlipStep.FLOP;
    }

    public handlePlayerInput(player: Player, action: IInputAction): void {
        return;
    }

    public tick(): void {

        let endLength = 3;

        if (this.flipStep === FlipStep.TURN) {
            endLength = 4;
        }
        if (this.flipStep === FlipStep.RIVER) {
            endLength = 5;
        }

        if (this.game.communityCards.length < endLength) {
            this.game.dispatchCardToCommunity();
        } else {
            this.backToActStage();
        }
    }

    public stageStart(): void {
        switch (this.game.communityCards.length) {
            case 0:
                this.flipStep = FlipStep.FLOP;
                break;
            case 3:
                this.flipStep = FlipStep.TURN;
                break;
            case 4:
                this.flipStep = FlipStep.RIVER;
                break;
            default:
                throw new Error('Invalid flip step: can only enter this stage with community cards = 0,3,4');
        }
    }

    public stageEnd(): void {
        return;
    }

    public backToActStage() {
        this.stageSystem.changeStage(STAGE_ACT);
    }

    public endCountDown(): void {
        return;
    }

    public getPromotion(): string {
        return DISPATCHING_COMMUNITY_CARD;
    }
}
