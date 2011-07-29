/**
 * Camera class keeps track of the current 
 * drawing position
 */

var Point = require('./point').Point;

var Camera module.exports.Camera = function(){
	Point.call(this);
};
Camera.prototype.toScreen = function(p){
	if(typeof p =='undefined'){
		return this.neg();
	}
	return p.minus(this);
};
Camera.prototype.toWorld = function(p){
	if(typeof p =='undefined'){
		return this;
	}
	return p.plus(this);
};
Camera.prototype.toMap = function(p, tilesize){
	if(typeof p =='undefined'){
		return null;
	}
	var tw = th = tilesize;
	
	if(! tilesize){
		tw=jo.game.map.tileSet.width;
		th=jo.game.map.tileSet.height;
	}
	var p= this.toWorld(p);
	p.x/=tw;
	p.y/=th;
	return p.floor();
};
Camera.prototype.parrallax = function(val, width, height){
	var para = this.mul(val);
	para.x = para.x % width;
	para.y = para.y % height;
	return para.negate();
};
