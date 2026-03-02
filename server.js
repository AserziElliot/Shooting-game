const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const path = require('path');

const app = express();
const server = http.createServer(app);
const io = new Server(server);

// 1. Indicar dónde están los archivos estáticos
const publicPath = path.join(__dirname, 'public');
app.use(express.static(publicPath));

// 2. SOLUCIÓN AL "NOT FOUND": Si entran a la raíz, enviar el index.html explícitamente
app.get('/', (req, res) => {
    res.sendFile(path.join(publicPath, 'index.html'));
});

// Lógica de jugadores (la misma de antes)
let players = {};
io.on('connection', (socket) => {
    socket.on('joinGame', (data) => {
        let stats = { hp: 100, maxHp: 100, speed: 0.15, damage: 15, color: 0x0000ff };
        if(data.class === 'Medico') stats = { hp: 70, maxHp: 70, speed: 0.18, damage: 30, color: 0x00ff00 };
        if(data.class === 'Grandullon') stats = { hp: 115, maxHp: 115, speed: 0.08, damage: 5, color: 0xff0000 };
        players[socket.id] = { id: socket.id, x: 0, z: 0, class: data.class, ...stats };
        socket.emit('init', { id: socket.id, players });
        socket.broadcast.emit('newPlayer', players[socket.id]);
    });

    socket.on('move', (pos) => {
        if (players[socket.id]) {
            players[socket.id].x = pos.x;
            players[socket.id].z = pos.z;
            socket.broadcast.emit('playerMoved', players[socket.id]);
        }
    });

    socket.on('disconnect', () => {
        delete players[socket.id];
        io.emit('removePlayer', socket.id);
    });
});

// Usar el puerto que Render nos asigne o el 3000
const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
    console.log('Servidor funcionando en puerto', PORT);
});
