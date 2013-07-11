module.exports = (function (){
	var DM = require('./DM.js');
	var commandable = require('./commandable.js');
	var map = require('./map.js');
	var id_manager = require('./id_manager.js');
	var mover = Object.create(commandable, {
		disposed: {
			value     : false,
			writable  : true
		},
		updated_public: {
			value     : false,
			writable  : true
		},
		_screen: {
			value     : undefined,
			writable  : true
		},
		screen: {
			set: function (value){
				this._screen = value;
				this.update_public({
					graphic: this._graphic
				});
			},
			get: function (){
				return this._screen;
			}
		},
		movement: {
			value: DM.MOVEMENT_ALL,
			writable : true
		},
		dense: {
			value: false,
			writable: true
		},
		faction: {
			value: DM.F_NONE,
			writable: true
		},
		intelligences: {
			value     : undefined,
			writable  : true
		},
		_direction: {
			value     : DM.SOUTH,
			writable  : true
		},
		direction: {
			set: function (value){
				this._direction = value;
				this.update_public({
					direction: this._direction
				});
			},
			get: function (){
				return this._direction;
			}
		},
		_graphic:{
			value: "test",
			writable  : true,
		},
		graphic: {
			set: function (value){
				this._graphic = value;
				this.update_public({
					graphic: this._graphic
				});
			},
			get: function (){
				return this._graphic;
			}
		},
		width: {
			value: map.tile_size,
			writable: true
		},
		height: {
			value: map.tile_size,
			writable: true
		},
		collision_check_priority: {
			value: DM.COLLISION_PRIORITY_MOVER,
			writable: true
		},
		behavior_name: {
			value: undefined,
			writable: true
		},
		handle_event: {value: function (mover, event){
			if(this.intelligences){
				var int_copy = this.intelligences.copy()
				for(var I = 0; I < int_copy.length; I++){
					var next_intelligence = int_copy[I];
					if(this.intelligences.indexOf(next_intelligence) == -1){ continue;}
					var result = next_intelligence.handle_event(mover, event);
					if(!result){
						break;
					}
				}
			} else if(this.behavior_name && this[this.behavior_name]){
				this[this.behavior_name].call(mover, event);
			}
		}},
		constructor: { value: function (x, y, width, height, screen){
			id_manager.generate_id(this);
			//this.color = "rgba("+Math.round(Math.random()*255)+","+Math.round(Math.random()*255)+","+Math.round(Math.random()*255)+", 1.0)";
			this.x = x || undefined;
			this.y = y || undefined;
			this.width  = width  || this.width;
			this.height = height || this.height;
			if(screen){
				this.screen = screen;
				screen.movers.add(this);
				/*var test_loc = this.screen.tile_at(this.x, this.y);
				if(test_loc){
					test_loc.add_mover(this);
				}*/
			}
			var update_data = {
				"graphic": this.graphic,
				"x": this.x,
				"y": this.y,
				"direction": this.direction
			}
			this.update_public(update_data)
			return this;
		}},
		dispose: { value: function(){
			this.handle_event(this, {type: DM.EVENT_DISPOSE});
			this.update_public({"dispose":true})
			// Recycle must go after update_public(), as this.id is needed in update_public().
			id_manager.recycle_id(this);
			this.disposed = true;
			if(this.screen){
				this.screen.movers.remove(this);
				this.screen = null;
			}
		}},
		update_public: { value: function (data){
			if(this.disposed){ return}
			if(!this.updated_public){
				this.updated_public = {"id": this.id/*, "graphic": this.graphic*/};
			}
			for(var key in data){
				this.updated_public[key] = data[key];
			}
			if(this.screen){
				this.screen.update(this.updated_public);
			}
			if("transition" in data){
				this.updated_public = null;
			}
		}},
		pack_public: { value: function (){
			if(this.disposed){ return false}
			var update_data = {
				"graphic": this.graphic,
				"x": this.x,
				"y": this.y,
				"direction": this.direction,
			}
			return update_data;
		}},
		take_turn: { value: function(){
			if(this.disposed){ return}
			this.handle_event(this, {type: DM.EVENT_TAKE_TURN});
		}},
		translate: { value: function(delta_x, delta_y){var success = false;
			if(this.disposed){ return}
			// Determine if movement will cause the object's edge to cross a border between turfs.
			var check_x = false;
			var check_y = false;
			var x_pole;
			var y_pole;
			if(!delta_x){ x_pole = 0}
			else if(delta_x > 0){
				x_pole = 1;
			}
			else{
				x_pole = -1;
			}
			if(!delta_y){ y_pole = 0}
			else if(delta_y > 0){
				y_pole = 1;
			}
			else{
				y_pole = -1;
			}
			if(x_pole == 1){
				if(((this.x+this.width)-1)%map.tile_size + delta_x >= map.tile_size){
					// -1 because the Nth position pixel is at index N-1.
					check_x = true;
					var limit = map.tile_size - (((this.x+this.width)-1)%map.tile_size);
					this.x += limit-1;
					delta_x -= limit-1;
				}
			}
			else if(x_pole == -1){
				if((this.x%map.tile_size) + delta_x < 0){
					check_x = true;
					this.x = this.x - (this.x%map.tile_size)
					delta_x = delta_x + this.x%map.tile_size
				}
			}
			if(y_pole == 1){
				if(((this.y+this.height)-1)%map.tile_size + delta_y >= map.tile_size){
					// -1 because the Nth position pixel is at index N-1.
					check_y = true;
					var limit = map.tile_size - (((this.y+this.height)-1)%map.tile_size);
					this.y += limit-1;
					delta_y -= limit-1;
				}
			}
			else if(y_pole == -1){
				if((this.y%map.tile_size) + delta_y < 0){
					check_y = true;
					this.y = this.y - (this.y%map.tile_size)
					delta_y = delta_y + this.y%map.tile_size
				}
			}
			// Determine size of border crossed, in tiles
				// If the object is centered in a turf and is less than or equal to game.map.tile_size, this number will be 1
				// If the object is 3x game.map.tile_size, then this number could be as much as 4.
			var side_height = Math.ceil(((this.y%map.tile_size)+this.height)/map.tile_size);
			if(check_x){
				if(x_pole == 1){
					for(var I = 0; I < side_height; I++){
						var target = this.screen.tile_at(((this.x+this.width)-1)+delta_x, this.y+(I*map.tile_size));
						//var raw_x = ((this.x+this.width)-1)+delta_x
						//var raw_y = this.y+(I*game.map.tile_size);
						//var target = this.screen.locate(Math.floor(raw_x/game.map.tile_size), Math.floor(raw_y/game.map.tile_size));
						var dense_object;
						if(target){
							dense_object = target.dense(this);
						}
						if(!target || dense_object){
							delta_x = 0;
							this.handle_event(this, {type: DM.EVENT_STOP, direction: DM.EAST});
							//Bump(dense_object)
							this.x += (map.tile_size - (((this.x+this.width)-1)%map.tile_size)) -1;
							break;
						}
					}
				}
				else if(x_pole == -1){
					for(var I = 0; I < side_height; I++){
						var target = this.screen.tile_at(this.x+delta_x, this.y+(I*map.tile_size));
						var dense_object;
						if(target){
							dense_object = target.dense(this);
						}
						if(!target || dense_object){
							delta_x = 0;
							this.handle_event(this, {type: DM.EVENT_STOP, direction: DM.WEST});
							//Bump(dense_object)
							this.x = this.x - this.x%map.tile_size;
							break;
						}
					}
				}
			}
			this.x += delta_x;
			var base_width  = Math.ceil(((this.x%map.tile_size)+this.width )/map.tile_size);
			if(check_y){
				if(y_pole == 1){
					for(var I = 0; I < base_width; I++){
						var target = this.screen.tile_at(this.x+(I*map.tile_size), ((this.y+this.height)-1)+delta_y);
						var dense_object;
						if(target){
							dense_object = target.dense(this);
						}
						if(!target || dense_object){
							delta_y = 0;
							this.handle_event(this, {type: DM.EVENT_STOP, direction: DM.SOUTH});
							//Bump(dense_object)
							this.y += (map.tile_size - (((this.y+this.height)-1)%map.tile_size)) -1;
							break;
						}
					}
				}
				else if(y_pole == -1){
					for(var I = 0; I < base_width; I++){
						var target = this.screen.tile_at(this.x+(I*map.tile_size), this.y+delta_y);
						var dense_object;
						if(target){
							dense_object = target.dense(this);
						}
						if(!target || dense_object){
							delta_y = 0;
							this.handle_event(this, {type: DM.EVENT_STOP, direction: DM.NORTH});
							//Bump(dense_object)
							this.y = this.y - this.y%map.tile_size;
							break;
						}
					}
				}	
			}
			this.y += delta_y;
			if(delta_x || delta_y){
				this.update_public({"x":this.x, "y":this.y});
			}
		}},
		move: {value: function(direction, amount){
			if(this.disposed){ return false}
			/*var delta_x = this.size*(Math.cos(bearing));
			var delta_y = this.size*(Math.sin(bearing));*/
			var delta_x = 0;
			var delta_y = 0;
			var old_dir = this.direction;
			if(direction & DM.NORTH){
				delta_y -= amount;
				this.direction = DM.NORTH;
				if(this.y == 0){
					this.handle_event(this, {type: DM.EVENT_SCREEN_CROSS, direction: DM.NORTH});
				}
			}
			if(direction & DM.SOUTH){
				delta_y += amount;
				this.direction = DM.SOUTH;
				if(this.y == this.screen.grid_height*map.tile_size - this.height){
					this.handle_event(this, {type: DM.EVENT_SCREEN_CROSS, direction: DM.SOUTH});
				}
			}
			if(direction & DM.EAST){
				delta_x += amount;
				this.direction = DM.EAST;
				if(this.x == this.screen.grid_width *map.tile_size - this.width ){
					this.handle_event(this, {type: DM.EVENT_SCREEN_CROSS, direction: DM.EAST});
				}
			}
			if(direction & DM.WEST){
				delta_x -= amount;
				this.direction = DM.WEST;
				if(this.x == 0){
					this.handle_event(this, {type: DM.EVENT_SCREEN_CROSS, direction: DM.WEST});
				}
			}
			return this.translate(delta_x, delta_y);
		}},
		collide: { value: function (mover){}},
		intelligence_add: {value: function (new_intelligence){
			if(!this.intelligences){
				this.intelligences = Object.create(DM.list);
			}
			this.intelligences.unshift(new_intelligence);
		}},
		intelligence_remove: {value: function (old_intelligence){
			if(!this.intelligences){
				return;
			}
			this.intelligences.remove(old_intelligence);
			if(!this.intelligences.length){
				this.intelligences = null;
			}
		}},
		direction_to: {value: function (mover){
			var x_separation = 0;
			var y_separation = 0;
			var saved_dir_y = DM.SOUTH;
			var saved_dir_x = DM.EAST;
			if(this.x < mover.x){
				x_separation = (mover.x - mover.height/2) - (this.x  + this.height /2);
			} else if(this.x > mover.x){
				saved_dir_x = DM.WEST;
				x_separation = (this.x  - this.height /2) - (mover.x + mover.height/2);
			}
			if(this.y < mover.y){
				y_separation = (mover.y - mover.width /2) - (this.y  + this.width  /2);
			} else if(this.y > mover.y){
				saved_dir_y = DM.NORTH;
				y_separation = (this.y  - this.width  /2) - (mover.y + mover.width /2);
			}
			if(y_separation > x_separation){
				return saved_dir_y;
			} else{
				return saved_dir_x;
			}
		}}
	});
	return mover;
})();