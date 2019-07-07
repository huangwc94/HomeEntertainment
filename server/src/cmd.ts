import * as readline from 'readline';

import * as io from 'socket.io-client';
import Socket = SocketIOClient.Socket;


const playerNameBase = '玩家';

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
                    clients[pn] = io('http://localhost');
                    clients[pn].on('connect', () => {
                        clients[pn].emit('CLIENT_LOGIN', {type: 1, name: pn, token: 111, data: '客厅'});
                        clients[pn].on('SERVER_UPDATE', (data: any) => {
                            clientData[pn] = data;
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
        }
        rl.prompt();
    });
});
