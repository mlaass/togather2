var mongoose = require('mongoose'),
	crypto = require('crypto'),
	redis = require('redis');

var Schema = mongoose.Schema,
	LevelSchema, 
	Level;
var createName = function(minlength, maxlength, prefix, suffix) {
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

var initData= function(){
		var a = [];
		for(var i=0; i< 16*16; i++){
			a.push({index: -1});
		}
		return a;
	},
	initName= function(){
		return createName(12, 14, 'level: ');
	};
LevelSchema = new Schema({
	  'name': {type: String, 'default': initName()},
	  'date': {type: Date, 'default': Date.now},
	  'lastUpdate': {type: Date, 'default': Date.now},
	  'creator': {type: Schema.ObjectId},
	  'width': {type: Number, 'default': 16},
	  'height': {type: Number, 'default': 16},
	  'data': {type: [], 'default': initData()}
});


mongoose.model('Level', LevelSchema);
Level = mongoose.model('Level');

module.exports.load = function(id, fn){
	Level.findById( id, function(err, lvl){
		if(lvl && !err){
			fn(null, lvl);
			return;
		}
		fn(err);
	});	
};

module.exports.create = function( fn){
	var lvl = new Level();
	lvl.save(function(err){
		if(err){
			console.log(err);
		}
		fn(err, lvl);
	});
};
module.exports.update = function(lvl, fn){
	lvl.lastUpdate = Date.Now();
	lvl = new Level(lvl);	
	lvl.save(function(err){
		fn(err, lvl);
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

if(process.env.NODE_ENV !== 'production'){
	mongoose.connect('mongodb://localhost:27017/togatherdev');
}else{
	//TODO: enter correct mongodb connection
	mongoose.connect('mongodb://dev:27017/togather');
}