module.exports = (function (){
	// Not a shared object!
	var DM = require('./DM.js');
	var key_state = {
		key_state_flags: 0,
		key_press_flags: 0,
		old_keys_flags: 0,
		key_up: function (command_code, modifier){
			//console.log("Key Up  : "+command_code);
			// Called when the server recieves a key_down event.
			this.key_state_flags = this.key_state_flags & ~command_code;
			this.old_keys_flags = this.old_keys_flags & ~command_code;
			if(command_code < 16){
				var opposite = DM.flip(command_code);
				if(opposite & this.old_keys_flags){
					this.key_state_flags = this.key_state_flags | opposite;
					this.old_keys_flags = this.old_keys_flags & ~opposite;
				}
			}
		},
		key_down: function (command_code, modifier){
			//console.log("Key Down: "+command_code)
			// Called when the server recieves a key_up event.
			if(command_code < 16){
				var opposite = DM.flip(command_code);
				if(opposite & this.key_state_flags){
					this.key_state_flags = this.key_state_flags & ~opposite;
					this.old_keys_flags = this.old_keys_flags | opposite;
				}
			}
			this.key_state_flags = this.key_state_flags | command_code;
			this.key_press_flags = this.key_press_flags | command_code;
		},
		reset_keys: function (){
			// Used before giving a player control of anything.
			this.key_state_flags = 0;
			this.old_keys_flags = 0;
			this.key_press_flags = 0;
		},
		key_state: function (command_code){
			// Use this to check if a player is holding down the command_code;
			return this.key_state_flags & command_code;
		},
		key_press: function (command_code){
			// Use this to check if a player has pressed the command_code;
			return this.key_press_flags & command_code;
		},
		command_keys: function (){
			// Use this to see which keys the player has pressed or is holding.
			return this.key_press_flags | this.key_state_flags;
		},
		clear_press: function (save_buttons){
			// Use this to clear out al key presses, except those encoded in 'save_buttons';
			if(save_buttons){
				this.key_press_flags = this.key_press_flags & save_buttons;
			}
			else{
				this.key_press_flags = 0;
			}
		}
	}
	return key_state;
})();