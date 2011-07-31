$(document).ready(function(){
	
	$('form.confirm').submit(function(event){
		if(confirm('Are you sure?')){
			return true;
		}
		else{
			event.preventDefault();
		}
	});
	
	
});