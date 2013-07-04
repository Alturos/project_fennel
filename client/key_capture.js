// Dependant on client.js
client.key_capture = {
	key_state: {},
	setup: function (configuration){
		// See note in skin.js about tabindex and focus.
		var container = client.skin.canvas;
		container.addEventListener('keydown', function (event){
			client.key_capture.key_press(event);
		});
		container.addEventListener('keyup', function (event){
			client.key_capture.key_up(event);
		});
	},
	key_press: function (e){
		e.preventDefault();
		var key_code;
		if(window.event){ key_code = e.keyCode} // IE 8 and earlier compatibility.
		else{
			key_code = e.which// | e.keyCode;
		}
		// Start key_down repeat work-around.
		if(this.key_state[key_code.toString()]){ return}
		this.key_state[key_code.toString()] = true;
			// End key_down repeat work-around.
		var command = client.preferences[key_code.toString()];
		if(command){
			if(client.focus_current){
				client.focus_current.command(command);
				//client.networking.send_message({"key_down": command});
			}
		}
	},
	key_up: function (e){
		e.preventDefault();
		var key_code;
		if(window.event){ key_code = e.keyCode} // IE 8 and earlier compatibility.
		else{
			key_code = e.which// | e.keyCode;
		}
		// Start key_down repeat work-around.
		delete this.key_state[key_code.toString()];
			// End key_down repeat work-around.
		var command = client.preferences[key_code.toString()];
		if(command){
			if(client.focus_current){
				client.focus_current.command((command|DM.KEY_UP));
				//client.networking.send_message({"key_up": command});
			}
		}
	},
	flush: function (){
		for(var key in this.key_state){
			var command = client.preferences[key];
			client.focus_current.command((command|DM.KEY_UP));
		}
		key_state = {};
	}
}
