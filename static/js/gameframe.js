

require(['jo/jo', 'jo/Game','jo/Camera', 'jo/Animation', 'Level', 'cloning/game'], 
		function(jo, Game, Camera, Animation, Level, game){	
	//one global variable to rule them all very useful with the browser console
	$jo=jo;
	jo.dev=true;
	
	var levels = jo.levels= 0;
	var currentLevel = 0;
	$.ajax({
	  url: '/json/levels',
	  success: function( data ) {
	    levels = jo.levels = data;
	    console.log(levels);
	  }
	});

	//the game object needs id of the canvas 
	var gframe = jo.gframe = new Game({ name: '#canvas', fullscreen: true, fps: 30});
	gframe.setup(function(){
		//preloading of the files we need
		game.runSetup();
		gframe.load(['img/logo.png',
		           'img/player.png',
		           'img/tileset.png'], '/');	
		
		gframe.cam = new jo.Camera(0,0);
		jo.screen.debug=true;
	});

	gframe.ready(function(){		
		jo.state = 'play';
		gframe.ts = new jo.TileSet({tiles:[0,1,2,3, [{i:4, t:800 }, {i:5, t: 600 }], 6],width: 64, height: 64, sprite: jo.files.img['tileset']});
		jo.game = game;
		game.mode = 'play';
		game._leveldone = function(){
			currentLevel=(currentLevel+1)%levels.length;
			
			gframe.map = new Level(jo.levels[currentLevel]);
			gframe.map.tileSet = gframe.ts;
			game.map = gframe.map;
		};
	});
	gframe.OnUpdate(function(ticks){
		if(levels){
			gframe.map = new Level(jo.levels[currentLevel]);
			gframe.map.tileSet = gframe.ts;
			game.map = gframe.map;
			
			jo.game.runReady();
		}		
	});
	gframe.OnDraw(function(ticks){
	});
});

