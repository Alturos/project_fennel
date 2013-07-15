// Dependant on environment_variables.js
var client = {
	preload: function (configuration){
		this.resource_library.setup(function (){ client.setup(configuration)});
	},
	setup: function (configuration){
		this.skin.setup(configuration.container_id);
		this.unit_interface.setup(this.skin.canvas.width, this.skin.canvas.height);
		this.key_capture.setup(configuration);
		this.focus(this.unit_interface);
		this.networking.setup(configuration);
		this.chat.setup(configuration.container_id);
	},
	screen: undefined,
	eye: undefined,
	focus_current: undefined,
	focus: function (new_focus){
		this.key_capture.flush();
		this.focus_current = new_focus;
	},
	focused_mover_id: undefined,
	update_screen: function (data_array){
		if(!this.screen){ return}
		for(var I = 0; I < data_array.length; I++){
			var update_object = data_array[I];
			var id = update_object.id;
			var old_object = this.screen.movers[id]
			if(update_object.dispose || update_object.transition){
				if(old_object){
					delete this.screen.movers[id]
				}
			}
			else{
				if(!old_object){
					old_object = {};
					this.screen.movers[id] = old_object;
				}
				for(var key in update_object){
					if(key != "id"){
						old_object[key] = update_object[key];
					}
				}
			}
		}
	},
	transition: function (new_screen){
		var transition_direction = 0;
		if(client.screen && new_screen.region_id == client.screen.region_id){
			if(new_screen.x == client.screen.x+1){
				transition_direction |= DM.EAST;
			} else if(new_screen.x == client.screen.x-1){
				transition_direction |= DM.WEST;
			}
			if(new_screen.y == client.screen.y+1){
				transition_direction |= DM.NORTH;
			} else if(new_screen.y == client.screen.y-1){
				transition_direction |= DM.SOUTH;
			}
		}
		client.skin.screen.transition(transition_direction);
		client.screen = new_screen;
	}
};