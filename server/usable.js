module.exports = (function (){
	var displayable = require('./displayable.js');
	var usable = Object.create(displayable, {
		cost: {value: 0, writable: true},
		effect: {value: undefined, writable: true},
		projectile_type: {value: undefined, writable: true},
		cast: {value: false, writable: true},
		range: {value: undefined, writable: true},
		use: {value: function (user){
			if(user.mp < this.cost){ return false;}
			//user.adjust_mp(-this.cost);
			if(this.cast){
				//user.cast_time(7)
			}
			if(this[this.effect]){
				this[this.effect](user)
			}
			return true;
		}}
	});
	return usable;
})();