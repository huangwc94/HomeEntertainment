import * as readline from 'readline';

import * as io from 'socket.io-client';
import Socket = SocketIOClient.Socket;


const playerNameBase = '电脑玩家';

const clients: { [id: string]: Socket } = {};

const clientData: { [id: string]: any } = {};

const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
});

rl.question('How many player? ', (numberOfPlayers) => {

    rl.prompt();
    rl.on('line', (line) => {
        const [action, player, type, payload] = line.split(' ');

        if (!action) {
            rl.prompt();
            return;
        }

        const playerName = playerNameBase + player;
        switch (action) {
            case 'ready':
                Object.values(clients).forEach((client) => {
                    client.emit('CLIENT_READY');
                });
                break;
            case 'read':
                if (!!player) {
                    console.log(JSON.stringify(clientData[playerName], null, 4));
                }
                break;

            case 'connect':
                for (let i = 0; i < parseInt(numberOfPlayers, 10); i++) {
                    const pn = playerNameBase + i;
                    clients[pn] = io('http://he.ddns.net');
                    clients[pn].on('connect', () => {
                        clients[pn].emit('CLIENT_LOGIN', {type: 1, name: pn, token: 111, data: '567'});
                        clients[pn].on('SERVER_UPDATE', (data: any) => {
                            clientData[pn] = data;
                            const p = data.players[pn];
                            // @ts-ignore
                            if (p.gamePlayerState.state === '正在行动') {
                                setTimeout(() => {

                                    if (Math.random() < 0.95) {
                                        if (Math.random() < 0.5) {
                                            if (data.gameState.highestBet === p.gamePlayerState.betValue) {
                                                clients[pn].emit('CLIENT_ACTION', {type: 'PlayerCheck'});
                                            } else if (p.gamePlayerState.betValue + p.gamePlayerState.chipValue > data.gameState.highestBet) {
                                                clients[pn].emit('CLIENT_ACTION', {type: 'PlayerCall'});
                                            } else if (Math.random() < 0.9) {
                                                clients[pn].emit('CLIENT_ACTION', {type: 'PlayerFold'});
                                            } else {
                                                clients[pn].emit('CLIENT_ACTION', {type: 'PlayerAllIn'});
                                            }
                                        } else if (
                                            Math.random() < 0.3
                                            && (p.gamePlayerState.betValue + p.gamePlayerState.chipValue > data.gameState.highestBet + 25)
                                            && p.gamePlayerState.chips[2] > 0) {
                                            clients[pn].emit('CLIENT_ACTION', {type: 'PlayerRaise', payload: 25});
                                            clients[pn].emit('CLIENT_ACTION', {type: 'PlayerRaiseConfirm'});
                                        } else {
                                            clients[pn].emit('CLIENT_ACTION', {type: 'PlayerFold'});
                                        }

                                    } else {
                                        clients[pn].emit('CLIENT_ACTION', {type: 'PlayerAllIn'});
                                    }

                                }, Math.random() * 1000 + 500);
                            }
                        });
                    });
                }
                break;
            case 'exit':
                process.exit();
                break;
            case 'send':
                if (!!player && !!type) {
                    clients[playerName].emit('CLIENT_ACTION', {type, payload: parseInt(payload, 10)});
                }
                break;
            case 'allin':
                Object.values(clients).forEach((client) => {
                    client.emit('CLIENT_ACTION', {type: 'PlayerAllIn'});
                });
                break;
        }
        rl.prompt();
    });
});
