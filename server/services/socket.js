const { Server } = require('socket.io');
const jwt = require('jsonwebtoken');

class SocketService {
  constructor(server) {
    this.io = new Server(server, {
      cors: {
        origin: "http://localhost:3000",
        methods: ["GET", "POST"]
      }
    });

    this.activeUsers = new Map();
    this.objects = new Map();
    this.comments = new Map();

    this.initializeSocketHandlers();
  }

  initializeSocketHandlers() {
    this.io.use((socket, next) => {
      try {
        const token = socket.handshake.auth.token;
        if (!token) {
          return next(new Error('Authentication error'));
        }

        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        socket.user = decoded;
        next();
      } catch (error) {
        next(new Error('Authentication error'));
      }
    });

    this.io.on('connection', (socket) => {
      console.log('User connected:', socket.user.id);

      // Add user to active users
      this.activeUsers.set(socket.id, {
        id: socket.user.id,
        name: socket.user.name,
        socketId: socket.id
      });

      // Broadcast updated user list
      this.broadcastUserList();

      // Handle object edits
      socket.on('object-edit', (data) => {
        const fileUrn = socket.handshake.query.fileUrn;
        if (!this.objects.has(fileUrn)) {
          this.objects.set(fileUrn, new Map());
        }
        
        this.objects.get(fileUrn).set(data.objectId, data);
        socket.to(fileUrn).emit('object-edit', data);
      });

      // Handle object selection
      socket.on('object-select', (data) => {
        socket.to(socket.handshake.query.fileUrn).emit('object-select', data);
      });

      // Handle comments
      socket.on('comment', (data) => {
        const fileUrn = socket.handshake.query.fileUrn;
        if (!this.comments.has(fileUrn)) {
          this.comments.set(fileUrn, []);
        }
        
        this.comments.get(fileUrn).push(data);
        socket.to(fileUrn).emit('comment', data);
      });

      // Handle disconnection
      socket.on('disconnect', () => {
        console.log('User disconnected:', socket.user.id);
        this.activeUsers.delete(socket.id);
        this.broadcastUserList();
      });
    });
  }

  broadcastUserList() {
    const userList = Array.from(this.activeUsers.values());
    this.io.emit('user-update', userList);
  }

  getObjects(fileUrn) {
    return this.objects.get(fileUrn) || new Map();
  }

  getComments(fileUrn) {
    return this.comments.get(fileUrn) || [];
  }
}

module.exports = SocketService; 