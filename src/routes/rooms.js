require('dotenv').config();
const jwt = require('jsonwebtoken');
const {ObjectId} = require('mongodb');
const {v4: uuidv4} = require('uuid');
module.exports = async (app, io, db) => {
  let namespace = io.of('/api/rooms');
  namespace.on('connection', (socket) => {
    console.log('a user connected');
    socket.on('join', (roomUID) => {
      console.log('join', roomUID);
      socket.join(roomUID);
    });
    socket.on('message', (message) => {
      console.log('message', message);
      namespace.to(message.roomUID).emit('message', message);
    });
    socket.on('disconnect', () => {
      console.log('user disconnected');
    });
  });
  app.post('/api/rooms', async (req, res) => {
    const {name} = req.body;
    let roomUID = uuidv4();
    const room = {
      name,
      users: [],
      messages: [],
      createTimeStamp: new Date(),
      roomUID: roomUID,
      _id: roomUID,
    };
    let createdRoom = await db.collection('rooms').insertOne(room, {
      returnDocument: 'after',
    });
    const roomToSend = await db.collection('rooms').findOne({
      _id: roomUID,
    });
    if (createdRoom) {
      res.status(201).send({
        success: true,
        data: {
          room: room,
          createdRoom: roomToSend,
        },
      });
    }
  });
};
