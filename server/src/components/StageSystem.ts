import { Player } from '../core/Player';
import { IInputAction } from '../network';

export interface IStage {
    stageStart(): void;

    stageEnd(): void;

    tick(): void;

    getPromotion(): string;

    endCountDown(): void;

    handlePlayerInput(player: Player, action: IInputAction): void;
}

export interface IStageMapping {
    [stageName: string]: IStage;
}

export class StageSystem<T> {

    private _stages: IStageMapping;

    private _countDown: number;

    private _currentStage: string;

    constructor(
        private _game: T,
        private onStageStart: (stageName: string) => void,
        private onStageEnd: (stageName: string) => void,
    ) {
        this._stages = {};
        this._countDown = -1;
        this._currentStage = '';
    }

    get stages(): IStageMapping {
        return this._stages;
    }

    set stages(value: IStageMapping) {
        this._stages = value;
    }

    get countDown(): number {
        return this._countDown;
    }

    set countDown(value: number) {
        this._countDown = value;
    }

    get currentStage(): string {
        return this._currentStage;
    }

    set currentStage(value: string) {
        if (value in this.stages) {
            this._currentStage = value;
        }
    }

    public changeStage(newStageName: string) {
        if (newStageName in this.stages) {
            this.endStage();
            this.currentStage = newStageName;
            this.startStage();
        }
    }

    public startStage() {
        if (this.inValidStage()) {
            this.getCurrentStage().stageStart();
            this.onStageStart(this.currentStage);
        }
    }

    public endStage() {
        if (this.inValidStage()) {
            this.getCurrentStage().stageEnd();
            this.countDown = -1;
            this.onStageEnd(this.currentStage);
        }
    }

    public getCurrentStage(): IStage {
        return this.stages[this.currentStage];
    }

    public tick() {
        if (this.inValidStage()) {
            this.getCurrentStage().tick();
            if (this.countDown > 0) {
                this.countDown -= 1;
            } else if (this.countDown === 0) {
                this.countDown = -1;
                this.getCurrentStage().endCountDown();
            }
        }
    }

    public getPromotion(): string {
        if (this.inValidStage()) {
            return this.getCurrentStage().getPromotion();
        } else {
            return '';
        }
    }

    public inValidStage(): boolean {
        return this.currentStage in this.stages;
    }

    public handlePlayerInput(player: Player, action: IInputAction) {
        this.getCurrentStage().handlePlayerInput(player, action);
    }
}
