define(['jo/jo', 'jo/Point', 'jo/Surface', './Level'], function(jo, Point, Surface, Level){	
	
	var exports={},
		socket = null;
	
	exports.init = function(game, fn){
		fn = fn || function(){};
		socket = $appdata.socket = io.connect($appdata.host);
		socket.on('connect', function() {
			socket.emit('handshake', {rediskey: $appdata.rediskey, levelId: levelId}, fn);
		});				
		
		socket.on('level', function(msg){
			console.log('grid');
			console.log(msg);
			//area.grid(msg);
		});
	};
	return exports;
});