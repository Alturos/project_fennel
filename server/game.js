module.exports = (function (){
	var DM = require('./DM.js');
	return function (configuration){
		// Dependant upon DM.js
		function call_iterate(){
			game.iterate();
		};;
		var game = {
			id_manager: require('./id_manager.js'),
			client: require('./client.js'),
			map: require('./map.js'),
			player: require('./player.js'),
			commandable: require('./commandable.js'),
			mover: require('./mover.js'),
			unit: require('./unit.js'),
			usable: require('./usable.js'),
			projectile: require('./projectile.js'),
			dungeon_generator: require('./dungeon_generator.js'),
			speed: DM.GAME_SPEED,
			next_iteration: undefined,
			players: Object.create(DM.list),
			//garbage: Object.create(DM.list),
			setup: function(){
				this.state = this.state | DM.STATE_SETUP;
				// TEMP CREATE REGION
				var new_region = this.map.region.constructor.call(Object.create(this.map.region), "Test Region", 64, 64);
				var shared_tile_set = [
					this.map.tile.constructor.call(Object.create(this.map.tile), "floor", DM.MOVEMENT_FLOOR),
					this.map.tile.constructor.call(Object.create(this.map.tile), "wall", DM.MOVEMENT_WALL),
					this.map.tile.constructor.call(Object.create(this.map.tile), "pillar", DM.MOVEMENT_WALL),
					this.map.tile.constructor.call(Object.create(this.map.tile), "water", DM.MOVEMENT_WATER)
				];
				var level_maze = this.dungeon_generator.generate_maze();
				for(pos_y = 0; pos_y < level_maze.height; pos_y++){
					for(pos_x = 0; pos_x < level_maze.width; pos_x++){
						var maze_node = level_maze.node(pos_x, pos_y);
						var new_screen = this.map.screen.constructor.call(Object.create(this.map.screen), pos_x, pos_y, 1, 1);
						new_region.place_screen(new_screen);
						new_screen.tile_set = shared_tile_set;
						new_screen.setup(maze_node.tile_grid);
					}
				}
				/*var create_screen = (function (binder){
					return function (x, y, width, height){
						var new_screen = binder.screen.constructor.call(Object.create(binder.screen), x, y, width, height);
						new_region.place_screen(new_screen);
						new_screen.tile_set = shared_tile_set
						new_screen.setup();
						return new_screen
					};
				})(this.map);*/
				/*
				 * ###########
				 * #.+.#<#.+.#
				 * #+#+#+#+#+#
				 * #.+.#...#.#
				 * #.#+#+###+#
				 * #.#.#.#.+.#
				 * #+###.###.#
				 * #.+.+.#.+.#
				 * #+###.###+#
				 * #.+.#.+...#
				 * ###########
				 * 
				 */
				/*
				 *
				O+O O O+O
				+ + + + +
				O+O OoO O
				o + +   +
				O O O O+O
				+   o   o
				O+O+O O+O
				+   o   +
				O+O O+OoO
				
				*/
				
				/*create_screen(0,0,1,1)
				create_screen(1,0,1,1)
				create_screen(2,0,1,1)
				create_screen(3,0,1,1)
				create_screen(4,0,1,1)
				
				create_screen(0,1,1,2)
				create_screen(1,1,1,1)
				create_screen(2,1,2,1)
				create_screen(4,1,1,1)
				
				create_screen(1,2,1,1)
				create_screen(2,2,1,3)
				create_screen(3,2,1,1)
				create_screen(4,2,1,2)
				
				create_screen(0,3,1,1)
				create_screen(1,3,1,1)
				create_screen(3,3,1,1)
				
				create_screen(0,4,1,1)
				create_screen(1,4,1,1)
				create_screen(3,4,2,1)*/
				
				this.map.regions[new_region.id] = new_region;
				/*new_screen.tile_set[0] = Object.create(game.map.tile);
				new_screen.tile_set[0].graphic = "floor";
				new_screen.tile_set[1] = Object.create(game.map.tile);
				new_screen.tile_set[1].graphic = "wall";
				new_screen.tile_set[1].movement = DM.MOVEMENT_WALL;
				new_screen.tile_set[2] = Object.create(game.map.tile);
				new_screen.tile_set[2].graphic = "test";
				new_screen.tile_set[2].movement = DM.MOVEMENT_WALL;*/
			},
			state: 0,
			start: function (){
				this.state = (this.state | DM.STATE_STARTED);
				this.iterate();
			},
			add_client: function (new_client){
				new_client.game = this;
				if(!(this.state & DM.STATE_SETUP)){
					this.setup();
				}
				var new_player = Object.create(this.player);
				new_player.intelligence = new_client;
				this.players.add(new_player);
				var test_region = this.map.regions["Test Region"];
				var new_mover = this.unit.constructor.call(Object.create(this.unit), 1, 1, test_region.find_screen(0,0));
				new_mover.hp = new_mover.max_hp();
				new_mover.mp = new_mover.max_mp()-1;
				new_mover.intelligence_add(new_player);
				new_mover.primary = Object.create(this.usable);
				new_mover.primary.effect = "asdf";
				new_mover.primary["asdf"] = (function (user){
					var M = game.projectile.constructor.call(Object.create(game.projectile, {graphic: {value:"mage"}}), new_mover, null);
				});
				new_client.send_message({"screen": game.map.regions["Test Region"].find_screen(0,0).pack()})
				new_player.attach_unit(new_mover);
				new_player.focus(new_mover);
				if(!(this.state & DM.STATE_STARTED)){
					this.start();
				}
			},
			pause: function (){
				if(this.next_iteration){
					clearTimeout(this.next_iteration);
					this.next_iteration = undefined;
				}
			},
			iterate: function (){
				/*var max_players = game.players.length;
				for(var index = 0; index < max_players; index++){
					var next_player = game.players[index];
					next_player.take_turn();
				}*/
				this.map.iterate();
				//this.clean_up();
				this.next_iteration = setTimeout(call_iterate, this.speed);
				for(var I = 0; I < this.players.length; I++){
					var player = this.players[I];
					player.update_client();
				}
			}/*,
			clean_up: function (garbage){
				if(garbage){
					if(!this.next_iteration){
						garbage.clean_up();
					}
					else{
						this.garbage.add(garbage);
					}
				}
				else{
					while(this.garbage.length){
						var next_garbage = this.garbage[0];
						this.garbage.remove(next_garbage);
						next_garbage.clean_up();
					}
				}
			}*/
		};
		return game;
	};
})();