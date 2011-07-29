define(['../../jo/jo', '../../jo/Object'], function(jo, Object){
	
	jo.Actor = jo.Object.extend({
		
		joObject: 'Actor',
		
		init: function(options){
			this._super(options);
			this.name = options.name;
			this.pos = options.position.clone();
			this.lp= this.pos.clone();
			this.width = this.height = 32;
			this.ground = false;
			this.landed= 200;
			this.wall=false;
			this.rec = false;
			this.rec_anim= new jo.Animation([1,1,1,1,1,1], 48, 48, jo.files.img.player_record);
			
			if(this.name==='player'){
				this.anim= new jo.Animation([1,1,1,1,1,1], 48, 48, jo.files.img.player);				
			}else{
				this.anim= new jo.Animation([1,1,1,1,1,1], 48, 48, jo.files.img.player_shadow);

			}
			
		},
		draw: function(opt, pos, srf){
			this._super(srf);
			var p = jo.game.cam.toScreen(this.pos);

			var sp = p.minus(new jo.Point(5,11));
			var v = this.v();
			if(this.name==='player'){
				this.fr= 0;
				if(!this.ground)
					this.fr=1;
				if(v.x>0.1){
					this.fr=2;
					if(!this.ground)
						this.fr=4;
				}else if(v.x<-0.1){
					this.fr=3;
					if(!this.ground)
						this.fr=5;
				}
			}
			
			this.anim.frame = this.fr;
			if(this.rec){
				this.rec_anim.frame = this.fr;
				//this.rec_anim.draw({frame: this.fr},sp, jo.screen);
			}else{
				//this.anim.draw({} ,p, srf);
			}
			if(jo.dev ||true){
				srf.rect({fill:this.ground?'rgba(0,255,0,0.5)':'rgba(255,0,255,0.5)', stroke: 'white'}, p, this.width, this.height);
				srf.text({fill:'#999', align: 'left', baseline: 'bottom', font:'12px console', stroke: 0}, p, this.name);
			}
			
			
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
				this.pos.y -= 17;
				this.side(this.dir);
				this.landed=0;
				//jo.files.sfx.ja.play();
			}
		},
		hit: function(){
				this.ground = false;
				this.pos.y -= 14;
				this.side(this.dir);
				this.landed=0;
				//jo.files.sfx.uh.play();
		},
		side: function(dir){
			this.dir= dir;
			if(this.ground){
				this.pos.x+=4*dir;
			}else if(this.wall){}else{
				this.pos.x+=0.5*dir;
			}
		},
		stand: function(){
			this.dir=0;
		},
		moveTo: function(p){
			this.pos.copy(p);
			this.lp.copy(p);
		}
	});
	return jo.Actor;
});