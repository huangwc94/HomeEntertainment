import {PlayerBase} from '../../../components/PlayerBase';
import {Socket} from 'socket.io';

export class BlackJackPlayer extends PlayerBase {


    constructor(name: string, socket: Socket, private money: number) {
        super(name, socket);
    }


}
