var mongoose = require('mongoose'),
	crypto = require('crypto'),
	redis = require('redis');

var Schema = mongoose.Schema,
	UserSchema, 
	User,
	PendingSchema,
	Pending,
	rediscli = redis.createClient();

var emailfilter = /^([a-zA-Z0-9_\.\-])+\@(([a-zA-Z0-9\-])+\.)+([a-zA-Z0-9]{2,4})+$/,
	makeSalt = function() {
		return Math.round((new Date().valueOf() * Math.random())) + '';
	},
	encrypt = function(salt, str){
		return crypto.createHmac('sha1', salt).update(str).digest('hex');
	},
	rndcolor = function(){
		var c = ['r','g','b'];
		for(var i = 0; i< 3; i++){
			c[i] = Math.floor(Math.random()*255).toString(16);
			if(c[i].length === 1){
				c[i]= '0'+c[i];
			}
		}
		return '#'+c[0]+c[1]+c[2];
	};

UserSchema = new Schema({
	  'email': { type: String, validate: [emailfilter, 'a valid email is required'], index: { unique: true } },
	  'name': String,
	  'color': {type: String, 'default': rndcolor},
	  'role': {type: String, 'default': 'user'},
	  'date': {type: Date, 'default': Date.now},
	  'hashed_password': String,
	  'salt': String
});

UserSchema.method('auth', function(plainText) {
	return this.encryptPassword(plainText) === this.hashed_password;
});

UserSchema.method('makeSalt', makeSalt);

UserSchema.method('encryptPassword', function(password) {
	return crypto.createHmac('sha1', this.salt).update(password).digest('hex');
});

UserSchema.pre('save', function(next) {	
	if (this.password && this.password.length > 4 ) {
		next();
	} 
else {		
		next(new Error('Invalid password, needs at least 5 characters'));
	}
});

UserSchema.virtual('password').set(function(password) {
	 this._password = password;
	 this.salt = this.makeSalt();
	 this.hashed_password = this.encryptPassword(password);
	 
}).get(function() { 
	return this._password; 
});

mongoose.model('User', UserSchema);
module.exports.User = User = mongoose.model('User');

PendingSchema = new Schema({
	'hash': {type: String, 'default': encrypt(makeSalt(), 'well this is fun'), index: {unique: true}},
	'email': { type: String, validate: [emailfilter, 'a valid email is required']},
	'date': {type: Date, 'default': Date.now}	
});
PendingSchema.pre('save', function(next){
	User.findOne({email: this.email}, function(err, user){
		if(err){
			next(err);
		}else{
			next();
		}
	});
});
mongoose.model('Pending', PendingSchema);
Pending = mongoose.model('Pending');


module.exports.role = function(user, role){	
	return user.role === role || user.role=== 'admin';
};
module.exports.auth = function(email, password, call){
	User.findOne({email: email}, function(err, user){
		if(user && user.auth(password)){
			call(null, user);
			return;
		}
		call(new Error('Wrong email/password combination'));
	});	
};
module.exports.findByMail = function(email,call){
	User.findOne({email: email}, function(err, user){
		if(user){
			call(null, user);
			return;
		}		
		call(new Error('email not registered'));
	});
};
module.exports.register = function(user, call){
	if(user.password !== user.repassword){
		call(new Error('confirmation password must be identical.'), user);
		return;
	}
	delete user.repassword;
	user.role = 'user';
	user = new User(user);

	user.save(function(err){
		if(err){
			console.log(err);
		}
		call(err, user);
	});
};
module.exports.update = function(user, call){
	user.role = 'user';
	delete user.repassword;
	user = new User(user);	
	user.save(function(err){
		call(err, user);
	});
};
module.exports.forgotPassword = function(email, call){
	Pending.findOne({email:email}, function(err, pending){
		if(! pending){
			pending = new Pending({email: email});
			pending.save(function(err){
				call(err, pending);
			});
		}else{
			pending.remove(function(err){
				var pending = new Pending({email: email});
				pending.save(function(err){
					call(err, pending);
				});
			});
		}
	});	
};
module.exports.findPending = function(search, call){
	Pending.findOne(search, function(err, pending){
		if(err){
			call(err, pending);
			return;
		}
		if(!pending){
			call(new Error('your trying to reach an invalid key'), pending);
			return;
		}
		call(err, pending);
	});
};
module.exports.resetPassword = function(query, call){
	query = query || {};
	
	Pending.findOne({hash: query.hash}, function(err, pending){
		if(err){
			call(err);
			return;
		}
		if(! pending){
			call(new Error('invalid key'));
			return;
		}
		console.log(pending);
		User.findOne({email: pending.email}, function(err, user){
			if(err){
				call(err);
				return
			}
			user.password = query.password;
			user.save(function(err){
				call(err, user);
				pending.remove(function(err){
					if(err){
						console.log(err);
					}
				});
			});			
		});		
	});
};

if(process.env.NODE_ENV !== 'production'){
	mongoose.connect('mongodb://localhost:27017/togatherdev');
}else{
	//TODO: enter correct mongodb connection
	mongoose.connect('mongodb://localhost:27017/togatherdev');
}
