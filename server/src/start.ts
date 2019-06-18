/**
 * Start the Express Web-Server
 *
 * created by Sean Maxwell Apr 14, 2019
 */

import HomeEntertainmentServer from './HomeEntertainmentServer';


const server = new HomeEntertainmentServer(8000);

server.start();

