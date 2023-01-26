const http = require("http");
const express = require("express");
// const socketio = require("socket.io");
const { Server } = require("socket.io");
const cors = require("cors");

const app = express();
const server = http.createServer(app);
// const io = socketio(server);
app.use(cors());
app.use(express.urlencoded({ extended: true }));

const io = new Server(server, {
  cors: {
    origin: "*",
    credentials: true,
  },
  transports: ["websocket"],
});

const users = [{}];

app.get("/", function (req, res) {
  res.sendFile(__dirname + "/index.html");
});

io.on("connection", function (socket) {
  const transport = socket.conn.transport.name; // in most cases, "polling"

  socket.conn.on("upgrade", () => {
    const upgradedTransport = socket.conn.transport.name; // in most cases, "websocket"
  });
  socket.on("joined", (data) => {
    users[socket.id] = data.user;

    socket.broadcast.emit("userJoined", {
      message: `Welcome ${users[socket.id]} to the chat`,
    });
    socket.emit("welcome", {
      message: `Welcome to the chat  ${users[socket.id]}`,
    });
  });

  socket.on("message", ({ message, id }) => {
    io.emit("sendMessage", { user: users[id], message, id });
  });

  socket.on("disconnect", () => {
    socket.broadcast.emit("leave", {
      message: `${users[socket.id]} has left the chat`,
    });
    console.log(`${users[socket.id]} user disconnect`);
  });
});

server.listen(process.env.PORT || 5000, () =>
  console.log(`Server has started.`)
);
