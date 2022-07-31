const express = require('express');
const app = express();
const http = require('http');
const server = http.createServer(app);
const { Server } = require("socket.io");
const io = new Server(server);

io.on('connection', (socket) => {
    socket.on("test", (msg) => {
        console.log(msg);
        socket.emit('testResponse', 'ДА, АНДРЕЙ ЛОХ!');
    });
});

server.listen(3001);