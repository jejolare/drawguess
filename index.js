const express = require('express');
const app = express();
const http = require('http');
const server = http.createServer(app);
const { Server } = require("socket.io");
const io = new Server(server);
const mysql = require("mysql2/promise");

function makeCode(length) {
    var result = '';
    var characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    for ( var i = 0; i < length; i++ ) {
        result += characters.charAt(Math.floor(Math.random() * characters.length));
    }
    return result;
}

(async () => {
    const connection = await mysql.createConnection({
        host: "localhost",
        user: "root",
        password: "12345677",
        database: "gameinfo"
    });
    await connection.connect();
    const roomsInfo = {};
    // {
    //     9EJoij704p7g: {
    //         players: new Map(),
    //         rounds: 3,
    //         roundTime: 80,
    //         gameInfo: {
    //             status: "inGame",
    //             word: "Анджелина Джоли",
    //             round: 2,
    //             timeLeft: 69
    //         }
    //     }
    // }
    io.on('connection', (socket) => {
        // socket.on("join-button-click", (nickname, roomCode) => {
        //     if (roomCode in Object.keys(roomsInfo)) {
        //         roomsInfo[roomCode].players.set(nickname, 0);
        //         socket.emit("join-result", { result: true,  roomInfo: roomsInfo[roomCode]})
        //     } else {
        //         socket.emit("join-result", { result: false });
        //     }
        // });
        socket.on("create-room", async (data) => {
            let gameCode;
            let identifier;
            while (true) {
                // await connection.connect();
                gameCode = makeCode(12);
                let [ selected ] = await connection.query("SELECT * FROM games WHERE gameCode=?", [gameCode]);
                if (!selected[0]) {
                    while (true) {
                        identifier = makeCode(12);
                        let [ identifiers ] = await connection.query("SELECT * FROM identifiers WHERE identifier=?", [identifier]);
                        if (!(identifiers[0])) {
                            await connection.query("INSERT INTO identifiers(identifier, nickname) VALUES (?, ?)", [identifier, data.nickname]);
                            break;
                        }
                    }
                    await connection.query("INSERT INTO games(gameCode, rounds, drawingTime, status, players) VALUES (?, ?, ?, ?, ?)", [gameCode, 3, 80, "inMenu", JSON.stringify([identifier])]);
                    // await connection.end();
                    socket.join(gameCode);
                    break;
                }
            }
            socket.emit("creating-menu-loaded", { code: gameCode, identifier: identifier });
        });
        socket.on("change-room-parameters", (data) => {
            // await connection.connect();
            let [ players ] = await connection.query("SELECT players FROM games WHERE gameCode=?", [data.gameCode]);
            if (!!(JSON.parse(players[0])[0]) && (JSON.parse(players[0])[0] == data.identifier)) {
                await connection.query("UPDATE games SET rounds=?, drawingTime=? WHERE gameCode=?", [data.rounds, data.drawingTime, data.gameCode]);
                io.to(gameCode).emit("room-parameters-changed", { rounds: data.rounds, drawingTime: data.drawingTime });
                // await connection.end();
            }
        });
        socket.on("join", (data) => {

        });
    });
    server.listen(3001);
})();