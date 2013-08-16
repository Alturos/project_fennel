// Dependant on client.js
client.skin = {
	setup: function (dom_container_id){
        var dom_container = document.getElementById(dom_container_id);
        this.canvas = document.createElement('canvas');
		// The following is a trick which makes any element focusable.
		// Canvases normally are not focusable, so they cannot capture keyboard events.
		this.canvas.setAttribute('tabindex', 1);
        this.canvas.width = SCREEN_WIDTH;
        this.canvas.height = SCREEN_HEIGHT;
        this.canvas.style.background = "black";
        this.canvas.style.width = SCREEN_WIDTH+"px";
        this.canvas.style.height = SCREEN_HEIGHT+"px";
        dom_container.appendChild(this.canvas)
		this.screen.setup(this.canvas.getContext("2d"), SCREEN_WIDTH, SCREEN_HEIGHT);
	},
	screen: {
		width: undefined,
		height: undefined,
		display_time: 0,
		display_speed: 1000/24,
		screen_background: undefined,
		transition_storage: (function (){
			var transition_canvas = document.createElement('canvas');
			return {
				canvas: undefined,
				//context: undefined,
				time_left: 0,
				full_time: 24,
				direction: undefined
			};
		})(),
		setup: function (context, width, height){
			context.imageSmoothingEnabled = false;
			context.webkitImageSmoothingEnabled = false;
			context.mozImageSmoothingEnabled = false;
			this.context = context;
			this.width = width;
			this.height = height;
			this.scrap_board = document.createElement('canvas');
			this.scrap_board.width = TILE_SIZE*4;
			this.scrap_board.height = TILE_SIZE*4;
			this.scrap_board = this.scrap_board.getContext("2d");
			// The canvas can be accessed later via scrap_board.canvas
		},
		redraw: function (){
			if(!client.screen){
				return;
			}
			this.display_time++;
			var screen = client.screen;
			var focused_mover
			var transitioning = false;
			var transition_offset_x = 0;
			var transition_offset_y = 0;
			var full_offset_x = 0;
			var full_offset_y = 0;
			if(this.transition_storage.time_left){
				transitioning = true;
				this.transition_storage.time_left--;
				ty = function (factor){
					return (Math.sin((Math.PI)*(factor-0.5))+1)/2
				}
				var transition_percent = this.transition_storage.time_left / this.transition_storage.full_time;
				var parametric_percent = ty(transition_percent);
				if(this.transition_storage.direction == DM.EAST){
					transition_offset_x =  Math.round(((screen.width -1)*TILE_SIZE) * parametric_percent);
					full_offset_x       =  Math.round( (screen.width -1)*TILE_SIZE);
				} else if(this.transition_storage.direction == DM.WEST){
					transition_offset_x = -Math.round(((screen.width -1)*TILE_SIZE) * parametric_percent);
					full_offset_x       = -Math.round( (screen.width -1)*TILE_SIZE);
				}
				if(this.transition_storage.direction == DM.NORTH){
					transition_offset_y =  Math.round(((screen.height-1)*TILE_SIZE) * parametric_percent);
					full_offset_y       =  Math.round( (screen.height-1)*TILE_SIZE);
				} else if(this.transition_storage.direction == DM.SOUTH){
					transition_offset_y = -Math.round(((screen.height-1)*TILE_SIZE) * parametric_percent);
					full_offset_y       = -Math.round( (screen.height-1)*TILE_SIZE);
				}
			}
			if(client.focused_mover_id){
				focused_mover = client.screen.movers[client.focused_mover_id]
			}
			if(focused_mover){
				client.eye = [focused_mover.x, focused_mover.y];
			}
			if(client.eye){
				var x_offset = Math.max(0, Math.min((screen.width *TILE_SIZE)-1 -this.width , client.eye[0]-Math.round(this.width /2)));
				var y_offset = Math.max(0, Math.min((screen.height*TILE_SIZE)-1 -this.height, client.eye[1]-Math.round(this.height/2)));
				this.context.setTransform(1, 0, 0, 1, -x_offset, -y_offset)
				if(!(client.screen.drawn)){
					this.context.clearRect(0,0, client.skin.canvas.width, client.skin.canvas.height);
					this.draw_screen(client.screen, x_offset, y_offset);
					client.screen.drawn = true;
				}
				/*if(-x_offset < 0){ console.log("Problem!: "+x_offset)}
				if(-y_offset < 0){ console.log("Problem!: "+y_offset)}*/
				var draw_width  = Math.min(this.width , this.screen_background.width );
				var draw_height = Math.min(this.height, this.screen_background.height);
				if(this.transition_storage.time_left){
					this.context.drawImage(
						this.transition_storage.canvas,
						x_offset,
						y_offset,
						draw_width,
						draw_height,
						-full_offset_x+transition_offset_x,
						-full_offset_y+transition_offset_y,
						draw_width,
						draw_height
					);
				};
				this.context.drawImage(
					this.screen_background,
					x_offset,
					y_offset,
					draw_width,
					draw_height,
					x_offset+transition_offset_x,
					y_offset+transition_offset_y,
					draw_width,
					draw_height
				);
				//, -x_offset, -y_offset, x_offset, y_offset, this.width, this.height)
				   //drawImage(image  , sx, sy, sWidth, this.height, dx, dy, dWidth, dHeight)
				for(var id in client.screen.movers){
					var mover = client.screen.movers[id];
					this.draw_graphic(
						mover.graphic,
						mover.graphic_state,
						mover.x+transition_offset_x,
						mover.y+transition_offset_y,
						mover.direction,
						mover.invulnerable && !transitioning
					);
				}
			}
			if(client.focus_current && client.focus_current.display){
				client.focus_current.display(this.context, x_offset, y_offset, this.width, this.height);
			}
		},
		draw_screen: function (screen){ //, x_offset, y_offset){
			/*var left_tile_pos   =          Math.floor( x_offset               /TILE_SIZE)                ;
			var top_tile_pos    =          Math.floor( y_offset               /TILE_SIZE)                ;
			var right_tile_pos  = Math.min(Math.floor((x_offset+SCREEN_WIDTH )/TILE_SIZE), screen.width );
			var bottom_tile_pos = Math.min(Math.floor((y_offset+SCREEN_HEIGHT)/TILE_SIZE), screen.height);*/
			this.screen_background = document.createElement("canvas");
			this.screen_background.width  = screen.width *TILE_SIZE;
			this.screen_background.height = screen.height*TILE_SIZE;
			var temp_context = this.screen_background.getContext("2d");
			/*for(var y = top_tile_pos; y < bottom_tile_pos; y++){
				for(var x = left_tile_pos; x < right_tile_pos; x++){*/
			for(var y = 0; y < screen.height; y++){
				for(var x = 0; x < screen.width; x++){
					var compound_index = y*screen.width + x;
					var tile_key = screen.grid[compound_index];
					var tile = screen.tile_set[tile_key];
					this.draw_tile(tile, x, y, temp_context);
				}
			}
		},
		draw_tile: function (tile, x, y, context){
			var resource = client.resource(tile.graphic);
			if(!resource){
				console.log('No such resource: '+tile.graphic)
				return;
			}
			var state_name = tile.state;
			//Canvas Draws from top to bottom. That is, the origin of the coordinate system corresponds with the top-left of the drawing plane.
			//var fixed_y =
			//context.drawImage(img,sx,sy,swidth,sheight,x,y,width,height);
			//                      s-prefix: subset of image.
			
			var state = resource.states? resource.states[state_name] : undefined;
			var sprite_x = resource.x || 0;
			var sprite_y = resource.y || 0;
			if(state){
				if(state.x){
					sprite_x += state.x * TILE_SIZE;
				}
				if(state.y){
					sprite_y += state.y * TILE_SIZe;
				}
			}
			context.drawImage(resource.image, sprite_x, sprite_y, TILE_SIZE, TILE_SIZE, x*TILE_SIZE, y*TILE_SIZE, TILE_SIZE, TILE_SIZE);
		},
		draw_graphic: function (graphic, state_name, x, y, direction, invulnerable){
			x = Math.floor(x);
			y = Math.floor(y);
			// Beware MAGIC_NUMBERS!
			var resource = client.resource(graphic);
			if(!resource){
				console.log('No such resource: '+graphic)
				return;
			}
			var state = resource.states? resource.states[state_name] : undefined;
			var offset_x = 0;
			var offset_y = 0;
			var offset_width = resource.width || TILE_SIZE;
			var offset_height = resource.height || TILE_SIZE;
			var animate_frames = resource.animate || 0;
			var offset_dirs = resource.dirs || 1;
			if(state){
				if(state.x){
					offset_x += state.x;
				}
				if(state.y){
					offset_y += state.y;
				}
				if(state.width){
					offset_width = state.width;
				}
				if(state.height){
					offset_height = state.height;
				}
				if(state.animate){
					animate_frames = state.animate;
				}
				if(state.dirs){
					offset_dirs = state.dirs;
				}
			}
			if(offset_dirs == 4){
				switch(direction){
				case undefined:
				break;
				case DM.SOUTH:
				break;
				case DM.NORTH:
					offset_x += 1;
				break;
				case DM.EAST:
					offset_x += 2;
				break;
				case DM.WEST:
					offset_x += 3;
				break;
				}
			}
			if(animate_frames){
				offset_y += Math.floor(this.display_time/this.display_speed*6)%animate_frames;
			}
			var sprite_image = resource.image;
			//var resource_offset_x = resource.x+offset_x;
			//var resource_offset_y = resource.y+offset_y;
			//var resource_width = resource.width || 16;
			//var resource_height = resource.height || 16;
			var sprite_offset_x = (resource.x || 0) + (offset_x*offset_width);
			var sprite_offset_y = (resource.y || 0) + (offset_y*offset_height);
			var sprite_width = offset_width;
			var sprite_height = offset_height;
			if(invulnerable){
				switch(Math.floor(Math.random()*3.99)){
					case 0: {this.scrap_board.fillStyle = "rgb(255,   0,   0)"; break;}
					case 1: {this.scrap_board.fillStyle = "rgb(  0,   0,   0)"; break;}
					case 2: {this.scrap_board.fillStyle = "rgb(  0,   0, 255)"; break;}
					case 3: {this.scrap_board.fillStyle = "rgb(255, 255, 255)"; break;}
				}
				this.scrap_board.globalCompositeOperation = "copy";
				this.scrap_board.fillRect(0, 0, this.scrap_board.canvas.width, this.scrap_board.canvas.height);
				this.scrap_board.globalCompositeOperation = "destination-in";
				this.scrap_board.drawImage(sprite_image, sprite_offset_x, sprite_offset_y, sprite_width, sprite_height, 0, 0, sprite_width, sprite_height);
				sprite_image = this.scrap_board.canvas;
				sprite_offset_x = 0;
				sprite_offset_y = 0;
			}
			this.context.drawImage(sprite_image, sprite_offset_x, sprite_offset_y, sprite_width, sprite_height, x, y, sprite_width, sprite_height);
		},
		transition: function (direction){
			if(!direction){
				if(this.transition_storage.time_left){
					this.transition_storage.time_left = 0;
				}
				return;
			}
			this.transition_storage.canvas = this.screen_background;
			if(!this.transition_storage.time_left && DM.flip(direction) == this.transition_storage.direction){
				this.transition_storage.time_left = this.transition_storage.full_time;
			} else{
				this.transition_storage.time_left = this.transition_storage.full_time - this.transition_storage.time_left;
			}
			this.transition_storage.direction = direction;
		}
	}
};