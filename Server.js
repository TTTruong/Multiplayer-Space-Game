var express = require('express');
var app = express();
var http = require('http').Server(app);
var server = require('http').Server(app);
var io = require('socket.io')(server);

var players = [];
var shipRad = 15;
var missleRad = 1;

function Player()
{
    this.playerID = players.length;
    this.alive = false;
    this.position = 0;
    this.rotation = 0;
    this.misslePos = 0;
    this.missleFired = false;
}

var addPlayer = function(id)
{
    var player = new Player();
    player.playerID = id;
    player.alive = true;
    players.push( player );

    return players.length-1;
};

var removePlayer = function(player)
{
    var index = players.indexOf(player);
    players[index].alive = false;
};

var updatePlayerData = function(data, location)
{
    players[location].position = data.position;
    players[location].rotation = data.rotation;
    players[location].misslePos = data.misslePos;
    players[location].missleFired = data.missleFired;
};

var playerForID = function(id)
{
    var player;
    for (var i = 0; i < players.length; i++){
        if (players[i].playerID === id){
            player = players[i];
            break;
        }
    }

    return player;
};

function collide(player)
{
    var dx, dy, dz, d;

    for (var i=0; i<players.length; i++) {
        if (players[i].playerID != player.playerID && players[i].alive) {
            if (players[i].missleFired) {
                dx = players[i].misslePos.x - player.position.x;
                dy = players[i].misslePos.y - player.position.y;
                dz = playerayers[i].misslePos.z - player.position.z;
                d = Math.sqrt(dx*dx + dy*dy +dz*dz);
                if(d <(shipRad + missleRad)) {
                    players[i].missleFired = false;
                    removePlayer(player);
                    return true;
                }
            }

            dx = players[i].position.x - player.position.x;
            dy = players[i].position.y - player.position.y;
            dz = players[i].position.z - player.position.z;
            d = Math.sqrt(dx*dx + dy*dy +dz*dz);
            if(d <(2*shipRad)) {
                removePlayer(player);
                removePlayer(players[i]);
                return true;
            }
        }
    }

    return false;
}

app.get('/', function(req, res){
 res.sendFile(__dirname + '/Client.html');
 app.use(express.static(__dirname + '/'));
});

io.on('connection', function(socket){
    console.log('A player has connected!');

    var id = socket.id;
    var location = addPlayer(id);
    var player = playerForID(id);

    socket.emit('initialize', id);

    socket.on('locationUpdate', function(data){
        updatePlayerData(data, location);
        player = playerForID(id);
        socket.emit('sendAllPlayers', players);

        var hit = collide(player);

        if (hit || !player.alive) {
            socket.emit('death');
        }
    });

    socket.on('disconnect', function(){
        console.log('A player has disconnected.');
        removePlayer(player);
        socket.broadcast
    });
});

server.listen(8080, function(){
 console.log('listening on: *8080');
});