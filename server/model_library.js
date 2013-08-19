module.exports = (function (){
	var DM = require('./DM.js');
	var unit = require('./unit.js');
	var projectile = require('./projectile.js');
	var item = require('./item.js');
    var usable = require('./usable.js');
	// TODO: Refactor placement of unit behaviors.
	unit.behavior_normal = function (mover, event){
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
			} else if(this.shoot_frequency && this.projectile_type){
				if(Math.random()*this.shoot_frequency > this.shoot_frequency-1){
					this.shoot();
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
		case DM.EVENT_DIED:
			if(Math.random() < DM.ITEM_DROP_PROBABILITY){
				var item_model_id = DM.pick(DM.ITEM_ARRAY);
				var item_model = model_library.get_model('item', item_model_id);
				var centered_x = mover.x + Math.floor((mover.width -item_model.width )/2);
				var centered_y = mover.y + Math.floor((mover.height-item_model.height)/2);
				var I = item_model.constructor.call(Object.create(item_model), centered_x, centered_y, undefined, undefined, this.screen);
			}
		break;
		}
	};
	unit.behavior_pause = function (mover, event){
		if(mover.dead){ return;}
		switch(event.type){
		case DM.EVENT_TAKE_TURN:
			if(this.storage_pausing){
				this.storage_pausing--;
				return;
			} else if(Math.random()*128 > 127){
				this.storage_pausing = DM.INVULNERABLE_TIME*3;
			}
		break;
		}
		this.behavior_normal(mover, event);
	};
    var player_unit = Object.create(unit, {
		projectile_type: {value: 'fist', writable: true}
    });
	unit.skill_id_primary = 'melee';
	//
	var model_library = {
		get_model: function (category, model_id){
			if(this[category]){
				return this[category][model_id];
			}
		},
		item: {
			cherry: Object.create(item, {
				_graphic_state: {value: 'cherry'},
				potency: {value: 1},
				use: {value: function (mover){
					var healed = mover.adjust_hp(this.potency);
					if(healed){
						mover.screen.add_event('heal_sparkle', {x: mover.x+mover.width/2, y: mover.y+mover.height/2});
						this.dispose();
					}
				}}
			}),
			plum: Object.create(item, {
				_graphic_state: {value: 'plum'},
				potency: {value: 5},
				use: {value: function (mover){
					var healed = mover.adjust_hp(this.potency);
					if(healed){
						mover.screen.add_event('heal_sparkle', {x: mover.x+mover.width/2, y: mover.y+mover.height/2});
						this.dispose();
					}
				}}
			}),
			bottle: Object.create(item, {
				_graphic_state: {value: 'bottle'},
				use: {value: function (mover){
					if(!(typeof mover.adjust_mp === 'function') || !(typeof mover.max_mp === 'function')){
						return;
					}
					var healed = mover.adjust_mp(mover.max_mp());
					if(healed){
						mover.screen.add_event('aura_sparkle', {x: mover.x+mover.width/2, y: mover.y+mover.height/2});
						this.dispose();
					}
				}}
			}),
			shield: Object.create(item, {
				_graphic_state: {value: 'shield'},
				potency: {value: DM.INVULNERABLE_TIME_SHIELD},
				use: {value: function (mover){
					if(!(typeof mover.invulnerable === 'function')){ return;}
					mover.invulnerable(this.potency);
					this.dispose();
				}}
			}),
			coin_silver: Object.create(item, {
				_graphic_state: {value: 'coin_silver'},
				potency: {value: 1},
				use: {value: function (mover){
					this.dispose();
				}}
			}),
			coin_gold: Object.create(item, {
				_graphic_state: {value: 'coin_gold'},
				potency: {value: 2},
				use: {value: function (mover){
					this.dispose();
				}}
			}),
			coin_diamond: Object.create(item, {
				_graphic_state: {value: 'coin_diamond'},
				potency: {value: 4},
				use: {value: function (mover){
					this.dispose();
				}}
			})
		},
		theme: {
			plains: {
				graphic: 'plains',
				song: '',
				infantry: ['bug1'],
				cavalry: ['bug2'],
				officer: [['bug3']],
				boss: ['spider1']
			},
			cave: {
				graphic: 'cave',
				song: '',
				infantry: ['','bat1','eyeball1','eyeball1'],
				cavalry: ['','spine1','spine2','spine3'],
				officer: ['','eyeball2','spider1','spider1'],
				boss: ['','spine3']
			}
		},
		unit: {
            knight: Object.create(player_unit, {
                _graphic: {value: 'knight', writable: true},
                projectile_type: {value: 'sword', writable: true},
                front_protection: {value: true},
                base_body: {value: 10},
                base_aura: {value: 0}
            }),
			lancer: Object.create(player_unit, {
                _graphic: {value: 'lancer', writable: true},
                projectile_type: {value: 'lance', writable: true},
                front_protection: {value: true},
                base_body: {value: 10},
                base_aura: {value: 0},
				skill_id_secondary: {value: 'axe'}
            }),
            acolyte: Object.create(player_unit, {
                _graphic: {value: 'acolyte', writable: true},
                base_body: {value: 6},
                base_aura: {value: 3},
				aura_regen_rate: {value: 96},
				skill_id_secondary: {value: 'heal'}
            }),
            mage: Object.create(player_unit, {
                _graphic: {value: 'mage', writable: true},
                base_body: {value: 6},
                base_aura: {value: 5},
				aura_regen_rate: {value: 96},
				skill_id_secondary: {value: 'fireball'},
				skill_id_tertiary: {value: 'fireblast'}
            }),
            archer: Object.create(player_unit, {
                _graphic: {value: 'archer', writable: true},
                projectile_type: {value: 'arrow', writable: true},
                base_body: {value: 6},
                base_aura: {value: 0},
                base_speed: {value: 3}
            }),
            //
			bug1: Object.create(unit, {
				_graphic: {value: 'bug1', writable: true},
				faction: {value: DM.F_ENEMY},
				touch_damage: {value: 1},
				base_speed: {value: 1},
				base_body: {value: 1},
				behavior_name: {value: "behavior_normal"}
			}),
			bug2: Object.create(unit, {
				_graphic: {value: 'bug2', writable: true},
				faction: {value: DM.F_ENEMY},
				touch_damage: {value: 1},
				base_speed: {value: 1},
				base_body: {value: 2},
				behavior_name: {value: "behavior_normal"}
			}),
			bug3: Object.create(unit, {
				_graphic: {value: 'bug3', writable: true},
				faction: {value: DM.F_ENEMY},
				touch_damage: {value: 2},
				base_speed: {value: 1},
				base_body: {value: 3},
				behavior_name: {value: "behavior_normal"}
			}),
			bat1: Object.create(unit, {
				_graphic: {value: 'bat1', writable: true},
				faction: {value: DM.F_ENEMY},
				touch_damage: {value: 1},
				base_speed: {value: 2},
				base_body: {value: 1},
				height: {value: 8},
				behavior_name: {value: "behavior_pause"}
			}),
			eyeball1: Object.create(unit, {
				_graphic: {value: 'eyeball1', writable: true},
				faction: {value: DM.F_ENEMY},
				touch_damage: {value: 1},
				base_speed: {value: 1},
				base_body: {value: 2},
				movement: {value: DM.MOVEMENT_ALL},
				behavior_name: {value: "behavior_normal"},
			}),
			eyeball2: Object.create(unit, {
				_graphic: {value: 'eyeball2', writable: true},
				faction: {value: DM.F_ENEMY},
				touch_damage: {value: 2},
				base_speed: {value: 1},
				base_body: {value: 4},
				movement: {value: DM.MOVEMENT_ALL},
				behavior_name: {value: "behavior_normal"},
			}),
			spider1: Object.create(unit, {
				_graphic: {value: 'spider', writable: true},
				_graphic_state: {value: 'level1', writable: true},
				faction: {value: DM.F_ENEMY},
				width: {value: 32},
				height: {value: 32},
				touch_damage: {value: 1},
				base_speed: {value: 1},
				base_body: {value: 5},
				movement: {value: DM.MOVEMENT_ALL},
				behavior_name: {value: "behavior_normal"},
				projectile_type: {value: 'silk'},
				shoot_frequency: {value: 64},
				shoot: {value: function (){
					this.direction = DM.flip(this.direction);
					unit.shoot.call(this);
					this.direction = DM.flip(this.direction);
				}}
			}),
			spine1: Object.create(require('./snake.js'), {
				_graphic: {value: 'skull', writable: true},
				_graphic_state: {value: 'level1', writable: true},
				body_state: {value: 'spine1'},
				faction: {value: DM.F_ENEMY},
				touch_damage: {value: 1},
				base_speed: {value: 1},
				//base_body: {value: 3, writable: true},
				body_health: {value: 1},
				body_width: {value: 9},
				length: {value: 5},
				width: {value: 13},
				height: {value: 16},
				behavior_name: {value: "behavior_normal"},
			}),
			spine2: Object.create(require('./snake.js'), {
				_graphic: {value: 'skull', writable: true},
				_graphic_state: {value: 'level2', writable: true},
				body_state: {value: 'spine1'},
				faction: {value: DM.F_ENEMY},
				touch_damage: {value: 2},
				base_speed: {value: 1},
				//base_body: {value: 3, writable: true},
				body_health: {value: 1},
				body_width: {value: 9},
				length: {value: 9},
				width: {value: 13},
				height: {value: 16},
				behavior_name: {value: "behavior_normal"},
				projectile_type: {value: 'fireball_enemy'},
				shoot_frequency: {value: 64}
			}),
			spine3: Object.create(require('./snake.js'), {
				_graphic: {value: 'skull', writable: true},
				_graphic_state: {value: 'level3', writable: true},
				body_state: {value: 'spine3'},
				faction: {value: DM.F_ENEMY},
				touch_damage: {value: 2},
				base_speed: {value: 2},
				//base_body: {value: 3, writable: true},
				body_health: {value: 2},
				body_width: {value: 9},
				length: {value: 9},
				width: {value: 13},
				height: {value: 16},
				behavior_name: {value: "behavior_normal"},
			})
		},
		projectile: {
			fist: Object.create(projectile, {
				_graphic: {value: 'fist', writable: true},
				width: {value: 8},
				height: {value: 8},
				max_range: {value: 16},
				speed: {value: 4},
				potency: {value: 1},
				persistent: {value: true},
				movement: {value: DM.MOVEMENT_ALL},
				constructor: {value: function (user, skill, direction){
					projectile.constructor.call(this, user, skill, direction);
					user.intelligence_add(this);
					return this;
				}},
				handle_event: {value: function (controlled_mover, event){
					if(controlled_mover == this){
						return projectile.handle_event.call(this, controlled_mover, event);
					}
					switch(event.type){
					case DM.EVENT_TAKE_TURN:
						return false;
					}
					return true;
				}}
			}),
			arrow: Object.create(projectile, {
				_graphic: {value: 'arrow', writable: true},
				short_length: {value: 3},
				long_length: {value: 16},
				speed: {value: 8},
				potency: {value: 1},
				constructor: {value: function (user, skill, direction){
					projectile.constructor.call(this, user, skill, direction);
					this.direction = direction;
					if(this.direction == DM.NORTH || this.direction == DM.SOUTH){
						this.width = this.short_length;
						this.height = this.long_length;
					} else{
						this.width = this.long_length;
						this.height = this.short_length;
					}
					this.center(user);
					return this;
				}}
			}),
			sword: Object.create(projectile, {
				_graphic: {value: 'sword', writable: true},
				movement: {value: DM.MOVEMENT_ALL},
				projecting: {value: false},
				long_length: {value: 0, writable: true},
				short_length: {value: 6},
				persistent: {value: true},
				potency: {value: 2},
				stage: {value: 0, writable: true},
				speed: {value: 0},
				constructor: {value: function (user, skill, direction){
					projectile.constructor.call(this, user, skill, direction);
					user.intelligence_add(this);
                    this.handle_event(this, {type: DM.EVENT_TAKE_TURN})
					return this;
				}},
				handle_event: {value: function (controlled_mover, event){
					if(controlled_mover != this){
                        return projectile.handle_event.call(this, controlled_mover, event);
					}
					switch(event.type){
                        default:
                            return projectile.handle_event.call(this, controlled_mover, event);
                        break;
                        case DM.EVENT_TAKE_TURN:
                            if(controlled_mover._graphic_state != 'attack'){
                                controlled_mover.graphic_state = 'attack';
                            }
                            this.stage++;
                            this.direction = this.owner.direction;
                            switch(this.stage){
                                case 1: case 5:
                                    this.graphic_state = '1';
                                    this.long_length = 6;
                                break;
                                case 2: case 4:
                                    this.graphic_state = '2';
                                    this.long_length = 11;
                                break;
                                case 3:
                                    this.graphic_state = '3';
                                    this.long_length = 16;
                                break;
                                case 6:
                                    this.dispose();
                                break;
                            }
                            switch(this.direction){
                                case DM.SOUTH:
                                    this.width = this.short_length;
                                    this.height = this.long_length;
                                    this.x = this.owner.x + (this.owner.width - this.width)/2;
                                    this.y = this.owner.y + this.owner.height;
                                break;
                                case DM.NORTH:
                                    this.width = this.short_length;
                                    this.height = this.long_length;
                                    this.x = this.owner.x + (this.owner.width - this.width)/2;
                                    this.y = this.owner.y - this.height;
                                break;
                                case DM.EAST:
                                    this.width = this.long_length;
                                    this.height = this.short_length;
                                    this.x = this.owner.x + this.owner.width;
                                    this.y = this.owner.y + (this.owner.height - this.height)/2;
                                break;
                                case DM.WEST:
                                    this.width = this.long_length;
                                    this.height = this.short_length;
                                    this.x = this.owner.x - this.width;
                                    this.y = this.owner.y + (this.owner.height - this.height)/2;
                                break;
                            }
                            return false;
                        break;
                    }
					return true;
				}}
			}),
			lance: Object.create(projectile, {
				_graphic: {value: 'lance', writable: true},
				movement: {value: DM.MOVEMENT_ALL},
				projecting: {value: false},
				long_length: {value: 16, writable: true},
				short_length: {value: 6},
				persistent: {value: true},
				potency: {value: 2},
				stage: {value: 0, writable: true},
				speed: {value: 0},
				constructor: {value: function (user, skill, direction){
					projectile.constructor.call(this, user, skill, direction);
					user.intelligence_add(this);
                    this.handle_event(this, {type: DM.EVENT_TAKE_TURN})
					return this;
				}},
				handle_event: {value: function (controlled_mover, event){
					if(controlled_mover != this){
                        return projectile.handle_event.call(this, controlled_mover, event);
					}
					switch(event.type){
                        default:
                            return projectile.handle_event.call(this, controlled_mover, event);
                        break;
                        case DM.EVENT_TAKE_TURN:
                            if(controlled_mover._graphic_state != 'attack'){
                                controlled_mover.graphic_state = 'attack';
                            }
                            this.stage++;
                            this.direction = this.owner.direction;
							var offset = 0;
                            switch(this.stage){
                                case 1: case 5:
									offset = 0;
                                break;
                                case 2: case 4:
									offset = 10;
                                break;
                                case 3:
									offset = 16;
                                break;
                                case 6:
                                    this.dispose();
									return;
                                break;
                            }
                            switch(this.direction){
                                case DM.SOUTH:
                                    this.width = this.short_length;
                                    this.height = this.long_length;
                                    this.x = this.owner.x + (this.owner.width - this.width)/2;
                                    this.y = this.owner.y + (this.owner.height + offset);
                                break;
                                case DM.NORTH:
                                    this.width = this.short_length;
                                    this.height = this.long_length;
                                    this.x = this.owner.x + (this.owner.width - this.width)/2;
                                    this.y = this.owner.y - (this.height + offset);
                                break;
                                case DM.EAST:
                                    this.width = this.long_length;
                                    this.height = this.short_length;
                                    this.x = this.owner.x + (this.owner.width + offset);
                                    this.y = this.owner.y + (this.owner.height - this.height)/2;
                                break;
                                case DM.WEST:
                                    this.width = this.long_length;
                                    this.height = this.short_length;
                                    this.x = this.owner.x - (this.width + offset);
                                    this.y = this.owner.y + (this.owner.height - this.height)/2;
                                break;
                            }
                            return false;
                        break;
                    }
					return true;
				}}
			}),
			axe: Object.create(projectile, {
				_graphic: {value: 'axe', writable: true},
				movement: {value: DM.MOVEMENT_ALL},
				projecting: {value: false},
				width: {value: 16, writable: true},
				height: {value: 16, writable: true},
				persistent: {value: true},
				potency: {value: 1},
				stage: {value: 0, writable: true},
				speed: {value: 0},
				constructor: {value: function (user, skill, direction){
					projectile.constructor.call(this, user, skill, direction);
					user.intelligence_add(this);
                    this.handle_event(this, {type: DM.EVENT_TAKE_TURN})
					return this;
				}},
				handle_event: {value: function (controlled_mover, event){
					if(controlled_mover != this){
                        return projectile.handle_event.call(this, controlled_mover, event);
					}
					switch(event.type){
                        default:
                            return projectile.handle_event.call(this, controlled_mover, event);
                        break;
                        case DM.EVENT_TAKE_TURN:
                            if(controlled_mover._graphic_state != 'attack'){
                                controlled_mover.graphic_state = 'attack';
                            }
                            this.stage++;
							var offset = 0;
                            switch(this.stage){
                                case 1: case 2:
									this.direction = DM.turn(this.owner.direction, -45);
                                break;
                                case 3: case 4:
									this.direction = this.owner.direction;
                                break;
                                case 5: case 6:
									this.direction = DM.turn(this.owner.direction, 45);
                                break;
                                case 7:
                                    this.dispose();
									return;
                                break;
                            }
                            this.x = this.owner.x + (this.owner.width - this.width)/2;
                            this.y = this.owner.y + (this.owner.height - this.height)/2;
							var offset_x = (this.width + this.owner.width)/2;
							var offset_y = (this.height + this.owner.height)/2
							var offset_diagonal_x = offset_x * 0.8;
							var offset_diagonal_y = offset_y * 0.8;
                            switch(this.direction){
                                case DM.EAST:
                                    this.x += offset_x;
                                break;
                                case DM.NORTHEAST:
                                    this.x += offset_diagonal_x;
                                    this.y -= offset_diagonal_y;
                                break;
                                case DM.NORTH:
                                    this.y -= offset_y;
                                break;
                                case DM.NORTHWEST:
                                    this.x -= offset_diagonal_x;
                                    this.y -= offset_diagonal_y;
                                break;
                                case DM.WEST:
                                    this.x -= offset_x;
                                break;
                                case DM.SOUTHWEST:
                                    this.x -= offset_diagonal_x;
                                    this.y += offset_diagonal_y;
                                break;
                                case DM.SOUTH:
                                    this.y += offset_y;
                                break;
                                case DM.SOUTHEAST:
                                    this.x += offset_diagonal_x;
                                    this.y += offset_diagonal_y;
                                break;
                            }
                            return false;
                        break;
                    }
					return true;
				}}
			}),
			silk: Object.create(projectile, {
				_graphic: {value: 'silk', writable: true},
				width: {value: 8},
				height: {value: 8},
				max_range: {value: 64},
				speed: {value: 1},
				potency: {value: 0},
				explosive: {value: true},
				terminal_explosion: {value: true},
				movement: {value: DM.MOVEMENT_FLOOR},
				explode: {value: function (){
					var web_model = model_library.get_model('projectile', 'web');
					var web = web_model.constructor.call(Object.create(web_model), this.owner, null, null);
					web.x = this.x + (this.width -web.width )/2;
					web.y = this.y + (this.height-web.height)/2;
					this.dispose();
				}}
			}),
			web: Object.create(projectile, {
				_graphic: {value: 'web', writable: true},
				width: {value: 32},
				height: {value: 32},
				speed: {value: 0},
				projecting: {value: 0},
				potency: {value: 0},
				max_time: {value: 256},
				collision_check_priority: {value: DM.COLLISION_PRIORITY_UNIT},
				attack: {value: function (mover){
					if(mover.invulnerable_time || mover.invincible){ return}
					if(this.faction & mover.faction){ return;}
					mover.intelligence_add(Object.create(model_library.get_model('intelligence', 'freeze'), {
						time_left: {value: 74, writable: true}
					}));
					var target_coordinate = {
						x: this.x,
						y: this.y,
						width: this.width,
						height: this.height
					}
					this.owner.direction = this.owner.direction_to(target_coordinate);
					this.owner.intelligence_add({
						target: target_coordinate,
						time: 96,
						handle_event: function (controlled, event){
							if(event.type === DM.EVENT_TAKE_TURN){
								if(Math.random()*9 > 8){
									controlled.direction = controlled.direction_to(this.target);
								}
								controlled.move(controlled.direction, controlled.speed()*2)
								if(this.time-- <= 0){
									controlled.intelligence_remove(this);
								}
								return false;
							}
							if(event.type === DM.EVENT_INTELLIGENCE_ADDED){
								return false;
							}
							return true;
						}
					})
					this.dispose();
				}}
			}),
			fireball: Object.create(projectile, {
				_graphic: {value: 'fireball', writable: true},
				width: {value: 8},
				height: {value: 8},
				max_range: {value: 128},
				speed: {value: 6},
				potency: {value: 1},
				movement: {value: DM.MOVEMENT_FLOOR}
			}),
			fireball_enemy: Object.create(projectile, {
				_graphic: {value: 'fireball', writable: true},
				width: {value: 8},
				height: {value: 8},
				max_range: {value: 128},
				speed: {value: 3},
				potency: {value: 1},
				movement: {value: DM.MOVEMENT_FLOOR}
			}),
			fireball_large: Object.create(projectile, {
				_graphic: {value: 'fireball_large', writable: true},
				width: {value: 16},
				height: {value: 16},
				speed: {value: 6},
				potency: {value: 2},
				max_range: {value: 0},
				movement: {value: DM.MOVEMENT_FLOOR}
			})
		},
		intelligence: {
			attack: {
				time_left: 6,
				constructor: function (attacker, time){
					attacker.graphic_state = 'attack'
					if(time){
						this.time_left = time;
					}
					return this;
				},
				handle_event: function (mover, event){
					if(event.type === DM.EVENT_INTELLIGENCE_REMOVED){
						if(mover.graphic_state == 'attack'){
							mover.graphic_state = null;
						}
					}
					if(event.type === DM.EVENT_TAKE_TURN){
						if(--this.time_left > 0){
							mover.graphic_state = 'attack'
							return false;
						} else{
							mover.intelligence_remove(this);
						}
					}
					return true;
				}
			},
			cast: {
				time_left: 6,
				constructor: function (caster, time){
					caster.graphic_state = 'cast'
					if(time){
						this.time_left = time;
					}
					return this;
				},
				handle_event: function (mover, event){
					if(event.type === DM.EVENT_INTELLIGENCE_REMOVED){
						if(mover.graphic_state == 'cast'){
							mover.graphic_state = null;
						}
					}
					if(event.type === DM.EVENT_TAKE_TURN){
						if(--this.time_left > 0){
							mover.graphic_state = 'cast'
							return false;
						} else{
							mover.intelligence_remove(this);
						}
					}
					return true;
				}
			},
			freeze: {
				time_left: DM.TRANSITION_INVULNERABILITY_TIME,
				constructor: function (time){
					if(time){
						this.time_left = time;
					}
					return this;
				},
				handle_event: function (mover, event){
					if(event.type === DM.EVENT_TAKE_TURN){
						if(--this.time_left > 0){
							return false;
						} else{
							mover.intelligence_remove(this);
						}
					}
					return true;
				}
			}
		},
        skill: {
            melee:  Object.create(usable, {
                effect: {value: 'melee'},
                melee: {value: function (user){
                    user.shoot();
					var attack_int = model_library.get_model('intelligence', 'attack');
					user.intelligence_add(attack_int.constructor.call(Object.create(attack_int), user));
                }}
            }),
            test_arrow: Object.create(usable, {
                effect: {value: 'whatever'},
                whatever: {value: function (user){
                    user.shoot(model_library.get_model('projectile','arrow'))
					var attack_int = model_library.get_model('intelligence', 'attack');
					user.intelligence_add(attack_int.constructor.call(Object.create(attack_int), user));
                }}
            }),
            axe:  Object.create(usable, {
                effect: {value: 'melee'},
                melee: {value: function (user){
                    user.shoot(model_library.get_model('projectile', 'axe'));
					var attack_int = model_library.get_model('intelligence', 'attack');
					user.intelligence_add(attack_int.constructor.call(Object.create(attack_int), user));
                }}
            }),
            heal: Object.create(usable, {
                effect: {value: 'whatever'},
				cost: {value: 1},
                whatever: {value: function (user){
					var effect_screen = user.screen;
					var movers = effect_screen.movers.copy();
					var max_index = movers.length-1;
					var effect_width = 64;
					var m1 = undefined;
					var m2 = {
						x: user.x + (user.width-effect_width)/2,
						y: user.y + (user.height-effect_width)/2,
						width: effect_width,
						height: effect_width
					};
					for(var mover_index = 0; mover_index <= max_index; mover_index++){
						var indexed_mover = movers[mover_index];
						if(typeof indexed_mover.adjust_hp != 'function'){ continue}
						if(effect_screen.movers.indexOf(indexed_mover) == -1){ continue}
						if(indexed_mover.faction != user.faction){ continue}
						m1 = indexed_mover;
						if(    Math.abs(m1.x+m1.width /2 - (m2.x+m2.width /2)) < (m1.width +m2.width )/2){
							if(Math.abs(m1.y+m1.height/2 - (m2.y+m2.height/2)) < (m1.height+m2.height)/2){
								indexed_mover.adjust_hp(1, user);
							}
						}
					}
					var cast_int = model_library.get_model('intelligence', 'cast');
					user.intelligence_add(cast_int.constructor.call(Object.create(cast_int), user));
					effect_screen.add_event('heal_sparkles', {x: user.x+user.width/2, y: user.y+user.height/2});
                }}
            }),
            fireball: Object.create(usable, {
                effect: {value: 'whatever'},
				cost: {value: 1},
                whatever: {value: function (user){
                    user.shoot(model_library.get_model('projectile','fireball'))
					var cast_int = model_library.get_model('intelligence', 'cast');
					user.intelligence_add(cast_int.constructor.call(Object.create(cast_int), user));
                }}
            }),
            fireblast: Object.create(usable, {
                effect: {value: 'whatever'},
				cost: {value: 2},
                whatever: {value: function (user){
                    user.shoot(model_library.get_model('projectile','fireball_large'))
					var cast_int = model_library.get_model('intelligence', 'cast');
					user.intelligence_add(cast_int.constructor.call(Object.create(cast_int), user));
                }}
            })
        }
	};
	return model_library;
})();