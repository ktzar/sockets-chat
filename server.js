//Constants
var SERVER_PORT = 1080;

var app = require('http').createServer(handler)
, io = require('socket.io').listen(app)
, fs = require('fs')
, util = require('util')
, mime = require('./lib/mime')


app.listen(SERVER_PORT);

//Rooms that are available
var rooms = new Array('News', 'Sports', 'Romance', 'Languages');


//HTTP handler
function handler (req, res) {

    //Room list
    if (req.url.indexOf("/ajax/rooms.json") == 0 ) {
        res.writeHead(200, {'Content-Type': 'application/json'});
        res.write(JSON.stringify(rooms),encoding='utf8')
        res.end();
        return;
    }

    //Dump any existing file in the /static folder
    if (req.url.indexOf("/static/")==0) {
        var file = req.url;

        //Read the desired file and output it
        fs.readFile(__dirname + '/'+file,
            function (err, file_data) {
                if (err) {
                    res.writeHead(500);
                    res.end('Not found '+req.url);
                } else {
                    // returns MIME type for extension, or fallback, or octet-steam
                    var extension = file.substr(file.lastIndexOf('.'));
                    var mime_type = mime.lookupExtension(extension);
                    res.writeHead(200, {'Content-Type' : mime_type});
                    res.end(file_data);
                }
            }
        );
    } else {
        //Elsewhere, redirect to the static page
        res.writeHead(302, {
            'Location': '/static/index.html'
        });
        res.end();
    }

}


//TODO put this in a module
var createChat = function(room_name){

    var contacts = {};
    var user_count = 0;

    var refreshContactList = function () {
        room.emit('list', contacts);
    };

    var room = io.of('/'+room_name).on('connection', function (socket) {
        //If the client doesn't set any nickname it'll remain Anonymous
        var _this = this;

        var nick = "Anonymous_"+user_count++;
        socket.set('nick', nick);

        //Set nickname to the user
        socket.emit('nick', nick);
        //show to the room
        room.emit('join', nick);

        contacts[socket.id] = nick;
        refreshContactList();

        //Message to the Room
        socket.on('msg', function (message) {
            if (message == undefined || message.length == 0 ) {
                console.log('Empty message');
                return;
            }
            //Get the nickname
            socket.get('nick', function (err, nick) {
                console.log("Send ",nick, message);
                //Broadcast the message with the nickname
                room.emit('msg', {nick:nick,text:message});
            });
        });

        //Event of a private message
        socket.on('private', function (message) {
            if (message == undefined || message.length == 0 ) {
                console.log('Empty message');
                return;
            }
            var to      = message.to;
            var message = message.message;

            //confirm that the user_id exists
            if ( typeof contacts[to] == "undefined" ) {
                console.log('private to unexisting user');
                console.log(to, contacts);
                return;
            }

            socket.get('nick', function (err, nick) {
                //Broadcast the message with the nickname
                console.log("Send private from "+nick+" to "+to, message);

                room.socket(to).emit('privatein', {
                    from: socket.id,
                    name: nick,
                    message: message
                });
            });
        });

        //Someone presents himself
        socket.on('nick', function (new_nick) {
            
            //can be set to false if any error check is not passed
            var new_name_ok = true;

            //Not empty name
            if ( new_nick == "" ) {
                new_name_ok = false;
            } else if ( _this.nick == new_nick ) {
            //Is there any changes at all?
                new_name_ok = false;
            }

            if ( new_name_ok ) {
                //If the username exists already, don't change it
                for ( contact in contacts ) {
                    if ( contacts[contact] == new_nick ) {
                        //contact already exists
                        new_name_ok = false;
                    }
                }
            }

            if ( new_name_ok == false ) {
                //reset old nick
                socket.emit('nick', _this.nick);
            } else {

                socket.get('nick', function (err, old_nick) {
                    //store the new nick
                    socket.set('nick', new_nick);
                    //set the new name to the client
                    socket.emit('nick', new_nick);
                    //Store in the client list
                    contacts[socket.id] = new_nick;
                    //Show that to the room
                    room.emit('nickchange', {new_nick:new_nick, old_nick:old_nick});
                    console.log(old_nick+ " is now known as " + new_nick);
                    refreshContactList();
                });
            }
        });

        //User disconnects
        socket.on('disconnect', function () {
            socket.get('nick', function(err, nick) {
                //delete this user from contact list
                delete contacts[socket.id];
                console.log(nick+" left");
                room.emit('left', nick);
                refreshContactList();
            });
        });
    });
};

//Create chatrooms
for ( room in rooms ) {
    createChat(rooms[room]);
}
  
//Debug memory usage every 10s
setInterval(function(){
    console.log("Memory",util.inspect(process.memoryUsage()));
}, 10*1000);
