module.exports = (function (){
	var DM = require('./DM.js');
	var player = {
		credential: undefined,
		focused_mover: undefined,
		unit: undefined,
		intelligence: undefined, // TODO: In need of refactoring.
		client_latency: 0,
		attach_unit: function (unit){
			this.unit = unit;
			// TODO: Reexamine this assumption.
			this.unit.revivable = true;
		},
		disconnect: function (){
			if(this.intelligence){
				this.intelligence.game.players.remove(this);
			}
			if(this.unit){
				this.unit.intelligence_remove(this);
				this.unit.dispose();
				this.unit = undefined;
			}
			if(this.focused_mover){
				this.focused_mover.intelligence_remove(this);
				this.focused_mover = undefined;
			}
			this.intelligence = undefined;
		},
		focus: function (mover){
			this.focused_mover = mover;
			this.intelligence.send_message({focused_mover: this.focused_mover.id});
			if("change_status" in this.focused_mover){
				this.focused_mover.change_status("hp", "mp");
			}
		},
		handle_event: function (mover, event){
			switch(event.type){
				case DM.EVENT_TAKE_TURN: {
					if(!this.intelligence || !this.intelligence.connected){
						if(++this.client_latency > 256){ // TODO: Magic numbers!
							this.disconnect();
						}
						return
					}
					if(this.focused_mover && this.focused_mover.disposed){
						this.focused_mover = undefined;
					}
					if(this.intelligence){
						var command_flags = this.intelligence.take_turn();
						if(command_flags){
							this.command(command_flags);
						}
					}
					break;
				}
				case DM.EVENT_STOP: { break;}
				case DM.EVENT_SCREEN_CROSS: {
					mover.screen.transition(mover, event.direction);
					break;
				}
				case DM.EVENT_SCREEN_ENTER: {
					if(this.intelligence){
						this.intelligence.send_message({"screen": mover.screen.pack()});
					}
					break;
				}
				case DM.EVENT_STATUS_CHANGE: {
					if(this.intelligence){
						this.intelligence.send_message({"event": event});
					}
					break;
				}
				case DM.EVENT_DISPOSE: {
					// TODO: Better game referencing :/
					this.intelligence.game.spawn_unit(this);
				}
			}
		},
		command: function(command){
			if(this.focused_mover){
				this.focused_mover.command(command)
			}
		},
		update_client: function (){
			if(!this.intelligence || !this.intelligence.connected){
				return;
			}
			this.client_latency = 0;
			var screen = this.focused_mover? this.focused_mover.screen : undefined;
			var update = {};
			if(screen){
				update.update = screen.updated;
				this.intelligence.send_message(update);
			}
		}
	}
	return player;
})();