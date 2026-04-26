import express from 'express';
import { createServer } from 'http';
import { Server } from 'socket.io';
import cors from 'cors';

const app = express();
const httpServer = createServer(app);
const io = new Server(httpServer, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"]
  }
});

app.use(cors());

const messages = [];

io.on('connection', (socket) => {
  console.log('Usuario conectado:', socket.id);

  socket.emit('messageHistory', messages);

  socket.on('sendMessage', (data) => {
    const message = {
      id: Date.now().toString(),
      user: data.user,
      text: data.text,
      time: new Date().toLocaleTimeString()
    };
    messages.push(message);
    
    if (messages.length > 100) {
      messages.splice(0, messages.length - 100);
    }

    io.emit('newMessage', message);
  });

  socket.on('disconnect', () => {
    console.log('Usuario desconectado:', socket.id);
  });
});

const PORT = 3001;
httpServer.listen(PORT, () => {
  console.log(`Servidor Socket.io corriendo en http://localhost:${PORT}`);
});