// Dependant on client.js
client.networking = {
	socket: undefined,
	setup: function (configuration){
		this.socket = io.connect(configuration.address);
		this.socket.on('connect', function (msg) { // Note: msg, supplied by socket.io, seems to be empty.
			this.emit('setup', {
				insecure_email: configuration.email
			});
			this.on('update', function (message){
				client.networking.recieve_message(message);
			});
		});
	},
	/*connection: function (configuration){
		// TODO: accept 'news' and other connection data from server.
		// Or just remove this step.
	},*/
	send_message: function (message_object){
		this.socket.emit('client_message', message_object);
	},
	recieve_message: function (data){
		var redraw = false;
		for(var key in data){
			switch(key){
				case "chat": {
					client.chat.receive_data(data[key]);
					break;
				}
				case "redraw": {
					redraw = true;
					break;
				}
				case "screen": {
					client.screen = data[key];
					redraw = true;
					break;
				}
				case "focused_mover": {
					client.focused_mover_id = data[key];
					redraw = true;
					break;
				}
				case "update": {
					var update = data[key];
					if(update){
						client.update_screen(update);
					}
					redraw = true;
					break;
				}
				case "event": {
					var event = data[key];
					switch(event.type){
						case DM.EVENT_STATUS_CHANGE: {
							client.unit_interface.status_change(event);
							break;
						}
					}
				}
			}
		}
		if(redraw){
			client.skin.screen.redraw();
		}
	}
};
