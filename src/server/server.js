import express from 'express';
import { createServer } from 'http';
import { Server } from 'socket.io';

import { RoomManager } from './managers/RoomManager.js';

const app = express();
const httpServer = createServer(app);
const io = new Server(httpServer, {
 cors: {
   origin: "*",
   methods: ["GET", "POST"]
 }
});

const PORT = process.env.PORT || 3000;
const roomManager = new RoomManager(io);

io.on('connection', (socket) => {
  roomManager.handleConnection(socket);
});

httpServer.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
