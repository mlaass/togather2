define(['jo/jo', 'jo/Point', 'jo/Surface', './Level'], function(jo, Point, Surface, Level){	
	
	var exports={},
		socket = null,
		channel = '',
		functions = {},
		pending = {count:0};
	
	function map(obj){
		var args = [];
		for(var i in obj){
			args[i] = obj[i];
		}
		return args;
	};
	function makeIdent(name, prefix, args){
		return prefix+name+'('+JSON.stringify(args)+')';
	};
	
	exports.init = function(game, fn){
		fn = fn || function(){};
		channel = 'lvl:'+levelId;
		
		socket = $appdata.socket = io.connect($appdata.host);
		
		socket.on('connect', function() {			
			socket.emit('handshake', {rediskey: $appdata.rediskey, levelId: levelId}, fn);
			
			socket.on(channel, function(msg){
				var name = msg.name;
				if(msg.prefix){
					name= msg.prefix+msg.name;
				}
				if(msg.type === 'function'&& msg.name&& functions[name]){
					var args = map(msg.args);
					//console.log(msg);
					functions[msg.name].apply(functions[msg.name].self, args);
					
					var ident = makeIdent(msg.name, msg.prefix, args);
					
					if(pending[ident]){
						pending.count-=1;
						//console.log('unpending: '+ident);
						pending[ident]=false;
						delete pending[ident];
					}
					if(pending.count==0){
						$('#saved').show();
						$('#loading').hide();
					}
				}
			});				
		

		});
	};
	exports.sync = function(name, obj, prefix){		
		prefix = prefix || '';
		
		var fn = obj[name];
		fn.self = obj;
		fn.prefix = prefix;
		
		functions[prefix+name] = fn;
		
		obj[name]= function(){
			
			
			var ident = makeIdent(name, prefix, map(arguments));
			
			if(! pending[ident]){
				fn.apply(fn.self, arguments);
				//console.log('pending: '+ident);
				pending[ident] = true;
				socket.emit(channel, {type: 'function', name: name, prefix: prefix,  args: arguments});
				pending.count+=1;
				$('#saved').hide();
				$('#loading').show();
			}
			
		};	
		return obj[name];
	};
	return exports;
});