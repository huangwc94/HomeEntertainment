import {
    BlackJack,
    STAGE_ASK,
    STAGE_END,
} from '../index';
import {INITIAL_BLACK_JACK} from '../components/BlackJackPlayer';
import {ICard} from '../../../components/Poker';
import {Logger} from '@overnightjs/logger';
import {StageSystem, IStage} from '../../../components/StageSystem';
import {Player} from '../../../core/Player';
import {IInputAction} from '../../../network';


export const DISPATCH_CARD = '正在发牌';

export class DistributeStage implements IStage {

    constructor(private game: BlackJack, private stageSystem: StageSystem<BlackJack>) {

    }

    public handlePlayerInput(player: Player, action: IInputAction): void {
        return;
    }


    public stageStart(): void {
        Object.values(this.game.players).forEach((p) => p.startDistribute());
    }

    public stageEnd(): void {
        return;
    }

    public tick(): void {
        const turn = this.game.dealerHand.length;

        if (turn === 2) {
            if (Object.values(this.game.players).every((p) => p.inFinalState())) {
                Logger.Info(`[DistributeStage]All bet player win!`);
                this.stageSystem.changeStage(STAGE_END);
            } else {
                Logger.Info(`[DistributeStage]All bet player complete round!`);
                this.stageSystem.changeStage(STAGE_ASK);
            }
            return;
        }

        const player = Object.values(this.game.players).find((p) => p.hand.length === turn && p.inRound());
        if (!!player) {
            const card: ICard | null = this.game.poker.randomGet();
            if (!!card) {
                player.receiveCard(card, true);
                Logger.Info(`[DistributeStage]Player receive card : ${player.name} ${card.suit} ${card.value}`);
            }
        } else {
            const card: ICard | null = this.game.poker.randomGet();
            if (!!card) {
                this.game.dealerHand.push(card);
                Logger.Info(`[DistributeStage] Dealer receive card : ${card.suit} ${card.value}`);
                if (this.game.dealerHand.length === 2) {
                    card.show = false;
                    if (BlackJack.handValue(this.game.dealerHand, true) === 21) {
                        this.game.dealerHand.forEach((c: ICard) => c.show = true);
                        this.stageSystem.changeStage(STAGE_END);
                    } else {
                        Object.values(this.game.players).forEach((p) => {
                            if (p.state === INITIAL_BLACK_JACK) {
                                p.win(1.5);
                                Logger.Info(`[DistributeStage] Player Initial BlackJack!!! : ${p.name}`);
                            }
                        });
                    }
                }
            }
        }
    }

    public getPromotion(): string {
        return DISPATCH_CARD;
    }

    public endCountDown(): void {
        return;
    }
}
