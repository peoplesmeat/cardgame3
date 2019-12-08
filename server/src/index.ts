import {Socket} from "socket.io";

const uuidv4 = require('uuid/v4');
var app = require('express')();
var server = require('http').Server(app);
var io = require('socket.io')(server);


server.listen(4000);
// WARNING: app.listen(80) will NOT work here!

var inQueueSocket: Socket = null;

app.get('/', function (req: any, res: any) {
    res.sendFile(__dirname + '/index.html');
});

app.get('/api/board', function (req: any, res: any) {
    const k = Array(9).fill(null);
    k[0] = "X";
    k[1] = "O";
    return res.json( k );

    // res.sendFile(__dirname + '/index.html');
});

io.on('connection', function (socket: Socket) {
    //console.log(io.of('/').in("room-1"))
    console.log("Socket Connected");
    if (inQueueSocket === null) {
        inQueueSocket = socket;
        socket.emit('news', { message: 'queued'});
    } else {
        const room = uuidv4();
        socket.emit('news', { message: 'joined', game: room, player:'X'});
        inQueueSocket.emit('news', { message: 'joined', game: room, player: 'O'});

        inQueueSocket.join(room);
        socket.join(room);

        inQueueSocket = null;
    }

    socket.on('my other event', function (data) {
        console.log(data);
    });

    socket.on("move", (data) => {
        if (!(data.room in socket.rooms)) {
            console.log("move", data);
            socket.to(data.game).emit('move', data);
        } else {
            console.log("BAD ROOM", data.room, socket.rooms);
        }
    });

    socket.on('disconnect', (reason) => {
        if (inQueueSocket === socket) {
            console.log("In Queued Socket has disconnected");
            inQueueSocket = null;
        }
    });


});

