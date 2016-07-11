var express = require("express");
var app = express();
var http = require("http").Server(app);
var io = require("socket.io")(http);

var globalClients = {};

var states = {
    normal: 1,
    name: 2
};

function serverTalk(msg) {
    return {
        "msg": msg,
        "interval": interval("cheerful")
    };
}

function interval(speed) {
    switch (speed) {
        case "revelation": return 500;
        case "serious": return 100;
        default:
        case "casual": return 30;
        case "cheerful": return 15;
        case "instant": return 1;
    }
}

app.use(express.static("resources"));

io.on("connection", function(socket) {
    var state;
    var name = "Hacking Anon";
    
    console.log(socket.id + " INCOMING CONNECT " + socket.request.connection.remoteAddress);
    
    console.log(socket.id + " REQUEST NAME");
    state = states.name;
    socket.emit("global", serverTalk("Welcome, welcome! Please, what is your name?"));
    
    socket.on("global", function(data) {
        console.log(socket.id + " INCOMING GLOBAL " + data["msg"] + " @" + data["speed"]);
        
        switch (state) {
            case states.global:
                var incomingInterval = interval(data["speed"]);
                
                console.log(socket.id + " OUTGOING GLOBAL " + name + ": " + data["msg"] + " @" + incomingInterval + " (" + data["speed"] + ")");
                for (var clientName in globalClients) {
                    globalClients[clientName].emit("global", {
                        "name": name,
                        "msg": data["msg"],
                        "interval": incomingInterval
                    });
                }
                break;
                
            case states.name:
                var incomingName = data["msg"];
                
                if (incomingName in globalClients) {
                    console.log(socket.id + " ERROR Name " + incomingName + " is already in global channel.");
                    socket.emit("global", serverTalk("OBJECTION! " + incomingName + " is in here right now! Can you testify your name again?"));
                }
                else {
                    console.log(socket.id + " SET NAME " + data["msg"]);
                    name = incomingName;
                    state = states.global;
                    globalClients[name] = socket;
                    socket.emit("global", serverTalk("Welcome, " + name + "! I hope you enjoy your stay."));
                }
                break;
            
            default:
                console.log(socket.id + " ERROR Invalid state!");
        }
    });
    
    socket.on("disconnect", function() {
        console.log(socket.id + " DISCONNECT");
        
        if (state == states.global)
            delete globalClients[name];
    });
});

http.listen(process.env.PORT, process.env.HOST);