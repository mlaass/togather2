define(['jo/jo', 'jo/TileMap'],function(jo, TileMap){
	//level
	var lvl = TileMap.extend({
		entities: [],
		add: function(entity){
			if(!entity || ! entity.type){
				throw new Error('Entity need to be defined!');
				return;
			}
			entity.id = this.entities.length;
			this.entities.push(entity);			
		},
		updateEntities: function(entities){
			this.entities = entities;
		},
		rename: function(name){
			this.name = name;
		}
	});
	return lvl;
});