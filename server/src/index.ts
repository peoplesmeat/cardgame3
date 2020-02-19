import {Socket} from "socket.io";

const uuidv4 = require("uuid/v4");
const app = require("express")();
const server = require("http").Server(app);
const io = require("socket.io")(server, { path: '/myapp'});

app.use(function(req: any, res: any, next: any) {
    res.header("Access-Control-Allow-Origin", "*"); // update to match the domain you will make the request from
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
    next();
});

server.listen(4000);
// WARNING: app.listen(80) will NOT work here!

interface StoresGame {
    currentGame: string;
}

let inQueueSocket: Socket & StoresGame = null;

app.get("/", function(req: any, res: any) {
    res.sendFile(__dirname + "/index.html");
});

app.get("/api/board", function(req: any, res: any) {
    const k = Array(9).fill(null);
    k[0] = "X";
    k[1] = "O";
    return res.json( k );

    // res.sendFile(__dirname + '/index.html');
});

io.on("connection", function(socket: Socket & StoresGame) {
    console.log("Socket Connected");
    if (inQueueSocket === null) {
        inQueueSocket = socket;
        socket.emit("news", { message: "queued"});
    } else {
        const room = uuidv4();
        socket.emit("news", { message: "joined", game: room, player: "X"});
        inQueueSocket.emit("news", { message: "joined", game: room, player: "O"});

        inQueueSocket.join(room);
        socket.join(room);
        socket.currentGame = room;
        inQueueSocket.currentGame = room;

        inQueueSocket = null;
    }

    socket.on("my other event", function(data) {
        console.log(data);
    });

    socket.on("move", (data) => {
        if (!(data.room in socket.rooms)) {
            console.log("move", data);
            socket.to(data.game).emit("move", data);
        } else {
            console.log("BAD ROOM", data.room, socket.rooms);
        }
    });

    socket.on("disconnect", (reason) => {
        console.log("Socket has disconnected", socket.currentGame);

        if (inQueueSocket === socket) {
            console.log("Removing the queued socket");
            inQueueSocket = null;
        }

        if (socket.currentGame) {
            socket.to(socket.currentGame).emit("disconnected", {});
        }

    });
});
