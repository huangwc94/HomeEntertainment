import { Logger } from '@overnightjs/logger';
import { IStage, StageSystem } from '../../../components/StageSystem';
import { Player } from '../../../core/Player';
import { IInputAction } from '../../../network';
import { TexasHoldemPlayerActionType, STAGE_END, STAGE_FLIP, STAGE_SHOWDOWN, TexasHoldem } from '../index';
import { ALL_IN, BET_RAISE, TexasHoldemPlayer, WAIT_ACT, WAIT_GAME, WAIT_OTHER } from '../TexasHoldemPlayer';

export const START_BET = '等待 {0} 行动';

export class ActStage implements IStage {

    public turnPlayer: TexasHoldemPlayer | null;

    constructor(private game: TexasHoldem, private stageSystem: StageSystem<TexasHoldem>) {
        this.turnPlayer = null;
    }

    public handlePlayerInput(player: Player, action: IInputAction): void {

        const gamePlayer = player.gamePlayer as TexasHoldemPlayer;
        if (!gamePlayer || this.turnPlayer !== gamePlayer || !gamePlayer.canAct()) {
            return;
        }
        switch (action.type) {
            case TexasHoldemPlayerActionType.PlayerFold:
                Logger.Info(`[ActStage] Player ${player.name} Fold`);
                gamePlayer.fold();
                this.nextActPlayer();
                break;

            case TexasHoldemPlayerActionType.PlayerCall:
                if (gamePlayer.canCall()) {
                    Logger.Info(`[ActStage] Player ${player.name} Call`);
                    gamePlayer.call();
                    this.nextActPlayer();
                }
                break;

            case TexasHoldemPlayerActionType.PlayerAllIn:
                if (gamePlayer.canAllIn()) {
                    Logger.Info(`[ActStage] Player ${player.name} All in`);
                    gamePlayer.allIn();
                    this.nextActPlayer();
                }
                break;

            case TexasHoldemPlayerActionType.PlayerCheck:
                if (gamePlayer.canCheck()) {
                    Logger.Info(`[ActStage] Player ${player.name} Check`);
                    this.nextActPlayer();
                }
                break;
            case TexasHoldemPlayerActionType.PlayerRaise:
                if (gamePlayer.canRaise()) {
                    Logger.Info(`[ActStage] Player ${player.name} Raise ${action.payload}`);
                    gamePlayer.raiseChip(action.payload);
                    if (gamePlayer.state === ALL_IN) {
                        Logger.Info(`[ActStage] Player ${player.name} Raise all chips, turn to ALL IN`);
                        this.nextActPlayer();
                    }
                }
                break;
            case TexasHoldemPlayerActionType.PlayerRaiseConfirm:
                if (gamePlayer.state === BET_RAISE) {
                    Logger.Info(`[ActStage] Player ${player.name} Raise Confirm`);
                    gamePlayer.confirmRaise();
                    this.nextActPlayer();
                }
                break;
            default:
                Logger.Warn(`Unrecognized action ${action.type}`);
                break;
        }
    }

    public stageStart(): void {
        this.game.getPlayerArray().forEach((p) => {
            if (p.canAct()) {
                p.state = WAIT_ACT;
            }
        });
        this.turnPlayer = this.game.firstActPlayer();
        this.nextActPlayer();
        return;
    }

    public stageEnd(): void {
        this.turnPlayer = null;
        return;
    }

    public tick(): void {
        return;
    }

    public endCountDown(): void {
        return;
    }

    public getPromotion(): string {
        return START_BET.replace('{0}', this.turnPlayer ? this.turnPlayer.name : '');
    }

    public getCurrentTurn(): TexasHoldemPlayer | null {
        return this.turnPlayer;
    }

    public resetToWaitAct() {
        this.game.getPlayerArray().forEach((p) => {
            if (p.canAct() && p.bet.getCashValue() < this.game.highestBet()) {
                p.state = WAIT_ACT;
            }
        });
    }

    public nextActPlayer(): void {
        this.turnPlayer && this.turnPlayer.offTurn();
        this.resetToWaitAct();
        if (this.game.getPlayerArray().filter((p) => p.inGame()).length === 1) {
            Logger.Info(`[ActStage] Only 1 player left, end game!`);
            this.stageSystem.changeStage(STAGE_END);
            return;
        }
        const nextTurnPlayer: TexasHoldemPlayer | undefined = this.game.getPlayerArrayStartingAt(this.turnPlayer).find((p) => p.shouldAct());
        if (!!nextTurnPlayer) {
            nextTurnPlayer.onTurn();
            this.turnPlayer = nextTurnPlayer;
            Logger.Info(`[ActStage] Next Act Player : ${nextTurnPlayer.name}`);
        } else {
            if (this.game.getPlayerArray().filter((p) => p.canAct()).length < 2 || this.game.communityCards.length === 5) {
                this.stageSystem.changeStage(STAGE_SHOWDOWN);
                Logger.Info(`[ActStage] All player ALL IN or complete dispatching card, go to show down!`);
            } else {
                this.stageSystem.changeStage(STAGE_FLIP);
                Logger.Info(`[ActStage] Have 2 more player in game, go to flip!`);
            }
        }
    }
}
