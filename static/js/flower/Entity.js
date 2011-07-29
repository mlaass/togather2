var events = require('events'),
	point = require('./point');


module.exports = function(what){
	return new Entity(what);
};

/**
 * @constructor
 * @param {jo.Sprite} sprite the frame set
 * @param {array} frames as  {i: {number} frameIndex, t: {number} time in ms}
 * or just time in milliseconds
 * @param {number} width width of one frame 
 * @param {number} height height of one frame
 */
var Entity = module.exports.Entity = function(what) {
	events.EventEmitter.call(this);
	this.pos = point.create();
	for(var i in what ){
		if(!this[i]){
			this[i]= what[i];
		}
	}
};
// inherit events.EventEmitter
Entity.super_ = events.EventEmitter;
Entity.prototype = Object.create(events.EventEmitter.prototype, {
    constructor: {
        value: Entity,
        enumerable: false
    }
});
Entity.prototype.draw = function(srf){
	this.emit('draw', srf);
};
Entity.prototype.update = function(ticks){
	this.emit('update', ticks);
};