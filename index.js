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
            let [ selected ] = await connection.query("SELECT gameCode, rounds, drawingTime, status, currentRound, drawingStarted, chatHistory, scoreInfo, players FROM games WHERE gameCode=?", [data.gameCode]);
            // console.log(selected);
            let scoreInfo = JSON.parse(selected[0].scoreInfo);
            let players = JSON.parse(selected[0].players);
            console.log(players);
            if ((selected[0].status != "gameClosed") && (!players.includes(data.identifier)) && (!!scoreInfo?.sum) && (Object.keys(scoreInfo?.sum).includes(data.identifier))) {
                await connection.query("UPDATE identifiers SET socketID=? WHERE identifier=?", [socket.id, data.identifier]);
                let playersWithNew = JSON.parse(selected[0].players);
                playersWithNew.push(data.identifier);
                await connection.query("UPDATE games SET players=? WHERE gameCode=?", [JSON.stringify(playersWithNew), selected[0].gameCode]);
                let answer = selected[0]; 
                answer.players = playersWithNew;
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
                console.log("Success");
                socket.emit("join-success", answer);
                if (playersWithNew.length == 1) {
                    socket.emit("get-leader-privilege");
                }
                io.to(selected[0].gameCode).emit("change-players-list", { players: answer.players });
                socket.join(selected[0].gameCode);
            }
        });

        socket.on("create-room", async (data) => {
            let gameCode;
            let identifier;
            while (true) {
                await connection.connect();
                gameCode = makeCode(12);
                let [ selected ] = await connection.query("SELECT * FROM games WHERE gameCode=?", [gameCode]);
                if (!selected[0]) {
                    while (true) {
                        identifier = makeCode(12);
                        let [ identifiers ] = await connection.query("SELECT * FROM identifiers");
                        if (!(identifier in identifiers)) {
                            await connection.query("INSERT INTO identifiers(identifier, nickname, socketID, gameCode) VALUES (?, ?, ?, ?)", [identifier, data.nickname, socket.id, gameCode]);
                            break;
                        }
                    }
                    await connection.query("INSERT INTO games(gameCode, rounds, drawingTime, status, scoreInfo, players) VALUES (?, ?, ?, ?, ?, ?)", [gameCode, 3, 80, "inMenu", JSON.stringify({ sum: { [identifier]: 0 } }), JSON.stringify([identifier])]);
                    // await connection.end();
                    socket.join(gameCode);
                    console.log("Success");
                    break;
                }
            }
            socket.emit("change-localstorage-data", { identifier: identifier, gameCode: gameCode });
            socket.emit("creating-menu-loaded", { gameCode: gameCode, identifier: identifier });
        });
        socket.on("change-room-parameters", async (data) => {
            await connection.connect();
            let [ players ] = await connection.query("SELECT status, players FROM games WHERE gameCode=?", [data.gameCode]);
            console.log(players[0]);
            console.log(data.identifier);
            if ((players[0].status == "inMenu") && !!(JSON.parse(players[0].players)[0]) && (JSON.parse(players[0].players)[0] == data.identifier)) {
                await connection.query("UPDATE games SET rounds=?, drawingTime=? WHERE gameCode=?", [data.rounds, data.drawingTime, data.gameCode]);
                io.to(data.gameCode).emit("room-parameters-changed", { rounds: data.rounds, drawingTime: data.drawingTime });
                console.log("Successed change");
                // await connection.end();
            }
        });
        socket.on("join", async (data) => {
            let [ selected ] = await connection.query("SELECT status, chatHistory, scoreInfo, players FROM games WHERE gameCode=?", [data.gameCode]);
            if (!!(selected[0]) && (selected[0]?.status != "gameClosed")) {
                let identifier;
                while (true) {
                    identifier = makeCode(12);
                    let [ identifiers ] = await connection.query("SELECT * FROM identifiers WHERE identifier=?", [identifier]);
                    if (!(identifiers[0])) {
                        await connection.query("INSERT INTO identifiers(identifier, nickname, socketID, gameCode) VALUES (?, ?, ?, ?)", [identifier, data.nickname, socket.id, data.gameCode]);
                        break;
                    }
                }
                
                // let [ selected ] = await connection.query("SELECT players FROM games WHERE gameCode=?", [data.gameCode]);
                
                playersWithNew = JSON.parse(selected[0].players);
                playersWithNew.push(identifier);
                console.log(playersWithNew);
                await connection.query("UPDATE games SET players=? WHERE gameCode=?", [JSON.stringify(playersWithNew), data.gameCode]);
                let scoreInfo = JSON.parse(selected[0].scoreInfo);
                scoreInfo.sum[identifier] = 0;
                await connection.query("UPDATE games SET scoreInfo=? WHERE gameCode=?", [JSON.stringify(scoreInfo), data.gameCode]);
                if (selected[0].status == "inGame") {
                    let chatHistory = JSON.parse(selected[0].chatHistory);
                    chatHistory.push(["system", `${data.nickname} присоединился к игре.`]);
                    await connection.query("UPDATE games SET chatHistory=? WHERE gameCode=?", [JSON.stringify(chatHistory), data.gameCode]);
                }
                [ selected ] = await connection.query("SELECT gameCode, rounds, drawingTime, status, currentRound, drawingStarted, chatHistory, scoreInfo, players FROM games WHERE gameCode=?", [data.gameCode]);
                let answer = selected[0]; 
                console.log(selected[0]);
                // ["identifier1", "identifier2"...]
                answer.players = playersWithNew;
                console.log(answer.players);
                for (let i = 0; i < answer.players.length; i++) {
                    let [ nickname ] = await connection.query("SELECT nickname FROM identifiers WHERE identifier=?", [answer.players[i]]);
                    answer.players[i] = nickname[0].nickname;
                }
                // answer.players = answer.players.map(async (e) => {
                    // let [ nickname ] = await connection.query("SELECT nickname FROM identifiers WHERE identifier=?", [e]);
                    // return nickname[0].nickname;
                // });
                console.log(answer.players);
                // {sum: [["identifier1", 2], ["identifier2", 4]...], 1.1: [["identifier1", 1], ["identifier2", 0]...], ...}
                answer.scoreInfo = JSON.parse(answer.scoreInfo);
                answer.scoreInfo = answer.scoreInfo?.sum;
                // ?.map(async (e) => {
                    // let [ nickname ] = await connection.query("SELECT nickname FROM identifiers WHERE identifier=?", [e[0]]);
                    // let playerScore = e;
                    // playerScore[0] = nickname[0].nickname;
                    // return playerScore;
                // });
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
                // answer.chatHistory = answer.chatHistory?.map(async (e) => {
                    // if (e[0] == "player") {
                    //     let message = e;
                    //     let [ nickname ] = await connection.query("SELECT nickname FROM identifiers WHERE identifier=?", [e[1]]);
                    //     message[1] = nickname[0].nickname;
                    //     return message;
                    // } else {
                    //     return e;
                    // }
                // });
                // console.log(answer);
                answer.identifier = identifier;
                socket.emit("join-success", answer);
                io.to(data.gameCode).emit("change-players-list", { players: answer.players });
                socket.join(data.gameCode);
            } else {
                socket.emit("join-failed");
            }
        });

        socket.on("disconnect", async () => {
            console.log("disconnected");
            let [ selected ] = await connection.query("SELECT identifier, gameCode FROM identifiers WHERE socketID=?", [socket.id]);
            console.log(selected);
            let [ players ] = await connection.query("SELECT players FROM games WHERE gameCode=?", [selected[0]?.gameCode]);
            let playersList;
            if (!!players[0]?.players) {
                playersList = JSON.parse(players[0]?.players);
            } else {
                playersList = undefined;
            }
            if (playersList?.includes(selected[0]?.identifier)) {
                socket.leave(selected[0].gameCode);
                let leaderIdentifier = playersList[0];
                console.log(playersList);
                playersList.splice(playersList.indexOf(selected[0].identifier), 1);
                console.log(playersList);
                await connection.query("UPDATE games SET players=? WHERE gameCode=?", [JSON.stringify(playersList), selected[0].gameCode]);
                // if (!playersList[0]) {
                //     await connection.query("UPDATE games SET status=? WHERE gameCode=?", ["gameClosed", selected[0].gameCode]);
                // }
                await connection.query("UPDATE identifiers SET socketID=? WHERE socketID=?", [null, socket.id]);
                if ((!!playersList[0]) && (leaderIdentifier != playersList[0])) {
                    let [ identifiers ] = await connection.query("SELECT socketID FROM identifiers WHERE identifier=?", [playersList[0]]);
                    io.to(identifiers[0].socketID).emit("get-leader-privilege");
                } 
                for (let i = 0; i < playersList.length; i++) {
                    let [ nickname ] = await connection.query("SELECT nickname FROM identifiers WHERE identifier=?", [playersList[i]]);
                    playersList[i] = nickname[0].nickname;
                }
                io.to(selected[0].gameCode).emit("change-players-list", { players: playersList });
            }
        });
        socket.on("leave", async (data) => {
            console.log("disconnected");
            let [ players ] = await connection.query("SELECT players FROM games WHERE gameCode=?", [data.gameCode]);
            let playersList;
            if (!!players[0]?.players) {
                playersList = JSON.parse(players[0]?.players);
            } else {
                playersList = undefined;
            }
            if (playersList?.includes(data.identifier)) {
                socket.leave(data.gameCode);
                let leaderIdentifier = playersList[0];
                console.log(playersList);
                playersList.splice(playersList.indexOf(data.identifier), 1);
                console.log(playersList);
                await connection.query("UPDATE games SET players=? WHERE gameCode=?", [JSON.stringify(playersList), data.gameCode]);
                if (!playersList[0]) {
                    await connection.query("UPDATE games SET status=? WHERE gameCode=?", ["gameClosed", data.gameCode]);
                }
                await connection.query("UPDATE identifiers SET socketID=? WHERE identifier=?", [null, data.identifier]);
                if ((!!playersList[0]) && (leaderIdentifier != playersList[0])) {
                    let [ identifiers ] = await connection.query("SELECT socketID FROM identifiers WHERE identifier=?", [playersList[0]]);
                    io.to(identifiers[0].socketID).emit("get-leader-privilege");
                } 
                for (let i = 0; i < playersList.length; i++) {
                    let [ nickname ] = await connection.query("SELECT nickname FROM identifiers WHERE identifier=?", [playersList[i]]);
                    playersList[i] = nickname[0].nickname;
                }
                socket.emit("change-localstorage-data", { identifier: "", gameCode: "" });
                socket.emit("leave-success");
                io.to(data.gameCode).emit("change-players-list", { players: playersList });
            }    
        });
    });

    
    server.listen(3001);
})();