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
            while (true) {
                connection.connect();
                let newCode = makeCode(12);
                let [ selected ] = await connection.query("SELECT * FROM games WHERE gameCode=?", [newCode]);
                if (!selected[0]) {
                    await connection.query("INSERT INTO games(gameCode, rounds, drawingTime, status, players) VALUES (?, ?, ?, ?, ?)", [newCode, 3, 80, "inMenu", JSON.stringify([data.nickname])]);
                    connection.end();
                    socket.join(newCode);
                    break;
                }
            }
            socket.emit("creating-menu-loaded");
        });
    });
    server.listen(3001);
})();