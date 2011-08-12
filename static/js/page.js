$().ready(function(){
	
	$('form.confirm').submit(function(event){
		if(confirm('Are you sure?')){
			return true;
		}
		else{
			event.preventDefault();
		}
	});
	
	$('#registerForm').validate({
		rules: {
			'user[betakey]': {
				required: true
			},
			'user[name]': {
				required: true,
				minlength: 2
			},
			'user[password]': {
				required: true,
				minlength: 5
			},
			'user[repassword]': {
				required: true,
				minlength: 5,
				equalTo: '#password'
			},
			'user[email]': {
				required: true,
				email: true
			}
		},
		messages: {
			'user[betakey]': {
				required: 'Please enter a valid beta key'
			},
			'user[name]': {
				required: 'Please enter a username',
				minlength: 'Your username must consist of at least 2 characters'
			},
			'user[password]': {
				required: 'Please provide a password',
				minlength: 'Your password must be at least 5 characters long'
			},
			'user[repassword]': {
				required: 'Please provide a password',
				minlength: 'Your password must be at least 5 characters long',
				equalTo: 'Please enter the same password as above'
			},
			'user[email]': 'Please enter a valid email address'
		},
		// set this class to error-labels to indicate valid fields
		success: function(label) {
			// set &nbsp; as text for IE
			label.html("&nbsp;").addClass("checked");
		}});
	
	
});