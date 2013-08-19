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
		var screen = this.screen;
		if(!screen){ return}
		var handle_mover = function (up_obj, up_id){
			var old_object = screen.movers[up_id]
			if(up_obj.dispose || up_obj.transition){
				if(old_object){
					delete screen.movers[up_id]
				}
			}
			else{
				if(!old_object){
					old_object = {};
					screen.movers[up_id] = old_object;
				}
				for(var key in up_obj){
					if(key != "id"){
						old_object[key] = up_obj[key];
					}
				}
			}
		}
		var handle_event = function (up_obj){
			if(!screen.events){
				screen.events = Object.create(DM.list);
			}
			var event_model = client.resource('event', up_obj.event);
			if(!event_model){ return}
			var event = Object.create(event_model);
			event.setup(up_obj.data);
			screen.events.add(event);
		}
		for(var I = 0; I < data_array.length; I++){
			var update_object = data_array[I];
			if(update_object.id){
				handle_mover(update_object, update_object.id);
			} else if(update_object.event){
				handle_event(update_object);
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