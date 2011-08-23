
var express = require('express'), 
	sys = require('sys'), 
	fs = require('fs'),
	app = express.createServer(),
	users = require('./users'),
	levels = require('./levels'),
	mail = require('./mail'),
	socket = require('socket.io'),
	RedisStore = require('connect-redis')(express),
	redis = require('redis'),
    redisclient = redis.createClient(),
    markdown = require('node-markdown').Markdown,
    io = require('./io'),
    Grid = require('./grid').Grid,
    help = require('./helpers');

//environement for google analytics and the like
var env = {
		googa: '',
		help:'helpfile',
		betalimit: 20
};
var secretphrase = 'I think we can work something out...';

app.configure(function(){    
    app.use(express.bodyParser());
    app.use(express.methodOverride());
    app.use(express.cookieParser());
    app.use(express.session({ store: new RedisStore, secret: secretphrase }));
    app.use(app.router);
    fs.readFile(__dirname + '/views/help.md', function(err, data){
    	
  	  if(!err){
  		  env.help = data;  
  	  }	else{
  		console.log(err);
  	  }
    });
});
var dt = Date.now();

app.configure('development', function(){
    app.use(express.static(__dirname + '/static'));
    app.use(express.errorHandler({ dumpExceptions: true, showStack: true }));
    env.googa = 'dev = true;';
});

app.configure('production', function(){
	//
  var oneYear = 31536000000;
  app.use(express.static(__dirname + '/static', { maxAge: oneYear/365 }));
  app.use(express.errorHandler());
  fs.readFile(__dirname + '/googa.txt', function(err, data){
	  if(!err){
		  env.googa = data;  
	  }	
  });
});
app.set('view engine', 'jade');

app.dynamicHelpers({
	sessionId: function(req, res){
		return req.session.sid;
	},
	origin: function(req,res){
		return req.route.path;
	},
	user: function(req, res){
		return req.session.user;
	},
	flash: function(req, res){
		return req.flash();
	},
	host: function(req, res){
		return req.header('host');
	},
	startscript: function(req,res){
		return "$appdata={ rediskey:'"+req.sessionID +"', "+
		 "host:'http://"+req.header('host')+"'};";
	},
	googleAnalytics: function(req,res){
		return env.googa;
	},
	help: function(req, res){
		return env.help;
	}
});

var title= function(name){
	return 'Togather - '+name;
};
var initSession = function (req, res, next){
	next();
};
var checklogin =function(role){	
	return function (req, res, next){
		if(req.session.user && users.role(req.session.user, role)){
			next();
		}else{
			res.redirect('/login?redir='+req.url);
		}	
	};
};

var all = [initSession],
	login = [initSession, checklogin('user')],
	admin = [initSession, checklogin('admin')];
/**
 * pages
 */
app.get('/', all, function(req, res){
	
	if(req.session.user){
		levels.Level.find({creator: req.session.user._id})
		.sort('lastUpdate', 'descending')
		.exec(function(err, levels){
			if(err){
				req.flash('warn', err.message);
			}
			res.render('dashboard', {locals: {
				title: title('Dashboard'),
				levels: decorateLevels(req, res, levels) 
			}});
		});
		
	}else{
		res.render('front', {locals: {
			title: title('Welcome')
		}});
	}

});

app.get('/dev', admin, function(req, res){
	res.render('dev', {locals: {
		title: title('dev console')
	}});
});

app.get('/level/create', login, function(req, res){
	levels.create(req.session.user._id, function(err, lvl){
		if(err){
			req.flash('warn', err.message);
			res.redirect('/level/list');
	
		}else{
			res.redirect('/level/'+lvl._id+'/edit');
		}
	});
});

app.get('/level/:level/edit', login, function(req, res){
	if(req.params.level==='newlevel'){
		res.redirect('/create');
	}else{
		levels.load(req.params.level, function(err, level){
			if(err){
				req.flash('warn', 'level not found');
				res.redirect('/create');
				return;
			}
			req.session.level = new Grid(level); 
			res.render('edit',{
				locals: {
					title: title(level.name+': Edit'),
					levelId: req.params.level,
					level: JSON.stringify(level)
				},
				layout: 'game-layout'
			});
		});
	}
});
app.get('/level/:level/copy', login, function(req, res){
	if(req.params.level==='newlevel'){
		res.redirect('/create');
	}else{
		levels.load(req.params.level, function(err, level){
			if(err){
				req.flash('warn', 'level not found');
				res.redirect('/level/list');
				return;
			}
			
			levels.create(req.session.user._id, function(err, clevel){
				if(err){
					req.flash('warn', err.message);
					res.redirect('/level/list');
			
				}else{
					clevel.name= 're: ' + level.name;
					clevel.width= level.width;
					clevel.height= level.height;
					clevel.data = level.data;
					clevel.save(function(err){
						res.redirect('/level/'+level._id+'/edit');
					});
					
					
				}
			});
		});
	}
});
var decorateLevels= function(req, res, levellist){
	for(var i =0; i< levellist.length; i++){
		levellist[i].prettydate = help.date(levellist[i].date+'');
		levellist[i].prettyupdate = help.date(levellist[i].lastUpdate+'');
		if(levellist[i].creator == req.session.user._id || req.session.user.role==='admin'){
			levellist[i].owner = true;
		}
	}
	return levellist;
};
app.get('/level/list', login, function(req, res){

	levels.getAll( function(err, levellist){

		res.render('list',{
			locals: {
				title: title('Levels'),
				levels: decorateLevels(req, res, levellist) 
			}
		});
	});
});
var deleteLevel = function(req, res){
	levels.load(req.params.level, function(err, level){
		if(level.creator == req.session.user._id  || req.session.user.role==='admin'){
			level.remove(function(err){
				req.flash('info', 'removed level');
				if(req.body.origin){
					res.redirect(req.body.origin);
				}else{
					res.redirect('/');
				}
				
			});
		}else{
			req.flash('warn', 'You can not remove this level!');
			res.redirect('/level/list');
		}

	});
};

app.get('/level/:level/delete', deleteLevel);
app.del('/level/:level', login, deleteLevel);

app.get('json/level/:from/:to', login, function(req, res){
	var from = parseInt(req.params.from, 10),
	to = parseInt(req.params.from, 10),
	num = to-from;
	levels.getNumFrom(num, from, function(err, levels){
		if(err){
			res.send(err);
			return;
		}
		res.send(levels);
	});
});

app.get('json/levels', login, function(req, res){
	levels.getAll( function(err, levels){
		if(err){
			res.send(err);
			return;
		}
		res.send(levels);
	});
});
/**
 * beta requests
 * 
 */
app.get('/beta-request',all, function(req, res){
	res.render('user/beta-request', {locals:{
		title: title('Beta request')
		}});
});

app.post('/beta-request',all, function(req, res){
	mail.send({
		to: req.body.request.email,
		subject: 'Welcome to togather',
		body: 'Hello and Welcome to the Beta,\n\n' +
			'go to http://'+req.header('host')+' and have a look! \n' +
			'Your beta key is: aedimiviepx\n\n' +
			'Have a nice Day!'
	});
	
	req.flash('info', 'check your mailbox');
	res.redirect('/register');
});


/**
 * user management
 */
app.get('/profile', login, function(req, res){
	res.render('user/profile', {locals: {
		title: title('profile')
	}});
});
app.get('/login', all, function(req, res){
	res.render('user/login', {locals: {
		redir: req.query.redir,
		title: title('Login')
	}});
});
app.post('/login', all, function(req, res){	
	users.auth(req.body.user.email, req.body.user.password, function(err, user){
		if(!err){
			req.session.user = user;
			req.session.regenerate(function(err){
				console.log('login: ' + req.body.user.email);
				
				req.session.user = user;
				console.log('user');
				res.redirect(req.body.redir);
				console.log('redir');
			});			
		}else{
			req.flash('warn', err.message);
			console.log(err.message);
			res.redirect('/login?redir='+req.body.redir);			
		}
	});	
});
app.get('/logout', login, function(req, res){
	delete req.session.user;
	req.session.regenerate(function(err){
		res.redirect('/');
	});	
});
app.get('/register', all, function(req, res){
	res.render('user/register', {locals: {
		title: title('Register')
	}});
});
app.post('/register', all, function(req, res){
	console.log('register: ');
	console.log(req.body.user.name);
	if(req.body.user.betakey.toLowerCase() == 'aedimiviepx'){
		users.register(req.body.user, function(err, user){				
			if(!err){
				console.log('registered: '+ user.email);
				req.session.user = user;
				res.redirect('/');
//				mail.send({
//					to: user.email,
//					subject: 'Welcome to togather',
//					body: 'Hello '+ user.name+' welcome to togather \n' +
//						'go to http://'+req.header('host')+' and play! \n' +
//						'We won\' bother you with any more messages unless you want us to\n\n' +
//						'Have a nice Day!'
//				});
			}else{
				req.flash('warn', err.message);
				res.redirect('/register');
			}
		});	
	}else{
		req.flash('warn', 'wrong beta key');
		res.redirect('/register');
	}

});
app.get('/forgot-password', all, function(req, res){
	res.render('user/forgot-password', {locals: {
		title: title('Forgot Password')
	}});
});
app.post('/forgot-password', all, function(req, res){
	users.findByMail(req.body.user.email, function(err, user){
		if(err){
			req.flash('warn', err.message);
			res.redirect('/forgot-password');
		}else{
			users.forgotPassword(user.email, function(err, pending){
				if(err){
					req.flash('warn', err.message);
					res.redirect('/forgot-password');
				}
				mail.send({
					to: pending.email,
					subject: 'togather password reset',
					body: 'You can reset your password at: '+ 
						'http://'+req.header('host')+'/reset-password/'+pending.hash
				});				
				res.render('user/check-your-mail', {locals: {
					title: title('check your mail'),
					email: pending.email
				}});
			});			
		}		
	});
});
app.get('/reset-password/:hash', all, function(req, res){
	users.findPending({hash: req.params.hash}, function(err, pending){
		if(err || !pending){
			req.flash('warn', err.message);
		}
		res.render('user/reset-password', {locals: {
			title: title('Enter new Password'),
			hash: req.params.hash
		}});
	});
	
});
app.post('/reset-password', all, function(req, res){	
	users.resetPassword(req.body.user, function(err, user){
		if(err){
			req.flash('warn', err.message);
		}else{
			res.redirect('/login');
		}		
	});
});
if(process.env.NODE_ENV !== 'production'){
	app.listen(3030);
}else{
	app.listen(80);
}

io.listen(socket.listen(app));
