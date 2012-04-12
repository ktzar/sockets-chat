//store the private windows
var private_windows = {};

//Private chat class
var Private = function (user_id, name)
{
    if ( typeof private_windows[user_id] != "undefined" ) {
        return false;
    }
    var that = this;
    this.user_id = parseInt(user_id);

    //functions
    this.msg_received = function(message){
        var conversation = this.panel.find('.conversation');
        conversation.html(conversation.html() + "<br/>" + message);
    };


    this.panel = jQuery(
    '<div class="private" data-user="'+this.user_id+'">'+
    '   <h2>Chat with <span class="username">'+name+'</span>'+
    '       <i class="icon-chevron-down"></i>'+
    '       <i class="icon-chevron-up"></i>'+
    '</h2>'+
    '   <div class="conversation"></div>'+
    '   <input type="text"></div>'+
    '</div>');
    this.panel.css("left",(private_windows.length*170)+"px");

    this.panel.on('keydown', 'input', function(e){
        if (e.keyCode == 13) {
            console.log('Message for '+that.user_id);
            console.log(e.keyCode);
            //call the callback with what's inside the input and clear it
            sendPrivate(that.user_id, that.panel.find('input').val());
            that.panel.find('input').val('');
        }
    });
    $('body').append(this.panel);

    private_windows[user_id] = this;
    //align all the existing windows
    var i = 0;
    for ( a_window in private_windows ) {
        private_windows[a_window].panel.css("left",(i*170)+"px");
        i++;
    }
    return true;
}
