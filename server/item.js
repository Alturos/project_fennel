module.exports = (function (){
	var DM = require('./DM.js');
	var mover = require('./mover.js');
	var unit = require('./unit.js');
	var item = Object.create(mover, {
		width: {value: 8},
		height: {value: 8},
		_graphic: {value: 'items'},
		_graphic_state: {value: 'cherry', writable: true},
		collision_check_priority: {value: DM.COLLISION_PRIORITY_GROUND},
		life_span: {value: DM.ITEM_TIME, writable: true},
		collide: { value: function (mover){
			if(mover.faction != DM.F_PLAYER){
				return;
			}
			this.activate(mover);
		}},
		activate: { value: function (mover){
			if(mover.adjust_hp && (typeof mover.adjust_hp) == 'function'){
				var healed = mover.adjust_hp(1);
				if(healed){
					this.dispose();
				}
			}
		}},
		take_turn: { value: function(){
			if(this.disposed){
				return;
			}
			if(--this.life_span < 0){
				this.dispose();
			}
			return mover.take_turn.call(this);
		}}
	});
	return item;
})();