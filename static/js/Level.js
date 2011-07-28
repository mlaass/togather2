
define(['jo/jo', 'jo/TileMap'],function(jo, TileMap){
	
	var lvl = TileMap.extend({
		onNode: true
	});
	return lvl;
});