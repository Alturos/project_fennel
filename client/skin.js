// Dependant on client.js
client.skin = {
	setup: function (dom_container_id){
        var dom_container = document.getElementById(dom_container_id);
        dom_container.style.background = "black";
        dom_container.style.width = "100px";
        dom_container.style.height= "100px";
        this.canvas = document.createElement('canvas');
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
			this.display_time++;
			var screen = client.screen;
			var focused_mover
			if(client.focused_mover_id){
				focused_mover = client.screen.movers[client.focused_mover_id]
			}
			if(focused_mover){
				client.eye = [focused_mover.x, focused_mover.y];
			}
			if(client.eye){
				var x_offset = Math.max(0, Math.min((screen.width *TILE_SIZE)-1 -this.width , client.eye[0]-Math.round(this.width /2)))
				var y_offset = Math.max(0, Math.min((screen.height*TILE_SIZE)-1 -this.height, client.eye[1]-Math.round(this.height/2)))
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
				this.context.drawImage(this.screen_background, x_offset, y_offset, draw_width, draw_height, x_offset, y_offset, draw_width, draw_height)//, -x_offset, -y_offset, x_offset, y_offset, this.width, this.height)
				   //drawImage(image  , sx, sy, sWidth, this.height, dx, dy, dWidth, dHeight)
				//putImageData(imgData,  x,  y, dirtyX,dirtyY,dirtyWidth,dirtyHeight);
				for(var id in client.screen.movers){
					var mover = client.screen.movers[id];
					this.draw_graphic(mover.graphic, mover.x, mover.y, mover.direction, mover.invulnerable);
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
			//Canvas Draws from top to bottom. That is, the origin of the coordinate system corresponds with the top-left of the drawing plane.
			//var fixed_y =
			//context.drawImage(img,sx,sy,swidth,sheight,x,y,width,height);
			//                      s-prefix: subset of image.
			context.drawImage(resource.image, resource.x*16, resource.y*16, 16, 16, x*TILE_SIZE, y*TILE_SIZE, TILE_SIZE, TILE_SIZE);
			//context.drawImage(graphic, x*TILE_SIZE, this.y(y*TILE_SIZE)-TILE_SIZE, TILE_SIZE, TILE_SIZE);
		},
		draw_graphic: function (graphic, x, y, direction, invulnerable){
			// Beware MAGIC_NUMBERS!
			var resource = client.resource(graphic);
			var offset_x = 0;
			var offset_y = 0;
			if(resource.dirs == 4){
				switch(direction){
				case undefined:
				break;
				case DM.SOUTH:
				break;
				case DM.NORTH:
					offset_x = 1;
				break;
				case DM.EAST:
					offset_x = 2;
				break;
				case DM.WEST:
					offset_x = 3;
				break;
				}
			}
			if(!resource){
				console.log('No such resource: '+graphic)
			}
			if(resource.animate){
				offset_y = Math.floor(this.display_time/this.display_speed*6)%resource.animate;
			}
			var resource_image = resource.image;
			var resource_offset_x = resource.x+offset_x;
			var resource_offset_y = resource.y+offset_y;
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
				this.scrap_board.drawImage(resource_image, (resource_offset_x)*16, (resource_offset_y)*16, 16, 16, 0, 0, 16, 16);
				resource_image = this.scrap_board.canvas;
				resource_offset_x = 0;
				resource_offset_y = 0;
			}
			this.context.drawImage(resource_image, (resource_offset_x)*16, (resource_offset_y)*16, 16, 16, x, y, 16, 16);
		}
	}
};