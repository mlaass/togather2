var events = require('events');

module.exports = Yoda;

function Yoda() {
    events.EventEmitter.call(this);
    this.functions = {};
}
// inherit events.EventEmitter
Yoda.super_ = events.EventEmitter;
Yoda.prototype = Object.create(events.EventEmitter.prototype, {
    constructor: {
        value: Yoda,
        enumerable: false
    }
});

Yoda.prototype.sync = function(name, obj){
	var self = this;
	var fn = function(){
		obj[name].apply(obj, arguments);
		self.emit('sync', arguments);
	};	
	fn.self = obj;
	this.functions[name] = fn;
	return this;
};
Yoda.prototype.call = function(name){
	arguments.splice(0,1);
	if(this.functions[name]){
		this.functions[name].apply(this, arguments);
	}
	return this;
};

Yoda.prototype.apply = function(name, args){
	if(this.functions[name]){
		this.functions[name].apply(this, args);
	}
	return this;
};