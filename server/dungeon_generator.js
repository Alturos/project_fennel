module.exports = (function (){
	//eller maze generator
	var DM = require('./DM.js');
	var map = require('./map.js');
	var generator = {
		north: 1,
		south: 2,
		east: 4,
		west: 8,
		generate_maze: function (){
			var new_maze = Object.create(generator.maze);
			new_maze.setup(5,5,0.5,0.5);
			//new_maze.setup(15,10,0.6,0.5,1);
			new_maze.generate();
			return new_maze;
		},
		maze: {
			width: undefined,
			height: undefined,
			join_threshold: 0.2,
			extention_factor: 0.2,
			node_grid: undefined,
			setup: function (width, height, join_threshold, extention_factor/*, cycle_factor*/){
				this.width = width || this.width;
				this.height = height || this.height;
				this.join_threshold = join_threshold || this.join_threshold;
				this.extention_factor = extention_factor || this.extention_factor;
				//this.cycle_factor = cycle_factor || this.cycle_factor;
				this.node_grid = [];
				this.node_grid.length = this.width*this.height;
			},
			node: function (x, y, new_node){
				var compound_index = x + (y*this.width);
				var indexed_node;
				if(new_node){
					this.node_grid[compound_index] = new_node;
					indexed_node = new_node;
				} else{
					indexed_node = this.node_grid[compound_index];
				}
				return indexed_node;
			},
			generate: function (){
				this.generate_node_grid();
				this.place_walls()
				this.log_nodes()
				this.log_divisions();
			},
			generate_node_grid: function (){
				var new_node;
				var left_node;
				var right_node;
				var pos_x;
				var pos_y;
				var old_set;
				var old_index;
				// State Variables
				var old_line = [];
				var new_line = [];
				old_line.length = this.width;
				new_line.length = this.width;
				for(pos_y = 0; pos_y < this.height; pos_y++){
					// Populate New Line
					for(pos_x = 0; pos_x < this.width; pos_x++){
						new_node = new_line[pos_x];
						if(!new_node){
							new_node = Object.create(generator.node, {
								x: {value:pos_x},
								y: {value:pos_y}
							});
							this.node(pos_x, pos_y, new_node);
							new_line[pos_x] = new_node;
							new_node.set = JSON.stringify(
								{x: new_node.x, y: new_node.y}
							);
						}
					}
					// Join Cells
					for(pos_x = 0; pos_x < this.width-1; pos_x++){
						left_node = new_line[pos_x];
						right_node = new_line[pos_x+1];
						if(left_node.set !== right_node.set){
							var final_join = (pos_y == this.height-1);
							if(Math.random() > this.join_threshold || final_join){
								//var cycle = (Math.random() < this.cycle_factor);
								//if(!cycle && JSON.parse(older_node.set).y > JSON.parse(newer_node.set).y){
								left_node.connections |= generator.east;
								right_node.connections |= generator.west;
								var old_set = right_node.set
								for(test_x = 0; test_x < this.width; test_x++){
									var test_node = new_line[test_x];
									if(test_node.set == old_set){
										test_node.set = left_node.set;
									}
								}
							}
						}
					}
					var rrr = ''
					for(test_x = 0; test_x < this.width; test_x++){
						var test_node = new_line[test_x];
						rrr += test_node.set;
					}
					// Extend Sets
					if(pos_y == this.height-1){
						continue;
					}
					old_line = new_line;
					new_line = [];
					new_line.length = this.width;
					var sets = {};
					for(pos_x = 0; pos_x < this.width; pos_x++){
						var indexed_node = old_line[pos_x];
						var set_identifier = indexed_node.set;
						var indexed_set;
						if(sets[set_identifier]){
							indexed_set = sets[set_identifier];
						} else{
							indexed_set = [];
							sets[set_identifier] = indexed_set;
						}
						indexed_set.push(indexed_node);
					}
					for(var set_key in sets){
						var indexed_set = sets[set_key];
						var preferred_extentions = Math.round(indexed_set.length*this.extention_factor);
						var extentions = Math.max(1, Math.min(indexed_set.length, preferred_extentions));
						for(var extention_index = 0; extention_index < extentions; extention_index++){
							var random_index = Math.floor(Math.random()*indexed_set.length);
							random_index = Math.min(random_index, indexed_set.length-1);
							var random_node = indexed_set[random_index];
							new_node = Object.create(generator.node, {
								x: {value: random_node.x},
								y: {value: random_node.y+1}
							});
							this.node(new_node.x, new_node.y, new_node);
							new_line[new_node.x] = new_node;
							random_node.connections |= generator.south;
							new_node.connections |= generator.north;
							new_node.set = set_key;
							var old_index = indexed_set.indexOf(random_node);
							if(old_index >= 0){
								indexed_set.splice(old_index, 1);
							}
						}
					}
					for(pos_x = 0; pos_x < this.width; pos_x++){
						var old_node = old_line[pos_x];
						delete old_node.set;
					}
				}
			},
			place_divisions: function (){
				var divisions;
				for(var y_pos = 0; y_pos < this.height; y_pos++){
					for(var x_pos = 0; x_pos < this.width; x_pos++){
						var indexed_node = this.node(x_pos, y_pos);
						// Determine wall symmetry
						var mirror_vertical = false;
						var mirror_horizontal = false;
						if(!(indexed_node.connections & (DM.NORTH|DM.SOUTH))){
							mirror_vertical = true;
						}
						if(!(indexed_node.connections & (DM.EAST|DM.WEST))){
							mirror_horizontal = true;
						}
						// Set own divisions
						if(indexed_node.division(DM.NORTH) === undefined){
							divisions = Math.min(2, Math.floor(Math.random()*3))// 0-2 divisions/walls
							indexed_node.division(DM.NORTH, divisions);
							if(mirror_vertical){
								indexed_node.division(DM.SOUTH, divisions);
							}
						}
						if(indexed_node.division(DM.SOUTH) === undefined){
							if(mirror_vertical){
								indexed_node.division(DM.SOUTH, indexed_node.division(DM.NORTH));
							} else{
								divisions = Math.min(2, Math.floor(Math.random()*3))// 0-2 divisions/walls
								indexed_node.division(DM.SOUTH, divisions);
							}
						}
						if(indexed_node.division(DM.WEST) === undefined){
							divisions = Math.min(2, Math.floor(Math.random()*3))// 0-2 divisions/walls
							indexed_node.division(DM.WEST, divisions);
							if(mirror_horizontal){
								indexed_node.division(DM.EAST, divisions);
							}
						}
						if(indexed_node.division(DM.EAST) === undefined){
							if(mirror_horizontal){
								indexed_node.division(DM.EAST, indexed_node.division(DM.WEST));
							} else{
								divisions = Math.min(2, Math.floor(Math.random()*3))// 0-2 divisions/walls
								indexed_node.division(DM.EAST, divisions);
							}
						}
						// Check for impossible wall configuration; fix if found
						if(indexed_node.division(DM.NORTH) !== indexed_node.division(DM.SOUTH)){
							if(indexed_node.division(DM.EAST) !== indexed_node.division(DM.WEST)){
								indexed_node.division(DM.SOUTH, indexed_node.division(DM.NORTH));
							}
						}
						if(indexed_node.division(DM.NORTH) !== indexed_node.division(DM.SOUTH)){
							if(indexed_node.division(DM.EAST) === 0){
								indexed_node.division(DM.SOUTH, indexed_node.division(DM.NORTH));
							}
						}
						if(indexed_node.division(DM.EAST) !== indexed_node.division(DM.WEST)){
							if(indexed_node.division(DM.NORTH) === 0){
								indexed_node.division(DM.EAST, indexed_node.division(DM.WEST));
							}
						}
						// Propagate divisions to connected neighbors.
						if(indexed_node.connections & DM.SOUTH){
							var south_node = this.node(x_pos, y_pos+1);
							south_node.division(DM.NORTH, indexed_node.division(DM.SOUTH));
						}
						if(indexed_node.connections & DM.EAST){
							var east_node = this.node(x_pos+1, y_pos);
							east_node.division(DM.WEST, indexed_node.division(DM.EAST));
						}
					}
				}
			},
			layout_screen: function (x,y){
				var node = this.node(x,y);
				/*var divisions_north = node.division(DM.NORTH);
				var divisions_south = node.division(DM.SOUTH);
				var divisions_east = node.division(DM.EAST);
				var divisions_west = node.division(DM.WEST);
				var fault_vertical = (divisions_north !== divisions_south);
				var fault_horizontal = (divisions_west !== divisions_east);
				var fault_vertical_end;
				var fault_horizontal_end;
				if(fault_vertical){
					fault_vertical_end = Math.max(1, Math.ceil(Math.random()*divisions_east));
					// A number between 1 and divisions_east
				}
				if(fault_horizontal){
					fault_horizontal_end = Math.max(1, Math.ceil(Math.random()*divisions_north));
					// A number between 1 and divisions_north
				}*/
				var screen_maze = Object.create(generator.maze);
				var columns = Math.max(1, Math.ceil(Math.random()*4));
				var rows = Math.max(1, Math.ceil(Math.random()*4));
				screen_maze.setup(columns, rows, 0.5, 0.5);
				screen_maze.generate();
				/*
				###############
				#.............# 1 : 13
				#......#......# 2 : 6,6
				#...#.....#...# 3 : 3,5,3
				#..#...#...#..# 4 : 2,3,3,2
				100100010001001
				0123456789abcde
				*/
				var room_sizes = [[13], [6,6], [3,5,3], [2,3,3,2]];
				var boundries = [[15], [7,15], [4,10,15], [3,7,11,15]];
				var tile_grid = '';
				var node_index_x = 0;
				var node_index_y = 0;
				for(var pos_y = 0; pos_y < map.screen_height; pos_y++){
					var test_index = 
					for(var pos_x = 0; pos_x < map.screen_width; pos_x++){
						var node_index_x = 
						var indexed_node = screen_maze.node(pos_x, pos_y);
						
					}
				}
			},
			log_nodes: function (){
				// Log results:
				for(pos_y = 0; pos_y < this.height; pos_y++){
					var line_text = '';
					for(pos_x = 0; pos_x < this.width; pos_x++){
						var indexed_node = this.node(pos_x, pos_y);
						line_text += '#';
						if(indexed_node.connections & generator.north){
							line_text += " ";
						} else{
							line_text += "#";
						}
						line_text += '#';
					}
					console.log(line_text);
					line_text = '';
					for(pos_x = 0; pos_x < this.width; pos_x++){
						var indexed_node = this.node(pos_x, pos_y);
						if(indexed_node.connections & generator.west){
							line_text += ' ';
						} else{
							line_text += "#";
						}
						line_text += '.'//'+indexed_node.x+','+indexed_node.y;
						if(indexed_node.connections & generator.east){
							line_text += ' ';
						} else{
							line_text += "#";
						}
					}
					console.log(line_text);
					line_text = '';
					for(pos_x = 0; pos_x < this.width; pos_x++){
						var indexed_node = this.node(pos_x, pos_y);
						line_text += '#';
						if(indexed_node.connections & generator.south){
							line_text += " ";
						} else{
							line_text += "#";
						}
						line_text += '#';
					}
					console.log(line_text);
				}
			},
			log_divisions: function (){
				for(pos_y = 0; pos_y < this.height; pos_y++){
					var line_text = '';
					for(pos_x = 0; pos_x < this.width; pos_x++){
						var indexed_node = this.node(pos_x, pos_y);
						var divisions = indexed_node.division(DM.NORTH);
						if(divisions === undefined){ divisions = '-'}
						line_text += ' ';
						line_text += divisions;
						line_text += ' ';
					}
					console.log(line_text);
					line_text = '';
					for(pos_x = 0; pos_x < this.width; pos_x++){
						var indexed_node = this.node(pos_x, pos_y);
						var divisions = indexed_node.division(DM.WEST);
						if(divisions === undefined){ divisions = '-'}
						line_text += divisions;
						line_text += ' ';
						var divisions = indexed_node.division(DM.EAST);
						if(divisions === undefined){ divisions = '-'}
						line_text += divisions;
					}
					console.log(line_text);
					line_text = '';
					for(pos_x = 0; pos_x < this.width; pos_x++){
						var indexed_node = this.node(pos_x, pos_y);
						var divisions = indexed_node.division(DM.SOUTH);
						if(divisions === undefined){ divisions = '-'}
						line_text += ' ';
						line_text += divisions;
						line_text += ' ';
					}
					console.log(line_text);
				}
			}
		},
		node: {
			x: undefined,
			y: undefined,
			connections: 0,
			divisions: 0,
			division: function (direction, divisions){
				var shift;
				var new_division;
				switch(direction){
				case DM.NORTH:
					shift = 0;
					break;
				case DM.SOUTH:
					shift = 1;
					break;
				case DM.EAST:
					shift = 2;
					break;
				case DM.WEST:
					shift = 3;
					break;
				}
				if(divisions !== undefined){
					new_division = divisions;
					// 65535 = 1111 1111 1111 1111
					// 255 = 1111 1111
					var shifted_divisions = 255 & ((divisions+1) << (shift*2));
					// +1 to differentiate '0 divisions' from 'divisions not set'
					// shifted_div ~= 0000 1111 0000 0000
					this.divisions |= shifted_divisions;
				}
				else{
					var shifted_divisions = this.divisions >> (shift*2);
					// 15 = 1111
					// 3 = 11
					shifted_divisions &= 3;
					shifted_divisions -= 1;
					// -1 to differentiate '0 divisions' from 'divisions not set'
					if(shifted_divisions == -1){
						shifted_divisions = undefined;
					}
					new_division = shifted_divisions;
				}
				return new_division;
			}
		}
	}
	generator.generate_maze();
})();