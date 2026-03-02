const express = require('express');
const http = require('http');
const { Server } = require('socket.io');

const app = express();
const server = http.createServer(app);
const io = new Server(server);

app.use(express.static('public'));

let players = {};

io.on('connection', (socket) => {
    console.log('Jugador conectado:', socket.id);

    socket.on('joinGame', (data) => {
        // Lógica de clases según tu descripción
        let stats = { hp: 100, speed: 0.15, weapon: 'AK47' };
        if(data.class === 'Medico') stats = { hp: 70, speed: 0.18, weapon: 'Pistola' };
        if(data.class === 'Grandullon') stats = { hp: 115, speed: 0.08, weapon: 'Minigun' };

        players[socket.id] = {
            x: 0, y: 1, z: 0,
            class: data.class,
            hp: stats.hp,
            id: socket.id
        };
        socket.emit('currentPlayers', players);
        socket.broadcast.emit('newPlayer', players[socket.id]);
    });

    socket.on('playerMovement', (mov) => {
        if (players[socket.id]) {
            players[socket.id].x = mov.x;
            players[socket.id].z = mov.z;
            socket.broadcast.emit('playerMoved', players[socket.id]);
        }
    });

    socket.on('disconnect', () => {
        delete players[socket.id];
        io.emit('playerDisconnected', socket.id);
    });
});

server.listen(process.env.PORT || 3000, () => {
    console.log('Servidor corriendo en puerto 3000');
});
