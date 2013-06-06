var DM = {
	// Wrapper. To be removed:
	MAGIC_NUMBER: 256,
	// Directions & key command codes:
	NORTH: 1,
	SOUTH: 2,
	EAST: 4,
	WEST: 8,
	PRIMARY: 16,
	SECONDARY: 32,
	TERTIARY: 64,
	QUATERNARY: 128,
	MENU: 256,
	KEY_UP: 512,
	flip: function flip(dir){
		switch(dir){
			case DM.NORTH: return DM.SOUTH;
			case DM.SOUTH: return DM.NORTH;
			case DM.EAST : return DM.WEST;
			case DM.WEST : return DM.EAST;
		}
		return 0;
	},
	// Game logistics & metrics:
	GAME_SPEED: 1000/25,
	STATE_SETUP: 1,
	STATE_STARTED: 2,
	// Unit categorization:
	M_HUMAN: 1,
	F_PLAYER: 1,
	// Movement logistics:
	MOVEMENT_FLOOR: 1,
	MOVEMENT_WATER: 2,
	MOVEMENT_WALL : 4,
	MOVEMENT_ALL  : 1+2+4,
	COLLISION_PRIORITY_MOVER: 0,
	COLLISION_PRIORITY_UNIT: 1,
	COLLISION_PRIORITY_PROJECTILE: 2,
	EVENT_TAKE_TURN: 1,
	EVENT_STOP: 2,
	EVENT_SCREEN_CROSS: 3,
	EVENT_STATUS_CHANGE: 4,
	// Combat metrics:
	INVULNERABLE_TIME: 12
};
DM.list = new Array();
	//Object.create(Array); <--- Cannot use this form. It inserts an undefined 1st item that cannot be removed.
DM.list.remove = function (){
	for(var i = 0; i < arguments.length; i++){
		var removal = arguments[i];
		var removal_index = this.indexOf(removal);
		if(removal_index == -1){ continue}
		this.splice(removal_index, 1);
	}
};
DM.list.add = function (){
	for(var i = 0; i < arguments.length; i++){
		var addition = arguments[i];
		this.push(addition);
	}
};
DM.list.copy = function (){
	return this.slice(0);
}