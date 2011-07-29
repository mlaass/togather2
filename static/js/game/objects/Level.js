define(['../jo/src/jo','../jo/src/TileMap', '../jo/src/Object'],function(jo, TileMap, Object){
	
	
	jo.Level = jo.Object.extend(new jo.tileMap(null, 16, 16, null));
	
	jo.Level = jo.Level.extend({
		
		init: function(options){
			this.options = options;
			this.objects = [];
			this.joObject= this.joObject;
			this._super(options.tileset, options.width, options.height, options.data);
		
		},
		load: function(data){
			for(i in data){
				this[i] = data[i];
			}			
		},
		toJSON: function(){
			
		}
	});

	return jo.Level;
});