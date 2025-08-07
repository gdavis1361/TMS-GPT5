Ext.define('TMS.AjaxController', {
	extend:'Ext.util.Observable',
	singleton: true,
	
	constructor: function(config) {
		Ext.apply(this, config);
		this.requests = [];
		this.init();
	},
	url: '/at-ajax/modules/tms/application/request',
	requestTimeout: false,
	requests: [],
	wait: 100,
	enabled: true,
	
	init: function(){
		this.initListeners();	
	},
	
	initListeners: function(){
		
		Ext.Ajax.on('beforerequest', function(connection, request){
			//Ignore if this request is bulk or a form
			if(request.bulk === true || request.async === false || request.form != null || !this.enabled){
				return true;
			}
			
			//Change the passed callback to the userCallback and set the callback to an empty function
			request.userCallback = request.callback;
			request.callback = function(){};
			
			//Clear timeout
			if(this.requestTimeout){
				clearTimeout(this.requestTimeout);
			}
			this.requestTimeout = setTimeout(Ext.bind(function(){
				this.sendBulkRequest();
				this.requestTimeout = false;
			}, this), this.wait);
			
			//Queue requests
			this.requests.push(request);
			request.transactionId = this.requests.length - 1;
			
			//Return false to cancel request
			//Ext.Ajax.abort();
			return false;
		}, this);
	},
	
	sendBulkRequest: function(){
		var requests = [];
		
		//make a copy of requests
		while(this.requests.length){
			requests.push(this.requests.pop());
		}
		this.requests = [];
		
		//build the request object to send
		var requestArray = [];
		Ext.each(requests, function(request){
			//Look for any arrays
			var arraysFound = [];
			for(var i in request.params){
				var value = request.params[i];
				if(i.substr(-2) == '[]'){
					if(typeof value != 'array'){
						value = [];
					}
					//Create correct one
					request.params[i.replace('[]', '')] = value;
					
					//Delete old one
					delete request.params[i];
				}
			}
			var requestObject = {
				transactionId: request.transactionId,
				url: request.url,
				params: request.params || {},
				method: request.method || 'post'
			};
			requestArray.push(requestObject);
		}, this);
		
		//console.log("just sent a bulk ajax request of " + requests.length);
		//Send a bulk request
		Ext.Ajax.request({
			scope: this,
			bulk: true,
			url: this.url,
			requests: requests,
			method:'post',
			params: { requests: Ext.encode(requestArray) },
			callback: function(request, success, r){
				var requests = request.requests;
				var response = Ext.decode(r.responseText);
				var results = response.results
				
				//console.log(requests);
				if(results){
					Ext.each(results, function(result){
						//console.log(result.transactionId);
						var request = requests[requests.length - result.transactionId - 1];
						//console.log(request.url);
						//Setup response
						/*
						response = {
							request: request,
							requestId : request.id,
							status : xhr.status,
							statusText : xhr.statusText,
							getResponseHeader : function(header){ return headers[header.toLowerCase()]; },
							getAllResponseHeaders : function(){ return headers; },
							responseText : xhr.responseText,
							responseXML : xhr.responseXML
						};
						*/
					   var sendResponse = {};
						Ext.apply(sendResponse,{
							request: request,
							requestId: request.id,
							responseText: Ext.encode(result)
						}, r);
						
						//get the callback function, can be success or callback
						if(request.success){
							//console.log('success');
							Ext.bind(request.success, request.scope)(sendResponse, request);
			                //request.success.call(request.scope, sendResponse, request);
			            }
			            if(request.userCallback){
							//console.log('callback');
							try{
								Ext.callback(request.userCallback, request.scope, [request.options, true, sendResponse]);
							}
							catch(e){
								//console.log(e);
							}
							//Ext.bind(request.userCallback, request.scope)(request, true, sendResponse);
			                //request.userCallback.call(request.scope, request, true, sendResponse);
			            }
					}, this);
				}
			}
		});
	},
	
	disable: function(){
		this.enabled = false;
	},
	
	enable: function(){
		this.enabled = true;
	}
});