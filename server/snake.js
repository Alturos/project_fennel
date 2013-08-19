module.exports = (function (){
	var DM = require('./DM.js');
	var unit = require('./unit.js');
	//var map = require('./map.js');
	var snake_body = Object.create(unit, {
		// redefined properties:
		movement: {value: DM.MOVEMENT_ALL, writable: true},
		// new properties:
		head: {value: undefined, writable: true},
		lead: {value: undefined, writable: true},
		follower: {value: undefined, writable: true},
		// redefined methods:
		hurt: {value: function (amount, attacker, proxy){
			if(this.head.body_invulnerable){
				//game.audio.play_sound("defend")
				return;
			}
			else{
				this.head.hurt(amount, attacker, this);
			}
		}},
		die: {value: function (){
			this.head.body.remove(this);
			this.head = undefined;
			this.lead = undefined;
			this.follower = undefined;
			if(Math.random() < DM.ITEM_DROP_PROBABILITY){
				var item_model_id = DM.pick(DM.ITEM_ARRAY);
				var model_library = require('./model_library.js');
				var item_model = model_library.get_model('item', item_model_id);
				var centered_x = this.x + Math.floor((this.width -item_model.width )/2);
				var centered_y = this.y + Math.floor((this.height-item_model.height)/2);
				var I = item_model.constructor.call(Object.create(item_model), centered_x, centered_y, undefined, undefined, this.screen);
			}
			unit.die.call(this);
		}},
		dispose: {value: function (){
			this.head = undefined;
			this.lead = undefined;
			this.follower = undefined;
			unit.dispose.call(this);
		}}
	});
	var snake = Object.create(unit, {
		//atomic = TRUE
		// redefined properties:
		// new properties:
		body: {value: undefined, writable: true},
		length: {value: 4, writable: true},
		body_width: {value: 16, writable: true},
		old_positions: {value: undefined, writable: true},
		body_health: {value: 1, writable: true},
		body_state: {value: undefined, writable: true},
		tail_state: {value: undefined, writable: true},
		body_invulnerable: {value: false, writable: true},
		// redefined methods:
		constructor: {value: function (x, y, screen){
			this.body = Object.create(DM.list);
			this.base_body = this.body_health*(this.length+1);
			this.old_positions = Object.create(DM.list);
			var lead = this;
			for(var body_index = 0; body_index < this.length; body_index++){
				var body_x = x + (this.width-this.body_width)/2;
				var body_y = y + (this.height-this.body_width)/2;
				//var bug1 = require('./model_library.js').get_model('unit','bug1');
				var body_segment = snake_body.constructor.call(Object.create(snake_body), body_x, body_y, screen);
				body_segment.width = this.body_width;
				body_segment.height = this.body_width;
				body_segment.graphic = this.graphic;
				body_segment.graphic_state = this.body_state;
				body_segment.faction = this.faction;
				body_segment.touch_damage = this.touch_damage;
				this.body.add(body_segment)
				if(lead != this){
					lead.follower = body_segment
				}
				body_segment.lead = lead;
				lead = body_segment;
				body_segment.head = this;
				if(body_index == this.length-1 && this.tail_state){
					body_segment.graphic_state = this.tail_state
				}
			}
			return unit.constructor.call(this, x, y, screen);
		}},
		take_turn: {value: function (mover, event){
			var old_coord = {x: this.x, y: this.y};
			old_coord.x += (this.width)/2;
			old_coord.y += (this.height)/2;
			this.old_positions.unshift(old_coord);
			unit.take_turn.call(this, mover, event);
			for(var body_index = 0; body_index < this.body.length; body_index++){
				var old_index = Math.floor((body_index+1) * this.body_width/this.speed());
				if(old_index < this.old_positions.length){
					var body_segment = this.body[body_index];
					if(!body_segment){ continue}
					body_segment.invulnerable_time = this.invulnerable_time;
					var new_coord = this.old_positions[old_index];
					if(body_segment.lead){
						body_segment.direction = body_segment.direction_to(body_segment.lead)
					}
					body_segment.x = new_coord.x-body_segment.width/2;
					body_segment.y = new_coord.y-body_segment.height/2;
				}
			}
			this.old_positions.length = Math.min(this.old_positions.length, Math.floor(this.body.length*this.body_width/this.speed()))
		}},
		speed: {value: function (){
			return this.base_speed;
		}},
		hurt: {value: function (amount, attacker, proxy){
			unit.hurt.call(this, amount, attacker, proxy);
			if(this.body.length){
				for(var body_index = this.body.length-1; body_index >= 0; body_index--){
					if(body_index > this.body.length){ continue}
					var body_segment = this.body[body_index]
					if(!body_segment){ continue}
					body_segment.invulnerable(this.invulnerable_time);
					if((body_index+1) * this.body_health >= this.hp){
						body_segment.die();
						if(this.tail_state && this.body.length){
							var last_segment = this.body[this.body.length]
							if(last_segment){
								last_segment.graphic_state = this.tail_state
							}
						}
					}
				}
			}
		}},
		die: {value: function (){
			var body_copy = this.body.copy();
			for(var body_index = 0; body_index < body_copy.length; body_index++){
				var indexed_segment = body_copy[body_index];
				indexed_segment.die()
			}
			unit.die.call(this);
		}},
		dispose: {value: function (){
			var body_copy = this.body.copy();
			for(var body_index = 0; body_index < body_copy.length; body_index++){
				var indexed_segment = body_copy[body_index];
				indexed_segment.dispose()
			}
			unit.dispose.call(this);
		}}
	});
	return snake;
})();