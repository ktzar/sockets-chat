//TODO implement parameter as mergeable options
var Chat = function(user_options) {

    var _this = this;
    //default options
    this.options = {
        nick: 'Anonymous',
        cb_rx_msg: function(){}
    };

    for (var attrname in user_options) { this.options[attrname] = user_options[attrname]; }

    console.log(this.options);
    this.socket = io.connect();
    this.socket.on('connect', function(){
        console.log('nick set to '+ _this.options.nick);
        _this.socket.emit('nick', _this.options.nick);    
    });
    this.sendMessage = function(text) {
        _this.socket.emit('msg', text); 
    };
    this.socket.on('msg', this.options.cb_rx_msg);
}


function receiveMessage(text) {
    $('#output').val($('#output').val()+"\n"+text);
    output = $('#output')[0];
    output.scrollTop = output.scrollHeight;
}
$(function(){
    console.info('loading');

    var name = null;
    while (name == null) {
        name = prompt("What's your name");
    }
    var chat = new Chat(
        {
            'nick':name,
            cb_rx_msg: receiveMessage
        }
    );
    $('#input').keydown(function(e){
        if ( e.keyCode == 13 ) {
            text = $('#input').val();
            console.info('send '+text);
            chat.sendMessage(text);
            $('#input').val('');
        }
    }).focus();
    console.info('loaded');
});
