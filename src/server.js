import express from 'express';
import cors from 'cors';
import 'dotenv/config.js';
import { connectToDatabase } from './config/database.js';
import apiLoggerMiddleware from './middlewares/apiLogger.mdw.js';
import appRouter from './routes/index.js';
import handleErrorMiddleware from './middlewares/handleError.mdw.js';
import { Server } from 'socket.io';
const app = express();
const PORT = process.env.PORT;

connectToDatabase();

app.use(express.json());
app.use(cors({ origin: ['https://test-bank-client.onrender.com', 'http://localhost:5173'] }));

app.use(apiLoggerMiddleware);

app.use('/api/v1', appRouter);

app.use(handleErrorMiddleware);

const expressServer = app.listen(PORT, () => {
  console.log(`Server is running on: http://localhost:${PORT}`);
});

const io = new Server(expressServer, {
  cors: ['https://x19fp-client.onrender.com', 'http://localhost:5173']
});

io.on('connection', socket => {
  socket.on('send-answer', answer => {
    socket.broadcast.emit('recevice-answer', answer);
  });
  socket.on('send-test-noti', testNoti => {
    socket.broadcast.emit('recevice-testNoti', testNoti);
    socket.join(testNoti.authorId);
  });
  socket.on('enter-room', room => {
    socket.join(room.roomId);
  });
  socket.on('send-noti-testOwner', noti => {
    io.to(noti.testOwnerId).emit('recevice-noti-testOwner', noti.message);
    socket.leave(noti.testOwnerId);
  });
  socket.on('join-room', id => {
    socket.join(id?.id);
  });
  socket.on('add-user-to-room', user => {
    socket.join(user.id);
    io.to(user.id).emit('get-user-in-room', user.currentUser);
  });
});
