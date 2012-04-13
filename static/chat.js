//Chat Class
var Chat = function(user_options) {

    var that = this;

    //default options
    this.options = {
    };

    var callbacks = ['msg', 'join', 'left', 'list', 'nick', 'nickchange', 'privatein'];
    for (var i in callbacks) {
        this.options['_cb_'+callbacks[i]] = function(){};
    }

    //merge options
    for (var attrname in user_options) { 
        this.options[attrname] = user_options[attrname]; 
    }

    //Set the nickname as soon as the connection is ready
    this.socket = io.connect();
    this.socket.on('connect', function(){});

    //message sending function
    this.sendMessage = function(text) {
        that.socket.emit('msg', text); 
    };

    //private message sending function
    this.sendPrivate = function(to, message) {
        that.socket.emit('private', {to:to, message:message}); 
    };

    //change nick 
    this.setNick = function(nick) {
        that.socket.emit('nick', nick); 
    };

    //configure callback
    for (i=0;i<callbacks.length;i++) {
        var callback = callbacks[i];
        if ( typeof this.options["_cb_"+callback] == "function" ) {
            var _callback = this.options["_cb_"+callback];
            this.socket.on(callback,   _callback);
            this.socket.on(
                callback,
                function(name){
                    return function(){
                        console.log('received '+name);   
                    };
                }(callback)
            );
        }
    }
}


