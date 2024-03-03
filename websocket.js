const server = require('http').createServer();
const io = require('socket.io')(server, {
    cors: {
      origin: "*", // adjust this to your needs
      methods: ["GET", "POST"]
    }
  });

  io.on('connection', (socket) => {
    console.log('a user connected');
    
    // Example of emitting an event
    socket.emit('welcome', { message: 'Welcome to the match update server!' });
  
    // TODO: Add logic to emit real-time updates based on your application's logic
  
    socket.on('disconnect', () => {
      console.log('user disconnected');
    });
  });
  
  server.listen(3000, () => {
    console.log('WebSocket server listening on port 3000');
  });