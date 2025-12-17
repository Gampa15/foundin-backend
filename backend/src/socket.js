const socketIO = require('socket.io');
const jwt = require('jsonwebtoken');
const User = require('./models/User');
const Message = require('./models/Message');
const Conversation = require('./models/Conversation');

let io;

module.exports = {
  init: (server) => {
    io = socketIO(server, {
      cors: {
        origin: '*',
        methods: ['GET', 'POST']
      }
    });

    io.use(async (socket, next) => {
      try {
        const token = socket.handshake.auth.token;
        if (!token) return next(new Error('Unauthorized'));

        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        const user = await User.findById(decoded.id);
        if (!user) return next(new Error('Unauthorized'));

        socket.user = user;
        next();
      } catch (err) {
        next(new Error('Unauthorized'));
      }
    });

    io.on('connection', (socket) => {

      // TYPING START
      socket.on('typing', ({ conversationId }) => {
        socket.to(conversationId).emit('typing', {
          userId: socket.user.id,
          conversationId
        });
      });

      // TYPING STOP
      socket.on('stop-typing', ({ conversationId }) => {
        socket.to(conversationId).emit('stop-typing', {
          userId: socket.user.id,
          conversationId
        });
      });

      console.log(`User connected: ${socket.user.id}`);

      socket.join(socket.user.id); // personal room

      socket.on('join-conversation', (conversationId) => {
        socket.join(conversationId);
      });

      socket.on('send-message', async ({ conversationId, content }) => {
        const conversation = await Conversation.findOne({
          _id: conversationId,
          members: socket.user.id
        });

        if (!conversation) return;

        const message = await Message.create({
          conversation: conversationId,
          sender: socket.user.id,
          content
        });

        io.to(conversationId).emit('new-message', {
          _id: message._id,
          conversation: conversationId,
          sender: socket.user.id,
          content,
          createdAt: message.createdAt
        });
      });

      socket.on('disconnect', () => {
        console.log(`User disconnected: ${socket.user.id}`);
      });
    });

    return io;
  },
  getIO: () => {
    if (!io) throw new Error('Socket.io not initialized');
    return io;
  }
};
