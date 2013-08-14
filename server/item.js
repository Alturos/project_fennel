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
		age: {value: 0, writable: true},
		life_span: {value: DM.ITEM_TIME, writable: true},
		collide: { value: function (mover){
			if(mover.faction != DM.F_PLAYER){
				return;
			}
			if(this.age <= 6){ return;}
			if((typeof mover.collect_item) == 'function'){
				mover.collect_item(this);
			}
		}},
		use: { value: function (mover){
			this.dispose();
		}},
		take_turn: { value: function(){
			if(this.disposed){
				return;
			}
			this.age++;
			if(--this.life_span < 0){
				this.dispose();
			}
			return mover.take_turn.call(this);
		}}
	});
	return item;
})();