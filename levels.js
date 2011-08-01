var mongoose = require('mongoose'),
	crypto = require('crypto'),
	redis = require('redis'),
	users = require('./users');

var Schema = mongoose.Schema,
	LevelSchema, 
	Level,
	TileSchema;

function createName(minlength, maxlength, prefix, suffix) {
	var rnd = function(minv, maxv){
		if (maxv < minv)
			return 0;
		return Math.floor(Math.random() * (maxv - minv + 1)) + minv;
	};
	prefix = prefix || '';
	suffix = suffix || '';
	// these weird character sets are intended to cope with the nature of
	// English (e.g. char 'x' pops up less frequently than char 's')
	// note: 'h' appears as consonants and vocals
	var vocals = 'aeiouyh' + 'aeiou' + 'aeiou',
	cons = 'bcdfghjklmnpqrstvwxz' + 'bcdfgjklmnprstvw' + 'bcdfgjklmnprst',
	allchars = vocals + cons;	
	var length = rnd(minlength, maxlength) - prefix.length - suffix.length;
	if (length < 1){
		length = 1;
	}		
	var consnum = 0;
	if (prefix.length > 0) {
		for ( var i = 0; i < prefix.length; i++) {
			if (consnum == 2){
				consnum = 0;
			}				
			if (cons.indexOf(prefix[i]) != -1) {
				consnum++;
			}
		}
	} else {
		consnum = 1;
	}

	var name = prefix, touse = vocals;
	for ( var i = 0; i < length; i++) {
		// if we have used 2 consonants, the next char must be vocal.
		if (consnum == 2) {
			touse = vocals;
			consnum = 0;
		} else{
			touse = allchars;
		}			
		// pick a random character from the set we are goin to use.
		var c = touse.charAt(rnd(0, touse.length - 1));
		name = name + c;
		if (cons.indexOf(c) != -1){
			consnum++;
		}			
	}
	name = name.charAt(0).toUpperCase() + name.substring(1, name.length)+ suffix;
	return name;
};
function initData(){
	var a = [];
	for(var i=0; i< 16*16; i++){
		a.push({index: -1});
	}
	return JSON.stringify(a);
};
function initName(){
	return createName(4, 7)+' '+createName(5,9);
};

function setData(data){
	if(typeof data !=='string'){
		data = JSON.stringify(data);
	}
	return data;
};
function getData(data){
	if(typeof data ==='string'){
		data= JSON.parse(data);
	}
	return data;
};
LevelSchema = new Schema({
	  'name': {type: String, 'default': initName()},
	  'date': {type: Date, 'default': Date.now},
	  'lastUpdate': {type: Date, 'default': Date.now},
	  'creator': {type: Schema.ObjectId},
	  'creatorName': {type: String, 'default': 'anonymous'},
	  'width': {type: Number, 'default': 16},
	  'height': {type: Number, 'default': 16},
	  'data': {type: String, 'default': initData()}
});
LevelSchema.pre('save', function(next) {
	console.log(this.creator);
	next();
});

mongoose.model('Level', LevelSchema);
module.exports.Level = Level = mongoose.model('Level');

module.exports.load = function(id, fn){
	Level.findById( id, function(err, lvl){
		if(lvl && !err){
			fn(null, lvl);
			return;
		}
		fn(err);
	});	
};

module.exports.create = function(userId, fn){
	users.User.findOne({_id: userId}, function(err, user){
		if(err){
			console.log(err);
			fn(err, null);
		}
		console.log(user.name + ' created a level');
		var level = new Level();
		level.creator = user._id;
		level.creatorName = user.name;
		
		
		level.save(function(err){
			if(err){
				console.log(err);
			}
			console.log(user.name + ' created the level: '+ level.name);
			fn(err, level);
		});
	});

};
module.exports.update = function(lvl){
	lvl.lastUpdate = Date.now();
	console.log('assign lvl');
	lvl = new Level(lvl);
	lvl.save(function(err){
		console.log(err);
	});
};
module.exports.getByName = function(name, fn){
	Level.findOne({name: name}, function(err, lvl){
		if(lvl){
			fn(null, lvl);
			return;
		}		
		fn(new Error('name not registered'));
	});
};
module.exports.getAll= function(fn){
	Level.find()
	.sort('lastUpdate', 'descending')
	.exec(function(err, levels){
		if(levels && !err){
			fn(null, levels);
		}else{
			fn(err, levels);
		}
	});
};
module.exports.getNumFrom = function(num, from, fn){
	Level.find()
	.sort('lastUpdate', 'descending')
	.skip(from)
	.limit(num)
	.exec(function(levels){
		if(levels && !err){
			fn(null, levels);
		}else{
			fn(err, levels);
		}
	});
};
//module.exports.callFn = function(id, name, args){
//	mongoose.connection.db.eval('grid:call({name:'+name+'id:'+id+', args:'+JSON.stringify(args)+'}', function(err){
//		
//	});
//};
//
//mongoose.connection.db.collection('system.js', function(err, js){
//	var db = mongoose.connection.db;
//	
//	var gridput = function(grid, x, y, val){
//		grid.data[x + grid.width*y] = val;
//		return grid;
//	},gridget = function(grid, x, y){
//		return grid.data[x + grid.width*y];		
//	},
//	gridblit = function(src, tgt, x, y, w, h){
//		w = Math.min(w, tgt.width-x);
//		h = Math.min(h, tgt.height-y);
//		for(var i = 0; i < h; i++){
//			for(var j = 0; j < w; j++){
//				gridput(tgt, x+j, y+i, gridget(j,i));
//			}
//		}
//		return tgt;
//	},
//	gridcopy = function(grid){
//		var copy = {
//				width: width,
//				height: height,
//				data: []
//			};
//		for(var i=0; i< grid.data.length; i++){
//			copy.data.push(grid.data[i]);
//		}
//		return copy;
//	},
//	gridclear = function(grid){
//		grid.data=[];
//		for(var i=0; i< grid.data.length; i++){
//			grid.data.push(empty);
//		}
//		return grid;
//	},
//	newgrid = function(width, height, empty){
//		var grid = {
//			width: width,
//			height: height,
//			data: []
//		};
//		for(var i=0; i< width*height; i++){
//			grid.data.push(empty);
//		}
//		return grid;
//	},
//	gridshift = function(grid, x, y, empty){
//		var copy = gridcopy(grid);	
//		grid = cleargrid(grid, empty);
//		return blit(copy, grid, x, y);
//	},
//	gridresize = function(grid, width, height, clear){
//		var copy = gridcopy(grid);
//		grid.width= width;
//		grid.height = height;
//		grid.data=[];
//		for( var i = 0; i < width * height; i++) {
//			grid.data.push(clear);
//		}
//		gridblit(copy, grid,0,0, copy.width, copy.height);
//		return grid;
//	},
//	gridrename= function(grid, name){
//		grid.name = name;
//		return grid;
//	};
//	js.insert({_id: 'gridput', value : gridput.toString()});
//	js.insert({_id: 'gridget', value : gridget.toString()});
//	js.insert({_id: 'gridblit', value : gridblit.toString()});
//	js.insert({_id: 'gridcopy', value : gridcopy.toString()});
//	js.insert({_id: 'gridclear', value : gridclear.toString()});
//	js.insert({_id: 'newgrid', value : newgrid.toString()});
//	js.insert({_id: 'gridshift', value : gridshift.toString()});
//	js.insert({_id: 'gridresize', value : gridresize.toString()});
//	js.insert({_id: 'gridrename', value : gridrename.toString()});
//
//	gridcall = function(cmd){
//		var g = db.levels.findOne({'_id': cmd.id});
//		g.data = JSON.parse(grid.data);
//		cmd.args.splice(0,0,g);
//		
//		g = grid[cmd.id].apply();
//		
//		g.data = JSON.stringify(dat);
//		db.levels.save(g);
//	}, gridinit = function(){
//		grid=[];
//		grid['put'] = gridput;
//		grid['rename'] = gridrename;
//		grid['resize'] = gridresize;
//		grid['shift'] = gridshift;	
//		return 'grid initalized in mongodb!';
//	};	
//	js.insert({_id: 'gridcall', value : gridcall.toString()});
//	js.insert({_id: 'gridinit', value : gridinit.toString()}, function(){
//		db.eval('gridinit();', function(err, ret){
//			console.log(err);
//			console.log(ret);
//		});
//	});
//
//});

if(process.env.NODE_ENV !== 'production'){
	mongoose.connect('mongodb://localhost:27017/togatherdev');
}else{
	//TODO: enter correct mongodb connection
	mongoose.connect('mongodb://dev:27017/togather');
}