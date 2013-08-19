// Dependant on Client.js
client.unit_interface = {
	setup: function (width, height){
		this.hud.setup(width, height);
	},
	display: function (context, x_offset, y_offset, width, height){
		this.hud.display(context, x_offset, y_offset, width, height);
	},
	command: function (command){
		if(command & DM.MENU){
			if(command == DM.MENU){
				this.hud.toggle();
			}
			return;
		}
		if(this.hud.open){
			if(!(command & DM.KEY_UP)){
				this.hud.command(command);
			}
			return;
		}
		if(!(command & DM.KEY_UP)){
			client.networking.send_message({"key_down": command});
		} else{
			client.networking.send_message({"key_up": command&(~DM.KEY_UP)});
		}
	},
	status_change: function (event){
		this.hud.status_change(event);
	},
	hud: {
		open: false,
		toggle: function (open){
			client.key_capture.flush();
			if(open === undefined){
				open = !this.open;
			}
			if(open){
				if(!this.context){
					this.setup();
				}
				this.open = true;
			} else{
				this.open = false;
			}
			this.redraw();
		},
		command: function (command){
			switch(command){
				case DM.PRIMARY: {
					console.log("Primary");
				}
			}
		},
		// Draw Settings:
		display: function (context, x_offset, y_offset, width, height){
			if(this.context){
				context.drawImage(this.context.canvas, x_offset, y_offset);
			}
		},
		context: undefined,
		hp: [undefined, undefined],
		mp: [undefined, undefined],
		setup: function (width, height){
			var new_canvas = document.createElement("canvas");
			new_canvas.width = width;
			new_canvas.height = height;
			this.context = new_canvas.getContext("2d");
		},
		status_change: function (event){
			for(var key in event){
				switch(key){
					case "type": {
						break;
					}
					case "hp": {
						this.hp = event[key];
						break;
					}
					case "mp": {
						this.mp = event[key];
						break;
					}
				}
			}
			this.redraw()
		},
		redraw: function (){
			if(!this.context){ return;}
			this.context.clearRect(0,0, client.skin.canvas.width, client.skin.canvas.height);
			var resource_image = client.resource('graphic', "hud").image;
			var current = this.hp[0];
			var base = this.hp[1];
			var max = this.hp[2];
			for(var I = 1; I <= max; I++){
				var x = client.skin.screen.width - (I*8);
				var y = 0;
				if(this.open){
					y = 0;
				} else{
					y = client.skin.screen.height - 16;
				}
				var resource_offset = 0;
				if(I > current){
					resource_offset += 1;
				}
				if(I > base){
					resource_offset += 2;
				}
				this.context.drawImage(resource_image, (resource_offset)*8, 0, 8, 8, x, y, 8, 8);
			}
			current = this.mp[0];
			base = this.mp[1];
			max = this.mp[2];
			for(var I = 1; I <= max; I++){
				var x = client.skin.screen.width - (I*8);
				var y = 0;
				if(this.open){
					y = 8;
				} else{
					y = client.skin.screen.height - 8;
				}
				var resource_offset = 0;
				if(I > current){
					resource_offset += 1;
				}
				if(I > base){
					resource_offset += 2;
				}
				this.context.drawImage(resource_image, (resource_offset)*8, 8, 8, 8, x, y, 8, 8);
			}
		}
	}
}