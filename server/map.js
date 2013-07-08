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
		screen_grid: undefined,
		active_screens: undefined,
		grid_width: 16,
		grid_height: 16,
		constructor: function (id, width, height){
			this.id = id;
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
			this.active_screens.add(screen);
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
				screen.iterate();
			}
		}
	}
	map.screen = {
		disposed: false,
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
			var unit = require('./unit.js'); // This here to prevent circular reference before either map or unit are finished.
			for(var y = 0; y < this.grid_height; y++){
				for(var x = 0; x < this.grid_width; x++){
					var compound_index = y*this.grid_width + x;
					var tile_set_index = parseInt(tile_map.charAt(compound_index));
					this.tile_grid[compound_index] = tile_set_index;
					// TODO: replace this monster placement.
					var tile_count = this.grid_height*this.grid_width
					if(tile_set_index == 0 && Math.random()*tile_count > tile_count - 5 && x!=0 && y!=0){
						var monster_config = {
							graphic: {value: 'bug1', writable: true},
							faction: {value: DM.F_ENEMY},
							touch_damage: {value: 1},
							base_speed: {value: 1},
							base_body: {value: 1}
						}
						var M = unit.constructor.call(Object.create(unit, monster_config), x*16, y*16, this);
						M.intelligence_add({
							handle_event: function (mover, event){
								if(mover.dead){ return;}
								switch(event.type){
									case DM.EVENT_TAKE_TURN: {
										var new_dir = mover.direction;
										if(Math.random()*16 < 1){
											switch(Math.floor(Math.random()*10)){
												case 0: new_dir = DM.NORTH; break;
												case 1: new_dir = DM.SOUTH; break;
												case 2: new_dir = DM.EAST; break;
												case 3: new_dir = DM.WEST; break;
											}
										}
										mover.move(new_dir, mover.speed())
										break;
									}
									case DM.EVENT_STOP: {
										switch(Math.floor(Math.random()*4)){
											case 0: mover.direction = DM.NORTH; break;
											case 1: mover.direction = DM.SOUTH; break;
											case 2: mover.direction = DM.EAST; break;
											case 3: mover.direction = DM.WEST; break;
										}
										mover.update_public({"direction": mover.direction})
										break;
									}
								}
							}
						});
					}
					//
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
				"tile_set": this.tile_set,
				"width": this.grid_width,
				"height": this.grid_height,
				"grid": this.tile_grid,
				"movers": mover_package
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
			new_screen.movers.add(mover);
			mover.handle_event(mover, {type: DM.EVENT_SCREEN_ENTER, screen_name: new_screen.name});
		},
		transition: function (mover, direction){
			var new_screen = this.adjacent(direction, mover.x, mover.y)[0];
			if(!new_screen){ return;}
			mover.update_public({"transition": true});
			this.movers.remove(mover);
			mover.screen = new_screen;
			new_screen.movers.add(mover);
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
			var movers_copy = this.movers.copy();
			for(var I = 0; I < movers_copy.length; I++){
				var mover = movers_copy[I];
				if(this.movers.indexOf(mover) == -1){
					continue;
				}
				mover.take_turn()
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
		/*
		iterate: function (_wave){
			// TODO:: Unload screen if there are no players present.
			for(var/game/hero/hero in game.heros){
				hero.take_turn()
				if(!hero){ continue}
				for(var/game/map/mover/projectile/P in hero.projectiles){
					P.take_turn()
					for(var/game/enemy/enemy in orange(COLLISION_RANGE, P)){
						if(enemy.invincible){ continue}
						if(!P){ break}
						if(!P.collision_check(enemy)){ continue}
						P.impact(enemy)
						}
					}
				if(hero.invulnerable){ continue}
				for(var/game/hero/other_hero in orange(COLLISION_RANGE, hero)){
					if(other_hero.invulnerable){ continue}
					var/_collision = FALSE
					if(    abs((hero.c.x+(hero.width /2)) - (other_hero.c.x+(other_hero.width /2))) < ((hero.width +other_hero.width )/2)-8){
						if(abs((hero.c.y+(hero.height/2)) - (other_hero.c.y+(other_hero.height/2))) < ((hero.height+other_hero.height)/2)-8){
							_collision = TRUE
							}
						}
					if(!_collision){ continue}
					var/delta_x = (other_hero.c.x+(other_hero.width /2)) - (hero.c.x+(hero.width /2))
					var/delta_y = (other_hero.c.y+(other_hero.height/2)) - (hero.c.y+(hero.height/2))
					var/over_x  = ((hero.width +other_hero.width )/2 - abs(delta_x)) * -sign(delta_x)
					var/over_y  = ((hero.height+other_hero.height)/2 - abs(delta_y)) * -sign(delta_y)
					hero.translate(        ceil(sign(over_x/2)),  round(sign(over_y/2)))
					other_hero.translate(-round(sign(over_x/2)),  -ceil(sign(over_y/2)))
					}
				}
			if(!(locate(/game/enemy) in enemies)){
				win()
				}
			else{
				for(var/game/enemy/enemy in enemies){
					enemy.take_turn()
					if(!enemy){ continue}
					for(var/game/map/mover/projectile/P in enemy.projectiles){
						P.take_turn()
						for(var/game/hero/hero in orange(COLLISION_RANGE, P)){
							if(hero.invincible){ continue}
							if(!P){ break}
							if(!P.collision_check(hero)){ continue}
							P.impact(hero)
							}
						}
					}
				for(var/game/enemy/enemy in enemies){
					if(!enemy.touch_damage){ continue}
					for(var/game/hero/hero in range(COLLISION_RANGE, enemy)){
						if(enemy.collision_check(hero)){
							if(hero.reverseDamage>0) { hero.attack(enemy, hero.reverseDamage)}
							else { enemy.attack(hero, enemy.touch_damage) }
							}
						}
					}
				}
			for(var/game/item/item in items){
				item.take_turn()
				for(var/game/hero/hero in range(COLLISION_RANGE, item)){
					if(item && item.collision_check(hero)){
						item.activate(hero)
						}
					}
				if(item && !item.no_collect){
					for(var/game/hero/projectile/P in range(COLLISION_RANGE, item)){
						if(!item){ break}
						if(!P.owner){ continue}
						if(P && item.collision_check(P)){
							item.activate(P.owner, P)
							break
							}
						}
					}
				if(item){
					item.redraw()
					}
				}
			for(var/game/map/mover/combatant/M in game.heros + enemies){
				M.redraw()
				for(var/game/map/mover/projectile/P in M.projectiles){
					P.redraw()
					}
				}
			spawn(game.speed){
				if(wave == _wave){
					iterate(_wave)
					}
				}
			}*/
		},
		update: function (data){
			if(!this.updated){
				this.updated = Object.create(DM.list);
			}
			this.updated.add(data);
		}
	};
	map.tile = {
		graphic: undefined,
		movement: DM.MOVEMENT_ALL,
		constructor: function (graphic, movement){
			this.graphic = graphic || this.graphic;
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