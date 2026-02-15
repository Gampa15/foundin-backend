require('dotenv').config();

const http = require('http');
const app = require('./src/app');
const connectDB = require('./src/config/db');
const bootstrapSocket = require('./src/socket/index');

connectDB();

const PORT = process.env.PORT || 5000;
const server = http.createServer(app);
const io = bootstrapSocket(server);
app.set('io', io);

server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
