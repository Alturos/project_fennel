// Dependant on environment_variables.js
var client = {
	preload: function (configuration){
		console.log('trying')
		this.resource_library.setup(function (){ client.setup(configuration)});
	},
	setup: function (configuration){
		this.skin.setup(configuration.container_id);
		this.unit_interface.setup(this.skin.canvas.width, this.skin.canvas.height);
		this.key_capture.setup();
		this.focus(this.unit_interface);
		this.networking.setup(configuration);
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
	}
};