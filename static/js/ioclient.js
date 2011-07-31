define(['jo/jo', 'jo/Point', 'jo/Surface', './Level'], function(jo, Point, Surface, Level){	
	
	var exports={},
		socket = null,
		channel = '',
		functions = {},
		pending = {count:0};
	
	function toArray(obj){
		var args = [];
		for(var i in obj){
			args[i] = obj[i];
		}
		return args;
	};
	function makeIdent(name, context, args){
		return context+name+'('+JSON.stringify(args)+')';
	};
	
	exports.init = function(fn){
		fn = fn || function(){};
		channel = 'lvl:'+levelId;
		
		socket = $appdata.socket = io.connect($appdata.host);
		
		socket.on('connect', function() {			
			socket.emit('handshake', {rediskey: $appdata.rediskey, levelId: levelId}, fn);
			
			socket.on(channel, function(msg){
				var name =  msg.context+':'+msg.name;
				
				if(msg.type === 'function' && msg.name && functions[name]){
					var args = toArray(msg.args);
					console.log(msg);
					functions[name].apply(functions[name].self, args);
					
					if(pending[msg.ident]){
						pending.count-=1;
						pending[msg.ident] = false;
						delete pending[msg.ident];
					}
					if(pending.count==0){
						$('#saved').show();
						$('#loading').hide();
					}
				}
			});				
		

		});
	};
	exports.sync = function(name, obj, context, wait){		
		context = context || '';
		
		var fn = obj[name];
		fn.self = obj;
		fn.context = context;
		fn.wait = wait;
		
		functions[context+':'+name] = fn;
		
		obj[name]= function(){			
			var ident = makeIdent(name, context, arguments);			
			if(! pending[ident]){
				if(!wait){
					fn.apply(fn.self, arguments);
				}				
				pending[ident] = true;
				socket.emit(channel, {type: 'function', name: name, context: context,  args: arguments, ident: ident});
				pending.count+=1;
				$('#saved').hide();
				$('#loading').show();
			}
			
		};	
		return obj[name];
	};
	return exports;
});