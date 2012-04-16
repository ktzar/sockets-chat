//Chat Class
var Chat = function(user_options) {

    var that = this;

    //check for HTML5 Storage
    this.hasLocalStorage = function supports_html5_storage() {
      try {
        return 'localStorage' in window && window['localStorage'] !== null;
      } catch (e) {
        return false;
      }
    }();

    //default options
    this.options = {
        room_name : "chat"
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
    this.socket = io.connect('/'+this.options.room_name);
    this.socket.on('connect', function(){});
    this.socket.on('disconnect', function(){
        alert("Connection closed");
    });

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
        if ( this.hasLocalStorage ) {
            console.log('store nick: ', nick);
            localStorage.setItem("nick", nick);
        }
    };

    //Set the stored nick if it's been stored
    if (this.hasLocalStorage) {
        var nick = localStorage.getItem("nick");
        console.log('retrieve nick: ', nick);
        this.setNick(nick);
    }

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


