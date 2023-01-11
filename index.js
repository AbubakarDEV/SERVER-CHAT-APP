let app = require("express")();

var http = require("http").Server(app);
var cors = require("cors");
var io = require("socket.io")(http);

app.use(cors());
const users = [{}];

app.get("/", function (req, res) {
  res.sendFile(__dirname + "/index.html");
});

io.on("connection", function (socket) {
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

http.listen(8000, function () {
  console.log("Server runing at port 8000");
});
