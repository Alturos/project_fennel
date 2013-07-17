module.exports = (function (){
	var DM = require('./DM.js');
	var map = require('./map.js');
	var mover = require('./mover.js');
	var maze_generator = require('./maze_generator.js');
	var model_library = require('./model_library.js');
	var dungeon = {
		id: 'Test Dungeon',
		levels: [], // list of regions
		get_level: function (depth){
			if(depth < 0 || Math.floor(depth) != depth){
				return;
			}
			var level_index = depth-1;
			if(depth > this.levels.length || !this.levels[level_index]){
				var theme_id = 'cave';
				if(depth == 1){
					theme_id = 'plains';
				}
				var new_level = map.region.constructor.call(Object.create(map.region), this.id+' level '+depth, theme_id, 64, 64);
				new_level.depth = depth;
				var floor_theme = new_level.theme
				var shared_tile_set = [
					map.tile.constructor.call(Object.create(map.tile), floor_theme.graphic, "floor", DM.MOVEMENT_FLOOR),
					map.tile.constructor.call(Object.create(map.tile), floor_theme.graphic, "wall", DM.MOVEMENT_WALL),
					map.tile.constructor.call(Object.create(map.tile), floor_theme.graphic, "pillar", DM.MOVEMENT_WALL),
					map.tile.constructor.call(Object.create(map.tile), floor_theme.graphic, "water", DM.MOVEMENT_WATER)
				];
				var level_maze = maze_generator.generate_maze();
				var dead_ends = Object.create(DM.list);
				for(pos_y = 0; pos_y < level_maze.height; pos_y++){
					for(pos_x = 0; pos_x < level_maze.width; pos_x++){
						var maze_node = level_maze.node(pos_x, pos_y);
						var new_screen = map.screen.constructor.call(Object.create(map.screen), pos_x, pos_y, 1, 1);
						new_level.place_screen(new_screen);
						new_screen.tile_set = shared_tile_set;
						new_screen.setup(maze_node.tile_grid);
						if(maze_node.dead_end){
							dead_ends.push(new_screen);
						}
					}
				}
				var unused_dead_ends = dead_ends.copy();
				var start_screen_index = Math.floor(Math.random()*unused_dead_ends.length);
				new_level.start_screen = unused_dead_ends[start_screen_index];
				unused_dead_ends.remove(new_level.start_screen);
				var boss_screen_index = Math.floor(Math.random()*unused_dead_ends.length);
				new_level.boss_screen = unused_dead_ends[boss_screen_index];
				unused_dead_ends.remove(new_level.boss_screen);
				var stair_up = passage_up.constructor.call(Object.create(passage_up), 2, 2, new_level.start_screen);
				var stair_down = passage_down.constructor.call(Object.create(passage_down), 2, 2, new_level.boss_screen);
				map.regions[new_level.id] = new_level;
				this.levels[level_index] = new_level;
			}
			var indexed_level = this.levels[level_index];
			return indexed_level;
		}
	}
	var passage_up = Object.create(mover, {
		_graphic: {value: 'ladder_up'},
		movement: {value: DM.MOVEMENT_STATIONARY},
		width: {value: map.tile_size},
		height: {value: map.tile_size},
		persistent: {value: true},
		collision_check_priority: {value: DM.COLLISION_PRIORITY_GROUND},
		constructor: { value: function (x, y, screen){
			mover.constructor.call(this, x*map.tile_size, y*map.tile_size, this.width, this.height, screen);
			return this;
		}},
		collide: { value: function (mover){
			if(mover.faction != DM.F_PLAYER){
				return;
			}
		}}
	});
	var passage_down = Object.create(mover, {
		_graphic: {value: 'ladder_down'},
		movement: {value: DM.MOVEMENT_STATIONARY},
		width: {value: map.tile_size},
		height: {value: map.tile_size},
		persistent: {value: true},
		collision_check_priority: {value: DM.COLLISION_PRIORITY_GROUND},
		constructor: { value: function (x, y, screen){
			mover.constructor.call(this, x*map.tile_size, y*map.tile_size, this.width, this.height, screen);
			return this;
		}},
		collide: { value: function (mover){
			if(mover.faction != DM.F_PLAYER){
				return;
			}
			var next_level = dungeon.get_level(map.regions[this.screen.region_id].depth+1);
			var start_screen = next_level.start_screen;
			this.screen.descend(mover, start_screen);
		}}
	});
	return dungeon;
})();