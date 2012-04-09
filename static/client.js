//Chat Class
var Chat = function(user_options) {

    var _this = this;

    //default options
    this.options = {
        nick: 'Anonymous',
        cb_rx_msg: function(){},
        cb_user_new: function(){},
        cb_user_left: function(){}
    };

    //merge options
    for (var attrname in user_options) { this.options[attrname] = user_options[attrname]; }

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
    this.socket.on('msg', this.options.cb_rx_msg);
    this.socket.on('new', this.options.cb_user_new);
    this.socket.on('left', this.options.cb_user_left);
}


//Add the incoming text in the textarea and keep it scrolled down
function receiveMessage(message) {
    updateBox("<span class='nick'>"+message.nick+"</span><span class='text'>"+message.text+"</span>");
}

//Add the incoming text in the textarea and keep it scrolled down
function userNew(nick) {
    updateBox("<span class='status'>"+nick+" new.</span>");
}

//Add the incoming text in the textarea and keep it scrolled down
function userLeft(nick) {
    updateBox("<span class='status'>"+nick+" left.</span>");
}

function updateBox (text) {
    $('#output').html($('#output').html()+"<div class='message'>"+text+"</div>");
    output = $('#output')[0];
    output.scrollTop = output.scrollHeight;
}

//onLoad
$(function(){
    //ask for a name
    var name = null, i = 0;
    while (name == null || i > 5) {
        name = prompt("What's your name");
        i++;
    }
    if ( i > 5 ) {
        alert("It seems that you don't wanna play my game");
        //Don't do anything else, chat won't work
        return;
    }

    //instantiate Chat class
    var chat = new Chat(
        {
            'nick':name,
            cb_rx_msg: receiveMessage,
            user_new: userNew,
            user_left: userLeft
        }
    );

    //Detect keystrokes, send message on Enter
    $('#input').keydown(function(e){
        if ( e.keyCode == 13 ) {
            text = $('#input').val();
            chat.sendMessage(text);
            $('#input').val('');
        }
    }).focus(); //input field is focused on loading
});
