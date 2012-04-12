//store the private windows
var private_windows = {};

//Private chat class
var Private = function (user_id)
{
    if ( typeof private_windows[user_id] != "undefined" ) {
        return false;
    }
    this.user_id = parseInt(user_id);
    this.panel = jQuery(
    '<div class="private" data-user="'+this.user_id+'">'+
    '   <h2>Chat with <span class="username">'+user_id+'</span></h2>'+
    '   <div class="conversation"></div>'+
    '   <input type="text"></div>'+
    '</div>');
    this.panel.css("left",(private_windows.length*170)+"px");
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
