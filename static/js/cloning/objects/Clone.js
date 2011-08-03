
define(['../../jo/jo','./Actor'], function(jo, Actor){
	jo.Clone = Actor.extend({
		init: function(options){
			this._super(options);
		},
		update: function(ticks){
			this.lp= this.pos.clone();
		},
		hit: function(){
			
		}
	});
	return jo.Clone;
});