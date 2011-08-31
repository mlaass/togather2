
define(['../jo/jo', 
        '../jo/Game',
        '../jo/Camera',
        '../jo/Animation',
        '../jo/TileMap',
        '../jo/math2d',
        './objects/Actor',
        './objects/Clone'], 
		function(jo, Game, Camera, Animation, Map, m2d, Actor, Clone){
	
	var game = new Game({ name: '#canvas', fullscreen: true, fps: 30});
	game.entities = [{type: 'player', name:'player', create: Actor }];
	
	game.setup(function(){
		game.load(['img/test.png', 
		           'img/player.png',
		           'img/player_record.png',
		           'img/player_shadow.png',
		           'img/device.png',
		           'img/tileset.png',
		           	], '/js/cloning/');
	}, true);
	
	game.ready(function(){
		game.state = 'start';
		game.cam = new jo.Camera();
		
		game.ts={};
		game.ts.solid = [0,1,2,3];
		game.ts.start = 5;
		game.ts.exit = 4;
		
		game.initPlayer();
		game.initLevel();		
		game.device= new jo.Animation([1,1,1], 80,42, jo.files.img.device);
		//jo.screen.debug=true;
		
	});
	game.initPlayer = function(){
		game.removeAllObjects();
		game.addObject('player', new Actor({name: 'player', position: new jo.Point(100, 64)}));
		game.player = game.getObject('player');
	};
	
	var caption = function(msg){
		jo.screen.text({ fill: jo.clr.white, stroke: 0}, new jo.Point(64, 32), msg);
	};
	game.OnDraw(function() {
		jo.screen.clear('#a5e63f');
		if(!jo.edit ){
			this.adjustcam();
		}
		var p = game.cam.toWorld();
		game.map.draw({cam: game.cam, x: p.x, y: p.y, width: jo.screen.width, height:jo.screen.height, grid: false}, new jo.Point(0,0), jo.screen);
		
		if(game.device ){
			var fr = 0;
			if(recording){
				fr = 2;
			}
			//game.device.draw({frame: fr}, new jo.Point(32, 32), jo.screen);
		}
		
		if(jo.dev){
			caption('Play Mode | FPS: '+parseInt(jo.screen.realFps)+' @ width:'+jo.screen.width+' height:'+jo.screen.height);
			jo.files.img.test.draw({pivot: 'center'}, new jo.Point(32, 32), jo.screen);
		}
	});
	game.adjustcam = function(){
		game.centerCam(game.getObject('player').pos.clone());
	};
	game.centerCam = function(p){
		var half = new jo.Point(jo.screen.width *0.5, jo.screen.height*0.5);
		game.cam.copy(p.minus(half));
		
		var mf = this.map.getFrame();
		
		game.cam.copy(new jo.Point(
				Math.min(mf.width - jo.screen.width, Math.max(0,game.cam.x)),									
				Math.min(mf.height - jo.screen.height, Math.max(-64, game.cam.y))
		));
	};
	game.initLevel= function(){
		game.records = [];
		game.resetRecording();
		game.moveToStart();

	};
	game.moveToStart = function(){
		var s = game.map.find(game.ts.start);
		var pl = game.getObject('player');
		
		if(typeof s !== 'undefined'){
			pl.moveTo(s.pos.plus(jo.point(16,0)));
		}else{
			pl.moveTo( new jo.Point(100, 64));
		}
	};

	game.levelDone = function(){
		if(typeof game._leveldone === 'function'){
			game._leveldone();
		}
		if(game.mode === 'play'){
			game.deleteRecords();
			game.initPlayer();
			game.initLevel();
			//alert('Level Done');
		}

	};
	
	var recording = false;
	var current_rec = 0;
	var rec_frame = 0;
	
	game.deleteRecords= function(){
		game.records = [];
		rec_frame = 0;
		current_rec = 0;
		game.resetRecording();		
	};
	game.resetRecording =function(){
		recording = false;
		current_rec = game.records.length;
		rec_frame = 0;
	};
	game.stopRecording= function(){
		game.player.rec = false;
		game.getObject('record'+current_rec).rec = false;
		recording = false;		
		current_rec += 1;
		rec_frame = 0;
	};
	game.startRecording= function(){
		recording = true;
		game.records[current_rec] = [];
		
		game.addObject('record' + current_rec, new Clone({
			name: 'record'+current_rec, 
			position: game.player.pos.clone()
		}));
		
		game.getObject('record' + current_rec).rec = true;
		game.player.rec = true;
	};
	game.OnUpdate(function(ticks){
		game.player = game.getObject('player');
		
		game.map.update(ticks);
		this.mobilecontrols();
		this.controls();
		this.handleCollision();
		
		if(recording){
			var p = game.player;
			game.records[current_rec].push({pos: p.pos.clone(), fr: p.fr});			
		}
		if(recording || current_rec>0){
			rec_frame+=1;
		}
		for(var i in game.records){
			var f = Math.min(game.records[i].length-1, rec_frame);
			game.obj['record'+i].pos = game.records[i][f].pos;
			game.obj['record'+i].fr = game.records[i][f].fr;
		}			
	});
	game.mobilecontrols =function(){
		if(jo.input.k('MOUSE1')){
			var d = game.cam.toWorld(jo.input.mouse).minus(game.player.pos);
			
			if(Math.abs(d.x) > Math.abs(d.y)){
				if(d.x > 16){
					this.player.side(1);
				}else if(d.x < -16){
					this.player.side(-1);
				}else{
					this.player.stand();
				}
			}else{
				this.player.jump();
			}
		}
	};
	game.controls = function(){
		if(jo.input.once('E')){
			game.device = true;
		}		
		if(jo.input.once('SPACE')){
			this.player.jump();
			$('#popup').hide();
			//$('#menu').hide();
		}
		if(jo.input.once('ESC')){
			//game.menu=$('#menu').show();
		}
		if(jo.input.k('RIGHT')){
			this.player.side(1);
		}else if(jo.input.k('LEFT')){
			this.player.side(-1);
		}else{
			this.player.stand();
		}
		if(!recording && jo.input.once('SHIFT') && game.device){			
			//jo.files.sfx.rrm.play();
			game.startRecording();
		}else if(recording && !jo.input.k('SHIFT') && game.device){
			//jo.files.sfx.clkclk.play();
			game.stopRecording();
			game.moveToStart();
		}
	};
	game.handleCollision = function(){	
		this.mapCollide3(game.map, game.getObject('player'));
		
		for(i in this.enemy){
			this.mapCollide(game.map, game.getObject(enemy[i]));
		}
		var others = [];
		for(i in this.records){
			if(i != current_rec){
				others.push(game.getObject('record'+i));
			}			
		}
		game.actorCollide2(game.getObject('player'), others);
	};
	game.actorCollide2 = function(actor, others){
		for(var i in others){
			if(m2d.intersect.boxBox(others[i], actor)){
				var ac = actor.pos.plus(jo.point(actor.width/2, actor.height/2)),
				oc = others[i].pos.plus(jo.point(others[i].width/2, others[i].height/2));
				var x, y;
				if(ac.y <= oc.y ){
					y = {mov: 'N', axis: 'y', dir: -1, depth: actor.pos.y+actor.height-others[i].pos.y };
				}
				else if(ac.y > oc.y){
					y = {mov: 'S', axis: 'y',dir:  1, depth:others[i].pos.y+others[i].height-actor.pos.y};
				}				
				if(ac.x <= oc.x){
					x = {mov: 'W', axis: 'x',dir: -1, depth:actor.pos.x+actor.width-others[i].pos.x };
				}
				else if(ac.x >oc.x){
					x = {mov: 'E', axis: 'x',dir:  1, depth:others[i].pos.x+others[i].width-actor.pos.x };
				}
				var mov=false;
				if(x.depth> y.depth && y.depth>=0){
					mov=y;
				}else if(x.depth>=0){
					mov=x;
				}
				if(typeof mov=== 'object'){
					actor.pos[mov.axis]+= mov.depth*mov.dir;
					if(mov.mov ==='N' ){
						actor.ground=true;
					}
				}				
			}				
		}
	};
	game.mapCollide3 = function(map, actor){
		var mf = map.getFrame();
		actor.pos.x = Math.min(mf.width-actor.width,Math.max(0,actor.pos.x));
		actor.pos.y = Math.min(mf.height,Math.max(0,actor.pos.y));
		if(actor.pos.y > mf.height-actor.height){
			game.moveToStart();
		}
		
		var tiles = game.tiles = map.getIntersection({x:actor.pos.x, y: actor.pos.y, width: actor.width, height: actor.height});
		if(tiles.length != 4){//be extra sure about it 
			//game.stopLevel();
		}else{
			var col=[], ti=[];
			for(var i in tiles){
				if(jo.includes(game.ts.solid, tiles[i].index) || tiles[i].index == 4){
					ti.push(i);
					if(m2d.intersect.boxBox(tiles[i], actor)){
						if(tiles[i].index == game.ts.exit){
							game.levelDone();
							jo.log('level done');
						}else{
							col.push(i);	
							tiles[i].hit = "yellow";
						}
					}
				}
			}
			/**
			 * |0|1|
			 * |2|3| tiles is ordered like that
			 */
			a_bottom =actor.pos.y+actor.height;
			a_right = actor.pos.x+actor.width;

			var axis = {N :{axis: 'y', dir: -1, depth: a_bottom-tiles[2].pos.y},
						S :{axis: 'y', dir:  1, depth: tiles[0].pos.y+tiles[0].height-actor.pos.y},
						E :{axis: 'x', dir:  1, depth: tiles[0].pos.x+tiles[0].width-actor.pos.x},
						W :{axis: 'x', dir: -1, depth: a_right-tiles[1].pos.x}};
			var mov=[];
			
			if(ti.length>=2){
				//move up
				if(jo.incl(ti,['2','3'])){
					mov.push('N');				
					if(jo.incl(ti,['0'])){
						mov.push('E');								
					}
					if(jo.incl(ti,['1'])){
						mov.push('W');								
					}
				}//move down
				else if(jo.incl(ti,['0','1'])){
					mov.push('S');
					if(jo.incl(ti,['2'])){
						mov.push('E');								
					}
					if(jo.incl(ti,['3'])){
						mov.push('W');								
					}
				}else{
					
					if(jo.incl(ti,['0','2'])){//move right
						mov.push('E');
					}//move left
					else if(jo.incl(ti,['1','3'])){
						mov.push('W');
					}else{
						if(jo.incl(ti, ['0','3'])){
							if(m2d.intersect.boxBox(tiles[1], {pos: actor.lp, width: actor.width, height: actor.height })){//topright
								mov.push('N');
								mov.push('E');
							}else{
								mov.push('S');
								mov.push('W');
							}
						}else if(jo.incl(ti, ['1','2'])){
							if(m2d.intersect.boxBox(tiles[0], {pos: actor.lp, width: actor.width, height: actor.height })){//topright
								mov.push('N');
								mov.push('W');
							}else{
								mov.push('S');
								mov.push('E');
							}
						}
					}
				}
			}else{
				if(jo.incl(ti,['0'])){ //S or E
					mov.push((axis.S.depth < axis.E.depth)? 'S': 'E');								
				}
				if(jo.incl(ti,['1'])){//S or W
					mov.push((axis.S.depth < axis.W.depth)? 'S': 'W');							
				}
				if(jo.incl(ti,['2'])){//N or E
					mov.push((axis.N.depth < axis.E.depth)? 'N': 'E');							
				}
				if(jo.incl(ti,['3'])){//N or W
					mov.push((axis.N.depth < axis.W.depth)? 'N': 'W');							
				}	
			}
			actor.ground=false;
			var applied =[];
			for(var i in mov){
				if(axis[mov[i]].depth >= 0){				
					if(!jo.incl(applied,[mov[i]])){
						actor.pos[axis[mov[i]].axis]+= axis[mov[i]].dir*axis[mov[i]].depth;
						applied.push(mov[i]);
					}				
					if(mov[i]==='N'){
						actor.ground=true;
					}
				}
			}	
		}
	};
	return game;
});