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
    // games: gameCode, rounds, drawingTime, status, currentWord, currentRound, drawingStarted, chatHistory, scoreInfo, players
    // identifiers: indentifier, nickname
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
        socket.on("identifier-check", async (data) => {
            let [ selected ] = await connection.query("SELECT gameCode, scoreInfo FROM games WHERE status<>?", ["gameClosed"]);
            for (row of selected) { 
                if ((!!scoreInfo?.sum) && (Object.keys(scoreInfo?.sum).includes(data.identifier))) {
                    [ selected ] = await connection.query("SELECT gameCode, rounds, drawingTime, status, currentRound, drawingStarted, chatHistory, scoreInfo, players FROM games WHERE gameCode=?", [row.gameCode]);
                    // let playersWithNew = JSON.parse(selected[0].players);
                    // playersWithNew.push(data.identifier);
                    // await connection.query("UPDATE games SET players=? WHERE gameCode=?", [JSON.stringify(playersWithNew), selected[0].gameCode]);
                    let answer = selected[0]; 
                    answer.players = JSON.parse(answer.players);
                    for (let i = 0; i < answer.players.length; i++) {
                        let [ nickname ] = await connection.query("SELECT nickname FROM identifiers WHERE identifier=?", [answer.players[i]]);
                        answer.players[i] = nickname[0].nickname;
                    }

                    // answer.players = JSON.stringify(answer.players);
                    // {sum: {"identifier1": 2, "identifier2": 4...}, 1.1: [["identifier1", 1], ["identifier2", 0]...], ...}
                    answer.scoreInfo = JSON.parse(answer.scoreInfo);
                    answer.scoreInfo = answer.scoreInfo?.sum;
                    if (answer.scoreInfo) {
                        for (key of Object.keys(answer.scoreInfo)) {
                            let [ nickname ] = await connection.query("SELECT nickname FROM identifiers WHERE identifier=?", [key]);
                            answer.scoreInfo[nickname[0].nickname] = answer.scoreInfo[key];
                            answer.scoreInfo[key] = undefined; 
                        }
                    }
                    // [["player", "identifier1", "message"], ["system", "message"], ["player", "identifier2", "message"]...]
                    answer.chatHistory = JSON.parse(answer.chatHistory);
                    if (answer.chatHistory) {
                        for (let i = 0; i < answer.chatHistory.length; i++) {
                            if (answer.chatHistory[i][0] == "player") {
                                let [ nickname ] = await connection.query("SELECT nickname FROM identifiers WHERE identifier=?", [answer.chatHistory[i][1]]);
                                answer.chatHistory[i][1] = nickname[0].nickname;
                            } 
                        }
                    }
                    socket.emit("join-success", answer);
                    io.to(selected[0].gameCode).emit("new-connection", { nickname: answer.players[answer.players.length - 1] });
                    socket.join(selected[0].gameCode);
                }
            }
        });
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
                    await connection.query("INSERT INTO games(gameCode, rounds, drawingTime, status, scoreInfo, players) VALUES (?, ?, ?, ?, ?, ?)", [gameCode, 3, 80, "inMenu", JSON.stringify({ sum: { [identifier]: 0 } }), JSON.stringify([identifier])]);
                    // await connection.end();
                    socket.join(gameCode);
                    break;
                }
            }
            socket.emit("creating-menu-loaded", { code: gameCode, identifier: identifier });
        });
        socket.on("change-room-parameters", async (data) => {
            // await connection.connect();
            let [ players ] = await connection.query("SELECT status, players FROM games WHERE gameCode=?", [data.gameCode]);
            if ((players[0].status == "inMenu") && !!(JSON.parse(players[0].players)[0]) && (JSON.parse(players[0].players)[0] == data.identifier)) {
                await connection.query("UPDATE games SET rounds=?, drawingTime=? WHERE gameCode=?", [data.rounds, data.drawingTime, data.gameCode]);
                io.to(gameCode).emit("room-parameters-changed", { rounds: data.rounds, drawingTime: data.drawingTime });
                // await connection.end();
            }
        });
        socket.on("join", async (data) => {
            let [ selected ] = await connection.query("SELECT status, chatHistory, scoreInfo, players FROM games WHERE gameCode=?", [data.gameCode]);
            if (selected[0]?.status != "gameClosed") {
                let identifier;
                while (true) {
                    identifier = makeCode(12);
                    let [ identifiers ] = await connection.query("SELECT * FROM identifiers WHERE identifier=?", [identifier]);
                    if (!(identifiers[0])) {
                        await connection.query("INSERT INTO identifiers(identifier, nickname) VALUES (?, ?)", [identifier, data.nickname]);
                        break;
                    }
                }
                
                // let [ selected ] = await connection.query("SELECT players FROM games WHERE gameCode=?", [data.gameCode]);
                let playersWithNew = JSON.parse(selected[0].players)
                playersWithNew.push(identifier);
                let scoreInfo = JSON.parse(selected[0].scoreInfo);
                scoreInfo.sum[identifier] = 0;
                await connection.query("UPDATE games SET scoreInfo=? WHERE gameCode=?", [JSON.stringify(scoreInfo), data.gameCode]);
                await connection.query("UPDATE games SET players=? WHERE gameCode=?", [JSON.stringify(playersWithNew), data.gameCode]);
                if (selected[0].status == "inGame") {
                    let chatHistory = JSON.parse(selected[0].chatHistory);
                    chatHistory.push(["system", `${data.nickname} присоединился к игре.`]);
                    await connection.query("UPDATE games SET chatHistory=? WHERE gameCode=?", [JSON.stringify(chatHistory), data.gameCode]);
                }
                [ selected ] = await connection.query("SELECT gameCode, rounds, drawingTime, status, currentRound, drawingStarted, chatHistory, scoreInfo, players FROM games WHERE gameCode=?", [data.gameCode]);
                let answer = selected[0]; 
                // ["identifier1", "identifier2"...]
                answer.players = JSON.parse(answer.players);
                for (let i = 0; i < answer.players.length; i++) {
                    let [ nickname ] = await connection.query("SELECT nickname FROM identifiers WHERE identifier=?", [answer.players[i]]);
                    answer.players[i] = nickname[0].nickname;
                }

                // answer.players = JSON.stringify(answer.players);
                // {sum: {"identifier1": 2, "identifier2": 4...}, 1.1: [["identifier1", 1], ["identifier2", 0]...], ...}
                answer.scoreInfo = JSON.parse(answer.scoreInfo);
                answer.scoreInfo = answer.scoreInfo?.sum;
                if (answer.scoreInfo) {
                    for (key of Object.keys(answer.scoreInfo)) {
                        let [ nickname ] = await connection.query("SELECT nickname FROM identifiers WHERE identifier=?", [key]);
                        answer.scoreInfo[nickname[0].nickname] = answer.scoreInfo[key];
                        answer.scoreInfo[key] = undefined; 
                    }
                }
                // [["player", "identifier1", "message"], ["system", "message"], ["player", "identifier2", "message"]...]
                answer.chatHistory = JSON.parse(answer.chatHistory);
                if (answer.chatHistory) {
                    for (let i = 0; i < answer.chatHistory.length; i++) {
                        if (answer.chatHistory[i][0] == "player") {
                            let [ nickname ] = await connection.query("SELECT nickname FROM identifiers WHERE identifier=?", [answer.chatHistory[i][1]]);
                            answer.chatHistory[i][1] = nickname[0].nickname;
                        } 
                    }
                }
                answer.identifier = identifier;
                socket.emit("join-success", answer);
                io.to(data.gameCode).emit("new-connection", { nickname: data.nickname });
                socket.join(data.gameCode);
            } else {
                socket.emit("join-failed");
            }
        });
        socket.on("leave", async (data) => {
            let [ selected ] = await connection.query("SELECT players FROM games WHERE gameCode=?", (data.gameCode));
            let players = JSON.parse(selected[0]?.players);
            if (players.indexOf(data.identifier) != -1) {
                players.splice(players.indexOf(data.identifier), 1);
            }
            await connection.query("UPDATE games SET players=? WHERE gameCode=?", [players, data.gameCode]);
            for (let i = 0; i < players.length; i++) {
                let [ nickname ] = await connection.query("SELECT * FROM identifiers WHERE identifier=?", [players[i]]);
                players[i] = nickname[0].nickname;
            }
            socket.leave(data.gameCode);
            io.to(data.gameCode).emit("players-update", players);
            socket.emit("leave-room");
        });
    });
    server.listen(3001);
})();