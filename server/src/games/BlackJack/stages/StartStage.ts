import {BlackJack, IStage, IBlackJackPlayerAction, STAGE_BET} from '../index';

export const WAIT_START = '等待游戏开始...';

export class StartStage implements IStage {


    constructor(private game: BlackJack) {

    }

    public handlePlayerInput(playerIndex: string, action: IBlackJackPlayerAction): void {

    }

    public tick(): void {
        return;
    }

    public stageStart(): void {
        this.game.dealerHand = [];
        this.game.countDown = 5;
        this.game.playerTurn = 0;
        Object.values(this.game.players).map((p) => p.roundReset());
        if (this.game.poker.card_left() < 25) {
            this.game.poker.reset();
        }
    }

    public stageEnd(): void {
        return;
    }

    public endCountDown(): void{
        this.game.setStage(STAGE_BET);
    }

    public getPromotion(): string {
        return WAIT_START;
    }
}
