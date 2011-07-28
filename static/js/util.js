$(document).ready(function(){
	settings = $('#tools #settings'),
	chatbutton = $('#chat-button'), 
	helpbutton = $('#help-button'), 
	buttons = $('.button');
	
	if( !$jo ){
		$jo = {};
	}	        	
	
	$jo.tool='tile';       		
	
	buttons.each(function(vent, obj){
		var o = $(obj), txt= o.attr('name');
		if(txt === '' || !txt){
			txt = o.attr('id');
		}
		var  p = $('<span>').html(txt);
		o.append('<img src="/img/empty.png" width="32" height="32" alt="'+$(obj).attr('id')+'"/>').append(p);
		p = o.find('span');
		p.css({left: 8-(p.width()/2)});
		
	});
	chatbutton.click(function(){
		if(chatbutton.hasClass('hidden')){
			$('#chat').show();
			chatbutton.removeClass('hidden');
		}else {
			$('#chat').hide();
			chatbutton.addClass('hidden');
		}
	});
	helpbutton.click(function(){
		if(helpbutton.hasClass('hidden')){
			$('#help').show();
			helpbutton.removeClass('hidden');
		}else {
			$('#help').hide();
			helpbutton.addClass('hidden');
		}
	});

	$('#canvas').click(function(){
		$('input').blur();
	});
});
