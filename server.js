//Constants
var SERVER_PORT = 1080;

var app = require('http').createServer(handler)
, io = require('socket.io').listen(app)
, fs = require('fs')
, util = require('util')

app.listen(SERVER_PORT);

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

var contacts = {};
var user_count = 0;
function refreshContactList()
{
    io.sockets.emit('list', contacts);
}

//socket.io server
io.sockets.on('connection', function (socket) {
    //If the client doesn't set any nickname it'll remain Anonymous
    var _this = this;

    var nick = "Anonymous_"+user_count++;

    //set nickname in this socket
    socket.set('nick', nick);
    //Set nickname to the user
    socket.emit('nick', nick);
    //show to the room
    io.sockets.emit('join', nick);

    contacts[socket.id] = nick;
    refreshContactList();

    socket.on('msg', function (data) {
        if (data == undefined || data.length == 0 ) {
            console.log('Empty message');
            return;
        }
        socket.get('nick', function(err, nick) {
            //Broadcast the message with the nickname
            console.log("Send ",nick, data);
            io.sockets.emit('msg', {nick:nick,text:data});
        });
    });

    socket.on('private', function (data) {
        if (data == undefined || data.length == 0 ) {
            console.log('Empty message');
            return;
        }
        console.log('private', data);
        var to      = data.to;
        var message = data.message;

        //confirm that the user_id exists
        
        if ( typeof contacts[to] == "undefined" ) {
            console.log('private to unexisting user');
            console.log(to, contacts);
            return;
        }

        socket.get('nick', function(err, nick) {
            //Broadcast the message with the nickname
            console.log("Send private from "+nick+" to "+to, data);

            io.sockets.socket(to).emit('privatein', {
                from: socket.id,
                name: nick,
                message: message
            });
        });
    });

    //Someone presents himself
    socket.on('nick', function (new_nick) {
        socket.get('nick', function(err, old_nick) {
            
            //can be set to false if any error check is not passed
            var new_name_ok = true;

            if ( err ) {
                console.error('Something wrong happened, user without nick');
                new_name_ok = false;
            }

            //Is there any changes at all?
            if ( old_nick == new_nick ) {
                new_name_ok = false;
            }

            //If the username exists already, don't change it
            for ( contact in contacts ) {
                if ( contacts[contact] == new_nick ) {
                    //contact already exists
                    new_name_ok = false;
                }
            }

            if ( new_name_ok == false ) {
                //reset old nick
                socket.emit('nick', old_nick);
            } else {
                //store the new nick
                socket.set('nick', new_nick, function(){
                    nick = new_nick;

                    console.log(old_nick+ " is now known as " + new_nick);

                    //set the new name to the client
                    socket.emit('nick', new_nick);

                    //Store in the client list
                    contacts[socket.id] = new_nick;

                    //Show that to the room
                    io.sockets.emit('nickchange', {new_nick:new_nick, old_nick:old_nick});

                    refreshContactList();
                });
            }
        });
    });

    //User disconnects
    socket.on('disconnect', function () {
        socket.get('nick', function(err, nick) {
            //delete this user from contact list
            delete contacts[socket.id];
            console.log(nick+" left");
            io.sockets.emit('left', nick);
            refreshContactList();
        });
    });

});


setInterval(function(){
    console.log("Memory",util.inspect(process.memoryUsage()));
}, 10000);
