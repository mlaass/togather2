define([],function(){
	var Chat = function(){
		this.history = [];
		var self = this;
		
		$('#chat-form').submit(function(e){
			var msg = $('#chat-input').val();
			if(msg !== ''){
				self.post({time: '$time', username: '$id', text:msg });
			}
			
			$('#chat-input').val('');
			e.preventDefault();
			return false;
		});
	};
	Chat.prototype.post = function(msg){
		console.log(msg);
		this.history.push(msg);
		
		if(this.history.length>15){
			this.history.shift();
		}
		$('#chat-text').html(this.render());
	};	
	Chat.prototype.render = function(){
		var r = '';
		for(var i in this.history){
			var time= new Date(this.history[i].time);
			r+= '<p><span class="time">['+time.toLocaleTimeString()+'] </span><b class="name">'+this.history[i].username+': </b>'+this.history[i].text+'</p>';
		}
		return r;
	};	
	return Chat;
});