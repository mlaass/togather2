/**
 * defines an animation, needs a sprite as frame set,
 * define the frames' index and length in milliseconds and call run every frame.
 * 
 */

var events = require('events');

/**
 * @constructor
 * @param {jo.Sprite} sprite the frame set
 * @param {array} frames as  {i: {number} frameIndex, t: {number} time in ms}
 * or just time in milliseconds
 * @param {number} width width of one frame 
 * @param {number} height height of one frame
 */
function Animation(frames, width, height, sprite) {
    events.EventEmitter.call(this);
	this.sprite = (sprite) ? sprite : null;
	this.width = (width) ? width : 0;
	this.height = (height) ? height : 0;
	this.xoff = 0;
	this.yoff = 0;
	this.frames = this.readFrames(frames);
	this.frame = 0;
	this.tickCount = 0;
	this.start = true;
};
// inherit events.EventEmitter
Animation.super_ = events.EventEmitter;
Animation.prototype = Object.create(events.EventEmitter.prototype, {
    constructor: {
        value: Animation,
        enumerable: false
    }
});
		
/**
 * reads and transforms an array of frames
 * @param frames
 * @returns the transformed frames array
 */
Animation.prototype.readFrames = function(frames){
	if(typeof frames === 'undefined'){
		frames = [100];
	}
	if(typeof frames.length !== 'undefined'){
		for(var i=0; i< frames.length; i++){
			frames[i] = typeof frames[i] === 'object'? frames[i] : {i: i, t: frames[i]};
					
			frames[i].drawFrame = this.calcFrame(frames[i].i);					
		}
	}
	return frames;
};
/**
 * @description advances the animation
 * @param {number} ticks milliseconds to advance
 */
Animation.prototype.update = function(ticks){
	if(this.start === true ){
		this.emit('start');
		this.frame = this.frame % this.frames.length;
	}
	
	this.tickCount += ticks;
	if(this.frames[this.frame].t - this.tickCount <= 0 ){
		this.tickCount -= this.frames[this.frame].t;
		this.frame +=1;	
		this.emit('frame', this.frame);
	}
	
	if(this.frame >= this.frames.length ){
		this.emit('finish', this.frame);
		this.start = true;
		this.frame = this.frame % this.frames.length;
	}
};
/**
 * @description draw the current frame
 * @param position
 * @param surface
 * @param options
 */
Animation.prototype.draw = function(position, surface, options){
	if(this.sprite){
		options.frame = this.frames[this.frame].drawFrame;
		this.sprite.draw(position, surface, options);
	}
	this.emit('draw', position, surface, options);
};
/**
 * calculates a frame rectangle for use with sprite.draw
 * @param frame
 * @returns {Object}
 */
Animation.prototype.calcFrame = function(frame){
	var cols = Math.floor(this.sprite.width / this.width);
	return {
		x: this.xoff + ((frame % cols)) * this.width,
		y: this.yoff + Math.floor(frame / cols) * this.height, 
		width: this.width, 
		height: this.height				
	};
};
/**
 * returns a stored frame object for the specified frame
 * @param frame
 * @returns
 */
Animation.prototype.getDrawFrame = function(frame){
	if(!frame || frame >= this.frames.length){
		frame = 0;
	}
	return this.frames[frame].drawFrame;
};
