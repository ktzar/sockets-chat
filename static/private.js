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

    //Reduce window's height
    this.minimise = function(){
        this.panel.addClass('minimised');
    }

    //Restore window's height
    this.restore = function(){
        this.panel.removeClass('minimised');
    }

    //Close the window and remove references in the DOM
    this.close = function(){
        delete private_windows[this.user_id];
        this.panel.remove();
    }

    //html template for the private chat window
    this.panel = jQuery(
    '<div class="private" data-user="'+this.user_id+'">'+
    '   <h2>Chat with <span class="username">'+name+'</span>'+
    '       <i data-action="close" class="icon-remove">&nbsp;</i>'+
    '       <i data-action="minimise" class="icon-chevron-down">&nbsp;</i>'+
    '       <i data-action="restore" class="icon-chevron-up">&nbsp;</i>'+
    '</h2>'+
    '   <div class="conversation"></div>'+
    '   <input type="text"></div>'+
    '</div>');

    private_windows[user_id] = this;

    //align all the existing windows
    var i = 0;
    var width = this.panel.width();
    var margin = 10;
    for ( a_window in private_windows ) {
        private_windows[a_window].panel.css("left",(i*(width+margin))+"px");
        i++;
    }

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
            sendPrivate(that.user_id, that.panel.find('input').val());
            that.panel.find('input').val('');
        }
    });
    $('body').append(this.panel);

    return true;
}
