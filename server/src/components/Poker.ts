export enum CardSuit {
    DIAMONDS = 'DIAMONDS',
    CLUBS = 'CLUBS',
    HEARTS = 'HEARTS',
    SPADES = 'SPADES',
}

export interface ICard {
    suit: CardSuit;
    value: number;
    show: boolean;
}


export class Poker {

    public usedCards: ICard[];
    public cardPool: ICard[];


    constructor(public numberOfSets: number) {
        this.usedCards = [];
        this.cardPool = [];
    }

    public reset() {
        this.usedCards = [];
        this.cardPool = [];
        for (let set = 0; set < this.numberOfSets; set++) {
            for (const suit  in CardSuit) {
                if (typeof suit === 'string') {
                    const eSuit = suit as CardSuit;
                    for (let value = 1; value < 14; value++) {
                        this.cardPool.push({suit: eSuit, value, show: true});
                    }
                }
            }
        }
        this.shuffle();
    }

    public card_left(): number {
        return this.cardPool.length;
    }

    public randomGet(): ICard {
        if (this.card_left() <= 0) {
            throw new Error('[Poker] Card Stack is empty');
        }
        const card = this.cardPool.pop() as ICard;
        this.usedCards.push(card);
        return card;
    }

    public shuffle() {
        for (let i = this.cardPool.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            const temp = this.cardPool[i];
            this.cardPool[i] = this.cardPool[j];
            this.cardPool[j] = temp;
        }
    }

    public static cardToString(card: ICard): string {
        let str = '';
        switch (card.value) {
            case 1:
                str = 'A';
                break;
            case 10:
                str = 'T';
                break;
            case 11:
                str = 'J';
                break;
            case 12:
                str = 'Q';
                break;
            case 13:
                str = 'K';
                break;
            default:
                str = card.value.toString();
                break;
        }
        str += card.suit[0].toLowerCase();
        return str;
    }
}
