//store the private windows
var private_windows = {};

//Private chat class
var Private = function (user_id, nick)
{
    if ( typeof private_windows[user_id] != "undefined" ) {
        return false;
    }
    var that = this;
    this.user_id = user_id;
    this.nick = nick;


    private_windows[user_id] = this;


    this.panel.find('h2').on('click', 'i', function(){
        var action = ($(this).attr('data-action'));
        switch(action) {
            case 'close':
                that.close();
                break;
            case 'restore':
                that.restore();
                break;
            case 'minimise':
                that.minimise();
                break;
            default:
                console.log('Action not handled');
                // code
        }
    });
    this.panel.on('keydown', 'input', function(e){
        if (e.keyCode == 13) {
            console.log('Message for '+that.user_id);
            console.log(e.keyCode);
            //call the callback with what's inside the input and clear it
            var text = that.panel.find('input').val();
            sendPrivate(that.user_id, text);
            that.updateBox("<span class='nick'>You: </span><span class='text'>"+cleanText(text)+"</span>");
            //clean panel
            that.panel.find('input').val('');
        }
    });
    $('body').append(this.panel);

    //Set focus in the textfield
    this.panel.find('input').focus();

    //align all the existing windows
    var i = 0;
    var width = this.panel.width();
    var margin = 10;
    for ( a_window in private_windows ) {
        private_windows[a_window].panel.css("left",(i*(width+margin))+"px");
        i++;
    }
    return true;
}

/* Not in the prototype */
Private.getPrivate = function (from) {
    if ( typeof private_windows[from] === "undefined" ) {
        return false;
    }
    return private_windows[from];
}

//Reduce window's height
Private.prototype.minimise = function(){
    this.panel.addClass('minimised');
}

//Restore window's height
Private.prototype.restore = function(){
    this.panel.removeClass('minimised');
}

//Incoming message
Private.prototype.incomingMessage = function(text) {
    console.log(text);
    this.updateBox("<span class='nick'>"+this.nick+": </span><span class='text'>"+text+"</span>");
            
}

//Close the window and remove references in the DOM
Private.prototype.close = function(){
    delete private_windows[this.user_id];
    this.panel.remove();
}

Private.prototype.updateBox = function(text) {
    console.log('updateBox', text);
    var conversation = this.panel.find('.conversation');
    conversation.html(conversation.html()+"<br/>"+text);
    conversation[0].scrollTop = conversation[0].scrollHeight;
};

//html template for the private chat window
Private.prototype.panel = jQuery(
'<div class="private" data-user="'+this.user_id+'">'+
'   <h2>Chat with <span class="username">'+this.nick+'</span>'+
'       <i data-action="close" class="icon-remove">&nbsp;</i>'+
'       <i data-action="minimise" class="icon-chevron-down">&nbsp;</i>'+
'       <i data-action="restore" class="icon-chevron-up">&nbsp;</i>'+
'   </h2>'+
'   <div class="conversation"></div>'+
'   <input type="text"></div>'+
'</div>');
