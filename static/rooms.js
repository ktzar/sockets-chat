var Rooms = function(cb_loadRoom){
    var room_selector = jQuery('<div id="room_selector"><ul></ul></div>');

    //Load the rooms from the server
    $.getJSON('/ajax/rooms.json', function(rooms) {
        var room;
        //If there's only one chatroom, enter where automatically
        if ( rooms.length == 1 ) {
            cb_loadRoom(rooms[0]);
        }else{
            var room_list = room_selector.find('ul').html('');
            for ( room in rooms ) {
                room_list.append(function(_room_){
                    return $("<li>"+_room_+"</li>").click(function(){
                        $('#room_selector').fadeOut();
                        cb_loadRoom(_room_);
                    });
                }(rooms[room]));
            }
            jQuery('body').append(room_selector);
        }
    });
};
