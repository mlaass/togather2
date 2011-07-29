define(['jo/jo'], function(jo){
	var sb = new (jo.Class.extend({
		init: function(){
			this.params= $('#inspector #properties');
			jo.tool = 'tile';
		},
		setup: function(){
			var self = this;
			var tools = $('#tools li');
        	
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
			
			$('#toolprops form').each(function(ev, obj){
				$(obj).submit(function(han){
					var act = $(obj).attr('action');
					$jo.editor.sb.actions[act+'Submit']($(obj));
					return false;
				});
			});
			//entity select
			var eselect = $('#add-entity select');
			for(var i in jo.editor.entitylist){
				eselect.append($('<option>').html(jo.editor.entitylist[i]));
			}
			
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
		fillInspector: function(){
			this.params.html('');
			if(this.select && this.select.joObject){
				for(var i in this.select){
					this.addInpectorPair(i, this.select[i]);
				}
			}
		},
		addInspectorPair: function( name, value) {
			var nm = $('<label>').value(name).attr('for', name+'Field'),
			vl = $('<input>').value(value).attr('id', name+'Field'),
			li = $('<p>').addClass('pair').append(nm).append(vl);			
			this.params.append(li);
		},
		applyInspector: function(){
			if(this.select && this.select.joObject){
				for(var i in this.select){
					
				}
			}
		},
		actions:{
			addEntitySubmit: function(form){
				var ent =form.find('select').val();
				alert(ent);
			},
			mapSettingsSubmit: function(form){
				var w = $('#width').val(), h = $('#height').val();
        		w = parseInt(w, 10), h = parseInt(h, 10);
        		$jo.editor.map.resize(w,h, {index: -1});
			}
		},
		tools:{
			pick: function(){
				
			},
			settings: function(){
        		var inputs= $('#settings-prop input');
        		inputs.each(function(ev, obj){
        			var type= $(obj).attr('type');
        			if( type!=='reset' && type!=='submit'){
	        			var o = $(this);
	        			o.val($jo.editor.map[o.attr('id')]+'');
        			}
        		});
			},
			drag: function(){},
			tile: function(){}
		}
		
	}))();
	return sb;
});