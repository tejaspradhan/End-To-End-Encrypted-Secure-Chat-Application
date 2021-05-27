const path = require("path");
const mongoose = require("mongoose");
const http = require("http");
const express = require("express");
const socketio = require("socket.io");
const formatMessage = require("./utils/messages");
const { encrypt, decrypt } = require("./utils/cryptography.js");
const Cryptr = require("cryptr");
const Room = require("./RoomSchema");
const bcrypt = require("bcrypt");
const cryptr = new Cryptr(
  "56dce7276d2b0a24e032beedf0473d743dbacf92aafe898e5a0f8d9898c9eae80a73798beed53489e8dbfd94191c1f28dc58cad12321d8150b93a2e092a744265fd214d7c2ef079e2f01b6d06319b7b2"
);

mongoose.connect("mongodb://localhost/chat_db");

const {
  userJoin,
  getCurrentUser,
  userLeave,
  getRoomUsers,
} = require("./utils/users");

const app = express();
const server = http.createServer(app);
const io = socketio(server);

//Setting static folder
app.use(express.static(path.join(__dirname, "public")));

const botName = "Admin";

//RUn when client connects

io.on("connection", (socket) => {
  socket.on("joinRoom", ({ username, room }) => {
    const user = userJoin(socket.id, username, room);

    socket.join(user.room);

    //Welcome current user
    socket.emit(
      "message",
      formatMessage(botName, cryptr.encrypt("Welcome To Chatbox"))
    );

    //When user enters a chat room
    //Broadcast will show the prompt to all folks in chat room other than user itself
    socket.broadcast
      .to(user.room)
      .emit(
        "message",
        formatMessage(
          botName,
          cryptr.encrypt(`${user.username} has entered the chat room`)
        )
      );

    //Send room and users info

    io.to(user.room).emit("roomUsers", {
      room: user.room,
      users: getRoomUsers(user.room),
    });
  });

  socket.on("chatMessage", (msg) => {
    const user = getCurrentUser(socket.id);

    //console.log(msg);
    io.to(user.room).emit("message", formatMessage(user.username, msg));
  });

  //When user disconnects
  socket.on("disconnect", () => {
    const user = userLeave(socket.id);

    if (user) {
      //io.emit will show the prompt to all folks in chat room including the user itself
      io.to(user.room).emit(
        "message",
        formatMessage(
          botName,
          cryptr.encrypt(`${user.username} has left the chat`)
        )
      );

      // Send users and room info
      io.to(user.room).emit("roomUsers", {
        room: user.room,
        users: getRoomUsers(user.room),
      });
    }
  });
});

// ROUTES

app.get("/decrypt", (req, res) => {
  message = req.query.message;
  console.log("LD: " + message.length);
  decrypted = cryptr.decrypt(message);
  res.json(decrypted);
});

app.get("/encrypt", (req, res) => {
  message = req.query.message;
  encrypted = cryptr.encrypt(message);
  console.log("LE: " + encrypted.length);
  res.json(encrypted);
});

app.get("/insert", async (req, res) => {
  const salt = await bcrypt.genSalt(10);
  hashed1 = await bcrypt.hash("cybersec12345", salt);
  hashed2 = await bcrypt.hash("algo12345", salt);
  hashed3 = await bcrypt.hash("ds12345", salt);
  hashed4 = await bcrypt.hash("os12345", salt);
  hashed5 = await bcrypt.hash("ai12345", salt);
  hashed6 = await bcrypt.hash("se12345", salt);

  rooms = [
    { name: "Cyber Security", secretKey: hashed1 },
    { name: "Algorithms", secretKey: hashed2 },
    { name: "Data Science", secretKey: hashed3 },
    { name: "Operating Systems", secretKey: hashed4 },
    { name: "Artificial Intelligence", secretKey: hashed5 },
    { name: "Software Engineering", secretKey: hashed6 },
  ];
  console.log(rooms);
  Room.insertMany(rooms, function (err, res) {
    if (err) throw err;
  });
  res.send("Inserted Successfully");
});
const PORT = process.env.PORT || 3000;

server.listen(PORT, () => console.log(`Server running on port ${PORT}`));
