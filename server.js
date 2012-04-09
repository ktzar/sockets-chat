var app = require('http').createServer(handler)
, io = require('socket.io').listen(app)
, fs = require('fs')

app.listen(1080);

function handler (req, res) {

    //Dump any existing file in the /static folder
    if (req.url.substr(0,8) == "/static/") {
        var file = req.url;
    }else{
        //Elsewhere, dump index.html
        var file = 'index.html';
    }

    //Read the desired file and output it
    fs.readFile(__dirname + '/'+file,
        function (err, data) {
            if (err) {
                res.writeHead(500);
                return res.end('Not found '+req.url);
            }
            res.writeHead(200);
            res.end(data);
        }
    );
}

//socket.io server
io.sockets.on('connection', function (socket) {
    //If the client doesn't set any nickname it'll remain Anonymous
    socket.set('nick', "Anoymous");
    socket.on('msg', function (data) {
        if (data.length == 0 ) {
            console.log('Empty message came');
            return;
        }
        socket.get('nick', function(err, nick) {
            //Broadcast the message with the nickname
            console.log("Send ",nick, data);
            io.sockets.emit('msg', {nick:nick,text:data});
        });
    });
    //Someone presents himself
    socket.on('nick', function (nick) {
        socket.set('nick', nick, function(){
            //Show that to the room
            console.log(nick+" joined");
            io.sockets.emit('new', nick);
        });
    });

    //User disconnects
    socket.on('disconnect', function () {
        socket.get('nick', function(err, nick) {
            console.log(nick+" left");
            io.sockets.emit('left', nick);
        });
    });


});
