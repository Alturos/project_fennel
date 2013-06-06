module.exports = (function (){
	// Not a shared object!
	var client = {
		key_state: undefined,
		setup: function (socket){
			this.key_state = Object.create(require('./key_state.js'));
			this.socket = socket;
			var new_client = this;
			socket.on('client_message', function (control_message) {
				new_client.recieve_message(control_message);
			});
			var connection_configuration = {
			};
			socket.emit('connection', connection_configuration);
		},
		take_turn: function (){
			var command_flags = this.key_state.command_keys();
			this.key_state.clear_press();
			return command_flags;
		},
		recieve_message: function (data){
			for(var data_key in data){
				switch(data_key){
				case "key_down":
					this.key_state.key_down(data[data_key]);
				break;
				case "key_up":
					this.key_state.key_up(data[data_key]);
				break;
				}
			}
		},
		send_message: function (data){
			this.socket.emit('update', data)
			//client.networking.recieve_message(data);
		}
	}
	return client;
})();