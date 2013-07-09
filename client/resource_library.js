// Dependant on client.js
var resource_path = 'resources/'//'/rsc/fennel/'
client.resource = function (identifier){
	return this.resource_library.resource(identifier);
}
client.resource_library = {
	resource_load_ready: false,
	resource_loading_ids: Object.create(DM.list),
	resource: function (identifier){
		return this.library[identifier];
	},
	loaded_images: {},
	library: {
		// I - Graphics
		// I.a - Client Interface
		"hud": {url: resource_path + 'graphics/hud.png', x:0, y:0},
		"tomb": {url: resource_path + 'graphics/tomb.png', x:0, y:0, dirs: 1},
		// I.b - Mapping
		// I.b.1 - Tiles
		"plains": {url: resource_path + 'graphics/plains.png', states: {
			"floor": {url: resource_path + 'graphics/plains.png', x:0, y:0},
			"pillar": {url: resource_path + 'graphics/plains.png', x:1, y:0},
			"wall": {url: resource_path + 'graphics/plains.png', x:2, y:0},
			"water": {url: resource_path + 'graphics/plains.png', x:1, y:1},
			"test": {url: resource_path + 'graphics/plains.png', x:1, y:1},
		}},
		// I.b.2
		"ladder_up": {url: resource_path + 'graphics/common_tall.png', x:16, y:0, height: 32},
		"ladder_down": {url: resource_path + 'graphics/common_tall.png', x:0, y:0, height: 32, y_offset: -16},
		// I.c - Units
		// I.c.1 - Player Classes
		"adventurer": {url: resource_path + 'graphics/adventurer.png', x:0, y:0, animate:2, dirs:4},
		"archer": {url: resource_path + 'graphics/archer.png', x:0, y:0, animate:2, dirs:4},
		"acolyte": {url: resource_path + 'graphics/acolyte.png', x:0, y:0, animate:2, dirs:4},
		"knight": {url: resource_path + 'graphics/knight.png', x:0, y:0, animate:2, dirs:4},
		"mage": {url: resource_path + 'graphics/mage.png', x:0, y:0, animate:2, dirs:4},
		// I.c.2 - Enemies
		"bug1": {url: resource_path + 'graphics/enemies.png', x:0, y:0, animate:2, dirs:4},
		"bug2": {url: resource_path + 'graphics/enemies.png', x:0, y:32, animate:2, dirs:4},
		"bug3": {url: resource_path + 'graphics/enemies.png', x:64, y:0, animate:2, dirs:4},
		// Projectiles and Effects
		"fist": {url: resource_path + 'graphics/projectiles.png', width: 8, height: 8, x:0, y:0, dirs: 4},
		"fireball": {url: resource_path + 'graphics/projectiles.png', width: 8, height: 8, x:32, y:0, animate:2, dirs: 4},
		"shuriken": {url: resource_path + 'graphics/projectiles.png', width: 8, height: 8, x:64, y:0, animate:3}
	},
	setup: function (callback){
		console.log("Setting up resources");
		console.log("TODO:: Fix resource on noted line.");
		for(var key in this.library){
			var resource = this.library[key];
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