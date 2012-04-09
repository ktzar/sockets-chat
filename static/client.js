//Chat Class
var Chat = function(user_options) {

    var _this = this;

    //default options
    this.options = {
        nick: 'Anonymous',
    };

    var callbacks = ['msg', 'join', 'left', 'list'];
    for (var i in callbacks) {
        this.options['_cb_'+callbacks[i]] = function(){};
    }

    //merge options
    for (var attrname in user_options) { 
        this.options[attrname] = user_options[attrname]; 
    }

    //Set the nickname as soon as the connection is ready
    this.socket = io.connect();
    this.socket.on('connect', function(){
        _this.socket.emit('nick', _this.options.nick);    
    });
    //message sending function
    this.sendMessage = function(text) {
        _this.socket.emit('msg', text); 
    };

    //configure callback
    for (i=0;i<callbacks.length;i++) {
        var callback = callbacks[i];
        if ( typeof this.options["_cb_"+callback] == "function" ) {
            var _callback = this.options["_cb_"+callback];
            this.socket.on(callback,   _callback);
        }
    }
}


//Add the incoming text in the textarea and keep it scrolled down
function receiveMessage(message) {
    updateBox("<span class='nick'>"+message.nick+"</span><span class='text'>"+message.text+"</span>");
}

//Add the incoming text in the textarea and keep it scrolled down
function userNew(nick) {
    updateBox("<span class='status'>"+nick+" has joined.</span>");
}

//Add the incoming text in the textarea and keep it scrolled down
function userLeft(nick) {
    updateBox("<span class='status'>"+nick+" has left.</span>");
}

function updateBox (text) {
    $('#output').html($('#output').html()+"<div class='message'>"+text+"</div>");
    output = $('#output')[0];
    output.scrollTop = output.scrollHeight;
}

//Called when a user appears or leaves the room
function contactList(contacts) {
    console.log('contactList', contacts);
    $('#contactlist ul').html('');
    for (contact in contacts) {
        $('#contactlist ul').append('<li>'+contacts[contact]+'</li>');
    }
}

//onLoad
$(function(){
    //ask for a name
    var name = null, i = 0;
    while ( name == null || name.length == 0 || i > 5) {
        name = prompt("What's your name");
        i++;
    }
    if ( i > 5 ) {
        alert("It seems that you don't wanna play my game");
        //Don't do anything else, chat won't work
        return;
    }

    //instantiate Chat class
    var chat = new Chat({
        'nick':     name,
        _cb_msg:     receiveMessage,
        _cb_join:    userNew,
        _cb_left:    userLeft,
        _cb_list:    contactList
    });

    //Detect keystrokes, send message on Enter
    $('#input').keydown(function(e){
        if ( e.keyCode == 13 ) {
            text = $('#input').val();
            chat.sendMessage(text);
            $('#input').val('');
        }
    }).focus(); //input field is focused on loading
});
