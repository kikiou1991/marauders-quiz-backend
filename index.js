const express = require('express');
const app = express();
const http = require('http');
const server = http.createServer(app);
const cors = require('cors');
const {Server} = require('socket.io');
const {MongoClient} = require('mongodb');
const jwt = require('jsonwebtoken');
const io = new Server(server, {
  cors: {
    origin: '*',
    credentials: true,
  },
});
const port = 3010;
require('dotenv').config();
const mongoDBUri = process.env.MONGODB_URI;
let db;
app.use(cors());
app.use(express.json());

app.get('/api', (req, res) => {
  res.send('Hello World!');
});

app.use((err, req, res, next) => {
  console.error('Unhandled error:', err);
  res.status(500).send('Internal Server Error');
});

const mongoClient = new MongoClient(mongoDBUri);
// const exlucdePaths = ['/api/login', '/api/register'];

startServer();
async function startServer() {
  await mongoClient.connect();
  console.log('Connected successfully to server');
  db = mongoClient.db('marauders-quiz');
  require('./src/routes/rooms')(app, io, db);
}
server.listen(port, () => {});
