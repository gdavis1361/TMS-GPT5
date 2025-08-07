Ext.define('TMS.ActionWindow', {
	extend:'Ext.window.Window',
	
	//Config
	baseCls: 'x-panel',
	modal:true,
	frame: false,
	resizable:false,
	draggable:false,
	autoShow:true,
	autoSize:true,
	widthPercent: 0.5,
	heightPercent: 0.7,
	sizePercent: null,
	minWidth: 300,
	minHeight: 300,
	minSize: null,
	topItems: [],
	bottomItems: [],
	
	constructor: function(){
		this.topItems = [];
		this.bottomItems = [];
		this.callParent(arguments);
	},
	
	initComponent: function(){
		this.items = this.items || [];
		this.dockedItems = this.dockedItems || [];
		this.initTopBar();
		this.initBottomBar();
		this.initSizing();
		this.init();
		this.callParent(arguments);
	},
	
	init: function() {},
	
	initTopBar: function() {
		this.topToolbar = Ext.create('Ext.toolbar.Toolbar', {
			dock:'top',
			items: this.topItems || []
		});
		this.dockedItems.push(this.topToolbar);
		
		this.topToolbar.on('afterrender', function(){
			if(!this.topToolbar.items.items.length){
				this.topToolbar.hide();
			}
		}, this);
	},
	
	initBottomBar: function() {
		this.bottomToolbar = Ext.create('Ext.toolbar.Toolbar', {
			dock:'bottom',
			ui:'footer',
			layout:{
				pack:'center'
			},
			items: this.bottomItems || []
		});
		this.dockedItems.push(this.bottomToolbar);
		
		this.bottomToolbar.on('afterrender', function(){
			if(!this.bottomToolbar.items.items.length){
				this.bottomToolbar.hide();
			}
		}, this);
	},
	
	initSizing: function(){
		if(!this.autoSize){
			return;
		}
		
		if(this.sizePercent != null){
			this.widthPercent = this.sizePercent;
			this.heightPercent = this.sizePercent;
		}
		if(this.minSize != null){
			this.minWidth = this.minSize;
			this.minHeight = this.minSize;
		}
		
		 //Sizing Listeners
		this.on('show', function(){
			var width = Ext.Element.getViewportWidth() * this.widthPercent;
			var height = Ext.Element.getViewportHeight() * this.heightPercent;
			if(width < this.minWidth){
				width = this.minWidth;
			}
			if(height < this.minHeight){
				height = this.minHeight;
			}
			this.setWidth(width);
			this.setHeight(height);
			this.center();
		}, this);
		
		Ext.EventManager.onWindowResize(function(){
			var width = Ext.Element.getViewportWidth() * this.widthPercent;
			var height = Ext.Element.getViewportHeight() * this.heightPercent;
			if(width < this.minWidth){
				width = this.minWidth;
			}
			if(height < this.minHeight){
				height = this.minHeight;
			}
			this.setWidth(width);
			this.setHeight(height);
			this.center();
		}, this);
	},
	
	addTopButton: function(button) {
		this.topToolbar.show();
		this.topToolbar.add(button);
	},
	
	addBottomButton: function(button) {
		this.bottomToolbar.show();
		this.bottomToolbar.add(button);
	},
	
	showCloseButton: function() {
		this.bottomToolbar.removeAll();
		this.addBottomButton({
			scope:this,
			text:'Close',
			handler:this.close
		});
		
	}
	
});
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
Ext.define('TMS.Application', {
	extend: 'Ext.util.Observable',
    singleton: true,
	
	//Config
	messageContainer: false,
	
	constructor: function(){
		this.callParent(arguments);
		this.initMenu();
	},
	
	/**
	 * Quick navigation rig
	 */
	initMenu: function(){
		this.mainMenu = Ext.getBody().down('.header-main-nav');
		this.mainMenu.show();
		this.activeMenu = this.mainMenu.down('li a.active').up('li');
		this.activeSubMenu = this.activeMenu.down('ul');
		if(this.activeSubMenu){
			this.activeSubMenu.show();
			this.currentSubMenu = this.activeSubMenu;
		}
		Ext.select('.header-navigation').each(function(el){
			el.on('mouseleave', function(){
				if(this.currentSubMenu != null && this.currentSubMenu != this.activeSubMenu){
					this.onHideMenu(this.currentSubMenu);
				}
				if(this.activeSubMenu != null){
					this.onShowMenu(this.activeSubMenu);
				}
			}, this);
		}, this);
		this.mainMenu.select('> li').each(function(el){
			el.on('mouseover', function(event, element, options){
				var target = Ext.get(event.getTarget('li'));
				var subMenu = target.down('ul');
				if(subMenu == null){
					return;
				}
				if(this.currentSubMenu == subMenu){
					return;
				}
				if(this.currentSubMenu != null){
					this.onHideMenu(this.currentSubMenu);
				}
				if(this.activeSubMenu != null){
					this.onHideMenu(this.activeSubMenu);
				}
				
				this.onShowMenu(subMenu);
			}, this);
			el.on('mouseleave', function(event, element, options){
				var target = Ext.get(event.getTarget('li'));
				var subMenu = target.down('ul');
				if(subMenu == null){
					return;
				}
				if(this.currentSubMenu == subMenu){
					this.currentSubMenu = null;
				}
				this.onHideMenu(subMenu);
			}, this);
		}, this);
	},
	
	onShowMenu: function(subMenu){
		if(!subMenu.isVisible()){
			subMenu.show(true);
		}
		subMenu.up('li').down('a').addCls('active');
		this.currentSubMenu = subMenu;
	},
	
	onHideMenu: function(subMenu){
		subMenu.hide();
		subMenu.up('li').down('a').removeCls('active');
		if(this.currentSubMenu == null && this.activeSubMenu != null && subMenu != this.activeSubMenu){
			this.onShowMenu(this.activeSubMenu);
		}
	},
	
	showMessage: function(userConfig){
		var config = {};
		var defaultConfig = {
			title:'',
			content:'',
			icon:'/resources/img/thumb_icon.png',
			url:false,
			timeout:false
		}
		Ext.apply(config, userConfig, defaultConfig);
		
		if(!this.messageContainer){
			this.messageContainer = Ext.core.DomHelper.insertFirst(Ext.getBody(), {
				id:'tms-application-messages-container'
			}, true);
		}
		var messageBox = Ext.core.DomHelper.append(this.messageContainer, this.createMessageBox(config), true);
		messageBox.config = config;
		messageBox.hide();
		messageBox.slideIn('t');
		if(config.timeout){
			setTimeout(Ext.bind(function(){
				this.fadeOut({remove: true});
			}, messageBox), config.wait);
		}
		
		//Setup listeners
		messageBox.on('click', function(event){
			if(event.getTarget('.close') != null){
				this.fadeOut({remove: true});
			}
			else if(messageBox.config.url){
				location.href = messageBox.config.url;
			}
		}, messageBox);
		
	},
	createMessageBox: function(config){
		var messageBoxTemplate = new Ext.XTemplate(
			'<div class="tms-application-message">',
				'<div class="close"></div>',
				'<div class="title">{title}</div>',
				'<div class="icon"><img src="{icon}" /></div>',
				'<div class="message">{content}</div>',
			'</div>'
		);
		return messageBoxTemplate.apply(config);
	},
	
	addJs: function(src) {
		var needToAdd = true;
		Ext.select('script').each(function(el) {
			if (el.dom.src.replace(src, '') != el.dom.src) {
				needToAdd = false;
			}
		});
		if (needToAdd) {
			var newEl = Ext.core.DomHelper.append(Ext.getDoc().down('head'), {
				tag:'script',
				type:'text/javascript',
				src:src
			});
			return newEl;
		}
		else {
			return false;
		}
	},
	
	addCss: function(href) {
		var needToAdd = true;
		Ext.select('link').each(function(el) {
			if (el.dom.href.replace(href, '') != el.dom.href) {
				needToAdd = false;
			}
		});
		if (needToAdd) {
			var newEl = Ext.core.DomHelper.append(Ext.getDoc().down('head'), {
				tag:'link',
				type:'text/css',
				href:href
			});
			return newEl;
		}
		else {
			return false;
		}
	}
});

Ext.define('TMS.IframeWindow', {
	extend:'TMS.ActionWindow',
	
	iframe:false,
	iframeHtml:false,
	title:' ',
	url:false,
	
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
			this.setHeight(Ext.Element.getViewportHeight() * .8);
			this.setWidth(Ext.Element.getViewportWidth() * .9);
			this.center();
			if (this.url) {
				this.loadUrl(this.url);
			}
		}, this);
	},
	
	initButtons: function() {
		this.showCloseButton();
	},
	
	loadUrl: function(url) {
		this.url = url;
		this.setLoading(true);
		
		this.iframe.on('load', function() {
			this.setLoading(false);
		}, this);
		this.iframe.dom.src = this.url;
	}
});
Ext.define('TMS.TimeDifference', {
	extend: 'Ext.util.Observable',
	
	config: {
		selectorCls:'time-difference',
		futurePrefix:'In',
		futureSuffix:'',
		pastPrefix:'',
		pastSuffix:'ago'
	},
	
	displays:false,
	
	constructor: function(config) {
		this.initConfig(config);
		this.displays = Ext.select('.' + this.selectorCls, true);
		this.displays.removeCls(this.selectorCls);
		this.initDisplays();
		this.updateDisplays();
		this.interval = setInterval(Ext.Function.bind(this.updateDisplays, this), 1000);
	},
	
	remove: function() {
		clearInterval(this.interval);
	},
	
	initDisplays: function() {
		this.displays.addCls('x-hidden');
		var numDisplays = this.displays.elements.length;
		var originalDate = new Date();
		for (var i = 0; i < numDisplays; i++) {
			originalDate.setTime(this.displays.elements[i].dom.innerHTML + '000');
			this.displays.elements[i].originalTime = originalDate.getTime();
		}
		this.displays.update('');
		this.displays.removeCls('x-hidden');
	},
	
	updateDisplays: function() {
		var numDisplays = this.displays.elements.length;
		var now = (new Date()).getTime();
		for (var i = 0; i < numDisplays; i++) {
			this.displays.elements[i].update(this.getDisplayText(now - this.displays.elements[i].originalTime));
		}
	},
	
	getDisplayText: function(ts) {
		ts /= 1000;
		var isPositive = true;
		if (ts < 0) {
			isPositive = false;
			ts = -ts;
		}
		var chunks = [
			[31536000, 'year'],
			[2592000 , 'month'],
			[604800, 'week'],
			[86400 , 'day'],
			[3600 , 'hour'],
			[60 , 'minute'],
			[1 , 'second']
		];

		var name = '';
		var seconds = '';
		var numChunks = chunks.length;
		var count = 0;
		for (var i = 0; i < numChunks; i++) {
			seconds = chunks[i][0];
			name = chunks[i][1];
			count = Math.floor(ts / seconds);
			if (count) {
				break;
			}
		}
		
		var display = count + ' ' + name;
		if (count > 1) {
			display += 's';
		}
		
		if (isPositive) {
			display = this.pastPrefix + ' ' + display + ' ' + this.pastSuffix;
		}
		else {
			display = this.futurePrefix + ' ' + display + ' ' + this.futureSuffix;
		}
		
		return display;
		
		var days = Math.floor(ts / 86400);
		var hours = Math.floor((ts - (days * 86400 ))/3600);
		var minutes = Math.floor((ts - (days * 86400 ) - (hours *3600 ))/60);
		var seconds = Math.floor((ts - (days * 86400 ) - (hours *3600 ) - (minutes*60)));
		var x = days + " Days " + hours + " Hours " + minutes + " Minutes and " + seconds + " Seconds ";
		return x;
	}
	
});
