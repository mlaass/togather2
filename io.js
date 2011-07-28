var redis = require('redis'),
    redisclient = redis.createClient(),
    Step = require('step'),
    levels = require('./levels');

redisclient.on('error', function (err) {
    console.log('Error ' + err);
});

checkfn = function(fn){
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
					if(session && session.user){
						client.user = session.user;	
						client.session = session;
						session.client = client;
						
						//activate the socket.io protocol for this client
						activateProtocol(io, client, function(){
							fn({session:true, id: client.user._id, level: session.level});
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
	var chan = 'lvl:'client.session.level._id;
	//using step for async easing
	Step(function(){
		client.redis.subscribe(chan);	
		
		//pub/sub forwarding
		client.redis.on('message', function(chan, message){
			//TODO: forwarding without re encoding
			var msg = JSON.parse(message);
			//TODO: filter forwards that don't affect client, using space
			client.emit(chan, msg);		
		});	
		
		//disconnection
		client.on('disconnect', function(){
			redisclient.publish(chan, JSON.stringify({disconnect: true, user: client.user._id}));
		});
		fn();
	});
	
};