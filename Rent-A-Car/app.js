// library require for app
var contract = "0x394565808714d103c77a42f7a56803ab8b212f35";
var express = require('express');
var app = new express();
var server = require('http').createServer(app);
server.listen("8080");
var io = require("socket.io")(server);
var path = require('path');
var query = require('querystring');
const web3lib = require('web3');

//connect to geth via web3
var web3 = new web3lib(new web3lib.providers.HttpProvider("http://localhost:8545"));

// get the contract instance
var rentcarcontract = web3.eth.contract([{"constant":false,"inputs":[{"name":"car_brand","type":"string"},{"name":"car_model","type":"string"},{"name":"car_rent","type":"uint256"}],"name":"addCar","outputs":[],"payable":false,"stateMutability":"nonpayable","type":"function"},{"constant":false,"inputs":[{"name":"index","type":"address"}],"name":"CustomerDetails","outputs":[{"name":"","type":"string"},{"name":"","type":"string"},{"name":"","type":"uint256"},{"name":"","type":"string"},{"name":"","type":"uint256"},{"name":"","type":"uint256"}],"payable":false,"stateMutability":"nonpayable","type":"function"},{"constant":false,"inputs":[],"name":"getAddressLength","outputs":[{"name":"","type":"uint256"}],"payable":false,"stateMutability":"nonpayable","type":"function"},{"constant":false,"inputs":[],"name":"getCarLength","outputs":[{"name":"","type":"uint256"}],"payable":false,"stateMutability":"nonpayable","type":"function"},{"constant":false,"inputs":[{"name":"index","type":"uint256"}],"name":"getAddressAt","outputs":[{"name":"","type":"address"}],"payable":false,"stateMutability":"nonpayable","type":"function"},{"constant":false,"inputs":[{"name":"index","type":"uint256"},{"name":"customer_name","type":"string"},{"name":"from","type":"uint256"},{"name":"to","type":"uint256"},{"name":"dayscount","type":"uint256"}],"name":"hireCar","outputs":[],"payable":true,"stateMutability":"payable","type":"function"},{"constant":false,"inputs":[{"name":"index","type":"uint256"}],"name":"CarDetails","outputs":[{"name":"","type":"string"},{"name":"","type":"string"},{"name":"","type":"uint256"},{"name":"","type":"uint256"},{"name":"","type":"uint256"}],"payable":false,"stateMutability":"nonpayable","type":"function"},{"inputs":[],"payable":false,"stateMutability":"nonpayable","type":"constructor"},{"anonymous":false,"inputs":[{"indexed":false,"name":"_Status","type":"bool"},{"indexed":false,"name":"_TimeStamp","type":"uint256"}],"name":"addCarStatus","type":"event"},{"anonymous":false,"inputs":[{"indexed":false,"name":"_IsHired","type":"bool"},{"indexed":false,"name":"message","type":"string"},{"indexed":false,"name":"_TimeStamp","type":"uint256"}],"name":"hireStatus","type":"event"}]);
var rentcar = rentcarcontract.at(contract);


//refer for js/ file
app.use(express.static(__dirname));
app.use(express.static(__dirname + '/img'));

/*==================== ADMIN Pages =================*/
app.get('/dashboard',(request,response) => {
    response.sendFile(__dirname+'/html/admin/dashboard.html');
});

app.get('/carsboard',(request,response) => {
    response.sendFile(__dirname+'/html/admin/cars.html');
});

app.get('/adminheader.html',(request,response) => {
    response.sendFile(__dirname+'/html/admin/adminheader.html');
});

app.get('/adminfooter.html',(request,response) => {
    response.sendFile(__dirname+'/html/admin/adminfooter.html');
});

app.get('/menu.html',(request,response) => {
    response.sendFile(__dirname+'/html/admin/menu.html');
});

app.get('/customer',(request,response) => {
    response.sendFile(__dirname+'/html/admin/customers.html');
});

app.get('/transactions',(request,response) => {
    response.send(getTransactionsByAccount(contract,0));
});

/*==================== USERS Pages  =========================*/
//ruote for home page
app.get('/',(request,response) => {
    response.sendFile(__dirname+'/html/public/index.html');
});

app.get('/carcart', (request,response)=> {
	response.sendFile(__dirname+'/html/public/carcart.html');
});

app.get('/managecar', (request,response)=> {
	response.sendFile(__dirname+'/html/public/managecar.html');
});

/*=================== Css/Js ================================*/
app.get('style.css', (request,response)=> {
	response.sendFile(__dirname+'/css/style.css');
});

app.get('bootstrap-combined.min.css', (request,response)=> {
	response.sendFile(__dirname+'/css/bootstrap-combined.min.css');
});


/* ================== Application Logic ==========================*/
app.get('/addcar',(request,response) => {

	var car_brand = request.query.carbrand;
	var car_model = request.query.carmodel;
	var car_rent = request.query.carrent;

    rentcar.addCar.sendTransaction(car_brand,car_model, web3.toWei(car_rent, 'ether'),{
		from: web3.eth.accounts[0],
		gas:180000
    },
    function(error, transactionHash){
		if (!error){				
			response.send(transactionHash);
		}
		else{
			response.send(error);
		}
	});
});

app.get('/listcar',(request, response) => {
	var clen = rentcar.getCarLength.call().toNumber();
	var arraycar =[];

	for (var index = 0; index < clen; index++) {
		arraycar.push(rentcar.CarDetails.call(index));
	}
	response.send(arraycar);
});

app.get('/findcar',(request,response) => {
	var car = rentcar.CarDetails.call(request.query.Id);
	response.send(car);
});

app.get('/trans',(request,response) =>{
	var count  = web3.eth.getTransactionCount(contract);
	response.send(JSON.stringify(count));
});

app.get('/bookcar',(request,response) =>{
	
	var index = request.query.index; 
	var name = request.query.name;
	var from = request.query.from;
	var to = request.query.to;
	var days = request.query.days;
	var account = request.query.account;

	var car = rentcar.CarDetails.call(index);
	var rate = car[2].toNumber();
	var charges = rate * days;

    rentcar.hireCar.sendTransaction(index,name,from,to,days,{
		from:account,
		value:charges,
		gas:180000
    },
    function(error, transactionHash){
		if (!error){				
			response.send(transactionHash);
		}
		else{
			response.send(error);
		}
	});
});

app.get('/acclst',(request,response) =>{
	
	var array = [];
	var i = 0; 
	
	web3.eth.accounts.forEach(function(e){ 
		//console.log("  eth.accounts["+i+"]: " +  e + " \tbalance: " + web3.fromWei(web3.eth.getBalance(e), "ether") + " ether"); 

		var item = {
			"Account":web3.eth.accounts[i],
			"Balance":web3.fromWei(web3.eth.getBalance(e), "ether") + " Ether"
		}

		array.push(item);
		i++; 
	});
	
	response.send(array);
});
 

app.get('/customerlist',(request,response)=>{
	var custarry = [];
	var custlen = rentcar.getAddressLength.call();

	for(i=0; i < custlen; i++){
		var address = rentcar.getAddressAt.call(i);
		var customer = rentcar.CustomerDetails.call(address);
		custarry.push(customer);
	}

	response.send(custarry);
});


app.get('/customeracc',(request,response)=>{
	var customer = rentcar.CustomerDetails.call(request.query.acc);
	response.send(customer);
});

function getTransactionsByAccount(myaccount, startBlockNumber, endBlockNumber) {
	if (endBlockNumber == null) {
	  endBlockNumber = web3.eth.blockNumber;
	  //console.log("Using endBlockNumber: " + endBlockNumber);
	}
	if (startBlockNumber == null) {
	  startBlockNumber = endBlockNumber - 1000;
	  //console.log("Using startBlockNumber: " + startBlockNumber);
	}
	//console.log("Searching for transactions to/from account \"" + myaccount + "\" within blocks "  + startBlockNumber + " and " + endBlockNumber);
  
	var txns = [];

	for (var i = startBlockNumber; i <= endBlockNumber; i++) {
	//   if (i % 1000 == 0) {
	// 	console.log("Searching block " + i);
	//   }

	  var block = web3.eth.getBlock(i, true);
	  if (block != null && block.transactions != null) {
		block.transactions.forEach( function(e) {
		  if (myaccount == "*" || myaccount == e.from || myaccount == e.to) {
			// console.log("  tx hash          : " + e.hash + "\n"
			//   + "   nonce           : " + e.nonce + "\n"
			//   + "   blockHash       : " + e.blockHash + "\n"
			//   + "   blockNumber     : " + e.blockNumber + "\n"
			//   + "   transactionIndex: " + e.transactionIndex + "\n"
			//   + "   from            : " + e.from + "\n" 
			//   + "   to              : " + e.to + "\n"
			//   + "   value           : " + e.value + "\n"
			//   + "   time            : " + block.timestamp + " " + new Date(block.timestamp * 1000).toGMTString() + "\n"
			//   + "   gasPrice        : " + e.gasPrice + "\n"
			//   + "   gas             : " + e.gas + "\n"
			//   + "   input           : " + e.input);

			var item = {
				"BlockNumber":e.blockNumber,
				"TxHash":e.hash,
				"TimeStamp":new Date(block.timestamp * 1000).toGMTString(),
				"TransactionIndex":e.transactionIndex
			}
			
			txns.push(item);
		  }
		});
	  }
	}

	return txns;
  }