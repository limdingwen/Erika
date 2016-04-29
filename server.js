var app = require("express")();
var http = require("http").Server(app);
var io = require("socket.io")(http);

io.on("connection", function(socket) {
  console.log("Connected from " + socket.request.connection.remoteAddress);
  
  socket.on("broadcast", function(msg) {
        io.emit("broadcast", socket.id + ": " + msg);
  });
});

http.listen(process.env.PORT, process.env.HOST);