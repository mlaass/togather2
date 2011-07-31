
define(['jo/jo', 'jo/TileMap'],function(jo, TileMap){
	
	var lvl = TileMap.extend({
		objects: [],
		add: function(options){
			if(!options){
				throw new Error('options need to be defined!');
			}
			if(!options.name){
				
			}
			this.objects[options.name] = new jo.entities[options.type](options);
		},
		rename: function(name){
			this.name = name;
		}
	});
	return lvl;
});