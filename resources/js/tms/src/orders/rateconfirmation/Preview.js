Ext.define('TMS.orders.rateconfirmation.Preview', {
	extend:'TMS.ActionWindow',
	
	//Requires
	requires:[
		'TMS.ActionWindow',
		'TMS.orders.rateconfirmation.Email',
		'TMS.orders.rateconfirmation.Fax'
	],
	
	//Config
	order_id:0,
	iframe:false,
	iframeHtml:false,
	title:'Rate Confirmation Preview',
	url:'/at-ajax/modules/order/process/',
	
	closeAction:'hide',
	
	widthPercent: 0.9,
	heightPercent: 0.9,
	
	init: function() {
		this.initIframe();
		this.initButtons();
	},
	
	initIframe: function() {
		this.iframeHtml = Ext.core.DomHelper.markup({
			tag:'iframe',
			cls:'rate-confirmation-iframe',
			border:0,
			frameborder:0,
			width:'100%',
			height:'100%'
		});
		this.html = this.iframeHtml;
		this.on('afterrender', function(){
			this.iframe = this.getEl().down('iframe');
			
			if (this.order_id) {
				this.loadOrder(this.order_id);
			}
		}, this);
	},
	
	initButtons: function() {
		this.showCloseButton();
		this.addTopButton([{
			scope:this,
			text:'Download PDF',
			handler:this.download,
			icon:'/resources/icons/download-16.png'
		},{
			scope:this,
			text:'Send Email',
			handler:this.sendEmail,
			icon:'/resources/icons/email-16.png'
		},{
			scope:this,
			text:'Send Fax',
			handler:this.sendFax,
			icon:'/resources/icons/fax-16.png'
		},{
			scope:this,
			text:'Tweet This',
			handler:this.tweetThis,
			icon:'/resources/icons/twitter-16.png'
		}]);
	},
	
	loadOrder: function(order_id) {
		this.order_id = order_id || this.order_id;
		
		setTimeout(Ext.bind(function(){
			this.setLoading();
		}, this), 200);
		
		
		this.iframe.on('load', function() {
			this.setLoading(false);
		}, this);
		this.iframe.dom.src = this.url + 'output-confirmation?order_id=' + this.order_id;
	},
	
	download: function() {
		location.href = this.url + 'download-confirmation?order_id=' + this.order_id
	},
	
	sendEmail: function() {
		Ext.create('TMS.orders.rateconfirmation.Email', {
			order_id:this.order_id
		});
	},
	
	sendFax: function() {
		Ext.create('TMS.orders.rateconfirmation.Fax', {
			order_id:this.order_id
		});
	},
	
	tweetThis: function() {
		this.tweetThisWindow = Ext.create('TMS.ActionWindow', {
			html:'<img src="/resources/img/seriously.png" />',
			width:350,
			height:290
		});
	}
	
});