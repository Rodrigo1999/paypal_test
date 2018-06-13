var express=require('express'),
app=express(),
http=require('http').createServer(app),
io=require('socket.io')(http),
path=require('path'),
sharedsession=require("express-socket.io-session"),
ejs=require('ejs'),
paypal=require('paypal-rest-sdk');

const PORT=process.env.PORT || 5000; 


paypal.configure({
  'mode': 'sandbox', //sandbox or live
  'client_id': 'Aa6YyH2WHGDgTIqa9vEsdOM9kEqBDeTHhGmoJpgJDScuPQuhTtZ5TblM9tfynbMcg3hwQzKOEx9tC5EL',
  'client_secret': 'EIxVDcub_JAHBTImsA26TAch4RfjXrp6-p3-8lr9uSYX63ZNhhgLy0CctbdqGEIRmnDvLq2r-cPZdonk'
});

app.set('view engine', 'ejs');

app.get('/', function(req, res){
	res.render('index');
});

app.post('/pay', function(req, res){
	const create_payment_json = {
	    "intent": "sale",
	    "payer": {
	        "payment_method": "paypal"
	    },
	    "redirect_urls": {
	        "return_url": "http://localhost:5000/success",
	        "cancel_url": "http://localhost:5000/cancel"
	    },
	    "transactions": [{
	        "item_list": {
	            "items": [{
	                "name": "Red Sox Hat",
	                "sku": "001",
	                "price": "10.00",
	                "currency": "BRL",
	                "quantity": 1
	            }]
	        },
	        "amount": {
	            "currency": "BRL",
	            "total": "20.00",
	            "details":{
	            	"subtotal":"10.00",
		            "tax":"1.00",
		            "shipping":"1.20",
		            "handling_fee":"3.00",
		            "insurance":"4.80"
		        }
	        },
	        "description": "Hat for the best team ever"
	    }]
	};

	paypal.payment.create(create_payment_json, function (error, payment) {
	    if (error) {
	        throw error;
	    } else {
	        for(var i=0; i<payment.links.length; i++){
	        	if(payment.links[i].rel==='approval_url'){
	        		res.redirect(payment.links[i].href);
	        	}
	        }
	    }
	});
});

app.get('/success', function(req, res){
	const payerId = req.query.PayerID;
	const paymentId = req.query.paymentId;

	const execute_payment_json = {
		"payer_id": payerId,
		"transactions":[{
			"amount":{
				"currency":"BRL",
				"total":"20.00"
			}
		}]
	};

	paypal.payment.execute(paymentId, execute_payment_json, function(error, payment){
		if(error){
			console.log(error.response);
			throw error;
		}else{
			if(payment.state === "approved"){
				console.log("Get Payment Response");
				console.log(JSON.stringify(payment));
				res.send('Success');
			}else{
				res.send('Payment not successful');
			}			
		}
	});

});

app.get('/cancel', function(req, res){
	res.send('Cancelled');
});

// ---------------------------------------------- buttn-paypal---------------

app.get('/buttonsuccess', function(req, res){
	res.render('buttonsuccess');
});

http.listen(PORT,function(){
console.log('listening on *:'+PORT);
});