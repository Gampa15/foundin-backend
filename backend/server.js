const mongoose = require('mongoose');
const dotenv = require('dotenv');
const app = require('./src/app');

dotenv.config();

mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log('MongoDB connected'))
  .catch(err => console.error(err));

const PORT = process.env.PORT || 5000;
const http = require('http');
const socket = require('./src/socket');

const server = http.createServer(app);
socket.init(server);

server.listen(PORT, () => {
  console.log(`Server running on ${PORT}`);
});
