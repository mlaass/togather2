

var nodemailer = require("nodemailer");

nodemailer.SMTP = require('./smtp');

//nodemailer.SMTP = {
//    host: "smtp.gmail.com",
//    port: 465,
//    ssl: true,
//    use_authentication: true,
//    user: "your.username",
//    pass: "your.pass"
//};

module.exports.send = function(msg){
	if(!msg.sender){
		msg.sender = 'Moritz.Laass@gmail.com';
	}
	if(process.env.NODE_ENV === 'development'){
		console.log(msg);
	}else{
		nodemailer.send_mail(msg,function(err, success){
			if(err || !success){
				console.log('Could not send Message');
				console.log(msg);
				console.log(err);
			}
		});
	}
};