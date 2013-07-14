module.exports = (function (){
	var DM = require('./DM.js');
	var unit = require('./unit.js');
	// TODO: Refactor placement of unit behaviors.
	var item = require('./item.js');
	unit.behavior_bug = function (mover, event){
		if(mover.dead){ return;}
		switch(event.type){
		case DM.EVENT_TAKE_TURN:
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
		case DM.EVENT_STOP:
			switch(Math.floor(Math.random()*4)){
			case 0: mover.direction = DM.NORTH; break;
			case 1: mover.direction = DM.SOUTH; break;
			case 2: mover.direction = DM.EAST; break;
			case 3: mover.direction = DM.WEST; break;
			}
		break;
		case DM.DIED:
			if(Math.random() > 3/4){
				var centered_x = mover.x + Math.floor((mover.width -item.width )/2);
				var centered_y = mover.y + Math.floor((mover.height-item.height)/2);
				var I = item.constructor.call(Object.create(item), centered_x, centered_y, undefined, undefined, this.screen);
			}
		break;
		}
	}
	//
	var unit_library = {
		model_get: function (model_id){
			var identified_model = this.models[model_id];
			return identified_model;
		},
		models: {
			bug1: Object.create(unit, {
				_graphic: {value: 'bug1', writable: true},
				faction: {value: DM.F_ENEMY},
				touch_damage: {value: 1},
				base_speed: {value: 1},
				base_body: {value: 1},
				behavior_name: {value: "behavior_bug"}
			}),
			bug2: Object.create(unit, {
				_graphic: {value: 'bug2', writable: true},
				faction: {value: DM.F_ENEMY},
				touch_damage: {value: 1},
				base_speed: {value: 1},
				base_body: {value: 2},
				behavior_name: {value: "behavior_bug"}
			}),
			bug3: Object.create(unit, {
				_graphic: {value: 'bug3', writable: true},
				faction: {value: DM.F_ENEMY},
				touch_damage: {value: 2},
				base_speed: {value: 1},
				base_body: {value: 3},
				behavior_name: {value: "behavior_bug"},
			})
		}
	};
	return unit_library;
})();