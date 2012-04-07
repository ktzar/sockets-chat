var app = require('http').createServer(handler)
, io = require('socket.io').listen(app)
, fs = require('fs')

app.listen(1080);

function handler (req, res) {
    if (req.url.substr(0,8) == "/static/") {
        var file = req.url;
    }else{
        var file = 'index.html';
    }

    console.log("output ",__dirname + '/'+file);
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

io.sockets.on('connection', function (socket) {
    socket.set('nick', "Anoymous");
    socket.on('msg', function (data) {
        socket.get('nick', function(err, nick) {
            io.sockets.emit('msg', nick+": "+data);
            console.log(nick+"Send to all", data);
        });
    });
    socket.on('nick', function (nick) {
        socket.set('nick', nick, function(){
            console.log('Nick set to '+nick);
            io.sockets.emit('msg', nick+" entered the chat room.");
        });
    });
});
