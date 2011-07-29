define(['../../jo/jo', '../../jo/Object'],function(jo, Object){
	
	jo.Enemy = jo.Object.extend({
		
		joObject: 'Enemy',
		
		init: function(options){
			this._super(options);
			this.name = options.name;
			this.pos = options.position.clone();
			this.lp= this.pos.clone();
			this.width = this.height = 32;
			this.ground = false;
			this.landed= 200;
			this.wall=false;
		},
		draw: function(srf){
			this._super(srf);
			var p = jo.game.cam.toScreen(this.pos);
			srf.rect({fill:this.ground?'#00ff00':'#ff00ff', stroke: 'white'}, p,this.width, this.height);
			srf.text({fill:'#999', align: 'left', baseline: 'bottom', font:'12px console', stroke: 0}, p, this.name);
		},
		update: function(ticks){
			var pp = this.pos.clone();
			
			if(!this.ground){
				this.pos.y+=1;
				this.pos.y += this.pos.y-this.lp.y;
				this.pos.x += this.pos.x-this.lp.x;
			}else{
				this.landed+=ticks;
				this.pos.x += (this.pos.x-this.lp.x)*0.5;
			}
			
			this.lp = pp;
			
			
		},
		v: function(){
			return this.pos.minus(this.lp);
		},
		jump: function(){
			if(this.ground && this.landed > 25){
				this.ground = false;
				this.pos.y -= 14;
				this.side(this.dir);
				this.landed=0;
			}
		},
		side: function(dir){
			this.dir= dir;
			if(this.ground){
				this.pos.x+=6*dir;
			}else if(this.wall){}else{
				this.pos.x+=1*dir;
			}
		},
		stand: function(){
			this.dir=0;
		}
	});
	return jo.Enemy;
});