(function(){
	var area = document.getElementById('canvas-wrap');
	function touchHandler(event)
	{
	    var touches = event.changedTouches,
	        first = touches[0],
	        type = '';
	

	    switch(event.type)
	    {
	        case 'touchstart': type = 'mousedown'; break;
	        case 'touchmove':  type = 'mousemove'; break;        
	        case 'touchend':   type = 'mouseup'; break;
	        default: return;
	    }
	
	    //initMouseEvent(type, canBubble, cancelable, view, clickCount,
	    //           screenX, screenY, clientX, clientY, ctrlKey,
	    //           altKey, shiftKey, metaKey, button, relatedTarget);
	    
	    var simulatedEvent = document.createEvent('MouseEvent');
	    simulatedEvent.initMouseEvent(type, true, true, window, 1,
	                              first.screenX, first.screenY,
	                              first.clientX, first.clientY, false,
	                              false, false, false, 0/*left*/, null);
	
	    first.target.dispatchEvent(simulatedEvent);
//	    for (var i in event){
//	    	if(typeof event[i] !== 'function'){
//	    		$('#chat-text').append('event.'+i+': '+event[i]+'<br/>');
//	    	}	    	
//	    }		
	    event.preventDefault();	   
	};
	
	function init()
	{
	    area.addEventListener('touchstart', touchHandler, true);
	    area.addEventListener('touchmove', touchHandler), true;
	    area.addEventListener('touchend', touchHandler, true);
	    area.addEventListener('touchcancel', touchHandler, true);    
	};
	init();
})();