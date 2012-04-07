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
        socket.get('nick', function(err, nick) {
            //Broadcast the message with the nickname
            io.sockets.emit('msg', nick+": "+data);
        });
    });
    //Someone presents himself
    socket.on('nick', function (nick) {
        socket.set('nick', nick, function(){
            //Show that to the room
            io.sockets.emit('msg', nick+" entered the chat room.");
        });
    });
});
