//eller maze generator

var generator = {
	north: 1,
	south: 2,
	east: 4,
	west: 8,
	maze: {
		width: undefined,
		height: undefined,
		join_threshold: 0.2,
		extention_factor: 0.2,
		node_grid: undefined,
		setup: function (width, height, join_threshold, extention_factor, cycle_factor){
			this.width = width || this.width;
			this.height = height || this.height;
			this.join_threshold = join_threshold || this.join_threshold;
			this.extention_factor = extention_factor || this.extention_factor;
			this.cycle_factor = cycle_factor || this.cycle_factor;
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
				console.log(rrr)
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
		}
	},
	node: {
		x: undefined,
		y: undefined,
		connections: 0
	}
}
var new_maze = Object.create(generator.maze);
new_maze.setup(5,5,0.5,0.5,1);
//new_maze.setup(15,10,0.6,0.5,1);
new_maze.generate()