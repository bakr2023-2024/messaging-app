require("dotenv").config();
var express = require("express");
var path = require("path");
var logger = require("morgan");
const mongoose = require("mongoose");
const flash = require("express-flash");
mongoose.connect(process.env.MONGO_URI);
const passport = require("./passportConfig");
var indexRouter = require("./routes/index");
var app = express();
const http = require("http").createServer(app);
const Server = require("socket.io").Server;
const io = new Server(http, {
  connectionStateRecovery: {},
});
const cors = require("cors");
const session = require("express-session");
const MongoStore = require("connect-mongo")(session);
const URI = process.env.MONGO_URI;
const store = new MongoStore({ url: URI });
const cookieParser = require("cookie-parser");
const passportSocketIo = require("passport.socketio");
app.use(cors());
function onAuthorizeSuccess(data, accept) {
  console.log("successful connection to socket.io");

  accept(null, true);
}

function onAuthorizeFail(data, message, error, accept) {
  if (error) throw new Error(message);
  console.log("failed connection to socket.io:", message);
  accept(null, false);
}
io.use(
  passportSocketIo.authorize({
    cookieParser: cookieParser,
    key: "express.sid",
    secret: process.env.SECRET,
    store: store,
    success: onAuthorizeSuccess,
    fail: onAuthorizeFail,
  })
);
app.use(
  session({
    secret: process.env.SECRET,
    key: "express.sid",
    resave: true,
    saveUninitialized: true,
    store: store,
  })
);
app.set("views", path.join(__dirname, "views"));
app.set("view engine", "pug");
app.use(logger("dev"));
app.use(flash());
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(express.static(path.join(__dirname, "public")));
app.use(passport.initialize());
app.use(passport.session());
app.use("/", indexRouter);
let clientNum = 0;
const userSocketMapper = {};
io.on("connection", (socket) => {
  socket.emit("user", {
    clientNum: ++clientNum,
    username: socket.request.user.username,
    connected: true,
  });
  socket.on("disconnect", () => {
    socket.emit("user", {
      clientNum: --clientNum,
      username: socket.request.user.username,
      connected: false,
    });
  });
  socket.on("msg", (message) => {
    io.emit("chat msg", {
      id: socket.request.user.id,
      username: socket.request.user.username,
      message,
      color:socket.request.user.color
    });
  });
});
http.listen(3000, () => {
  console.log("listening at http://localhost:3000");
});
