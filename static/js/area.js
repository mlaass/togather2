define(['jo/jo', 'jo/Point'], function(jo, Point){
	var exports = {};
	
	var offset = jo.point(), toffset = jo.point(),
	cache = [],
	h = 16,
	w = 16;
	
	exports.init = function(cam, ioclient){
		exports.reload(cam);
	};
	
	exports.reload = function(cam){
		toffset = cam.dividedBy(jo.tilesize).floor();
		offset = cam.clone();
		
		$.get('/grid',{x: toffset.x, y: toffset.y, width: w, height: h}, function(frame){
			console.log('reloadframe');
			console.log(frame);
			cache = frame;
		});
		
	};
	
	exports.draw = function(cam, scr){
		if(cache.length = (h*w)){
			var p = jo.point();			
			for(var i = 0; i < h; i++){
				for(var j =0; j < w; j++){	
					p = jo.point(j, i).multiply(jo.tilesize).plus(offset).minus(cam);
					if(cache[i*w+j]){	
						scr.circle({fill: cache[i*w+j].color, stroke:0}, p.plus(jo.point(jo.tilesize/2,jo.tilesize/2)), jo.tilesize/2 -1);
						//scr.rect({fill: cache[i*w+j].color}, p, jo.tilesize, jo.tilesize);
					}else{
						scr.rect({fill: 0, stroke:'#5e3'}, p, jo.tilesize, jo.tilesize);
					}					
				}
			}
		}
	};
	
	exports.grid = function(msg){
		var p = jo.point(msg.x, msg.y).minus(toffset);
		exports.paint(p, msg);
	};
	exports.paint = function(p, tile){
		if(tile){
			if(p.x >= 0 && p.x < w && p.y >= 0 && p.y < h){
				cache[p.y*w+p.x] = tile;
			}
			$.post('/grid', {
				_method: 'PUT',			
				'tile[x]': p.x,
				'tile[y]': p.y,
				'tile[color]': tile.color});
		}

	};
	
	
	return exports;
});