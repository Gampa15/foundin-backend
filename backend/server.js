require('dotenv').config();

const http = require('http');
const app = require('./src/app');
const connectDB = require('./src/config/db');
const socket = require('./src/socket'); // this file exists

connectDB();

const PORT = process.env.PORT || 5000;
const server = http.createServer(app);
const io = socket.init(server); // use init() from socket.js
app.set('io', io);

server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
