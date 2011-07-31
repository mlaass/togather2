var redis = require('redis'),
    redisclient = redis.createClient(),
    Step = require('step'),
    levels = require('./levels'),
    Grid = require('./grid').Grid;


redisclient.on('error', function (err) {
    console.log('Error ' + err);
});

var checkfn = function(fn){
	if(typeof fn !== 'function'){
		fn = function(){
			console.log('client without function');
			console.log(arguments);
		};
	}
	return fn;
};
module.exports.listen = function(io){	
	io.sockets.on('connection', function(client){
		client.redis = redis.createClient();		
		client.on('handshake', function(message, fn) {
			checkfn(fn);
			if(message.rediskey && !client.user) {  				
				//fetch session info from redis
				client.redis.get(message.rediskey, function(err, session) {
					if(err ){
						console.log(err.message);
						fn(err.message);
						return;
					}
					session = JSON.parse(session);
					
					if(session && session.user && message.levelId){
						client.user = session.user;	
						client.session = session;
						session.client = client;
						client.levelId = message.levelId;
						
						//activate the socket.io protocol for this client
						activateProtocol(io, client, function(level){
							fn({session:true, id: client.user._id, level: level});
						});						
					}
					else{
						fn('warn:login to start session');	
					}							
				});
			 }else{
				 fn('warn:login to start session');
			 }
		});
	});
};
activateProtocol = function(io, client, fn){
	client.channel = 'lvl:'+client.levelId;
	
	//using step for async easing
	Step(
		function(){
			levels.load(client.levelId, this);
		},
		function(err, level){
			if(err){
				fn(err);
				return;
			}
			//level.data= JSON.parse(level.data);
			client.session.level = level;
			client.redis.subscribe(client.channel);			
			//pub/sub forwarding
			client.redis.on('message', function(chan, message){
				//TODO: forwarding without re encoding				
				var msg = JSON.parse(message);
				client.emit(chan, msg);
			});	
			//connection
			redisclient.publish(client.channel, JSON.stringify({connect: true, user: {
				id: client.user._id,
				name: client.user.name}}));
			//disconnection
			client.on('disconnect', function(){
				redisclient.publish(client.channel, JSON.stringify({disconnect: true, user: {id: client.user._id}}));
			});
			
			//syncing
			client.on(client.channel, function(msg){
				msg.user = client.user._id;	
			
				if(msg.type === 'function' && msg.name){
					if(msg.context === 'grid'){
						levels.load(level._id, function(err, level){
							var grid = new Grid({
								width: level.width,
								height: level.height,
								name: level.name,
								data: level.data
							});						
							var args = [];
							for(var i in msg.args){
								args[i] = msg.args[i];
							}
							grid[msg.name].apply(grid, args);
							level.lastUpdate= Date.now();
							level.name = grid.name;
							level.width = grid.width;
							level.height = grid.height;
							level.data = JSON.stringify(grid.data);
							level.save(function(err){
								if(err){
									console.log(err);
								}
							});
						});
					}else if(msg.context === 'chat'){
						msg.args[0].time = Date.now();
						msg.args[0].username = client.user.name;
					}
					redisclient.publish(client.channel, JSON.stringify(msg));
				}		
			});
			fn(level);
		}
	);	
};