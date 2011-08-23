

$(document).ready(function(){
	settings = $('#tools #settings'),
	chatbutton = $('#chat-button'), 
	helpbutton = $('#help-button'), 
	playbutton = $('#play-button'), 
	editbutton = $('#edit-button'),
	reloadbutton = $('#reload-button'),
	buttons = $('.button');
	
	buttons.each(function(vent, obj){
		var o = $(obj), txt = o.attr('name'),
		link = false, fixedwidth = o.hasClass('fixed');
		if(o.hasClass('link')){
			link=$(obj);
			o = o.find('a');			
		}
		
		if(txt === '' || !txt){
			txt = o.attr('id');
		}
		var  p = $('<span>').html(txt);
		o.append('<img src="/img/empty.png" width="32" height="32" alt="'+$(obj).attr('id')+'"/>').append(p);
		p = o.find('span');
		var w = p.width();
		if(!fixedwidth){
			var css = {width: Math.max(w,32)};			
			o.css(css);
			if(link){
				link.css(css);
			}
			var img = o.find('img');
			img.css({left: (w/2)-8});
		}else{
			p.css({left: 8-(w/2)});
		}
	});
	reloadbutton.hide();
	editbutton.hide();
	$('#menu').hide();
	
	
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
			if(!$jo.game.getObject('player')){
				$jo.game.runReady();
			}else{
				$jo.game.run();
			}
			
			$jo.state = 'play';
			console.log('go play');
			
			playbutton.hide();
			
			editbutton.show();
			reloadbutton.show();
			
			$('#sidebar').fadeOut();
		}
	});
	editbutton.click(function(){
		if($jo.state === 'play'){
			$jo.editor.cam.copy($jo.game.cam);
			$jo.editor.run();
			$jo.state = 'edit';
			console.log('go edit');
			
			editbutton.hide();
			reloadbutton.hide();
			
			playbutton.show();	
			$('#sidebar').fadeIn();
		}
	});
	reloadbutton.click(function(){
		if($jo.state === 'play'){
			$jo.game.runReady();
		}
	});

	$('#canvas').click(function(){
		$('input').blur();
	});
});
