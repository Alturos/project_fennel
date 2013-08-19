module.exports = (function (){
	var DM = require('./DM.js');
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
        model_library: require('./model_library.js'),
		unit: require('./unit.js'),
		usable: require('./usable.js'),
		projectile: require('./projectile.js'),
		maze_generator: require('./maze_generator.js'),
		dungeon: require('./dungeon.js'),
		speed: DM.GAME_SPEED,
		next_iteration: undefined,
		players: Object.create(DM.list),
		setup: function(){
			this.state = this.state | DM.STATE_SETUP;
		},
		state: 0,
		start: function (){
			this.state = (this.state | DM.STATE_STARTED);
			this.iterate();
		},
		get_player: function (credential){
			for(var player_index = 0; player_index < this.players.length; player_index++){
				var indexed_player = this.players[player_index];
				if(indexed_player.credential === credential){
					return indexed_player;
				}
			}
		},
		add_client: function (new_client){
			new_client.game = this;
			// TODO: This is a terrible hack of a way to add traffic, but it's just for the demo.
			for(var client_index = 0; client_index < this.players.length; client_index++){
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
			var new_player;
			var old_player = this.get_player(new_client.credential);
			if(old_player){
				new_player = old_player;
			} else{
				new_player = Object.create(this.player);
				new_player.credential = new_client.credential;
			}
			new_player.intelligence = new_client;
			if(!old_player){
				this.players.add(new_player);
				this.spawn_unit(new_player);
			} else{
				var new_mover = old_player.focused_mover;
				new_player.focus(new_mover);
				new_client.send_message({"screen": new_mover.screen.pack()})
			}
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
			this.map.clear_updates();
		},
		spawn_unit: function (player){
			var first_level = this.dungeon.get_level(1);
			var unit_config = {
                faction: {value: 1},
                revivable: {value: true}
			};
            var unit_id = 'adventurer';
			switch(Math.floor(Math.random()*4)){
			case 0:
			case 4:
				unit_id = "knight"
			break;
			case 1:
				unit_id = "acolyte"
			break;
			case 2:
				unit_id = "mage"
			break;
			case 3:
				unit_id = "archer"
			break;
			}
				unit_id = "lancer"
            var unit_model = this.model_library.get_model('unit', unit_id);
			var start_screen = first_level.start_screen
			var new_mover = unit_model.constructor.call(Object.create(unit_model, unit_config), 32, 32, start_screen);
			new_mover.hp = new_mover.max_hp();
			new_mover.mp = new_mover.max_mp();
			new_mover.intelligence_add(player);
			player.intelligence.send_message({"screen": first_level.start_screen.pack()})
			player.attach_unit(new_mover);
			player.focus(new_mover);
		}
	};
	return game;
})();