export type IChipStack = [number, number, number, number];

export const CHIP_REFERENCE: { [value: number]: number } = {
    5: 0,
    25: 1,
    50: 2,
    100: 3,
};

export const CHIP_VALUES = [5, 25, 50, 100];

export const MAXIMUM_NUMBER_OF_CHIPS = 10;

export class ChipStack {

    constructor(private stack: IChipStack = [0, 0, 0, 0], private sortChipFromLeft: boolean = true) {

    }

    public getCashValue(): number {
        let totalValue = 0;
        this.stack.forEach((numberOfChip, index) => {
            totalValue += numberOfChip * CHIP_VALUES[index];
        });
        return totalValue;
    }

    public getStack(): IChipStack {
        return this.stack;
    }

    public getNumberOfChip(value: number) {
        if (value in CHIP_REFERENCE) {
            return this.stack[CHIP_REFERENCE[value]];
        } else {
            return -1;
        }
    }

    public removeAllChips() {
        this.stack = [0, 0, 0, 0];
    }

    public addChip(value: number) {
        if (value in CHIP_REFERENCE) {
            this.stack[CHIP_REFERENCE[value]] += 1;
            return;
        }
    }

    public removeChip(value: number): boolean {
        if (value in CHIP_REFERENCE && this.stack[CHIP_REFERENCE[value]] > 0) {
            this.stack[CHIP_REFERENCE[value]] -= 1;
            return true;
        }
        return false;
    }

    public addChipValue(value: number): number {
        return this.evenChip(value);
    }

    public removeChipValue(value: number): number {
        if (this.getCashValue() < value) {
            return -1;
        }
        return this.evenChip(-value);
    }

    public evenChip(extraCash: number = 0): number {

        let remainingCashValue = this.getCashValue() + extraCash;
        // Get more greater value chips as possible

        if (this.sortChipFromLeft) {
            for (let index = 0; index < CHIP_VALUES.length; index++) {
                const numberOfChip = Math.floor(remainingCashValue / CHIP_VALUES[index]);
                if (numberOfChip > MAXIMUM_NUMBER_OF_CHIPS) {
                    this.stack[index] = MAXIMUM_NUMBER_OF_CHIPS;
                } else {
                    this.stack[index] = numberOfChip;
                }
                remainingCashValue -= CHIP_VALUES[index] * this.stack[index];
            }
        } else {
            for (let index = CHIP_VALUES.length - 1; index >= 0; index--) {
                const numberOfChip = Math.floor(remainingCashValue / CHIP_VALUES[index]);
                if (numberOfChip > MAXIMUM_NUMBER_OF_CHIPS) {
                    this.stack[index] = MAXIMUM_NUMBER_OF_CHIPS;
                } else {
                    this.stack[index] = numberOfChip;
                }
                remainingCashValue -= CHIP_VALUES[index] * this.stack[index];
            }
        }
        return remainingCashValue;
    }
}
