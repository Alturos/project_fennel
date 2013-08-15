module.exports = (function (){
	var DM = require('./DM.js');
	var map = {
		tile_size: 16,
		screen_width: 15,
		screen_height: 15,
		regions: {},
		load_screen: function (x, y){
			/*var new_screen = Object.create(map.screen); // TODO: Access file system, load screen.
			new_screen.setup();
			var compound_index = (y * this.width) + x;
			this.screens[compound_index] = new_screen;*/
			// Screens no longer have explicit order.
		},
		iterate: function (){
			var regions_copy = {};
			for(var region_name in this.regions){
				regions_copy[region_name] = this.regions[region_name];
			}
			for(var region_name in regions_copy){
				if(!(region_name in this.regions)){
					continue;
				}
				var region = regions_copy[region_name];
				region.iterate()
			}
		}/*,
		generate_dungeon: function (screens_width, file_name){
			var file_system = require('fs');
			var grid_text = '';
			var node_grid = [];
			node_grid.length = screens_width*screens_width;
			node_grid.access = function (x,y){
				var compound_index = x + (y*screens_width);
				indexed_node = node_grid[compound_index];
				return indexed_node;
			};
			var node = {
				x: undefined,
				y: undefined,
				screen: undefined,
			}
			file_system.writeFile(__dirname+'/map.txt', grid_text);
		}*/
	};
	map.region = {
		id: undefined,
		theme_id: undefined,
		theme: undefined,
		screen_grid: undefined,
		active_screens: undefined,
		grid_width: 16,
		grid_height: 16,
		constructor: function (id, theme_id, width, height){
			var model_library = require('./model_library.js');
			this.id = id;
			this.theme_id = theme_id;
			this.theme = model_library.get_model('theme', theme_id);
			map.regions[this.id] = this;
			this.grid_width  = width  || this.grid_width ;
			this.grid_height = height || this.grid_height;
			this.active_screens = Object.create(DM.list);
			this.screen_grid = Object.create(DM.list);
			this.screen_grid.length = this.grid_width * this.grid_height;
			return this;
		},
		find_screen: function (x, y){
			var compound_index = x + (y*this.grid_width);
			if(x >= this.grid_width || y >= this.grid_height || compound_index >= this.screen_grid.length){ return;}
			return this.screen_grid[compound_index];
		},
		place_screen: function(screen){
			screen.region_id = this.id;
			for(var pos_y = 0; pos_y < screen.screens_height; pos_y++){
				if(pos_y + screen.x >= this.grid_height){ continue;}
				for(var pos_x = 0; pos_x < screen.screens_width; pos_x++){
					if(pos_x + screen.x >= this.grid_width){ continue;}
					var compound_index = (screen.x+pos_x) + ((screen.y+pos_y)*this.grid_width);
					if(compound_index >= this.screen_grid.length){ return;}
					this.screen_grid[compound_index] = screen;
				}
			}
		},
		iterate: function (){
			var screens_copy = this.active_screens.copy();
			for(var I = 0; I < screens_copy.length; I++){
				var screen = screens_copy[I];
				if(!screen || this.screen_grid.indexOf(screen) == -1){
					continue;
				}
				if(!screen.active){
					this.active_screens.remove(screen);
					continue;
				}
				screen.iterate();
			}
		}
	}
	map.screen = {
		disposed: false,
		active: false,
		safe: false,
		peaceful_time: 0,
		tile_set: undefined,
		region_id: undefined,
		screens_width: 1,
		screens_height: 1,
		grid_width: undefined,
		grid_height: undefined,
		x: undefined,
		y: undefined,
		tile_grid: undefined,
		movers: undefined,
		updated: undefined,
		passage: undefined,
		constructor: function (x, y, width, height){
			this.x = x;
			this.y = y;
			this.movers = Object.create(DM.list);
			this.tile_grid = new Array();
			this.tile_set = Object.create(DM.list)
			this.screens_width  = width  || this.screens_width ;
			this.screens_height = height || this.screens_height;
			this.grid_width  = this.screens_width *map.screen_width ;
			this.grid_height = this.screens_height*map.screen_height;
			return this;
		},
		setup: function (tile_map){
			this.tile_grid.length = (this.screens_width*map.screen_width)*(this.screens_height*map.screen_height);
			if(!tile_map){tile_map = '';}
			for(var y = 0; y < this.grid_height; y++){
				for(var x = 0; x < this.grid_width; x++){
					var compound_index = y*this.grid_width + x;
					var tile_set_index = parseInt(tile_map.charAt(compound_index));
					this.tile_grid[compound_index] = tile_set_index;
				}
			}
		},
		dispose: function (){
			if(this.disposed){ return;}
			while(this.movers.length){
				var mover = this.movers[0];
				mover.dispose();
			}
			var parent_region = map.regions[region_id];
			if(parent_region){
				parent_region.active_screens.remove(this);
				for(var pos_y = 0; pos_y < this.screens_height; pos_y++){
					if(pos_y + this.x >= parent_region.grid_height){ continue;}
					for(var pos_x = 0; pos_x < this.screens_width; pos_x++){
						if(pos_x + this.x >= parent_region.grid_width){ continue;}
						var compound_index = (this.x+pos_x) + ((this.y+pos_y)*parent_region.grid_width);
						if(compound_index >= parent_region.screen_grid.length){ return;}
						parent_region.screen_grid[compound_index] = undefined;
					}
				}
			}
			this.movers = null;
			this.tile_grid = null;
			this.tile_set = null;
			this.disposed = true;
			this.screens_height = null;
			this.screens_width = null;
			this.grid_width = null;
			this.grid_height = null;
			tile_map = null;
		},
		pack: function (options){
			var mover_package = {};
			for(var I = 0; I < this.movers.length; I++){
				var mover = this.movers[I];
				var individual_pack = mover.pack_public();
				mover_package[mover.id] = individual_pack;
			}
			var pack = {
				"region_id": this.region_id,
				"tile_set": this.tile_set,
				"width": this.grid_width,
				"height": this.grid_height,
				"grid": this.tile_grid,
				"movers": mover_package,
				"x": this.x,
				"y": this.y
			};
			return pack;
		},
		coord_at: function (x, y){
			var x_residue = x % map.tile_size
			if(x_residue < 0){
				x_residue += map.tile_size
			}
			var y_residue = y % map.tile_size
			if(y_residue < 0){
				y_residue += map.tile_size
			}
			return {"x": (x-x_residue)/map.tile_size, "y": (y-y_residue)/map.tile_size}
		},
		tile_at: function (x, y){
			var coord = this.coord_at(x, y);
			var tile = this.locate(coord.x, coord.y);
			return tile;
		},
		locate: function (x, y){
			if(x >= this.grid_width || y >= this.grid_height){ return false}
			if(x < 0 || y < 0){ return false}
			var compound_index = (y*this.grid_width) + x
			var tile;
			if(compound_index < this.tile_grid.length){
				var tile_key = this.tile_grid[compound_index];
				if(this.tile_grid.indexOf(tile_key) >= 0){
					tile = this.tile_set[tile_key];
				}
			}
			return tile;
		},
		descend: function(mover, new_screen){
			mover.update_public({"transition": true});
			this.movers.remove(mover);
			mover.screen = new_screen;
			new_screen.add_mover(mover);
			mover.handle_event(mover, {type: DM.EVENT_SCREEN_ENTER, screen_name: new_screen.name});
			if((typeof mover.invulnerable) == 'function'){
				mover.invulnerable(DM.TRANSITION_INVULNERABILITY_TIME*2);
			}
		},
		add_mover: function (mover){
			this.movers.add(mover);
			if(!this.active && mover.faction){
				this.activate();
			}
		},
		transition: function (mover, direction){
			var new_screen = this.adjacent(direction, mover.x, mover.y)[0];
			if(!new_screen){ return;}
			mover.update_public({"transition": true});
			this.movers.remove(mover);
			mover.screen = new_screen;
			new_screen.add_mover(mover);
			if((typeof mover.invulnerable) == 'function'){
				mover.invulnerable(DM.TRANSITION_INVULNERABILITY_TIME);
			}
			switch(direction){
				case DM.NORTH: {
					mover.y = (new_screen.grid_height * map.tile_size) - mover.height;
					mover.x += (this.x - new_screen.x)*(map.screen_width*map.tile_size);
					break;
				}
				case DM.SOUTH: {
					mover.y = 0;
					mover.x += (this.x - new_screen.x)*(map.screen_width*map.tile_size);
					break;
				}
				case DM.WEST: {
					mover.x = (new_screen.grid_width  * map.tile_size) - mover.width;
					mover.y += (this.y - new_screen.y)*(map.screen_height*map.tile_size);
					break;
				}
				case DM.EAST: {
					mover.x = 0;
					mover.y += (this.y - new_screen.y)*(map.screen_height*map.tile_size);
					break;
				}
			}
			mover.handle_event(mover, {type: DM.EVENT_SCREEN_ENTER, screen_name: new_screen.name});
		},
		adjacent: function (direction, offset_x, offset_y){
			var pos_x = this.x;
			var pos_y = this.y;
			if(offset_x){
				pos_x += Math.floor((offset_x/map.tile_size)/map.screen_width );
			}
			if(offset_y){
				pos_y += Math.floor((offset_y/map.tile_size)/map.screen_height);
			}
			switch(direction){
				case DM.NORTH: {
					pos_y--;
					break;
				}
				case DM.SOUTH: {
					pos_y++;
					break;
				}
				case DM.WEST: {
					pos_x--;
					break;
				}
				case DM.EAST: {
					pos_x++;
					break;
				}
			}
			var parent_region = map.regions[this.region_id];
			var new_screen = parent_region.find_screen(pos_x, pos_y);
			/*if(!new_screen){
				var new_screen = map.screen.constructor.call(Object.create(map.screen), pos_x, pos_y, 1, 2);
				new_screen.tile_set = [
					map.tile.constructor.call(Object.create(map.tile), "floor", DM.MOVEMENT_FLOOR),
					map.tile.constructor.call(Object.create(map.tile), "wall", DM.MOVEMENT_WALL),
					map.tile.constructor.call(Object.create(map.tile), "pillar", DM.MOVEMENT_WALL),
					map.tile.constructor.call(Object.create(map.tile), "water", DM.MOVEMENT_WATER)
				];
				new_screen.setup();
				parent_region.place_screen(new_screen);
			}*/
			return [new_screen];
		},
		iterate: function (){
			if(this.disposed){ return;}
			this.updated = false;
			var hostility = false;
			var active_faction;
			var movers_copy = this.movers.copy();
			for(var I = 0; I < movers_copy.length; I++){
				var mover = movers_copy[I];
				if(!hostility){
					if(mover.faction == DM.F_PLAYER){
						hostility = true;
					} else if(!active_faction){
						active_faction = mover.faction;
					} else if(mover.faction && active_faction != mover.faction){
						hostility = true;
					}
				}
				if(this.movers.indexOf(mover) == -1){
					continue;
				}
				mover.take_turn()
			}
			if(!hostility){
				this.peaceful_time++
				if(this.peaceful_time >= DM.SCREEN_DEACTIVATION_TIME || this.boss){
					this.deactivate();
					return;
				}
			} else{
				peaceful_time = 0;
			}
			movers_copy = this.movers.copy();
			for(var I = 0; I < movers_copy.length; I++){
				var m1 = movers_copy[I];
				if(this.movers.indexOf(m1) == -1){
					continue;
				}
				for(var check_I = I+1; check_I < movers_copy.length; check_I++){
					var m2 = movers_copy[check_I];
					if(this.movers.indexOf(m2) == -1){
						continue;
					}
					// This is it! The magic expression! Oh boy oh boy oh boy!
					if(    Math.abs(m1.x+m1.width /2 - (m2.x+m2.width /2)) < (m1.width +m2.width )/2){
						if(Math.abs(m1.y+m1.height/2 - (m2.y+m2.height/2)) < (m1.height+m2.height)/2){
							if(m1.collision_check_priority == m2.collision_check_priority){
								m1.collide(m2);
								if(!m2.disposed){
									m2.collide(m1);
								}
							} else if(m1.collision_check_priority >= m2.collision_check_priority){
								m1.collide(m2);
							} else{
								m2.collide(m1)
							}
						}
					}
				}
				
			}
		},
		update: function (data){
			if(!this.updated){
				this.updated = Object.create(DM.list);
			}
			this.updated.add(data);
		},
		activate: function (){
			if(this.active == true){
				return;
			}
			this.active = true;
			var parent_region = map.regions[this.region_id];
			parent_region.active_screens.add(this);
			var old_movers = this.movers.copy();
			for(var mover_index = 0; mover_index < old_movers.length; mover_index++){
				var indexed_mover = old_movers[mover_index];
				if(typeof indexed_mover.activate === 'function'){
					indexed_mover.activate();
				}
			}
			if(!this.safe){
				this.populate(parent_region.depth, parent_region.theme);
			}
		},
		deactivate: function (){
			if(!this.active){
				return;
			}
			this.active = false;
			this.peaceful_time = 0;
			var old_movers = this.movers.copy();
			for(var mover_index = 0; mover_index < old_movers.length; mover_index++){
				var indexed_mover = old_movers[mover_index];
				if(indexed_mover.persistent){
					if(typeof indexed_mover.deactivate === 'function'){
						indexed_mover.deactivate();
					}
					continue;
				}
				indexed_mover.dispose();
			}
			var parent_region = map.regions[this.region_id];
			parent_region.active_screens.remove(this);
		},
		populate: function (depth, theme){
			var model_library = require('./model_library.js');
			var parent_region = map.regions[this.region_id];
			var parent_theme = parent_region.theme;
			var infantry_models = parent_theme.infantry[Math.min(depth, parent_theme.infantry.length)-1];
			var cavalry_models  = parent_theme.cavalry[ Math.min(depth, parent_theme.cavalry.length )-1];
			var officer_models  = parent_theme.officer[ Math.min(depth, parent_theme.officer.length )-1];
			var boss_models  = parent_theme.boss[ Math.min(depth, parent_theme.boss.length )-1];
			var infantry_model_id = infantry_models;
			var cavalry_model_id = cavalry_models;
			var officer_model_id = officer_models;
			var boss_model_id = boss_models;
			var infantry_model;
			var cavalry_model;
			var officer_model;
			var boss_model;
			if(typeof infantry_models !== 'string'){
				infantry_model_id = DM.pick(infantry_models);//infantry_models[Math.floor(Math.random()*infantry_models.length)];
			}
			if(typeof cavalry_models !== 'string'){
				cavalry_model_id  = DM.pick(cavalry_models);//cavalry_models[Math.floor(Math.random()*cavalry_models.length)];
			}
			if(typeof officer_models !== 'string'){
				officer_model_id  = DM.pick(officer_models);//officer_models[Math.floor(Math.random()*officer_models.length)];
			}
			if(typeof boss_models !== 'string'){
				console.log(boss_models)
				boss_model_id     = DM.pick(boss_models);
			}
			infantry_model = model_library.get_model('unit', infantry_model_id);
			cavalry_model  = model_library.get_model('unit', cavalry_model_id );
			officer_model  = model_library.get_model('unit', officer_model_id );
			boss_model     = model_library.get_model('unit', boss_model_id    );
			if(this.boss){
				officer_model = boss_model;
			}
			var tile_count = this.grid_height*this.grid_width;
			var infantry_amount = 5;
			var cavalry_amount = 2;
			var officer_amount = 1;
			for(var infantry_count = 0; infantry_count < infantry_amount; infantry_count){
				var test_x = Math.floor(Math.random()*this.grid_width );
				var test_y = Math.floor(Math.random()*this.grid_height);
				var test_tile = this.locate(test_x, test_y);
				if(test_tile.movement&DM.MOVEMENT_FLOOR){
					infantry_model.constructor.call(Object.create(infantry_model), test_x*16, test_y*16, this);
					infantry_count++;
				}
			}
			for(var cavalry_count = 0; cavalry_count < cavalry_amount; cavalry_count){
				var test_x = Math.floor(Math.random()*this.grid_width );
				var test_y = Math.floor(Math.random()*this.grid_height);
				var test_tile = this.locate(test_x, test_y);
				if(test_tile.movement&DM.MOVEMENT_FLOOR){
					cavalry_model.constructor.call(Object.create(cavalry_model), test_x*16, test_y*16, this);
					cavalry_count++;
				}
			}
			for(var officer_count = 0; officer_count < officer_amount; officer_count){
				var test_x = Math.floor(Math.random()*this.grid_width );
				var test_y = Math.floor(Math.random()*this.grid_height);
				var test_tile = this.locate(test_x, test_y);
				if(test_tile.movement&DM.MOVEMENT_FLOOR){
					var created_unit = officer_model.constructor.call(Object.create(officer_model), test_x*16, test_y*16, this);
					officer_count++;
					if(this.boss){
						created_unit.boss = true;
					}
				}
			}
			/*for(var y = 0; y < this.grid_height; y++){
				for(var x = 0; x < this.grid_width; x++){
					var test_tile = this.locate(x, y);
					if((test_tile.movement&DM.MOVEMENT_FLOOR) && Math.random()*tile_count > tile_count - 5 && x!=0 && y!=0){
						var M = unit_model.constructor.call(Object.create(unit_model), x*16, y*16, this);
					}
				}
			}*/
		}
	};
	map.tile = {
		graphic: undefined,
		state: undefined,
		movement: DM.MOVEMENT_ALL,
		constructor: function (graphic, state, movement){
			this.graphic = graphic || this.graphic;
			this.state = state || this.state;
			this.movement = movement || this.movement;
			return this;
		},
		dense: function (test_object){
			if(!(this.movement & test_object.movement)){
				return this
			}
			return false;
		}
	};
	map.temp_save = {
		name: "Test Map",
		regions: {
			id: "Overworld",
			grid_width: 16,
			grid_height: 16,
			screens: [
				// Does not exist in final Structure,
				// Exists as "active_screens" and "screen_grid"
				{}
			]
		}
	};
	return map;
})();