var Grid = module.exports.Grid = function(opt) {
	this.name = opt.name;
	this._id= opt._id;
	this.width = this.height = 16;

	if(opt && opt.width && opt.height){
		this.width = opt.width;
		this.height = opt.height;
	}

	this.data = [];
	for( var i = 0; i < this.width * this.height; i++) {
		this.data.push(0);
	}
	this.clearTo({index: -1});
	if(typeof opt.data === 'string'){
		opt.data = JSON.parse(opt.data);
	}
	if(opt.data && opt.data.length === this.data.length){
		this.data = opt.data;
	}
};		

Grid.prototype.clearTo = function(value) {
	for ( var i = 0; i < this.width * this.height; i++) {
		this.data[i] = value;
	}
};
Grid.prototype.blit = function(grid, x, y, width, height) {
	if (typeof width === 'undefined') {
		width = grid.width;
	}
	if (typeof height === 'undefined') {
		height = grid.height;
	}

	width = Math.min(width, this.width - x);
	height = Math.min(height, this.height - y);
	for (var i = 0; i < height; i++) {
		for (var j = 0; j < width; j++) {
			this.put(x+j, y+i, grid.get(j,i));
		}
	}
};
Grid.prototype.get = function(x, y) {
	if (x >= 0 && x < this.width && y >= 0 && y < this.height) {
		return this.data[x + y * this.width];
	}
	console.log('grid.get out of bounds: ' + x + ' | ' + y);
};

Grid.prototype.put = function(x, y, value) {
	if(x >= 0 && x < this.width && y >= 0 && y < this.height){
		this.data[y * this.width + x] = value;
	}			
},

Grid.prototype.copy = function(frame){
	if(typeof frame === 'undefined'){
		frame = {};
		frame.x = 0;
		frame.y = 0;
		frame.width = this.width;
		frame.height = this.height;
	}
	frame.x = Math.max(0, frame.x);
	frame.y = Math.max(0, frame.y);
	frame.width = Math.max(this.width, frame.width);
	frame.height = Math.max(this.height, frame.height);

	copy = new Grid({width:frame.width, height:frame.height});

	for(var i = 0; i< frame.height; i++){
		for(var j = 0; j< frame.width; j++){
			copy.put(j,i,this.get(frame.x + j, frame.y + i));
		}
	}
	return copy;
};
Grid.prototype.shift = function(x, y, clear){
	var copy = this.copy();
	if(typeof clear !== 'undefined'){
		this.clearTo(clear);
	}
	this.blit(copy,x,y);
};
Grid.prototype.resize= function(width, height, clear){
	var copy = this.copy();
	this.width= width;
	this.height = height;
	this.data=[];
	for( var i = 0; i < this.width * this.height; i++) {
		this.data.push(0);
	}
	if(typeof clear !== 'undefined'){
		this.clearTo(clear);
	}
	this.blit(copy,0,0);
};

