//Add the incoming text in the textarea and keep it scrolled down
function receiveMessage(message) {
    //escape the text
    updateBox("<span class='nick'>"+message.nick+"</span><span class='text'>"+cleanText(message.text)+"</span>");
}

//Add the incoming text in the textarea and keep it scrolled down
function userNew(nick) {
    updateBox("<span class='status'>"+nick+" has joined.</span>");
}

//Add the incoming text in the textarea and keep it scrolled down
function userLeft(nick) {
    updateBox("<span class='status'>"+nick+" has left.</span>");
}

//When the server sets or confirms a nick for this connection
function nickSet(nick) {
    console.log('now my nick is '+nick);
    $('#nick').val(nick);
}

//Other user changed names
function nickChange(nicks) {
    updateBox("<span class='status'>"+nicks.old_nick + ' is now known as '+nicks.new_nick+"</span>");
}

//Incoming private message
function privateIn(data) {
    console.log('privateIn', data);
    //TODO I'd like Private to have "static methods " to check if a window for a certain user exists
    if ( typeof private_windows[data.from] == "undefined" ) {
        //new chat, we have to create it
        new Private(data.from, data.name);
    }
    private_windows[data.from].incomingMessage(cleanText(data.message));
}

//Called when a user appears or leaves the room
function contactList(contacts) {
    console.log('contactList', contacts);
    $('#contactlist ul').html('');
    for (contact in contacts) {
        console.log( 'adding ', contact);
        $('#contactlist ul').append('<li data-id="'+contact+'"><i class="icon-user"></i><span class="name">'+contacts[contact]+'</span></li>');
    }
}

//Function that will be called when a new message arrives in the room
function updateBox (text) {
    $('#output').html($('#output').html()+"<div class='message'>"+text+"</div>");
    output = $('#output')[0];
    output.scrollTop = output.scrollHeight;
}


//Send a message to the room
function sendMessage () {
    text = $('#message').val();
    console.log('send '+text);
    chat.sendMessage(text);
    $('#message').val('');
}

//Send a private message to a specific user
function sendPrivate (to, message) {
    chat.sendPrivate(to, message);
}

function cleanText(text) {
    return $('<div/>').text(text).html();
}

var chat;
$.getJSON('ajax/rooms.json', function(data) {
    console.log(data);
    //instantiate Chat class
    chat = new Chat({
        room_name:      prompt ("Room?\n"+data.join("\n")),
        _cb_msg:        receiveMessage,
        _cb_join:       userNew,
        _cb_left:       userLeft,
        _cb_list:       contactList,
        _cb_nick:       nickSet,
        _cb_nickchange: nickChange,
        _cb_privatein:    privateIn
    });
});

//onLoad
$(function(){
    //ask for a name
    var name = null, i = 0;

    $('#bt_send').click(function(e){
        sendMessage();
    });
    //Detect keystrokes, send message on Enter
    $('#message').keydown(function(e){
        if ( e.keyCode == 13 ) {
            sendMessage();
        }
    }).focus(); //input field is focused on loading

    $('#bt_nick').click(function(){
        chat.setNick($('#nick').val());
    });

    $('#contactlist').on('dblclick', 'li', function(e){
        //TODO I'd like Private to have "static methods " to check if a window for a certain user exists
        new Private($(this).attr('data-id'), $(this).find('.name').html());
    });

});
