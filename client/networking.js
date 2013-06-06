// Dependant on client.js
client.networking = {
	socket: undefined,
	setup: function (configuration){
		this.socket = io.connect(configuration.address);
		this.socket.on('connect', function (msg) { // Note: msg, supplied by socket.io, seems to be empty.
			this.on('connection', function (conf_msg){
				client.networking.connection(conf_msg);
			});
			this.on('update', function(message){
				client.networking.recieve_message(message);
			})
		});
	},
	connection: function (configuration){
		// TODO: accept 'news' and other connection data from server.
		// Or just remove this step.
	},
	send_message: function (message_object){
		this.socket.emit('client_message', message_object);
	},
	recieve_message: function (data){
		var redraw = false;
		for(var key in data){
			switch(key){
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
					console.log("Recieved")
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
