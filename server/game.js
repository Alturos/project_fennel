module.exports = (function (){
	var DM = require('./DM.js');
	var uuuu = require('./unit.js');
	// Dependant upon DM.js
	function call_iterate(){
		game.iterate();
	};
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
			this.map.regions[new_region.id] = new_region;
		},
		state: 0,
		start: function (){
			this.state = (this.state | DM.STATE_STARTED);
			this.iterate();
		},
		add_client: function (new_client){
			new_client.game = this;
			// TODO: This is a terrible hack of a way to add traffic, but it's just for the demo.
			for(var client_index = 0; client_index <= this.players.length; client_index++){
				var indexed_player = this.players[client_index];
				if(!indexed_player){ continue}
				var indexed_client = indexed_player.intelligence;
				if(!indexed_client){ continue}
				var chat_message = {
					user: "traffic",
					body: new_client.resolve_credential(new_client.credential)+' has joined.'
				}
				indexed_client.send_message({
					chat: [chat_message]
				})
			}
			//
			if(!(this.state & DM.STATE_SETUP)){
				this.setup();
			}
			var new_player = Object.create(this.player);
			new_player.intelligence = new_client;
			this.players.add(new_player);
			var test_region = this.map.regions["Test Region"];
			var unit_config = {
				graphic: {value: 'acolyte', writable: true},
				faction: {value: 1},
				revivable: {value: true}
			};
			switch(Math.floor(Math.random()*4)){
			case 0:
			case 4:
				unit_config.graphic.value = "knight"
			break;
			case 1:
				unit_config.graphic.value = "acolyte"
			break;
			case 2:
				unit_config.graphic.value = "mage"
			break;
			case 3:
				unit_config.graphic.value = "archer"
			break;
			}
			var new_mover = this.unit.constructor.call(Object.create(this.unit, unit_config), 32, 32, test_region.find_screen(0,0));
			new_mover.hp = new_mover.max_hp();
			new_mover.mp = new_mover.max_mp()-1;
			new_mover.intelligence_add(new_player);
			new_mover.primary = Object.create(this.usable);
			new_mover.primary.effect = "asdf";
			if(!this.fist_projectile){
				this.fist_projectile = Object.create(game.projectile, {
					graphic: {value: 'fist', writable: true},
					width: {value: 8},
					height: {value: 8},
					max_range: {value: 16},
					speed: {value: 4},
					potency: {value: 1}
				});
			}
			var fist_projectile = this.fist_projectile;
			new_mover.primary["asdf"] = (function (user){
				var M = game.projectile.constructor.call(Object.create(fist_projectile), new_mover, null);
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
		}
	};
	return game;
})();