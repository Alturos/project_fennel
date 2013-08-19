// Dependant on client.js
var resource_path = 'resources/'
//var resource_path = '/rsc/fennel/'
client.resource = function (category, identifier){
	return this.resource_library.resource(category, identifier);
}
client.resource_library = {
	resource_load_ready: false,
	resource_loading_ids: Object.create(DM.list),
	resource: function (category, identifier){
		if(this.library[category]){
			return this.library[category][identifier];
		}
	},
	loaded_images: {},
	library: {
		graphic: {
			// I - Graphics
			// I.a - Client Interface
			"hud": {url: resource_path + 'graphics/hud.png', x:0, y:0},
			"tomb": {url: resource_path + 'graphics/tomb.png', x:0, y:0, dirs: 1},
			// I.b - Mapping
			// I.b.1 - Tiles
			"plains": {url: resource_path + 'graphics/plains.png', states: {
				"floor": {x:0, y:0},
				"pillar": {x:1, y:0},
				"wall": {x:2, y:0},
				"water": {x:1, y:1},
				"test": {x:1, y:1},
			}},
			"cave": {url: resource_path + 'graphics/cave.png', states: {
				"floor": {x:0, y:0},
				"pillar": {x:1, y:0},
				"wall": {x:2, y:0},
				"water": {x:1, y:1},
				"test": {x:1, y:1},
			}},
			"castle": {url: resource_path + 'graphics/castle.png', states: {
				"floor": {x:0, y:0},
				"pillar": {x:1, y:0},
				"wall": {x:2, y:0},
				"water": {x:1, y:1},
				"test": {x:1, y:1},
			}},
			// I.b.2
			"ladder_up": {url: resource_path + 'graphics/common_tall.png', x:16, y:0, height: 32},
			"ladder_down": {url: resource_path + 'graphics/common_tall.png', x:0, y:0, height: 32, y_offset: -16},
			// I.c - Units
			// I.c.1 - Player Classes
			"adventurer": {url: resource_path + 'graphics/adventurer.png', x:0, y:0, animate:2, dirs:4, states: {
				"attack": {x:0, y:2, animate:1, dirs:4}
			}},
			"knight": {url: resource_path + 'graphics/knight.png', x:0, y:0, animate:2, dirs:4, states: {
				"attack": {x:0, y:2, animate:1, dirs:4}
			}},
			"lancer": {url: resource_path + 'graphics/lancer.png', x:0, y:0, animate:2, dirs:4, states: {
				"attack": {x:0, y:2, animate:1, dirs:4}
			}},
			"acolyte": {url: resource_path + 'graphics/acolyte.png', x:0, y:0, animate:2, dirs:4, states: {
				"attack": {x:0, y:2, animate:1, dirs:4},
				"cast": {x:0, y:3, animate:1, dirs:4}
			}},
			"mage": {url: resource_path + 'graphics/mage.png', x:0, y:0, animate:2, dirs:4, states: {
				"attack": {x:0, y:2, animate:1, dirs:4},
				"cast": {x:0, y:3, animate:1, dirs:4}
			}},
			"archer": {url: resource_path + 'graphics/archer.png', x:0, y:0, animate:2, dirs:4, states: {
				"attack": {x:0, y:2, animate:1, dirs:4}
			}},
			// I.c.2 - Enemies
			"bug1": {url: resource_path + 'graphics/enemies.png', x:0, y:0, animate:2, dirs:4},
			"bug2": {url: resource_path + 'graphics/enemies.png', x:0, y:32, animate:2, dirs:4},
			"bug3": {url: resource_path + 'graphics/enemies.png', x:64, y:0, animate:2, dirs:4},
			"eyeball1": {url: resource_path + 'graphics/enemies.png', height:17, x:128, y:0, animate:2, dirs:4},
			"eyeball2": {url: resource_path + 'graphics/enemies.png', height:17, x:128, y:34, animate:2,  dirs:4},
			"eyeball3": {url: resource_path + 'graphics/enemies.png', height:17, x:128, y:68, animate:2,  dirs:4},
			"bat1": {url: resource_path + 'graphics/enemies.png', x:192, y:0, animate:2},
			"bat2": {url: resource_path + 'graphics/enemies.png', x:208, y:0, animate:2},
			"bat3": {url: resource_path + 'graphics/enemies.png', x:224, y:0, animate:2},
			"spider": {url: resource_path + 'graphics/spider.png', width:32, height:32, animate:4, dirs:4, states:{
				"level1": {},
				"level2": {x:4},
				"level3": {x:8}
			}},
			"skull": {url: resource_path + 'graphics/enemies.png', width:13, height:16, y: 64, animate:2, dirs:4, states:{
				"level1": {x:0}, "level2": {x:0, y:2}, "level3": {x:0, y:4},
				"spine1": {x:4}, "spine2": {x:4, y:2}, "spine3": {x:4, y:4},
			}},
			// I.d - Items
			// I.d.1 - Droppable Items
			"items": {url: resource_path + 'graphics/items.png', width: 8, height: 8, states: {
				"cherry":       {},
				"plum":         {x:1, y:0},
				"bottle":       {x:2, y:0},
				"shield":       {x:3, y:0, animate: 2},
				"coin_silver":  {x:0, y:1, animate: 4},
				"coin_gold":    {x:1, y:1, animate: 4},
				"coin_diamond": {x:2, y:1, animate: 4},
				"bomb_lit":     {x:3, y:2, animate: 2}
			}},
			// Projectiles and Effects
			"fist": {url: resource_path + 'graphics/projectiles.png', width: 8, height: 8, x:0, y:0, dirs: 4},
			"arrow": {url: resource_path + 'graphics/projectiles.png', width: 16, height: 16, x:0, y:5*16, dirs: 4},
			"sword": {url: resource_path + 'graphics/projectiles.png', width: 16, height: 16, x:0, y:32, dirs: 4, states: {
				"1": {}, "2": {y:1}, "3": {y:2},
			}},
			"lance": {url: resource_path + 'graphics/projectiles.png', width: 16, height: 16, x:0, y:96, dirs: 4, states: {
				"1": {}, "2": {y:1}, "3": {y:2},
			}},
			"axe": {url: resource_path + 'graphics/projectiles.png', width: 16, height: 16, x:64, y:32, dirs: 8},
			"fireball": {url: resource_path + 'graphics/projectiles.png', width: 8, height: 8, x:32, y:0, animate:2, dirs: 4},
			"fireball_large": {url: resource_path + 'graphics/projectiles.png', width: 16, height: 16, x:104, y:0, animate:2, dirs: 4},
			"silk": {url: resource_path + 'graphics/projectiles.png', width: 8, height: 8, x: 32, y: 16, animate:2, dirs: 4},
			"shuriken": {url: resource_path + 'graphics/projectiles.png', width: 8, height: 8, x:64, y:0, animate:3},
			"web": {url: resource_path + 'graphics/projectiles.png', width: 32, height: 32, x:72, y:0},
			"magic1": {url: resource_path + 'graphics/projectiles.png', width: 4, height: 4, x: 168, y: 0, animate:4},
			"magic2": {url: resource_path + 'graphics/projectiles.png', width: 5, height: 5, x: 172, y: 0, animate:4},
			"green_sparkles": {url: resource_path + 'graphics/projectiles.png', width: 32, height: 32, x: 192, animate: 4, frame_rate: 24},
			"blue_sparkles": {url: resource_path + 'graphics/projectiles.png', width: 32, height: 32, x: 224, animate: 4, frame_rate: 24}
		},
		event: {
			"heal_sparkles": {
				finished: false,
				sprites: undefined,
				setup: function (data){
					this.x = data.x;
					this.y = data.y;
					this.time = 0;
					this.sprites = Object.create(DM.list);
					this.sprites.add({x: this.x, y: this.y, graphic: 'green_sparkles', width: 0, height: 0});
					this.sprites.add({x: this.x, y: this.y, graphic: 'green_sparkles', width: 0, height: 0});
					this.sprites.add({x: this.x, y: this.y, graphic: 'green_sparkles', width: 0, height: 0});
					this.sprites.add({x: this.x, y: this.y, graphic: 'green_sparkles', width: 0, height: 0});
				},
				iterate: function (){
					this.time++;
					var expand_rate = 3;
					this.sprites[0].x = this.x+this.time*expand_rate;
					this.sprites[0].y = this.y+this.time*expand_rate;
					this.sprites[1].x = this.x+this.time*expand_rate;
					this.sprites[1].y = this.y-this.time*expand_rate;
					this.sprites[2].x = this.x-this.time*expand_rate;
					this.sprites[2].y = this.y-this.time*expand_rate;
					this.sprites[3].x = this.x-this.time*expand_rate;
					this.sprites[3].y = this.y+this.time*expand_rate;
					if(this.time > 5){ this.finished = true}
				}
			},
			"heal_sparkle": {
				finished: false,
				sprites: undefined,
				setup: function (data){
					this.x = data.x;
					this.y = data.y;
					this.time = 0;
					this.sprites = Object.create(DM.list);
					this.sprites.add({x: this.x, y: this.y, graphic: 'green_sparkles', width: 0, height: 0});
				},
				iterate: function (){
					this.time++;
					if(this.time > 5){ this.finished = true}
				}
			},
			"aura_sparkle": {
				finished: false,
				sprites: undefined,
				setup: function (data){
					this.x = data.x;
					this.y = data.y;
					this.time = 0;
					this.sprites = Object.create(DM.list);
					this.sprites.add({x: this.x, y: this.y, graphic: 'blue_sparkles', width: 0, height: 0});
				},
				iterate: function (){
					this.time++;
					if(this.time > 5){ this.finished = true}
				}
			}
		}
	},
	setup: function (callback){
		this.setup_graphics(callback);
	},
	setup_graphics: function (callback){
		console.log("Setting up resources");
		console.log("TODO:: Fix resource on noted line.");
		for(var key in this.library.graphic){
			var resource = this.library.graphic[key];
			if(!(resource.url in this.loaded_images)){
				var new_image = new Image();
				this.resource_loading_ids.add(resource.url);
				var load_call = function (){
					//client.resource_library.resource_loading_ids.remove(resource.url)
					client.resource_library.resource_loading_ids.remove(client.resource_library.resource_loading_ids[0]);
					/* TODO:: Fix the above line.
						The issue here is that the variable "resource" is a variable of the setup function's "closure",
						not of the loop code block. Thus, resource holds a reference to the object assigned to the
						resource variable in the last iteration of the loop, not the object assigned to the resource
						variable in the same iteration in which this function was created.
					*/
					if(client.resource_library.resource_load_ready){
						if(!client.resource_library.resource_loading_ids.length){
							console.log("Finished. Calling")
							callback();
						}
					}
				};
				new_image.addEventListener("load", load_call, false)
				new_image.src = resource.url;
				this.loaded_images[resource.url] = new_image;
			}
			resource.image = this.loaded_images[resource.url];
		}
		this.resource_load_ready = true;
		if(!this.resource_loading_ids.length){
			console.log("Finished. Calling")
			callback();
		}
	}
}