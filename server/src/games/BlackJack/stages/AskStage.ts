import {BlackJack, BlackJackPlayerActionType, IBlackJackPlayerAction, STAGE_DEAL, STAGE_END} from '../index';
import {BlackJackPlayer, BUSTED} from '../components/BlackJackPlayer';
import {ICard} from '../../../components/Poker';
import {Logger} from '@overnightjs/logger';
import {IInputAction, NotificationType} from '../../../network';
import {StageSystem, IStage, IStageWithInputHandler} from '../../../components/StageSystem';
import {PlayerController} from '../../../core/PlayerController';

export const PLAYER_TURN = '等待 {0} 要牌';
export const DISPATCH_CARD = '等待发牌';

export class AskStage implements IStageWithInputHandler {

    private turn: string;

    constructor(private game: BlackJack, private stageSystem: StageSystem<BlackJack>) {
        this.turn = '';
    }

    public handlePlayerInput(player: PlayerController, action: IInputAction): void {
        const playerIndex = player.getId();
        if (playerIndex !== this.turn) {
            Logger.Warn(`[AskStage] Receive action from wrong player: ${playerIndex} ${this.turn}`);
            return;
        }

        const player = this.game.players[playerIndex];

        switch (action.type) {
            case BlackJackPlayerActionType.PlayerStand:
                Logger.Info(`[AskStage] Player ${player.name} : ${playerIndex} Stand`);
                this.nextBetPlayer();
                break;

            case BlackJackPlayerActionType.PlayerHit:
                Logger.Info(`[AskStage] Player ${player.name} : ${playerIndex} Hit`);
                const card: ICard | null = this.game.poker.randomGet();
                if (!!card) {
                    player.receiveCard(card, false);
                    Logger.Info(`[AskStage] Player ${player.name} : ${playerIndex} Receive Card ${card.suit} ${card.value}`);

                    if (!player.canAsk()) {
                        if (player.state === BUSTED) {
                            player.lost();
                        }
                        Logger.Info(`[AskStage] Player ${player.name} ${player.state}`);
                        this.nextBetPlayer();
                    }
                }
                break;

            case BlackJackPlayerActionType.PlayerDouble:
                if (player.hand.length === 2 && player.double()) {
                    Logger.Info(`[AskStage] Player ${player.name} : ${playerIndex} Double`);
                    const c: ICard | null = this.game.poker.randomGet();
                    if (!!c) {
                        player.receiveCard(c, false);
                        if (player.state === BUSTED) {
                            player.lost();
                        }
                        Logger.Info(`[AskStage] Player ${player.name} : ${playerIndex} Receive Card for double ${c.suit} ${c.value}`);
                        this.nextBetPlayer();
                    }
                } else {
                    if (player.hand.length > 2) {
                        this.game.room.sendPlayerNotification(playerIndex, NotificationType.WARNING, '要牌后无法加倍');
                        Logger.Info(`[AskStage] Player ${player.name} : ${playerIndex} can not double after hit`);
                    } else {
                        this.game.room.sendPlayerNotification(playerIndex, NotificationType.WARNING, '没有足够的钱加倍！');
                        Logger.Info(`[AskStage] Player ${player.name} : ${playerIndex} can not double`);
                    }

                }
                break;

            case BlackJackPlayerActionType.PlayerSurrender:
                if (player.hand.length === 2) {
                    Logger.Info(`[AskStage] Player ${player.name} : ${playerIndex} Surrender`);
                    player.surrender();
                    this.nextBetPlayer();
                } else {
                    this.game.room.sendPlayerNotification(playerIndex, NotificationType.WARNING, '要牌后不能投降！');
                    Logger.Info(`[AskStage] Player ${player.name} : ${playerIndex} can not surrender after hit`);
                }
                break;
            default:
                Logger.Warn(`Unrecognized action ${action.type}`);
                break;
        }
    }

    public stageStart(): void {
        this.turn = '';
        this.nextBetPlayer();

    }

    public stageEnd(): void {
        return;
    }

    public tick(): void {
        return;
    }

    public getPromotion(): string {

        if (!!this.game.players[this.turn]) {
            const player: BlackJackPlayer = this.game.players[this.turn];
            return PLAYER_TURN.replace('{0}', player.name);
        }

        return DISPATCH_CARD;

    }

    public endCountDown(): void {
        return;
    }

    public getCurrentTurn(): string {
        return this.turn;
    }

    public nextBetPlayer(): void {
        Logger.Info(`[AskStage] Next Bet Player`);
        if (!!this.game.players[this.turn]) {
            this.game.players[this.turn].offTurn();
        }

        const nextTurnPlayer: BlackJackPlayer | undefined = Object.values(this.game.players).find((p) => p.canAsk());

        if (!!nextTurnPlayer) {
            this.game.players[nextTurnPlayer.id].onTurn();
            this.turn = nextTurnPlayer.id;
            Logger.Info(`[AskStage] Next Bet Player : ${nextTurnPlayer.name}`);
        } else {
            if (Object.values(this.game.players).every((p) => p.inFinalState())) {
                Logger.Info(`[AskStage]All bet player busted or black jacked!`);
                this.stageSystem.changeStage(STAGE_END);
            } else {
                Logger.Info(`[AskStage]All bet player complete round!`);
                this.stageSystem.changeStage(STAGE_DEAL);
            }
        }
    }
}
