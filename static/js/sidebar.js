define(['jo/jo'], function(jo){
	var sb = new (jo.Class.extend({
		init: function(){
			jo.tool = 'tile';
		},
		setup: function(options){
			options = options || {};
			var self = this;
			var tools = $('#tools li');
			$('#inspector').hide();
			tools.each(function(vent, obj){
        		$(obj).click(function(){
        			$jo.tool= $(obj).attr('id');
        			self.tools[$jo.tool]();
        			
        			tools.each(function(ev, obj2){
        				$(obj2).removeClass('active');
        			});
        			$(obj).addClass('active');        			
        			
        			$('.tool-prop').each(function(ev, obj){
        				$(obj).hide();
        			}); 
        			$('#'+$jo.tool+'-prop').show();	
        		});
        	});
			
			$('#sidebar form').each(function(ev, obj){
				$(obj).submit(function(){					
					var action = $(obj).attr('action');
					console.log(action);
					$jo.editor.sb.actions[action]($(obj));
					console.log(action);
					return false;
				});
				console.log(obj);
			});
			//entity select
			var eselect = $('#add-entity select');
			for(var i in jo.game.entities){
				eselect.append($('<option>').attr('name', i).html(jo.game.entities[i].name));
			}
			this.writeInspector(jo.game.entities);
			//tiles
			var tselect = $('#tile-prop #tile-select'), 
			tiles = $jo.editor.ts.getCss();			
			for(var i in tiles){
				tselect.append($('<li>').attr('style', tiles[i]).attr('name', i));
			}
			tiles = $('li', tselect);
			tiles.each(function(ev,obj){
				$(obj).click(function(){
					tiles.removeClass('selected');
					$(obj).addClass('selected');
					$jo.editor.tileBrush = parseInt($(obj).attr('name'));
				});
			});
			
		},
		writeInspector: function(object, list, name){
			if(!list){
				list = $('#inspector #properties');
			}
			name = name || '';
			if(object){
				for(var i in object){
					if(typeof object[i] !== 'object'){
						this.addInspectorPair(list, i, object[i]);
					}else{						
						var iname = name +'_'+ i+'Inspector',
						$li= $('<li>')
							.addClass('field')
							.attr('id', i+'Field')
							.attr('name', i)
							.html('<h4>'+i+'</h4>'),
						$ul = $('<ul>')
							.addClass('properties')
							.attr('id', iname);
						
						$li.append($ul);
						list.append($li);
						this.writeInspector(object[i],$('#'+iname), i);
					}					
				}
			}
		},
		addInspectorPair: function(parent, name, value) {
			var $name = $('<label>')
				.attr('for', name+'Field')
				.html(name),
			$value = $('<input>')
				.val(value)
				.attr('id', name+'Field'),
			$li = $('<li>').attr('name', name)
				.addClass('pair')
				.append($name)
				.append($value);			
			parent.append($li);
		},
		readInspector: function(list, obj){
			if(!list){
				list = $('#inspector #properties');
			}
			var self= this;
			list.find('li').each(function(i, el){
				el = $(el);
				var name = el.attr('name');
				if(el.hasClass('pair')){
					obj[name] = el.find('input').val();
				}else if(el.hasClass('field')){
					var $ul = el.find('ul'); 
					obj[name] = {};
					self.readInspector($ul, obj[name]);
				}
			});
			return obj;
		},
		actions:{
			addEntity: function(form){
				var ent = form.find('select').val();
				console.log(ent);
			},
			mapSettings: function(form){
				var w = $('#width').val(), 
				h = $('#height').val(),
				name = $('#name').val();
        		w = parseInt(w, 10), h = parseInt(h, 10);
        		$jo.editor.map.resize(w,h, {index: -1});        	
        		$jo.editor.map.rename(name);       		
			},
			commitInspector: function(form){
				console.log('ok');
				var s = {};
				sb.readInspector(null,s);  
				console.log(s);				
			}
		},
		tools:{
			pick: function(){
				$('#toolprops').fadeIn();
				$('#inspector').fadeIn();
			},
			settings: function(){
				$('#inspector').hide();
				$('#toolprops').fadeIn();
        		var inputs= $('#settings-prop input');
        		inputs.each(function(ev, obj){
        			var type= $(obj).attr('type');
        			if( type!=='reset' && type!=='submit'){
	        			var o = $(this);
	        			o.val($jo.editor.map[o.attr('id')]+'');
        			}
        		});        		
			},
			drag: function(){
				$('#inspector').hide();
				$('#toolprops').hide();
			},
			tile: function(){
				$('#inspector').hide();
				$('#toolprops').fadeIn();
			}
		}		
	}))();
	return sb;
});