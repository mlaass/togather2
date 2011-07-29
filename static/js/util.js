$(document).ready(function(){
	settings = $('#tools #settings'),
	chatbutton = $('#chat-button'), 
	helpbutton = $('#help-button'), 
	playbutton = $('#play-button'),
	buttons = $('.button');
	
	buttons.each(function(vent, obj){
		var o = $(obj), txt= o.attr('name');
		if(o.hasClass('link')){
			o = o.find('a');
		}
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
	playbutton.click(function(){
		if($jo.state === 'edit'){
			$jo.game.map = $jo.editor.map;
			$jo.game.runSetup();
			$jo.state = 'play';
			console.log('go play');
		}else if($jo.state === 'play'){
			$jo.editor.run();
			$jo.state = 'edit';
			console.log('go edit');
		}
	});

	$('#canvas').click(function(){
		$('input').blur();
	});
});
