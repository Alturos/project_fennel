module.exports = (function (){
	var DM = require('./DM.js');
	var player = {
		focused_mover: undefined,
		unit: undefined,
		attach_unit: function (unit){
			this.unit = unit;
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
			}
		},
		command: function(command){
			if(this.focused_mover){
				this.focused_mover.command(command)
			}
		},
		update_client: function (){
			var screen = this.focused_mover.screen;
			var update = {};
			if(screen){
				update.update = screen.updated;
				this.intelligence.send_message(update);
			}
		}
	}
	return player;
})();