require(['jo/jo', 'jo/Game','jo/Camera', 'jo/Animation', 'Level', 'ioclient', 'sidebar', 'chat','game/main'], 
		function(jo, Game, Camera, Animation, Level, ioclient, sidebar, Chat, game){	
	//one global variable to rule them all very useful with the browser console
	$jo=jo;

	//the game object needs id of the canvas 
	var editor = jo.editor = new Game({ name: '#canvas', fullscreen: true, fps: 30});
	editor.setup(function(){
		//preloading of the files we need
		editor.load(['img/logo.png',
		           'img/player.png',
		           'img/tileset.png'], '/');	
		
		editor.cam = new jo.Camera(0,0);
		editor.chat = new Chat();
		editor.sb = sidebar;		
	});

	editor.ready(function(){		
		jo.state = 'edit';
		editor.ts = new jo.TileSet({tiles:[0,1,2,3, [{i:4, t:800 }, {i:5, t: 600 }], 6],width: 64, height: 64, sprite: jo.files.img['tileset']});
		editor.sb.setup();
		
		jo.game = game;
		ioclient.init(function(answer){	
			if(answer.session){
				console.log('connected');
				console.log(answer);
				editor.connection = true;
				if(answer.level){
					editor.map = new Level(answer.level);
				}else{
					editor.map = new Level({width:12, height:12});
				}				
				editor.map.tileSet = editor.ts;
				
				ioclient.sync('resize', editor.map, 'grid');
				ioclient.sync('put', editor.map, 'grid');
				ioclient.sync('shift', editor.map, 'grid', true);
				ioclient.sync('rename', editor.map, 'grid');
				
				ioclient.sync('post', editor.chat, 'chat', true);
				
				
				$('#loading').hide();
			}
		});		
				
	});
	
	//main editor loop
	editor.OnUpdate(function(ticks){
		editor.editControls();
	});
	editor.tileBrush = 0;
	editor.editControls= function(){
		//player.pos.copy(editor.cam.toWorld(jo.input.mouse));
		if(jo.input.k('D') ){
			jo.log(editor.map.data);
		}
		if(jo.input.once('P') ){
			var lvl = editor.saveLevel();
			jo.log(lvl.json);
		}

		if(jo.input.k('CTRL')|| jo.input.k('ALT')){

			 if(jo.input.k('UP')){
				 editor.map.shift(0,-1,{index: -1});
			 }
			 if(jo.input.k('DOWN')){
				 editor.map.shift(0,1,{index: -1});
			 }
			 if(jo.input.k('LEFT')){
				 editor.map.shift(-1,0,{index: -1});
			 }
			 if(jo.input.k('RIGHT')){
				 editor.map.shift(1,0,{index: -1});
			 }
		}
		if(jo.input.once('TAB')){
			editor.tileBrush = (editor.tileBrush+1)%editor.map.tileSet.tiles.length;
		}
		if(jo.tool==='pick'){
			if(jo.input.once('MOUSE1')){
				for(var i in editor.objects){
					if(m2d.intersect.pointBox( editor.cam.toWorld(jo.input.mouse), editor.objects[i])){
						editor.sb.select = editor.selection= i;
						
						editor.sb.fillInspector();
					}
				}
			}else if(jo.input.k('MOUSE1') ){
				if(editor.selection){
					editor.objects[editor.selection].pos.copy(editor.cam.toWorld(jo.input.mouse));
				}
			 }else{
				 editor.selection=false;
			 }
		}
		
		if(jo.tool==='drag'){
			 if(jo.input.k('MOUSE1') ){
				editor.cam.subtract(jo.input.mouseMovement());
			 }
		}
		if(jo.tool==='tile'){
			if(jo.input.k('MOUSE1')){
				var p=editor.cam.toMap(jo.input.mouse);
				editor.map.put(p.x, p.y, {index: editor.tileBrush});
			}
			if(jo.input.k('MOUSE2')){
				var p=editor.cam.toMap(jo.input.mouse);
				editor.map.put(p.x, p.y, {index: -1});
			}
		}
	};
	var caption = function(msg){
		jo.screen.text({align: 'center', fill: 'white', stroke: 0}, jo.point(jo.screen.width/2, jo.screen.height/2), msg);
	};
	
	//main drawing loop get called after each update
	editor.OnDraw(function() {
		jo.screen.clear(jo.color(0,0,0));
		
		if(editor.map){
			//var p = editor.cam.toWorld();
			
			p = editor.cam.toScreen();
			editor.map.draw({cam: editor.cam, x: p.x, y: p.y, width: jo.screen.width, height:jo.screen.height, grid: true}, new jo.Point(0,0), jo.screen);
		}

		jo.files.img.logo.draw({angle: (jo.screen.frames/60)*Math.PI, pivot: 'center'}, jo.point(jo.screen.width-48,jo.screen.height-48), jo.screen);				
	});	
});