Ext.define('TmsClient', {
	extend: 'Ext.util.Observable',
	config:{
		url: '',
		port:8080,
		timeout: 3000,
		data: {}
	},
	
	constructor: function(config) {
		if(config.data != null){
			Ext.apply(config.data, this.config.data);
		}
        this.initConfig(config);
        this.initClient();
        this.initClientHandler();
        this.initServerHandler();
		this.initTasksHandler();
		this.client.connect();
        return this;
    },
    
    initClient: function(){
    	this.client = Ext.create('Redokes.socket.Client', {
			url: this.url,
			data: this.data,
			port:8080
		});
    },
    
    initClientHandler: function(){
    	this.clientHandler = Ext.create('Redokes.socket.MessageHandler', {
			module:'client',
			actions:{
				connect: Ext.bind(function(request) {
					
				}, this),

				disconnect: Ext.bind(function(request) {
					
				}, this),

				update: Ext.bind(function(request) {
					
				}, this)
			}
		});
    	this.client.registerHandler(this.clientHandler);
    },
    
    initServerHandler: function(){
    	this.serverHandler = Ext.create('Redokes.socket.MessageHandler', {
			module:'server',
			actions:{
				init: Ext.bind(function(request) {
				}, this)
			}
		});
    	this.client.registerHandler(this.serverHandler);
    },
	
	initTasksHandler: function(){
    	this.tasksHandler = Ext.create('Redokes.socket.MessageHandler', {
			module:'tasks',
			actions:{
				alert: Ext.bind(function(request) {
					var notifier = Ext.create('new TMS.task.Notifier');
					notifier.show(request.data);
				}, this)
			}
		});
    	this.client.registerHandler(this.tasksHandler);
    }
});

Ext.onReady(function(){
	//Get the sessionId
	Ext.Ajax.request({
		url: '/at-ajax/modules/util/session/get-user',
		async: true,
		success: function(r){
			var response = Ext.JSON.decode(r.responseText);
			var client = new TmsClient({
				url: 'accessresults.com',
				//url: 'localhost',
				data:{
					keys:{
						userId: response.sessionId
					}
				}
			});
		}
	});
});