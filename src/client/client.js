import io from 'socket.io-client';

const socket = io('http://localhost:3000');

socket.on('connect', () => {
  console.log('Connected to server with ID:', socket.id);
});

socket.on('disconnect', () => {
  console.log('Disconnected from server');
});

console.log('Client started...');
