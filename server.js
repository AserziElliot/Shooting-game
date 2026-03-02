const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const path = require('path');

const app = express();
const server = http.createServer(app);
const io = new Server(server);

app.use(express.static(path.join(__dirname, 'public')));

let players = {};

io.on('connection', (socket) => {
    socket.on('joinGame', (data) => {
        let stats = { hp: 100, maxHp: 100, speed: 0.12, damage: 15, color: 0x0000ff };
        if(data.class === 'Medico') stats = { hp: 70, maxHp: 70, speed: 0.16, damage: 30, color: 0x00ff00 };
        if(data.class === 'Grandullon') stats = { hp: 115, maxHp: 115, speed: 0.07, damage: 5, color: 0xff0000 };

        players[socket.id] = { id: socket.id, x: Math.random()*10, z: Math.random()*10, ry: 0, ...stats };
        socket.emit('init', { id: socket.id, players });
        socket.broadcast.emit('newPlayer', players[socket.id]);
    });

    socket.on('move', (data) => {
        if (players[socket.id]) {
            players[socket.id].x = data.x;
            players[socket.id].z = data.z;
            players[socket.id].ry = data.ry;
            socket.broadcast.emit('playerMoved', players[socket.id]);
        }
    });

    socket.on('shoot', (targetId) => {
        if (players[targetId]) {
            players[targetId].hp -= players[socket.id].damage;
            io.emit('updateHP', { id: targetId, hp: players[targetId].hp });
            if (players[targetId].hp <= 0) {
                players[targetId].hp = players[targetId].maxHp;
                io.emit('respawn', { id: targetId, x: Math.random()*20-10, z: Math.random
