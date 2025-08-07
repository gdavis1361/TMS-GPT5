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
Ext.define('TMS.filter.Abstract', {
	extend: 'Ext.form.Panel',
	
	//config
	frame: true,
	bodyPadding: 5,
	fieldDefaults: {
		labelWidth: 70,
		anchor: '100%'
	},
	config:{
		extraFilters: {}
	},
	registeredFilters: {},
	values: {},
	autoScroll: true,
	
	constructor: function(){
		this.extraFilters = {};
		this.values = {};
		return this.callParent(arguments);
	},

	initComponent: function(){
		this.items = [];
		this.registeredFilters = {};
		this._init();
		this.callParent(arguments);
	},
	
	_init: function(){
		this.initListeners();
		this.initDefaults();
		this.initButtons();
		this.init();
	},
	
	init: function(){},
	
	initListeners: function(){
		this.on('expand', function(){
			this.child("field").focus();
		}, this);
		
		this.on('add', function(panel, item){
			if(Ext.ComponentQuery.is(item, 'field')){
				this.onFilterAdd(item);
			}
		}, this);
	},
	
	initDefaults: function(){
		this.defaults = {
			xtype: 'textfield',
			enableKeyEvents: true,
			listeners: {
				scope: this,
				specialkey: function(field, e){
					// e.HOME, e.END, e.PAGE_UP, e.PAGE_DOWN,
					// e.TAB, e.ESC, arrow keys: e.LEFT, e.RIGHT, e.UP, e.DOWN
					if (e.getKey() == e.ENTER && field.xtype == 'textfield') {
						this.filter();
					}
				}
			}
		};
	},
	
	initButtons: function(){
		this.buttons = [{
			scope: this,
			text: 'Search',
			handler: function() {
				this.filter();
			}
		},{
			scope: this,
			text: 'Reset',
			handler: function(){
				this.getForm().reset();
				this.filter();
			}
		}];
	},
	
	initFields: function(){},
	
	registerFilter: function(filter){
		this.registeredFilters[filter.name] = filter;
		if(this.values[filter.name] != null){
			filter.setRawValue(this.values[filter.name]);
		}
		this.onFilterAdd(filter);
	},
	
	filter: function(){
		this.fireEvent('filter', this, this.getValues());
	},
	
	getValues: function(){
		var values = this.getForm().getValues();
		var registeredValues = {};
		var filter;
		var name;
		
		//Find all values that are not with this form
		for(name in this.values){
			if(values[name] == null){
				filter = {};
				registeredValues[name] = this.values[name];
			}
		}
		
		//Try to find any values that were registered but not in this form
		for(name in registeredValues){
			filter = this.registeredFilters[name];
			if(filter != null){
				values[name] = filter.getValue();
			}
			else{
				values[name] = registeredValues[name];
			}
		}
		
		//Add any registered filter values
		for(name in this.registeredFilters){
			filter = this.registeredFilters[name];
			values[name] = filter.getValue();
		}
		
		console.log(this.extraFilters);
		return Ext.apply({}, this.extraFilters, values);
	},
	
	setValues: function(values){
		//Set the default form values
		this.values = values;
		this.getForm().setValues(values);
		
		//Set any registered filter values
		for(var name in values){
			if(this.registeredFilters[name] != null){
				this.registeredFilters[name].setValue(values[name]);
			}
		}
	},
	
	onFilterAdd: function(field){
		field.on('change', function(field, newValue, oldValue){
			if(newValue != oldValue){
				this.filter();
			}
		}, this);
	}
	
});
Ext.define('TMS.carrier.filter.Carrier', {
	extend: 'TMS.filter.Abstract',
	
	//Requires
	requires:[
		'Ext.ux.form.field.RealComboBox'
	],
	
	init: function(){
		this.initName();
		this.initMc();
		this.initScac();
		this.initCity();
		this.initStateField();
		this.initZip();
	},
	
	initName: function(){
		this.name = new Ext.form.field.Text(Ext.apply({
			scope: this,
			name: 'name',
			fieldLabel: 'Name'
		}, this.defaults));
		this.items.push(this.name);
	},
	
	initMc: function(){
		this.mc = new Ext.form.field.Text(Ext.apply({
			scope: this,
			name: 'mc',
			fieldLabel: 'MC#'
		}, this.defaults));
		this.items.push(this.mc);
	},
	
	initScac: function(){
		this.scac = new Ext.form.field.Text(Ext.apply({
			scope: this,
			name: 'scac',
			fieldLabel: 'SCAC'
		}, this.defaults));
		this.items.push(this.scac);
	},
	
	initCity: function(){
		this.city = new Ext.form.field.Text(Ext.apply({
			scope: this,
			name: 'city',
			fieldLabel: 'City'
		}, this.defaults));
		this.items.push(this.city);
	},
	
	initStateField: function(){
		this.stateStore = Ext.create('Ext.data.Store', {
			autoLoad: true,
			fields:['display', 'value'],
			proxy: {
				type: 'ajax',
				url: '/at-ajax/modules/util/data/states',
				reader: {
					type: 'json',
					root: 'records'
				}
			}
		});
		this.stateField = new Ext.form.field.ComboBox(Ext.apply({
			scope: this,
			queryMode:'local',
			name: 'state',
			displayField:'display',
			valueField:'value',
			fieldLabel: 'State',
			store:this.stateStore
		}, this.defaults));
		
		this.items.push(this.stateField);
	},
	
	initZip: function(){
		this.zip = new Ext.form.field.Text(Ext.apply({
			scope: this,
			name: 'zip',
			fieldLabel: 'Zip'
		}, this.defaults));
		this.items.push(this.zip);
	}
	
});
Ext.define('TMS.carrier.forms.sections.Audit', {
	extend:'TMS.ActionWindow',
	requires:[
		'TMS.documents.view.Grid',
		'TMS.carrier.forms.sections.Authority',
		'TMS.comment.forms.sections.Form'
	],
	title:'Approve Carrier',
	processingPage:'/at-ajax/modules/carrier/audit/',
	
	carrier_id:0,
	widthPercent: 0.9,
	heightPercent: 0.9,
	layout:{
		type: 'hbox',
		align: 'stretch'
	},
	border: false,
	
	init: function() {
		this.initAuthority();
		this.initDocuments();
		
		this.initHidden();
		this.initButtons();
		this.initListeners();
	},
	
	initAuthority: function() {
		this.authorityPanel = Ext.create('TMS.carrier.forms.sections.Authority', {
			width: 300,
			carrier_id:this.carrier_id
		});
		this.items.push(this.authorityPanel);
	},
	
	initDocuments: function() {
		this.documentsPanel = Ext.create('TMS.documents.view.Grid', {
			title: 'Carrier Documents',
			extraParams:{
				carrier_id:this.carrier_id
			},
			flex: 1
		});
		this.items.push(this.documentsPanel);
	},
	
	initHidden: function() {
		this.carrierIdField = Ext.create('Ext.form.field.Hidden', {
			name:'carrierId',
			value:0
		});
		this.items.push(this.carrierIdField);
	},
	
	initButtons: function() {
		this.approveButton = Ext.create('Ext.button.Button', {
			scope:this,
			text:'Approve',
			handler:this.approve,
			scale:'medium',
			icon: '/resources/icons/check-24.gif'
		});
		
		this.declineButton = Ext.create('Ext.button.Button', {
			scope:this,
			text:'Decline',
			handler:this.decline,
			scale:'medium',
			icon: '/resources/icons/close-24.png'
		});
		
		
		this.addTopButton([
			this.approveButton,
			this.declineButton
		]);
	},
	
	approve: function() {
		this.setLoading();
		Ext.Ajax.request({
			scope:this,
			method:'post',
			url:this.processingPage + 'approve',
			params:{
				carrier_id:this.carrier_id
			},
			success: function(r) {
				this.setLoading(false);
				var response = Ext.decode(r.responseText);
				this.fireEvent('taskcomplete');
				this.close();
			}
		});
	},
	
	decline: function() {
		// Show a comment box that will be entered as an order comment
		this.formPanel = Ext.create('TMS.comment.forms.sections.Form', {
			field_value:this.carrier_id,
			commentType:'carrier'
		});
		
		this.formWindow = Ext.create('Ext.window.Window', {
			title:'Enter a reason',
			autoShow:true,
			modal:true,
			resizable:false,
			draggable:false,
			width:400,
			items:[
				this.formPanel
			]
		});
		
		this.formPanel.on('formsuccess', function() {
			this.formWindow.close();
			
			this.setLoading();
			Ext.Ajax.request({
				scope:this,
				method:'post',
				url:this.processingPage + 'decline',
				params:{
					carrier_id:this.carrier_id
				},
				success: function(r) {
					this.setLoading(false);
					var response = Ext.decode(r.responseText);
					this.fireEvent('taskcomplete');
					this.close();
				}
			});
			
		}, this);
			
	},
	
	initListeners: function() {
		
	}
	
});
Ext.define('TMS.form.Abstract', {
	extend:'Ext.form.Panel',
	alias: 'widget.tmsform',
	
	//Config
	submitParams: {},
	fieldPrefix: '',
	fieldPostfix: '',
	autoDestroy: true,
	autoScroll: true,
	
	constructor: function(){
		this.submitParams = {};
		return this.callParent(arguments);
	},
	
	initComponent: function(){
		//Set up items
		if(!this.url){
		}
		
		//Prototype the field to always show the msgTarget on the side
		Ext.form.field.Base.prototype.msgTarget = '';
		
		//Add events
		this.addEvents(
			'beforesubmit',
			'submit',
			'success',
			'failure',
			'cancelsubmit'
		);
			
		//Init the field names
		this.setFieldPrefix(this.fieldPrefix);
		this.setFieldPostfix(this.fieldPostfix);
		this.on('add', function(form, item){
			if(Ext.ComponentQuery.is(item, 'field')){
				this.applyPrefixPostfix(item);
			}
		}, this);
			
		//Call the parent function
		this.callParent(arguments);
	},
	
	setFieldPrefix: function(prefix){
		if(!this.rendered){
			this.on('afterrender', function(panel, options){
				this.setFieldPrefix(options.prefix);
			}, this, {prefix: prefix});
			return;
		}
		this.fieldPrefix = prefix;
		this.getForm().getFields().each(function(field){
			if(field.name != null && field.name.length){
				this.applyPrefixPostfix(field);
			}
		}, this);
	},
	
	setFieldPostfix: function(postfix){
		if(!this.rendered){
			this.on('afterrender', function(panel, options){
				this.setFieldPostfix(options.postfix);
			}, this, {postfix: postfix});
			return;
		}
		this.fieldPostfix = postfix;
		this.getForm().getFields().each(function(field){
			if(field.name != null && field.name.length){
				this.applyPrefixPostfix(field);
			}
		}, this);
	},
	
	applyPrefixPostfix: function(field){
		if(field.defaultName == null){
			field.defaultName = field.name;
		}

		var newName = field.defaultName;
		if(this.fieldPrefix.toString().length){
			newName = this.fieldPrefix + "-" + newName;
		}
		if(this.fieldPostfix.toString().length){
			newName += "-" + this.fieldPostfix;
		}

		field.name = newName;
	},
	
	useDefaultNames: function(){
		this.getForm().getFields().each(function(field){
			if(field.name != null && field.name.length){
				if(field.defaultName != null){
					field.name = field.defaultName;
				}
			}
		}, this);
	},
	
	usePrefixPostfixNames: function(){
		this.setFieldPrefix(this.fieldPrefix);
		this.setFieldPostfix(this.fieldPostfix);
	},
	
	setParams: function(object){
		Ext.apply(this.submitParams, object);
	},
	
	setParam: function(param, value){
		this.submitParams[param] = value;
	},
	
	getValues: function(){
		var values = this.getForm().getValues();
		Ext.apply(values, this.submitParams);
		return values;
	},
	
	setValues: function(values){
		if(!this.rendered){
			this.on('afterrender', function(form, options){
				this.setValues(values);
			}, this, { values: values});
			return;
		}
		this.useDefaultNames();
		this.getForm().setValues(values);
		this.usePrefixPostfixNames();
	},
	
	anyErrors: function(){
		var hasErrors = false;
		this.getForm().getFields().each(function(field){
			if(field.hasActiveError()){
				hasErrors = true;
			}
		}, this);
		
		return hasErrors;
	},
	
	submit: function(){
		if(this.rendered && this.getForm().isValid() && this.fireEvent('beforesubmit', this, this.submitParams) !== false){
			var values = this.getValues();
			Ext.apply(values, this.submitParams);
			this.getForm().submit({
				scope: this,
				url: this.url,
				params: values,
				success: function(form, action){
					this.fireEvent('success', form, action);
					this.fireEvent('submit', form, action);
				},
				failure: function(form, action){
					this.fireEvent('failure', form, action);
					this.fireEvent('submit', form, action);
					setTimeout(Ext.bind(function(errors){
						var errorsArray = [];
						for(var id in errors){
							errorsArray.push({
								id: id,
								msg: errors[id]
							});
						}
						this.getForm().markInvalid(errorsArray);
					}, this, [action.result.errors]));
				}
			});
		}
		else{
			this.fireEvent('cancelsubmit', this);
		}
	}
});
Ext.define('TMS.carrier.forms.sections.Authority', {
	extend:'TMS.form.Abstract',
	
	title:'Carrier Authority',
	processingPage:'/at-ajax/modules/carrier/authority/',
	url:'/at-ajax/modules/carrier/authority/save/',
	
	carrier_id:0,
	bodyPadding:8,
	
	initComponent: function() {
		this.items = this.items || [];
		
		this.initCommon();
		this.initContract();
		this.initBroker();
		
		this.initHidden();
		this.initListeners();
		
		if (this.carrier_id) {
			this.loadData(this.carrier_id);
		}
		
		this.callParent(arguments);
	},
	
	initCommon: function() {
		this.commonField = Ext.create('Ext.form.field.Text', {
			fieldLabel:'Common Authority',
			name:'common_authority',
			readOnly:true
		});
		this.items.push(this.commonField);
	},
	
	initContract: function() {
		this.contractField = Ext.create('Ext.form.field.Text', {
			fieldLabel:'Contract Authority',
			name:'contract_authority',
			readOnly:true
		});
		this.items.push(this.contractField);
	},
	
	initBroker: function() {
		this.brokerField = Ext.create('Ext.form.field.Text', {
			fieldLabel:'Broker Authority',
			name:'broker_authority',
			readOnly:true
		});
		this.items.push(this.brokerField);
	},
	
	initHidden: function() {
		this.carrierIdField = Ext.create('Ext.form.field.Hidden', {
			name:'carrier_id',
			value:this.carrier_id
		});
		this.items.push(this.carrierIdField);
	},
	
	initListeners: function() {
		
	},
	
	loadData: function(carrier_id) {
		this.carrier_id = carrier_id || this.carrier_id;
		if (this.carrier_id) {
			Ext.Ajax.request({
				scope:this,
				method:'post',
				url:this.processingPage + 'load',
				params:{
					carrier_id:this.carrier_id
				},
				success: function(r) {
					var response = Ext.decode(r.responseText);
					if (response.success) {
						this.setValues(response.record);
					}
				}
			});
		}
	},
	
	setValues: function(record) {
		this.commonField.setValue(this.getDisplay(record.common_authority));
		this.contractField.setValue(this.getDisplay(record.contract_authority));
		this.brokerField.setValue(this.getDisplay(record.broker_authority));
	},
	
	getDisplay: function(value) {
		if (value) {
			return 'Yes';
		}
		else {
			return 'No';
		}
	}
	
});
Ext.define('TMS.carrier.forms.sections.CarrierLocations', {
	extend:'Ext.panel.Panel',
	
	//Requires
	requires:[
		'Ext.ux.form.field.RealComboBox',
		'Ext.ux.form.field.BoxSelect',
		'TMS.location.forms.sections.Location'
	],
	
	//Config
	carrier_id:0,
	layout: {
		type: 'hbox',
		align: 'stretch'
	},
	processingPage:'/at-ajax/modules/carrier/process/',
	locationProcessingPage:'/at-ajax/modules/location/process/',
	
	initComponent: function(){
		this.items = this.items || [];
		this.dockedItems = this.dockedItems || [];
		this.init();
		this.callParent(arguments);
	},
	
	init: function() {
		this.initTopBar();
		this.initButtons();
		this.initLayoutPanels();
		this.initLocationStore();
		this.initLocationSelectorView();
		this.initLocationEditor();
	},
	
	initTopBar: function() {
		this.topToolbar = Ext.create('Ext.toolbar.Toolbar', {
			dock:'top'
		});
		this.dockedItems.push(this.topToolbar);
	},
	
	initButtons: function() {
		this.topToolbar.add({
			scope:this,
			text:'Add New Location',
			icon: '/resources/icons/add-16.png',
			handler:this.addNewLocation
		})
	},
	
	initLayoutPanels: function() {
		this.leftPanel = Ext.create('Ext.panel.Panel', {
			title:'Locations',
			width: 200
		});
		this.rightPanel = Ext.create('Ext.panel.Panel', {
			layout: 'fit',
			flex: 1,
			border:false
		});
		
		this.items.push(this.leftPanel, this.rightPanel);
	},
	
	initLocationStore: function() {
		this.locationStore = Ext.create('Ext.data.Store', {
			fields: [
				'location_id',
				'location_name_1',
				'location_name_2'
			],
			proxy: {
				type: 'ajax',
				url: this.processingPage + 'get-locations',
				extraParams:{
					carrier_id:this.carrier_id
				},
				reader: {
					type: 'json',
					root: 'records'
				}
			}
		});
		this.locationStore.on('load', this.selectFirst, this);
		this.locationStore.load();
	},
	
	initLocationSelectorView: function() {
		this.locationSelectorView = Ext.create('Ext.view.View', {
			title:'Locations',
			store:this.locationStore,
			tpl:[
				'<tpl for=".">',
					'<div class="carrier-contact-row">{location_name_1} {location_name_2}</div>',
				'</tpl>',
				'<div class="x-clear"></div>'
			],
			autoHeight:true,
			trackOver: true,
			overItemCls:'carrier-contact-row-hover',
			selectedItemCls:'carrier-contact-row-selected',
			itemSelector:'.carrier-contact-row',
			emptyText: 'No Locations',
			deferEmptyText:false,
			listeners: {
				scope:this,
				selectionchange: function(dv, nodes) {
					if (nodes.length) {
						this.selectRecord(nodes[0].index);
					}
				}
			}
		});
		this.leftPanel.add(this.locationSelectorView);
	},
	
	initLocationEditor: function() {
		this.locationEditor = Ext.create('TMS.location.forms.sections.Location', {
			title:'Location Information',
			bodyPadding:10,
			disabled:true,
			url:this.locationProcessingPage + 'process',
			buttons:[{
				scope:this,
				text:'Save',
				cls: 'submit',
				handler: function() {
					this.locationEditor.submit();
				}
			}]
		});
		
		this.locationEditor.on('success', function(form, action){
			var record = action.result.record;
			this.locationEditor.getForm().setValues(record);
			this.locationStore.un('load', this.selectFirst, this);
			this.locationStore.on('load', this.selectCurrent, this);
			this.locationStore.load();
		}, this);
		
		this.locationEditor.setValues({
			carrier_id: this.carrier_id
		});
		this.rightPanel.add(this.locationEditor);
	},
	
	selectFirst: function() {
		if (this.locationStore.count()) {
			this.leftPanel.doComponentLayout();
			this.locationSelectorView.suspendEvents();
			this.selectRecord(0);
			this.locationSelectorView.resumeEvents();
		}
	},
	
	selectCurrent: function() {
		var locationId = this.locationEditor.getForm().getValues()['location_id'];
		if (locationId) {
			var record = this.locationStore.findRecord('location_id', locationId);
			if (record) {
				this.leftPanel.doComponentLayout();
				this.locationSelectorView.suspendEvents();
				this.selectRecord(record.index);
				this.locationSelectorView.resumeEvents();
			}
			else {
				this.selectRecord(0);
			}
		}
	},
	
	selectRecord: function(index) {
		this.locationSelectorView.select(index);
		var record = this.locationStore.getAt(index);
		var location_id = record.data.location_id;
		var name = record.data.location_name_1;
		
		this.locationEditor.enable();
		this.locationEditor.loadLocation(location_id);
		this.locationEditor.setTitle('Location Information - ' + name);
		
	},
	
	addNewLocation: function() {
		// clear the form
		this.locationEditor.show();
		this.locationEditor.enable();
		this.locationEditor.setTitle('New Location');
		this.locationEditor.getForm().reset();
		this.locationEditor.setValues({
			carrier_id: this.carrier_id
		});
	},
	
	saveLocationData: function() {
		
	}
	
});
Ext.define('TMS.form.Navigation', {
	extend:'TMS.form.Abstract',
	
	//Requires
	requires:[
		'TMS.form.plugin.StatusBar',
		'TMS.panel.plugin.AutoHeight'
	],
	
	//Layout Config
	layout: 'border',
	layoutTypes:{
		CARD: 'card',
		SCROLL: 'scroll'
	},
	border: false,
	submitParams: {},
	
	//Config
	rootCls: 'tms-form-navigation',
	cls: 'tms-form-navigation',
	bodyCls: 'tms-form-navigation-body',
	redirect: true,
	redirectTimeout: 4000,
	deferredRender: false,
	layoutType: null,
	leftConfig: {},
	centerConfig: {},
	activeItem: null,
	saving: false,
	
	constructor: function(){
		//Ensure fresh objects and arrays
		this.leftConfig = {};
		this.centerConfig = {};
		
		//Call parent constructor
		this.callParent(arguments);
	},
	
	initComponent: function(){
		//Set up items
		this.formItems = this.items || [];
		this.dockedItems = this.dockedItems || [];
		this.plugins = this.plugins || [];
		this.items = [];
		this.uniqueKey = (new Date()).getTime();
		
		//Prototype the field to always show the msgTarget on the side
		Ext.form.field.Base.prototype.msgTarget = '';
		
		//Add Events
		this.addEvents(
			'setactiveitem'
		);
			
		//Init the navigation store
		this.initNavigationStore();	
		
		//Init the bbar
		this.initBottomToolbar();
		
		//Init layouts
		this.initLayoutType();
		this.initLeft();
		this.initCenter();
		this.initListeners();
		
		//Plugins
		this.initStatusBar();
		this.initAutoHeight();
		
		//Init key nav
		this.initKeys();
		
		//Call the parent function
		this.callParent(arguments);
	},
	
	initNavigationStore: function(){
		this.navigationStore = new Ext.data.Store({
			scope: this,
			fields:[
				'title',
				'button',
				'panel'
			]
		});
	},
	
	initListeners: function(){
		
		//before submit listener
		this.on('beforesubmit', this.onBeforeSubmit, this);
		
		//Submit listener
		this.on('submit', this.onSubmit, this);
		
		//Cancel listener
		this.on('cancelsubmit', this.onSubmit, this);
		
		//Failure Listener
		this.on('failure', function(form, response){
			this.onFailure(response.result);
		}, this);
		
		//Success Listener
		this.on('success', function(form, response){
			this.onSuccess(response.result);
		}, this);
		
		//Context menu
		this.on('afterrender', function(){
			this.getEl().on('contextmenu', function(event, el, options){
				
				//Create the menu
				var menu = new Ext.menu.Menu({
					scope: this
				});
				
				//Add items to the menu
				this.navigationStore.each(function(record){
					if(record.get('button').isVisible()){
						var text = record.get('title');
						if(record.get('panel') == this.activeItem){
							text = '<b>' + text + '</b>';
						}
						menu.add({
							scope: this,
							text: text,
							record: record,
							handler: function(item){
								this.setActiveItem(item.record.get('panel'));
							}
						});
					}
				}, this);
				
				//Show the menu
				menu.showAt(event.getXY());
				
				//Cancel event and prevent default
				event.preventDefault();
			}, this);
		}, this);
	},
	
	initLayoutType: function(){
		//Setup the layout type
		if(this.layoutType == null){
			this.layoutType = this.layoutTypes.CARD;
		}
		switch(this.layoutType){
			case this.layoutTypes.CARD:
				this.initCardLayout();
			break;
			
			case this.layoutTypes.SCROLL:
				this.initScrollLayout();
			break;
		}
	},
	
	initCardLayout: function(){
		this.previousButton = new Ext.panel.Tool({
			scope: this,
			type: 'prev',
			tooltip: 'Previous',
			handler: function(){
				this.previous();
			}
		});
		
		this.nextButton = new Ext.panel.Tool({
			scope: this,
			type: 'next',
			tooltip: 'Next',
			handler: function(){
				this.next();
			}
		});
		
		Ext.apply(this.centerConfig, {
			//tools: [this.previousButton, this.nextButton],
			layout:{
				type: 'card',
				deferredRender: this.deferredRender
			},
			defaults:{
				border: false,
				autoScroll: true
			}
		});
		
		//Listeners
		this.on('setactiveitem', function(item){
			this.center.getLayout().setActiveItem(item);
		}, this);
	},
	
	initScrollLayout: function(){
		Ext.apply(this.centerConfig, {
			autoScroll: true,
			border: false,
			bodyPadding: '5 0 0 0',
			defaults:{
				margin: '0 5 10 5',
				collapsible: true,
				titleCollapse: true
			}
		});
		
		//Listeners
		this.on('setactiveitem', function(item){
			var top = item.getEl().getY() - this.center.getEl().getY();
			//item.getEl().scrollIntoView(this.center.body);
			this.center.body.scroll("t", (-top) + 5, {
				scope: this,
				callback: Ext.bind(function(panel){
					//Show tooltip
					if(this.activeItemTooltip != null){
						this.activeItemTooltip.hide();
						this.activeItemTooltip.destroy();
					}
					var title = panel.title.substr(0, 10) + "...";
					this.activeItemTooltip = Ext.create('Ext.tip.ToolTip', {
						scope: this,
						cls: 'form-message-tip',
						anchor: 'left',
						autoHide: false,
						target: panel.getEl(),
						html: title
					});
					this.activeItemTooltip.show();
					
				}, this, [item])
			});
		}, this);
	},
	
	initBottomToolbar: function(){
		if(this.buttons == null || !this.buttons.length){
			return;
		}
		
		this.bottomToolbar = new Ext.toolbar.Toolbar({
			scope: this,
			items: ['->', this.buttons]
		});
		this.bbar = this.bottomToolbar;
		delete this.buttons;
	},
	
	initLeft: function(){
		this.left = new Ext.panel.Panel(Ext.apply({
			scope: this,
			region: 'west',
			layout: 'anchor',
			width: 200,
			split: true,
			collapsible: true,
			floatable: false,
			header: false,
			bodyStyle:{
				'background': '#f1f1f1'
			},
			defaults:{
				anchor: '100%'
			},
			autoScroll: true
		}, this.leftConfig));
		this.items.push(this.left);
	},
	
	
	initCenter: function(){
		//Create the center panel
		this.center = new Ext.panel.Panel(Ext.apply({
			scope: this,
			region: 'center',
			border: false,
			bbar: this.statusBar
		}, this.centerConfig));
		this.items.push(this.center);
		
		//Listeners
		this.center.on('beforeadd', function(panel, item){
			if(panel == this.center && item.title != null){
				var record = item.navigationRecord;
				if(record == null){
					this.onCenterBeforeAdd(item);
					return false;
				}
			}
		}, this);
		
		//Add the items to the center panel
		this.on('afterrender', function(){
			this.center.add(this.formItems);
			if(this.navigationStore.count()){
				this.setActiveItem(this.navigationStore.getAt(0).get('panel'));
			}
		}, this);
	},
	
	initStatusBar: function(){
		this.statusBarPlugin = Ext.create('TMS.form.plugin.StatusBar', {
			dockTo: this.center,
			items: [{
				scope: this,
				text: '&laquo; Back',
				handler: function(){
					this.previous();
				}
			},'-', {
				scope: this,
				text: 'Continue &raquo;',
				handler: function(){
					this.next();
				}
			}]
		});
		this.plugins.push(this.statusBarPlugin);
		
		this.statusBarPlugin.on('showerror', function(name){
			//Find the field
			this.navigationStore.each(function(record){
				var panel = record.get('panel');
				if(Ext.ComponentQuery.is(panel,'tmsform')){
					var foundField = panel.getForm().findField(name);
					if(foundField != null){
						this.setActiveItem(panel);
						foundField.focus(true, 100);
					}
				}
			}, this);
		}, this);
	},
	
	initAutoHeight: function(){
		this.plugins.push(Ext.create('TMS.panel.plugin.AutoHeight'));
	},
	
	initKeys: function(){
		//Setup the key nav
		this.on('afterrender', function(){
			var nav = new Ext.util.KeyNav(Ext.getBody(), {
				scope: this,
				"pageUp": function(){
					if(!this.saving){
						this.previous();
					}
				},
				"pageDown": function(){
					if(!this.saving){
						this.next();
					}
				}
				/*
				"up": function(event){
					if(event.ctrlKey && !this.saving){
						this.previous();
					}
				},
				"down": function(event){
					if(event.ctrlKey && !this.saving){
						this.next();
					}
				},
				"left": function(event){
					if(event.ctrlKey && !this.saving){
						this.previous();
					}
				},
				"right": function(event){
					if(event.ctrlKey && !this.saving){
						this.next();
					}
				}
				*/
			});
		}, this);
	},
	
	addNavigation: function(item){
		if(item.title == null || !item.title.length){
			return;
		}
		
		//Create the button
		var title = item.title;
		if(title.length > 24){
			title = title.substr(0, 24) + '...';
		}
		
		var buttonConfig = {};
		
		//Check for icon
		/*
		if(item.icon){
			Ext.apply(buttonConfig, {
				icon: item.icon
			});
		}
		*/
		
		var button = this.left.add(Ext.apply({
			scope: this,
			xtype: 'button',
			scale:'medium',
			//icon: '/resources/icons/form-24.png',
			cls: 'form-navigation-button',
			panel: item,
			text: title,
			hidden: (item.hidden || item.disabled),
			enableToggle: true,
			toggleGroup: this.uniqueKey,
			handler: function(button){
				this.setActiveItem(button.panel);
			}
		}, buttonConfig));
		
		//Create the record
		var addedRecords = this.navigationStore.add({
			title: item.title,
			button: button,
			panel: item
		});
		var navigationRecord = addedRecords[0];
		
		//Attach the record to the button
		button.record = navigationRecord;

		//Attach the button to the item
		item.navigationButton = button;
		item.navigationRecord = navigationRecord;
		
		//Button Tooltip
		button.on('afterrender', function(button){
			button.tip = Ext.create('Ext.tip.ToolTip', {
				scope: this,
				showDelay: 600,
				button: button,
				width: 200,
				target: button.getEl(),
				anchor: 'top',
				html: null
			});
			button.tip.on('beforeshow', function(tip){
				if(!Ext.ComponentQuery.is(item, 'tmsform')){
					return false;
				}
				var fields = tip.button.panel.getForm().getFields();
				var html = '<table cellpadding="5" cellspacing="0" width="100%"><tbody>';
				var count = 0;
				fields.each(function(field){
					if(field.fieldLabel != null && field.getRawValue != null){
						html += "<tr><td style=\"width: 40%;\"><span style=\"font-weight: bold;\">" + field.fieldLabel + ": </span></td><td>" + field.getRawValue() + "</td>";
						count++;
					}
				}, this);
				html += "</tbody></table>";
				if(!fields.length || !count){
					return false;
				}
				tip.update(html);
			}, this);
		}, this);
		button.on('click', function(button){
			if(button.tip == null){
				return;
			}
			
			if(!button.tip.isVisible()){
				button.tip.on('beforeshow', function(){
					return false;
				}, this, {single: true});
			}
			else{
				button.tip.hide();
			}
		}, this);
		

		//Item Listeners
		item.on('enable', function(panel, options){
			options.button.show();
		}, this, {button: button});
		item.on('disable', function(panel, options){
			options.button.hide();
		}, this, {button: button});
		item.on('destroy', function(panel, options){
			this.navigationStore.remove(options.button.record);
			options.button.destroy();
		}, this, {button: button});
		item.on('show', function(panel, options){
			options.button.toggle(true);
		}, this, {button: button});
		
		//Find the last field item
		item.on('afterrender', function(){
			var fieldItems = item.query('field');
			if(fieldItems.length){
				var lastField = fieldItems[fieldItems.length - 1];
				lastField.on('afterrender', function(field){
					field.on('specialkey', function(field, event){
						if(event.getKey() == Ext.EventObject.TAB){
							this.next();
						}
					}, this);
				}, this);
			}
		}, this);
	},
	
	bindForm: function(item){
		//If this is a tmsform chain the events both ways
		if(Ext.ComponentQuery.is(item, 'tmsform')){

			//Chain inner form events to main form
			item.on('beforesubmit', function(form, submitParams){
				return this.fireEvent('beforesubmit', form, submitParams);
			}, this);
			item.on('submit', function(form, action){
				return this.fireEvent('submit', form, action);
			}, this);
			item.on('success', function(form, action){
				return this.fireEvent('success', form, action);
			}, this);
			item.on('failure', function(form, action){
				return this.fireEvent('failure', form, action);
			}, this);
			item.on('cancelsubmit', function(form){
				return this.fireEvent('cancelsubmit', form);
			}, this);

			//Chain main form events to inner form
			this.on('beforesubmit', function(form, submitParams, options){
				if(form == null){
					return;
				}
				try{
					this.suspendEvents(false);
					var result = options.form.fireEvent('beforesubmit', form, submitParams);
					this.resumeEvents();
					return result;
				}
				catch(e){}
			}, this, {form: item});
			this.on('submit', function(form, action, options){
				if(form == null){
					return;
				}
				try{
					this.suspendEvents(false);
					var result = options.form.fireEvent('submit', form, action);
					this.resumeEvents();
					return result;
				}
				catch(e){}
			}, this, {form: item});
			this.on('success', function(form, action, options){
				if(form == null){
					return;
				}
				try{
					this.suspendEvents(false);
					var result = options.form.fireEvent('success', form, action);
					this.resumeEvents();
					return result;
				}
				catch(e){}
			}, this, {form: item});
			this.on('failure', function(form, action, options){
				if(form == null){
					return;
				}
				try{
					this.suspendEvents(false);
					var result = options.form.fireEvent('failure', form, action);
					this.resumeEvents();
					return result;
				}
				catch(e){}
			}, this, {form: item});
			this.on('cancelsubmit', function(form, options){
				if(form == null){
					return;
				}
				try{
					this.suspendEvents(false);
					var result = options.form.fireEvent('cancelsubmit', form);
					this.resumeEvents();
					return result;
				}
				catch(e){}
			}, this, {form: item});
		}
	},
	
	setActiveItem: function(item){
		if(!this.center.rendered){
			this.center.on('afterrender', function(panel, options){
				this.setActiveItem(options.item);
			}, this, {item: item});
			return;
		}
		
		//Add item to center
		this.center.add(item);
		
		//save the active item
		this.activeItem = item;
		
		//Make sure the button is toggled
		if(item.navigationButton){
			item.navigationButton.toggle(true);
		}
		
		//Fire the setactiveitem event
		this.fireEvent('setactiveitem', item);
	},
	
	getActiveItem: function(){
		return this.activeItem;
	},
	
	showBusy: function(str) {
		this.statusBar.showBusy(str);
	},
	
	next: function(){
		//Find active index
		var activeIndex = 0;
		var nextIndex = 0;
		var allItems = this.center.items.items;
		var items = [];
		
		this.navigationStore.each(function(record, index){
			var item = record.get('panel');
			if(!item.isDisabled() && item.navigationButton != null){
				items.push(item);
				if(item == this.activeItem){
					activeIndex = items.length - 1;
				}
			}
		}, this);
	   
		nextIndex = activeIndex + 1;
		
		if(nextIndex >= items.length){
			nextIndex = 0;
		}
		this.setActiveItem(items[nextIndex]);
	},
	
	previous: function(){
		//Find active index
		var activeIndex = 0;
		var nextIndex = 0;
		var allItems = this.center.items.items;
		var items = [];
		
		this.navigationStore.each(function(record, index){
			var item = record.get('panel');
			if(!item.isDisabled() && item.navigationButton != null){
				items.push(item);
				if(item == this.activeItem){
					activeIndex = items.length - 1;
				}
			}
		}, this);

		nextIndex = activeIndex - 1;
		
		if(nextIndex < 0){
			nextIndex = items.length - 1;
		}
		this.setActiveItem(items[nextIndex]);
	},
	
	onCenterBeforeAdd: function(item){
		//Add menu item
		this.addNavigation(item);
		
		//Add class to header
		item.on('afterrender', function(item){
			if(item.header != null){
				if(item.header.rendered){
					var headerEl = item.header.getEl();
					headerEl.addCls(this.rootCls + '-center-header');
				}
				else{
					item.header.on('afterrender', function(header){
						var headerEl = header.getEl();
						headerEl.addCls(this.rootCls + '-center-header');
					}, this);
				}
			}
		}, this);
			
		//bind this form with the main form
		this.bindForm(item);
	},
	
	onMouseWheel: function(e){
		return;
		//Check if the active item has autoScroll
		var activeItem = this.center.getLayout().getActiveItem();
		var activeItemScroll = activeItem.body.getScroll();
		if(activeItem.body.dom.scrollHeight > activeItem.body.dom.clientHeight){
			if(activeItemScroll.top + activeItem.body.dom.clientHeight != activeItem.body.dom.scrollHeight){
				return;
			}
			return;
		}
		
		var delta = e.getWheelDelta();
		if (delta < 0) {
			this.next();
		}
		else if (delta > 0) {
			this.previous();
		}
		e.stopEvent();
	},
	
	onBeforeSubmit: function() {
		//this.saving = true;
	},
	
	onSubmit: function() {
		//this.saving = false;
	},
	
	onSuccess: function(response) {
	},
	
	onFailure: function(response) {
		
	}
	
});
Ext.define('TMS.carrier.forms.Carrier', {
	extend:'TMS.form.Navigation',
	
	requires:[
		'Ext.ux.form.field.RealComboBox',
		'TMS.contacts.forms.sections.CarrierInformation',
		'TMS.contacts.forms.sections.ModesEquipment',
		'TMS.contacts.forms.sections.CarrierContacts',
		'TMS.contacts.forms.sections.PayTo',
		'TMS.comment.forms.sections.Comments',
		'TMS.orders.view.FilteredGrid',
		'TMS.documents.view.Interface'
	],
	
	//Config
	title: 'Carrier',
	url: '/at-ajax/modules/contact/process/add',
	carrier_id: 0,
	record: null,
	
	initComponent: function(){
		this.items = this.items || [];
		this.dockedItems = this.dockedItems || [];
		this.init();
		this.callParent(arguments);
	},
	
	init: function() {
		this.initTitle();
		this.initLocations();
		
		this.initGeneralInformationPanel();
		this.initCarrierInformation();
		this.initPayTo();
		this.initGeneralInformation();
		
		this.initModesEquipment();
		this.initContacts();
		this.initComments();
		this.initOrders();
		this.initDocuments();
	},
	
	initTitle: function(){
		if(this.record != null){
			this.title = this.record.CarrName;
		}
	},
	
	initLocations: function(){
		this.locations = Ext.create('TMS.carrier.forms.sections.CarrierLocations', {
			title:'Carrier Locations',
			carrier_id: this.carrier_id
		});
		this.items.push(this.locations);
		
		this.bindForm(this.locations.locationEditor);
	},
	
	initGeneralInformationPanel: function(){
		Ext.get('carrier-general-information').show();
		this.generalInformationPanel = new Ext.panel.Panel({
			scope: this,
			border: false,
			contentEl: 'carrier-general-information'
		});
	},
	
	initCarrierInformation: function(){
		this.carrierInformation = Ext.create('TMS.contacts.forms.sections.CarrierInformation', {
			title: 'Carrier Information',
			border: true,
			carrier_id: this.carrier_id
		});
	},
	
	initGeneralInformation: function(){
		this.generalInformation = new Ext.panel.Panel({
			title: 'General Information',
			bodyPadding: 10,
			defaults:{
				margin: '0 0 10 0'
			},
			items: [
				this.generalInformationPanel,
				this.carrierInformation,
				this.payTo
			]
		});
		this.items.push(this.generalInformation);
	},
	
	initPayTo: function(){
		this.payTo = Ext.create('TMS.contacts.forms.sections.PayTo', {
			title: 'Pay To Information',
			carrier_id: this.carrier_id
		});
		
		this.bindForm(this.payTo);
	},
	
	initModesEquipment: function(){
		this.modesEquipment = Ext.create('TMS.contacts.forms.sections.ModesEquipment', {
			title: 'Allowed Modes & Equipment',
			carrier_id: this.carrier_id
		});
		this.items.push(this.modesEquipment);
	},
	
	initContacts: function(){
		this.contacts = Ext.create('TMS.contacts.forms.sections.CarrierContacts', {
			title: 'Contacts',
			carrier_id: this.carrier_id
		});
		this.items.push(this.contacts);
		
		this.bindForm(this.contacts.contactMethods);
		this.bindForm(this.contacts.preferredStates);
	},
	
	initComments: function(){
		this.comments = Ext.create('TMS.comment.forms.sections.Comments', {
			title: 'Comments',
			field_value: this.carrier_id,
			type:'carrier'
		});
		this.items.push(this.comments);
	},
	
	initOrders: function(){
		this.orders = Ext.create('TMS.orders.view.FilteredGrid', {
			title:'Orders',
			extraFilters:{
				carrier_id: this.carrier_id
			}
		});
		this.items.push(this.orders);
	},
	
	initDocuments: function(){
		this.documents = Ext.create('TMS.documents.view.Interface', {
			title: 'Documents',
			extraParams:{
				carrier_id: this.carrier_id
			}
		});
		this.items.push(this.documents);
	}
});
Ext.define('TMS.carrier.lookup.Carrier', {
	extend: 'Ext.ux.form.field.RealComboBox',
	
	//Config
	processingPage: '/at-ajax/modules/carrier/lookup/carrier',
	displayField: 'carrier_name',
	valueField: 'carrier_id',
	emptyText: 'Search by name or mc number...',
	cls: 'carrier-lookup',
	typeAhead: false,
	hideTrigger:true,
	anchor: '100%',
	pageSize: 10,
	minChars: 0,
	listConfig: {
		loadingText: 'Searching...',
		cls: 'carrier-lookup-list',
		emptyText: 'No matching carriers found.',

		// Custom rendering template for each item
		getInnerTpl: function() {
			return '<div class="carrier-name">{carrier_name}</div>' +
					'<div class="carrier-number">{carrier_mc_no}</div>';
		}
	},
	
	initComponent: function(){
		this.init();
		this.callParent(arguments);
	},
	
	//Init Functions
	init: function(){
		this.initStore();
	},
	
	initStore: function(){
		this.store = new Ext.data.Store({
			fields: [
				'carrier_id',
				'carrier_name',
				'carrier_mc_no'
			],
			remoteSort: true,
			pageSize: 10,
			proxy: {
				type: 'ajax',
				url : this.processingPage,
				reader: {
					type: 'json',
					root: 'records',
					totalProperty: 'total'
				}
			}
		});
	}
});
            
Ext.define('TMS.carrier.view.FilteredGrid', {
	extend: 'Ext.panel.Panel',
	requires:[
		'TMS.carrier.filter.Carrier',
		'TMS.carrier.view.Grid'
	],
	layout:'border',
	gridConfig: {},
	
	constructor: function(){
		this.gridConfig = {};
		return this.callParent(arguments);
	},
	
	initComponent: function(){
		this.dockedItems = this.dockedItems || [];
		this.items = this.items || [];
		this.init();
		this.callParent(arguments);
	},
	
	//Init Functions
	init: function() {
		this.initFilter();
		this.initGrid();
	},
	
	initFilter: function(){
		this.filter = Ext.create('TMS.carrier.filter.Carrier', {
			title: 'Search',
			region: 'east',
			width: 250,
			collapsible: true,
			collapsed: true,
			titleCollapse: true,
			split: true,
			floatable: false
		});
		this.items.push(this.filter);
	},
	
	initGrid: function() {
		this.grid = Ext.create('TMS.carrier.view.Grid', Ext.apply({
			region: 'center',
			filter: this.filter
		}, this.gridConfig));
		this.items.push(this.grid);
	}
	
});
Ext.define('TMS.grid.Grid', {
	extend: 'Ext.grid.Panel',
	
	//Config
	viewConfig: {
		stripeRows: true
	},
	stateful: false,
	
	initComponent: function(){
		this.callParent(arguments);
		this.baseInit();
	},
	
	baseInit: function(){
		this.setListeners();
		this.setFilter(this.filter);
		
		this.on('statesave', function(){
			//console.log(arguments[1]);
		}, this);
	},
	
	setListeners: function(){
		this.store.on('load', function(){
			this.saveState();
		}, this);
	},
	
	setFilter: function(filter){
		if(filter == null){
			return false;
		}
		this.filter = filter;
		
		this.filter.on('filter', function(form, values){
			this.store.proxy.extraParams.filter = Ext.encode(values);
			this.store.loadPage(1);
			this.saveState();
		}, this, {buffer: 500});
		this.store.proxy.extraParams.filter = Ext.encode(this.filter.getValues());
	},
	
	applyState: function(state){
		this.callParent(arguments);
		
		//Apply filter
		if(state.filter != null && this.filter != null){
			this.filter.setValues(state.filter);
			this.store.proxy.extraParams.filter = Ext.encode(this.filter.getValues());
		}
		
		//Apply store
		if(state.store != null){
			Ext.apply(this.store, state.store);
		}
	},
	
	getState: function(){
		var state = this.callParent(arguments);
		
		//If there is a filter save it
		if(this.filter != null){
			state.filter = this.filter.getValues();
		}
		
		//Save the current page
		state.store = {
			currentPage: this.store.currentPage
		};
		
		return state;
	}
});
Ext.define('TMS.carrier.view.Grid', {
	extend: 'TMS.grid.Grid',
	
	//Config
	processingPage: '/at-ajax/modules/carrier/lookup/carrier',
	viewConfig: {
		stripeRows: true
	},
	autoLoadStore: true,
	
	initComponent: function(){
		this.dockedItems = this.dockedItems || [];
		this.init();
		this.callParent(arguments);
	},
	
	//Init Functions
	init: function(){
		this.initColumns();
		this.initStore();
		this.initPager();
		this.initListeners();
	},
	
	initPager: function(){
		this.pager = new Ext.toolbar.Paging({
			store: this.store,
			displayInfo: true,
			dock:'top'
		});
		this.dockedItems.push(this.pager);
	},
	
	initListeners: function(){
		this.on('afterrender', function(){
			if(this.autoLoadStore){
				this.store.load();
			}
		}, this);
	},
	
	initColumns: function(){
		this.columns = [{
			header: 'Name',
			dataIndex: 'carrier_name',
			flex: 2,
			renderer: function(value, options, record){
				return Ext.String.format(
					'<a href="/carriers/?d=carriers&action=view&id={0}">{1}</a>',
					record.get('carrier_id'),
					value
				);
			}
		},{
			header: 'MC#',
			dataIndex: 'carrier_mc_no',
			flex: 1
		},{
			header: 'SCAC',
			dataIndex: 'carrier_scac',
			flex: 1
		},{
			header: 'City',
			dataIndex: 'location_city',
			flex: 1
		},{
			header: 'State',
			dataIndex: 'location_state',
			flex: 1
		},{
			header: 'Zip',
			dataIndex: 'location_zip',
			flex: 1
		}];
	},
	
	initStore: function(){
		this.store = new Ext.data.Store({
			fields: [
				'carrier_id',
				'carrier_scac',
				'carrier_name',
				'carrier_mc_no',
				'location_city',
				'location_state',
				'location_zip'
			],
			remoteSort: true,
			autoLoad: false,
			pageSize: 20,
			proxy: {
				type: 'ajax',
				url : this.processingPage,
				reader: {
					type: 'json',
					root: 'records',
					totalProperty: 'total'
				}
			}
		});
	}
});
Ext.define('TMS.carrier.view.RadiusGrid', {
	extend: 'TMS.carrier.view.FilteredGrid',
	
	//Config
	order_id: 0,
	
	//Init Functions
	init: function() {
		this.gridConfig = {
			autoLoadStore: false
		};
		this.callParent(arguments);
		this.initToolbar();
		this.initRadius();
		this.initFrom();
		//this.initSearchButton();
	},
	
	initToolbar: function(){
		this.toolbar = new Ext.toolbar.Toolbar({
			scope: this,
			docked: 'top'
		});
		this.dockedItems.push(this.toolbar);
	},
	
	initRadius: function(){
		this.radiusStore = Ext.create('Ext.data.Store', {
			fields:['display', 'value'],
			data:[{
				display: '50 Miles',
				value: 50
			},{
				display: '100 Miles',
				value: 100
			},{
				display: '150 Miles',
				value: 150
			},{
				display: '200 Miles',
				value: 200
			},{
				display: '250 Miles',
				value: 250
			}],
			proxy: {
				type: 'memory',
				reader: {
					type: 'json'
				}
			}
		});
		this.radiusSelect = new Ext.form.field.ComboBox({
			scope: this,
			name: 'radiusDistance',
			fieldLabel: 'Radius',
			labelWidth: 50,
			queryMode:'local',
			displayField:'display',
			valueField:'value',
			store:this.radiusStore
		});
		
		this.radiusSelect.on('afterrender', function(){
			this.filter.suspendEvents(false);
			this.radiusSelect.select(this.radiusStore.getAt(1));
			this.filter.resumeEvents();
		}, this);
		
		this.filter.registerFilter(this.radiusSelect);
		
		this.toolbar.add(this.radiusSelect);
	},
	
	initFrom: function(){
		this.fromStore = Ext.create('Ext.data.Store', {
			fields:[
				'location_name_1',
				'address_1',
				'city',
				'state',
				'zip'
			],
			proxy: {
				type: 'ajax',
				url: '/at-ajax/modules/order/order/get-stops',
				extraParams: {
					order_id: this.order_id
				},
				reader: {
					type: 'json',
					root: 'records'
				}
			}
		});
		
		this.on('afterrender', function(){
			this.fromStore.load();
		}, this);
		
		this.fromSelect = new Ext.form.field.ComboBox({
			scope: this,
			name: 'radiusZip',
			fieldLabel: 'From',
			labelWidth: 40,
			queryMode:'local',
			displayField: 'location_name_1',
			valueField:'zip',
			store:this.fromStore,
			listConfig: {
				// Custom rendering template for each item
				getInnerTpl: function() {
					return '<div><b>{location_name_1}</b></div>' +
							'<div style="font-size: 10px; font-style: italic;">{address_1} {city}, {state} {zip}</div>';
				}
			}
		});
		
		this.filter.registerFilter(this.fromSelect);
		
		this.toolbar.add(this.fromSelect);
	},
	
	initSearchButton: function(){
		this.searchButton = new Ext.button.Button({
			scope: this,
			text: 'Search',
			handler: function(){
				
			}
		});
		
		this.toolbar.add(this.searchButton);
	}
	
});
Ext.define('TMS.comment.filter.Comment', {
	extend: 'TMS.filter.Abstract',
	
	init: function(){
		this.initShowAll();
	},
	
	initShowAll: function() {
		this.items.push({
			xtype:'checkbox',
			fieldLabel:'Show All Customer Contacts',
			labelWidth:200,
			name:'showAll'
		});
	}
	
});
Ext.define('TMS.comment.forms.sections.Comments', {
	extend: 'Ext.panel.Panel',
	
	//Requires
	requires:[
		'TMS.comment.view.Grid',
		'TMS.comment.forms.sections.Form',
		'TMS.comment.filter.Comment'
	],
	
	//Config
	layout:'border',
	title:'Comments',
	baseTitle:'Comments',
	
	field_value:0,
	type:'contact',
	extraFilters:{},
	
	initComponent: function(){
		this.items = this.items || [];
		this.dockedItems = this.dockedItems || [];
		this.init();
		this.callParent(arguments);
	},
	
	init: function() {
		this.initTopBar();
		this.initGrid();
		this.initForm();
		this.initFilter();
		this.initListeners();
	},
	
	initTopBar: function() {
		this.topToolbar = Ext.create('Ext.toolbar.Toolbar', {
			dock:'top',
			items:[{
				scope:this,
				text:'Add New Comment',
				handler:this.addNewComment,
				icon:'/resources/icons/add-16.png'
			}]
		});
		this.dockedItems.push(this.topToolbar);
	},
	
	initGrid: function() {
		this.gridPanel = Ext.create('TMS.comment.view.Grid', {
			region:'center',
			field_value:this.field_value,
			type:this.type
		});
		this.items.push(this.gridPanel);
	},
	
	initForm: function() {
		this.formPanel = Ext.create('TMS.comment.forms.sections.Form', {
			field_value:this.field_value,
			commentType:this.type
		});
		
		this.formWindow = Ext.create('Ext.window.Window', {
			title:'Comment Details',
			autoShow:false,
			modal:true,
			resizable:false,
			draggable:false,
			width:400,
			closeAction:'hide',
			items:[
				this.formPanel
			]
		});
		
		this.formPanel.getForm().setValues({
			field_value:this.field_value
		});
		
	},
	
	addNewComment: function() {
		this.formPanel.getForm().reset();
		this.formPanel.getForm().setValues({
			field_value:this.field_value
		});
		this.formPanel.selectFirst();
		this.formPanel.bottomToolbar.enable();
		this.formWindow.show();
	},
	
	initFilter: function() {
		this.filterPanel = Ext.create('TMS.comment.filter.Comment', {
			region:'east',
			width:250,
			title:'Filter',
			collapsible:true,
			collapsed:true,
			titleCollapse:true
		});
		
		this.filterPanel.on('filter', function(form, values){
			Ext.apply(values, this.extraFilters);
			this.gridPanel.store.proxy.extraParams.filter = Ext.encode(values);
			this.gridPanel.store.loadPage(1);
		}, this);
		
		this.items.push(this.filterPanel);
	},
	
	initListeners: function() {
		this.gridPanel.store.on('load', function(store) {
			if (store.totalCount) {
				this.setTitle(this.baseTitle + ' (' + store.totalCount + ')');
			}
			else {
				this.setTitle(this.baseTitle);
			}
		}, this);
		
		this.formPanel.on('formsuccess', function() {
			this.gridPanel.store.load();
			this.addNewComment();
			this.formWindow.hide();
		}, this);
		this.formPanel.on('formfailure', function() {
			
		}, this);
		
		this.gridPanel.on('itemclick', function(grid, record, item, index, e) {
			var data = record.data;
			this.formPanel.getForm().setValues(data);
			this.formPanel.expand();
			this.formPanel.bottomToolbar.disable();
		}, this);
	}
});
Ext.define('TMS.comment.forms.sections.Form', {
	extend:'Ext.form.Panel',
	
	//Requires
	requires:[
		'Ext.ux.form.field.RealComboBox'
	],
	
	layout: 'anchor',
	processingPage:'/at-ajax/modules/comment/process/',
	defaults:{
		anchor: '100%'
	},
	
	commentType: 'contact',
	field_value:0,
	
	initComponent: function() {
		this.items = this.items || [];
		this.dockedItems = this.dockedItems || [];
		this.init();
		this.callParent(arguments);
	},
	
	init: function() {
		this.initStore();
		this.initBottomBar();
		this.initCommentType();
		this.initCommentBox();
		this.initHidden();
	},
	
	initStore: function(){
		this.store = Ext.create('Ext.data.Store', {
			fields: [
				'comment_type_id',
				'comment_type_name'
			],
			proxy: {
				type: 'ajax',
				url: this.processingPage + 'get-comment-types',
				reader: {
					type: 'json',
					root: 'records'
				},
				extraParams: {
					commentType: this.commentType
				}
			}
		});
		this.store.load();
		this.store.on('load', this.selectFirst, this);
	},
	
	selectFirst: function() {
		if (this.commentType) {
			var record = this.commentType.store.getAt(0);
			if (record) {
				this.commentType.setValue(record.get('comment_type_id'));
			}
		}
	},
	
	initBottomBar: function() {
		this.bottomToolbar = Ext.create('Ext.toolbar.Toolbar', {
			dock:'bottom',
			pack:'right'
		});
		this.dockedItems.push(this.bottomToolbar);
		
		this.bottomToolbar.add('->', {
			scope:this,
			text:'Save Comment',
			handler:this.saveComment,
			icon:'/resources/icons/save-16.png'
		});
	},
	
	initCommentType: function(){
		this.commentType = Ext.create('Ext.ux.form.field.RealComboBox', {
			fieldLabel: 'Type',
			store: this.store,
			displayField: 'comment_type_name',
			valueField: 'comment_type_id',
			labelWidth: 50,
			name: 'comment_type_id',
			margin: '10',
			queryMode:'local'
		});
		
		this.commentType.on('change', function(o, result) {
			if (result) {
				this.comment.show();
			}
			else {
//				this.comment.hide();
			}
		}, this);
		this.items.push(this.commentType);
	},
	
	initCommentBox: function() {
		this.comment = Ext.create('Ext.form.TextArea', {
			grow: true,
			anchor: '100%',
			name: 'comment', 
			margin: '10',
			height:70
		});
//		this.comment.hide();
		this.items.push(this.comment);
	},
	
	initHidden: function() {
		this.commentId = Ext.create('Ext.form.field.Hidden', {
			name:'comment_id',
			value:0
		});
		this.items.push(this.commentId);
		
		this.fieldValue = Ext.create('Ext.form.field.Hidden', {
			name:'field_value',
			value:this.field_value
		});
		this.items.push(this.fieldValue);
		
	},
	
	changeCommentType: function(typeId) {
		this.commentType.clearValue();
		this.store.proxy.extraParams.group_id = typeId;
		this.store.load();
		this.commentType.fireEvent('change');
	},
	
	saveComment: function() {
		this.setLoading('Saving');
		this.getForm().submit({
			scope:this,
			url:this.processingPage + 'save-comment',
			success: function(form, action) {
				this.setLoading(false);
				this.fireEvent('formsuccess');
			},
			failure: function(form, action) {
				this.setLoading(false);
				this.fireEvent('formfailure');
				Ext.Msg.alert('Failure', action.result.errorStr);
			}
		});
	}
});
Ext.define('TMS.comment.view.Grid', {
	extend: 'Ext.grid.Panel',
	
	requires:[
		'Ext.ux.RowExpander'
	],
	
	processingPage: '/at-ajax/modules/comment/process/',
	viewConfig: {
		stripeRows: true
	},
	features: [{
		ftype: 'rowbody',
		getAdditionalData: function(data, idx, record, orig) {
			var headerCt = this.view.headerCt,
				colspan  = headerCt.getColumnCount();

			return {
				rowBody: record.get('comment'),
				rowBodyCls: this.rowBodyCls,
				rowBodyColspan: colspan
			};
		}
	}],
	disableSelection: true,
	
	field_value:0,
	type: 'contact',
	
	initComponent: function(){
		this.init();
		this.callParent(arguments);
	},
	
	init: function(){
		this.initColumns();
		this.initStore();
		this.initPager();
		this.initListeners();
	},
	
	initColumns: function(){
		this.columns = [{
			header: 'Comment About',
			dataIndex: 'field_display',
			width: 100,
			xtype:'templatecolumn',
			tpl:'{field_display}'
		},{
			header:'Created By',
			dataIndex: 'created_by_first_name',
			width: 100,
			xtype:'templatecolumn',
			tpl:'{created_by_first_name} {created_by_last_name}'
		},{
			header:'Created At',
			dataIndex:'created_at'
		},{
			header:'Type',
			dataIndex:'comment_type_name'
		},{
			header:'Comment',
			dataIndex:'comment',
			flex:1,
			sortable:false
		}];
	},
	
	initStore: function(){
		this.store = new Ext.data.Store({
			fields: [
				'comment_id',
				'comment',
				
				'field_value',
				'field_display',
				
				'created_by_id',
				'created_by_first_name',
				'created_by_last_name',
				
				'created_at',
				'updated_at',
				'comment_type_id',
				
				'comment_type_name'
			],
			remoteSort: true,
			pageSize: 10,
			proxy: {
				type: 'ajax',
				url : this.processingPage + 'get-grid-records',
				reader: {
					type: 'json',
					root: 'records',
					totalProperty: 'total'
				},
				extraParams:{
					field_value:this.field_value,
					type:this.type
				}
			}
		});
	},
	
	initPager: function(){
		this.pager = new Ext.toolbar.Paging({
			store: this.store,
			displayInfo: true
		});
		this.tbar = this.pager;
	},
	
	initListeners: function(){
		this.on('afterrender', function(){
			this.store.load();
		}, this);
		
		this.store.on('load', function(store, records) {
			return;
			var nodes = this.getView().getNodes();
			Ext.each(nodes, function(node){
				Ext.create('Ext.tip.ToolTip', {
					scope: this,
					target: node,
					anchor: 'top',
					autoHide: true,
					html: this.getView().getRecord(node).get('comment'),
					listeners: {
						'beforeshow': Ext.bind(function(){
							
						}, this)
					}
				});
			}, this);
		}, this);
	}
	
});
Ext.define('TMS.contacts.filter.Contact', {
	extend: 'TMS.filter.Abstract',
	
	//Requires
	requires:[
		'Ext.ux.form.field.RealComboBox'
	],
	
	init: function(){
		this.initName();
		this.initCompany();
		this.initOwner();
		this.initUpToDate();
		this.initStatus();
	},
	
	initName: function(){
		this.items.push({
			name: 'name',
			fieldLabel: 'Name'
		});
	},
	
	initCompany: function(){
		this.items.push({
			name: 'company',
			fieldLabel: 'Company'
		});
	},
	
	initOwner: function() {
		this.items.push({
			name: 'owner',
			fieldLabel: 'Owner'
		});
	},
	
	initUpToDate: function() {
		var data = {
			data:[{
				'upToDate':-1,
				'display':'All'
			},{
				'upToDate':0,
				'display':'No'
			},{
				'upToDate':1,
				'display':'Yes'
			}]
		};
		this.upToDateStore = Ext.create('Ext.data.Store', {
			autoLoad: true,
			fields:['upToDate', 'display'],
			data:data,
			proxy: {
				type: 'memory',
				reader: {
					type: 'json',
					root: 'data'
				}
			}
		});
		this.items.push({
			xtype:'realcombobox',
			queryMode:'local',
			name: 'upToDate',
			displayField:'display',
			valueField:'upToDate',
			fieldLabel: 'Up To Date',
			store:this.upToDateStore
		});
	},
	
	initStatus: function() {
		var data = {
			data:[{
				'status_id':-1,
				'status_name':'All'
			},{
				'status_id':9,
				'status_name':'Cold'
			},{
				'status_id':10,
				'status_name':'Warm'
			},{
				'status_id':11,
				'status_name':'Hot'
			}]
		};
		this.statusStore = Ext.create('Ext.data.Store', {
			autoLoad: true,
			fields:['status_id', 'status_name'],
			data:data,
			proxy: {
				type: 'memory',
				reader: {
					type: 'json',
					root: 'data'
				}
			}
		});
		this.items.push({
			xtype:'realcombobox',
			queryMode:'local',
			name: 'status',
			displayField:'status_name',
			valueField:'status_id',
			fieldLabel: 'Status',
			store:this.statusStore
		});
	}
	
});
Ext.define('TMS.contacts.forms.sections.BillTo', {
	extend:'TMS.form.Abstract',
	
	//requires
	requires:[
		'Ext.ux.form.field.RealComboBox',
		'TMS.customer.lookup.Customer',
		'TMS.location.lookup.Location'
	],
	
	
	//Config
	contact_id:0,
	location_id:0,
	bodyStyle:{
		padding:'8px'
	},
	processingPage:'/at-ajax/modules/contact/process/',
	url:'/at-ajax/modules/contact/process/save-bill-to',
	title:'Bill To',
	baseTitle:'Bill To',
	autoSave:false,
	
	layout: 'anchor',
	defaults:{
		anchor: '100%'
	},
	
	recordLoaded:false,
	
	initComponent: function(){
		this.items = this.items || [];
		this.dockedItems = this.dockedItems || [];
		this.addEvents('recordload');
		this.init();
		this.callParent(arguments);
	},
	
	init: function() {
		this.initToolbar();
		this.initCompanySelector();
		this.initLocationSelector();
		this.initHidden();
		this.initListeners();
		this.load(this.contact_id);
	},
	
	initToolbar: function() {
		this.removeBillToButton = Ext.create('Ext.button.Button', {
			scope:this,
			text:'Remove Bill To',
			handler:this.removeBillTo
		})
		this.topBar = Ext.create('Ext.toolbar.Toolbar', {
			dock:'top',
			items:[
				this.removeBillToButton
			]
		});
		this.dockedItems.push(this.topBar);
	},
	
	initCompanySelector: function() {
		this.companySelector = Ext.create('TMS.customer.lookup.Customer', {
			fieldLabel:'Company',
			name:'bill_to_customer_id'
		});
		this.items.push(this.companySelector);
	},
	
	initLocationSelector: function() {
		this.locationSelector = Ext.create('TMS.location.lookup.Location', {
			fieldLabel:'Location',
			type: 'customer',
			name:'bill_to_location_id'
		});
		this.items.push(this.locationSelector);
	},
	
	initHidden: function() {
		this.contactIdField = Ext.create('Ext.form.field.Hidden', {
			name:'contact_id',
			value: this.contact_id
		});
		this.items.push(this.contactIdField);
	},
	
	initListeners: function() {
		this.companySelector.on('select', function(field, records) {
			if(!records.length){
				this.locationSelector.disable();
				return false;
			}
			this.locationSelector.enable();
			var record = records[0];
			this.locationSelector.setRawValue('');
			this.locationSelector.setValue(0);
			this.locationSelector.store.proxy.extraParams.to_id = record.get('customer_id');
			this.locationSelector.store.proxy.extraParams.locationType = 'Billing';
			this.locationSelector.store.load();
			this.locationSelector.focus(true, 50);
		}, this);
		
		this.locationSelector.on('select', function(field, records) {
			var record = records[0];
			this.location_id = record.get('location_id');
			this.save();
		}, this);
		
		this.on('beforesubmit', function(){
			this.contactIdField.setValue(this.contact_id);
		}, this);
	},
	
	removeBillTo: function() {
		this.locationSelector.setValue('');
		this.location_id = 0;
		
		if (this.autoSave && this.contact_id) {
			this.submit();
		}
	},
	
	save: function() {
		if (this.autoSave && this.contact_id && this.location_id) {
			this.submit();
		}
	},
	
	load: function(contact_id) {
		this.contact_id = contact_id;
		
		if (this.contact_id) {
			this.setLoading(true);
			Ext.Ajax.request({
				scope:this,
				method:'post',
				url:this.processingPage + 'get-bill-to-data',
				params:{
					contact_id:this.contact_id
				},
				success: function(r) {
					this.setLoading(false);
					var response = Ext.decode(r.responseText);
					this.fireEvent('recordload', this, response);
					this.recordLoaded = true;
					if (response.success) {
						this.companySelector.setValue(response.record.customer_id);
						this.companySelector.setRawValue(response.record.customer_name);
						this.locationSelector.setValue(response.record.location_id);
						this.locationSelector.setRawValue(response.record.location_name_1 + ' ' + response.record.location_name_2);
						this.locationSelector.store.proxy.extraParams.to_id = response.record.customer_id;
//						this.setTitle(this.baseTitle + ' for ' + response.record.contact_name);
					}
					else {
						this.companySelector.setValue(0);
						this.companySelector.setRawValue('');
						this.locationSelector.setValue(0);
						this.locationSelector.setRawValue('');
					}
				}
			});
		}
	}
	
});
Ext.define('TMS.contacts.forms.sections.CarrierContacts', {
	extend:'Ext.panel.Panel',
	requires:[
		'Ext.ux.form.field.RealComboBox',
		'Ext.ux.form.field.BoxSelect',
		'TMS.contacts.forms.sections.ContactMethods',
		'TMS.contacts.forms.sections.PreferredStates'
	],
	carrier_id:0,
	layout: {
		type: 'hbox',
		align: 'stretch'
	},
	processingPage:'/at-ajax/modules/carrier/process/',
	
	initComponent: function(){
		this.items = this.items || [];
		this.dockedItems = this.dockedItems || [];
		this.init();
		this.callParent(arguments);
	},
	
	init: function() {
		this.initToolbar();
		this.initLayoutPanels();
		this.initContactMethods();
		this.initPreferredStates();
		this.initContactStore();
		this.initContactSelectorView();
	},
	
	initToolbar: function() {
		this.toolbar = Ext.create('Ext.toolbar.Toolbar', {
			dock:'top',
			items:[{
				scope:this,
				text:'Add New Contact',
				icon:'/resources/icons/add-16.png',
				handler:this.addNewContact
			}]
		});
		this.dockedItems.push(this.toolbar);
	},
	
	addNewContact: function() {
		var url = '/contacts/?d=contacts&a=add&carrier_id=' + this.carrier_id;
		window.open(url, '_blank');
	},
	
	initLayoutPanels: function() {
		this.leftPanel = Ext.create('Ext.panel.Panel', {
			title:'Contacts',
			width: 200
		});
		
		this.viewContactPageButton = Ext.create('Ext.button.Button', {
			scope:this,
			text:'View Contact Page',
			handler:this.viewContactPageClick,
			icon:'/resources/icons/preview-16.png'
		});
		
		this.rightPanel = Ext.create('Ext.panel.Panel', {
			flex: 1,
			layout:{
				type: 'vbox',
				align: 'stretch'
			},
			defaults:{
				autoScroll: true,
				flex: 1
			},
			tbar:[
				this.viewContactPageButton
			]
		});
		
		this.items.push(this.leftPanel, this.rightPanel);
	},
	
	viewContactPageClick: function() {
		var records = this.contactSelectorView.getSelectionModel().getSelection();
		if (records && records.length) {
			var record = records[0];
			var url = '/contacts/?d=contacts&a=view&id=' + record.data.contact_id;
			window.open(url, '_blank');
		}
	},
	
	initContactMethods: function() {
		this.contactMethods = Ext.create('TMS.contacts.forms.sections.ContactMethods', {
			autoSave: true
		});
		this.rightPanel.add(this.contactMethods);
	},
	
	initPreferredStates: function() {
		this.preferredStates = Ext.create('TMS.contacts.forms.sections.PreferredStates');
		this.rightPanel.add(this.preferredStates);
	},
	
	initContactStore: function() {
		this.contactStore = Ext.create('Ext.data.Store', {
			fields: [
				'contact_id',
				'first_name',
				'last_name'
			],
			proxy: {
				type: 'ajax',
				url: this.processingPage + 'get-contacts',
				extraParams:{
					carrier_id:this.carrier_id
				},
				reader: {
					type: 'json',
					root: 'records'
				}
			}
		});
		this.contactStore.on('load', this.selectFirst, this);
		this.on('afterrender', function(){
			this.contactStore.load();
		}, this);
	},
	
	initContactSelectorView: function() {
		this.contactSelectorView = Ext.create('Ext.view.View', {
			title:'Contacts',
			store:this.contactStore,
			tpl:[
				'<tpl for=".">',
					'<div class="carrier-contact-row">{first_name} {last_name}</div>',
				'</tpl>',
				'<div class="x-clear"></div>',
			],
			autoHeight:true,
			trackOver: true,
			overItemCls:'carrier-contact-row-hover',
			selectedItemCls:'carrier-contact-row-selected',
			itemSelector:'.carrier-contact-row',
			emptyText: 'No contacts',
			deferEmptyText:false,
			listeners: {
				scope:this,
				selectionchange: function(dv, nodes) {
					if (nodes.length) {
						this.selectRecord(nodes[0].index);
					}
				}
			}
		});
		this.leftPanel.add(this.contactSelectorView);
	},
	
	selectFirst: function() {
		if (this.contactStore.count()) {
			this.leftPanel.doLayout();
			this.contactSelectorView.suspendEvents();
			this.selectRecord(0);
			this.contactSelectorView.resumeEvents();
		}
		else {
			this.rightPanel.hide();
		}
	},
	
	selectRecord: function(index) {
		// Get the record based on the index
		this.contactSelectorView.select(index);
		var record = this.contactStore.getAt(index);
		var contact_id = record.data.contact_id;
		
		// Update the right side panel's title
		var name = record.data.first_name + ' ' + record.data.last_name;
		this.rightPanel.setTitle(name);
		
		// Load the information panels for this contact
		this.contactMethods.loadRecord(contact_id);
		this.preferredStates.loadContact(contact_id, this.carrier_id);
	}
	
});
Ext.define('TMS.contacts.forms.sections.CarrierInformation', {
	extend:'Ext.panel.Panel',
	requires:[
		'TMS.carrier.lookup.Carrier',
		'TMS.location.lookup.Location',
		'TMS.location.forms.Form',
		'TMS.form.plugin.StatusBar',
		'TMS.ActionWindow'
	],
	
	//Config
	bodyStyle:{
		padding:'10px'
	},
	border: false,
	processingPage:'/at-ajax/modules/carrier/process/',
	carrierProcessingPage: '/at-ajax/modules/carrier/process/',
	carrierLookupPage: '/at-ajax/modules/carrier/lookup/',
	contact_id:0,
	fieldValues:{},
	layout: 'anchor',
	defaults:{
		anchor: '100%'
	},
	
	initComponent: function(){
		this.items = [];
		this.init();
		this.callParent(arguments);
	},
	
	init: function() {
		
		//Init Containers
		this.initCarrierPanel();
		this.initLocationPanel();
		
		//Init items
		this.initCarrierLookup();
		this.initLocationLookup();
		
		this.initListeners();
	},
	
	initListeners: function() {
		if(this.carrier_id){
			this.on('afterrender', function(){
				
				//Pass the contact id to the customer lookup
				this.carrierLookup.loadFromStore({
					carrier_id: this.carrier_id
				}, false);
				
				//Pass the carrier id to the location lookup
				this.locationLookup.store.on('load', function(store, records){
					if(records.length){
						this.locationLookup.enable();
						this.locationLookup.select(records[0]);
					}
				}, this, {single: true});
				this.locationLookup.store.load({
					params:{
						to_id: this.carrier_id
					}
				});
				
			});
		}
	},
	
	initCarrierPanel: function(){
		this.carrierPanel = new Ext.panel.Panel({
			scope: this,
			layout: 'hbox',
			border: false,
			unstyled: true,
			autoHeight: true,
			defaults:{
				margin: 2
			}
		});
		this.items.push(this.carrierPanel);
	},
	
	initLocationPanel: function(){
		this.locationPanel = new Ext.panel.Panel({
			scope: this,
			layout: 'hbox',
			border: false,
			unstyled: true,
			autoHeight: true,
			defaults:{
				margin: 2
			}
		});
		this.items.push(this.locationPanel);
	},
	
	initCarrierLookup: function(){
		this.carrierLookup = Ext.create('TMS.carrier.lookup.Carrier', {
			fieldLabel: 'Carrier',
			flex: 1
		});
		
		this.carrierAddButton = new Ext.button.Button({
			scope: this,
			width: 150,
			text: 'Add New Carrier',
			handler: function(){
				var win = this.createLocationWindow({
					title: 'Add New Carrier'
				});
				var mcNumberField = new Ext.form.field.Text({
					xtype: 'textfield',
					name: 'mc_no',
					fieldLabel: 'MC Number',
					enableKeyEvents: true,
					msgTarget: 'under'
				});
				
				this.carrierApproval = Ext.create('Ext.Img', {
					src: '/resources/silk_icons/thumbs_down_red.png',
					width: 24,
					height: 24
				});
				
				this.carrierInsurance = Ext.create('Ext.form.FieldSet', {
					items: [],
					title: 'Insurance Information',
					getFieldValues: function(){
						var a = [];
						Ext.each(this.items.items, function(item){
							a.push( item.getForm().getValues() );
						}, this);
						return a;
					}
				});
				
				carrierApprovalPanel = new Ext.Container({
					items: [ this.carrierApproval, this.carrierInsurance ],
					hidden: true
				});
				
				
				//Run when the mcnumber is changed
				mcNumberField.on('change', function(field, value, oldValue){
					if(value == oldValue){
						return;
					}
					
					var mcNum = field.getValue();
					if (mcNum.length != 6) return;
					
					win.setLoading(true);
					win.form.locationSection.clearFieldValues();
					
					
					//Send a request to get the carrier411 info
					Ext.Ajax.request({
						scope: this,
						url: this.carrierLookupPage + 'carrier411',
						params: {
							mc: field.getValue()
						},
						success: function(r, request){
							var response = Ext.JSON.decode(r.responseText);
							if(response.record != null){
								thumbsUp = false; //guilty until proven innocent.
								
								//Auth check
								if (response.record.FMCSACOMMON == 'A' || response.record.FMCSACONTRACT == 'A'){
									//Safety check
									if (response.record.SAFETYRATING != 'N'){
										//Insurance check.
										if (response.record.insurance.length)
											thumbsUp = true;
									}
								}
								
								if (thumbsUp) this.carrierApproval.setSrc('/resources/silk_icons/thumbs_up_green.png');
								else this.carrierApproval.setSrc('/resources/silk_icons/thumbs_down_red.png');
								
								this.carrierInsurance.removeAll(true);
								
								Ext.each(response.record.insurance, function(ins, i){
									this.carrierInsurance.add(
										new Ext.form.Panel({
											items: [{
												xtype: 'displayfield',
												name: 'type',
												fieldLabel: 'Type',
												value: ins.INSURTYPE
											},{
												xtype: 'displayfield',
												name: 'effective',
												fieldLabel: 'Effective Date',
												value: ins.INSUREFFECTIVE
											},{
												xtype: 'hidden',
												name: 'insurance_type_name',
												fieldLabel: 'Type',
												value: ins.INSURTYPE
											},{
												xtype: 'hidden',
												name: 'effective_date',
												fieldLabel: 'Effective Date',
												value: ins.INSUREFFECTIVE
											},{
												xtype: 'hidden',
												name: 'agency_name',
												value: ins.INSURCOMPANY
											},{
												xtype: 'hidden',
												name: 'policy_number',
												value: ins.INSURPOLICYNUM
											},{
												xtype: 'hidden',
												name: 'insurance_value',
												value: (ins.INSURBIPDTO ? ins.INSURBIPDTO : '')
											}],
											bodyStyle: {
												background: (i % 2 ? '#eaeaea' : ''),
												border: 0
											}
										})
									);
								}, this);
								
								var carrierObject = {
									name1: response.record.FMCSALEGALNAME,
									name2: response.record.FMCSADBANAME,
									address1: response.record.FMCSABUSADDRESS,
									zip: response.record.FMCSABUSZIP.split('-',1),
									phone: response.record.FMCSABUSPHONE,
									safety_rating_date: response.record.SAFETYRATEDATE,
									safety_rating: response.record.SAFETYRATING,
									insurance: thumbsUp //insTypes,
								};
								win.form.getForm().setValues(carrierObject);
								carrierApprovalPanel.show();
							}else{
								//carrierInfo.hide();
								carrierApprovalPanel.hide();
								mcNumberField.markInvalid( response.errors );
							}
							win.setLoading(false);
							win.doLayout();
						}
					});
				}, this, {buffer: 250});
				Ext.each(win.form.locationSection.items.items, function(d,i){
					d.setReadOnly(true);
				});
				win.form.locationSection.insert(0, mcNumberField);
				win.form.locationSection.insert(0, carrierApprovalPanel);
				
				win.form.on('success', function(form, action){
					var result = action.result;
										
					//Create and link the carrier
					Ext.Ajax.request({
						scope: this,
						url: this.carrierProcessingPage + 'process',
						locationResult: result,
						params: Ext.apply({
							location_id: result.record.location_id,
							insurance_info: Ext.encode(this.carrierInsurance.getFieldValues())
						}, form.getValues()),
						success: function(r, request){
							var response = Ext.JSON.decode(r.responseText);
							var locationRecord = request.locationResult.record;
							
							if(response.success){
								win.setLoading(false);
								win.destroy();

								//Set the carrier lookup value and auto select the correct record
								this.carrierLookup.store.on('load', function(store, records, successful, options){
									if(records.length){
										this.carrierLookup.select(records[0]);
									}
								}, this, {single: true});

								this.carrierLookup.store.load({
									params:{
										carrier_id: response.record.carrier_id
									}
								});

								//Set the location and auto select the correct record
								this.locationLookup.enable();

								this.locationLookup.store.on('load', function(store, records, successful, options){
									if(records.length){
										this.locationLookup.select(records[0]);
									}
								}, this, {single: true});

								this.locationLookup.store.proxy.extraParams.to_id = response.record.customer_id;
								this.locationLookup.store.load({
									params:{
										location_id: locationRecord.location_id
									}
								});
							}
						}
					});
				}, this);
				
			}
		});
		
		this.carrierPanel.add(this.carrierLookup, this.carrierAddButton);
	},
	
	initLocationLookup: function(){
		this.locationLookup = Ext.create('TMS.location.lookup.Location', {
			type: 'carrier',
			fieldLabel: 'Location',
			flex: 1,
			disabled: true,
			hiddenName: 'location_id'
		});
		
		this.carrierLookup.on('select', function(field, records){
			if(!records.length){
				this.locationLookup.disable();
				return false;
			}
			this.locationLookup.enable();
			var record = records[0];
			this.locationLookup.setValue('');
			this.locationLookup.setRawValue('');
			this.locationLookup.store.proxy.extraParams.to_id = record.get('carrier_id');
			this.locationLookup.store.loadPage(1);
			this.locationLookup.focus(true, 50);
			this.locationLookup.expand();
		}, this);
		
		this.locationAddButton = new Ext.button.Button({
			scope: this,
			width: 150,
			text: 'Add New Location',
			disabled: true,
			handler: function(){
				var win = this.createLocationWindow({
					title: 'Add New Location'
				});
				win.on('show', function(panel){
					panel.down('textfield[name=name1]').setValue(this.locationLookup.getRawValue());
					panel.down('textfield[name=name1]').focus(true, 50);
				}, this);
				win.on('failure', function(form, action){
					var html = action.result.errors.join(', ');
					
					Ext.MessageBox.alert('Errors', html, Ext.bind(function(){
						this.setLoading(false);
					}, win));
				}, win);
				win.on('success', function(form, action){
					var result = action.result;
					//Create and link the customer
					Ext.Ajax.request({
						scope: this,
						url: this.carrierProcessingPage + 'add-location',
						locationResult: result,
						params: {
							carrier_id: this.carrierLookup.getValue(),
							location_id: result.record.location_id
						},
						success: function(r, request){
							var response = Ext.JSON.decode(r.responseText);
							var locationRecord = request.locationResult.record;
							win.setLoading(false);
							win.destroy();

							//Set the location and auto select the correct record
							this.locationLookup.enable();

							this.locationLookup.store.on('load', function(store, records, successful, options){
								if(records.length){
									this.locationLookup.select(records[0]);
								}
							}, this, {single: true});

							this.locationLookup.store.proxy.extraParams.to_id = this.carrierLookup.getValue();
							this.locationLookup.store.load({
								params:{
									location_id: locationRecord.location_id
								}
							});

						}
					});
				}, this);
				win.show();
			}
		});
		
		this.locationLookup.on('disable', function(){
			this.locationAddButton.disable();
		}, this);
		this.locationLookup.on('enable', function(){
			this.locationAddButton.enable();
		}, this);
		
		this.locationPanel.add(this.locationLookup, this.locationAddButton);
	},
	
	createLocationWindow: function(config){
		var locationForm = Ext.create('TMS.location.forms.Form', {
			scope: this,
			autoScroll: true,
			plugins:[Ext.create('TMS.form.plugin.StatusBar')],
			carrier_id:this.carrierLookup.getValue()
		});
		var win = Ext.create('TMS.ActionWindow', Ext.apply({
			scope: this,
			layout: 'fit',
			modal: true,
			form: locationForm,
			items:[locationForm],
			dockedItems: [{
				xtype: 'toolbar',
				dock: 'bottom',
				ui: 'footer',
				layout:{
					pack: 'center'
				},
				items: [{
					scope: this,
					type: 'button',
					text: 'Save',
					handler: function(){
						win.form.submit();
					}
				},{
					scope: this,
					type: 'button',
					text: 'Cancel',
					handler: function(){
						win.destroy();
					}
				}]
			}]
		}, config));
		return win;
	}
});

Ext.define('TMS.contacts.forms.sections.Claim', {
	extend:'TMS.ActionWindow',
	
	title:'Claim Contact',
	processingPage:'/at-ajax/modules/contact/process/',
	
	contact_id:0,
	defaultText:'',
	
	init: function() {
		this.on('afterrender', this.claimContact, this);
		this.initButtons();
	},
	
	claimContact: function() {
		this.setLoading(true);
		Ext.Ajax.request({
			scope:this,
			method:'post',
			url:this.processingPage + 'claim-contact',
			params:{
				contact_id:this.contact_id
			},
			success: function(r) {
				this.setLoading(false);
				var response = Ext.decode(r.responseText);
				if (response.success) {
					this.update(response.msg[0]);
					this.showCloseButton();
				}
				else {
					this.update(response.errorStr);
				}
			}
		});
	},
	
	initButtons: function() {
		this.addBottomButton([{
			scope:this,
			text:'Close',
			handler: function() {
				this.close();
			}
		}]);
	}
	
});
Ext.define('TMS.contacts.forms.sections.CompanyInformation', {
	extend:'Ext.panel.Panel',
	requires:[
		'TMS.customer.lookup.Customer',
		'TMS.location.lookup.Location',
		'TMS.customer.forms.Form',
		'TMS.form.plugin.StatusBar',
		'TMS.ActionWindow',
		'TMS.location.forms.Form'
	],
	
	//Config
	bodyStyle:{
		padding:'10px'
	},
	title:'Company Information',
	processingPage:'/at-ajax/modules/contact/process/',
	customerProcessingPage: '/at-ajax/modules/customer/process/',
	contact_id:0,
	fieldValues:{},
	layout: 'anchor',
	defaults:{
		anchor: '100%'
	},
	
	isPayTo:false, // we are going to be adding pay to companies and locations as customers for now and marking the status as a different number
	
	initComponent: function(){
		this.items = [];
		this.init();
		this.callParent(arguments);
	},
	
	init: function() {
		
		//Init Containers
		this.initCustomerPanel();
		this.initLocationPanel();
		
		//Init items
		this.initCustomerLookup();
		this.initLocationLookup();
		
		//Init any listeners
		this.initListeners();
	},
	
	initListeners: function(){
		this.on('expand', function() {
			this.scrollIntoView();
		}, this);
		
		if(this.contact_id){
			this.on('afterrender', function(){
				
				//Pass the contact id to the customer lookup
				this.customerLookup.store.on('load', function(store, records){
					if(records && records.length){
						this.customerLookup.select(records[0]);
					}
				}, this, {single: true});
				this.customerLookup.store.load({
					params:{
						contact_id: this.contact_id
					}
				});
				
				//Pass the cntact id to the location lookup
				this.locationLookup.store.on('load', function(store, records){
					if(records && records.length){
						this.locationLookup.enable();
						this.locationLookup.select(records[0]);
					}
				}, this, {single: true});
				this.locationLookup.store.load({
					params:{
						contact_id: this.contact_id
					}
				});
				
			});
			
			this.locationLookup.on('select', function(field, records){
				if (records && records.length) {
					var record = records[0];
					var location_id = record.data.location_id;
					Ext.Ajax.request({
						scope:this,
						method:'post',
						url:this.processingPage + 'save-location',
						params:{
							contact_id:this.contact_id,
							location_id:location_id
						}
					});
				}
			}, this);
		}
	},
	
	
	initCustomerPanel: function(){
		this.customerPanel = new Ext.panel.Panel({
			scope: this,
			layout: 'hbox',
			border: false,
			unstyled: true,
			defaults:{
				margin: 2
			}
		});
		this.items.push(this.customerPanel);
	},
	
	initLocationPanel: function(){
		this.locationPanel = new Ext.panel.Panel({
			scope: this,
			layout: 'hbox',
			border: false,
			unstyled: true,
			defaults:{
				margin: 2
			}
		});
		this.items.push(this.locationPanel);
	},
	
	initCustomerLookup: function(){
		this.customerLookup = Ext.create('TMS.customer.lookup.Customer', {
			fieldLabel: 'Company',
			flex: 1,
			proxyParams:{
				isPayTo:this.isPayTo
			}
		});
		
		this.customerAddButton = new Ext.button.Button({
			scope: this,
			width: 150,
			text: 'Add New Company',
			handler: function(){
				var win = this.createCustomerWindow({
					title: 'Add New Company'
				});
				
				//On window show
				win.form.down('textfield[name=customerName]').focus(true, 50);
				
				//on form success
				win.form.on('success', function(form, action){
					var result = action.result;
					if (result.success) {
						// Set the company selector values
						var record = result.record;
						this.locationLookup.enable();
						this.locationLookup.store.proxy.extraParams.to_id = record['customer_id'];
						
						this.customerLookup.loadFromStore({
							customer_id:record.customer_id
						}, false);
						
						win.destroy();
						var locationAddWindow = this.locationAddButtonClick();
						locationAddWindow.down('textfield[name=name1]').setValue(record['customer_name']);
						locationAddWindow.down('*[name=customer_id]').setValue(record['customer_id']);
					}
				}, this);
				
				//Show the window
				win.show();
			}
		});
		
		this.customerPanel.add(this.customerLookup, this.customerAddButton);
	},
	
	initLocationLookup: function(){
		this.locationLookup = Ext.create('TMS.location.lookup.Location', {
			type: 'customer',
			fieldLabel: 'Location',
			flex: 1,
			disabled: true,
			hiddenName: 'location_id',
			name:'location_id'
		});
		
		this.customerLookup.on('select', function(field, records){
			if(!records.length){
				this.locationLookup.disable();
				return false;
			}
			this.locationLookup.enable();
			var record = records[0];
			this.locationLookup.setRawValue('');
			this.locationLookup.setValue('');
			this.locationLookup.store.proxy.extraParams.to_id = record.get('customer_id');
			this.locationLookup.store.loadPage(1);
			this.locationLookup.focus(true, 50);
			this.locationLookup.expand();
		}, this);
		
		this.locationAddButton = new Ext.button.Button({
			scope: this,
			width: 150,
			text: 'Add New Location',
			disabled: true,
			handler: this.locationAddButtonClick
		});
		
		this.locationLookup.on('disable', function(){
			this.locationAddButton.disable();
		}, this);
		this.locationLookup.on('enable', function(){
			this.locationAddButton.enable();
		}, this);
		
		this.locationPanel.add(this.locationLookup, this.locationAddButton);
	},
	
	locationAddButtonClick: function() {
		var win = this.createLocationWindow({
			title: 'Add New Location'
		});
		
		//On window show
		win.form.down('*[name=customer_id]').setValue(this.customerLookup.getRealValue());
		win.form.down('textfield[name=name1]').setValue(this.locationLookup.getRawValue());
		win.form.down('textfield[name=name1]').focus(true, 50);
		
		//On success
		win.form.on('success', function(form, action){
			var result = action.result;
			var record = result.record;
			win.destroy();
			
			//Set the location and auto select the correct record
			this.locationLookup.enable();

			this.locationLookup.loadFromStore({
				location_id: record.location_id
			});

			this.locationLookup.store.proxy.extraParams.to_id = this.customerLookup.getValue();
		}, this);
		
		//return the window
		return win;
	},
	
	createCustomerWindow: function(config){
		var customerForm = Ext.create('TMS.customer.forms.Form', {
			scope: this,
			isPayTo:this.isPayTo,
			plugins:[Ext.create('TMS.form.plugin.StatusBar')]
		});
		
		customerForm.customerName.setValue(this.customerLookup.getRawValue());
		
		var win = Ext.create('TMS.ActionWindow', Ext.apply({
			scope: this,
			modal: true,
			layout: 'fit',
			form: customerForm,
			items:[customerForm],
			dockedItems: [{
				xtype: 'toolbar',
				dock: 'bottom',
				ui: 'footer',
				layout:{
					pack: 'center'
				},
				items: [{
					scope: this,
					type: 'button',
					text: 'Save',
					handler: function(){
						win.form.submit();
					}
				},{
					scope: this,
					type: 'button',
					text: 'Cancel',
					handler: function(){
						win.destroy();
					}
				}]
			}]
		}, config));
		return win;
	},
	
	createLocationWindow: function(config){
		var locationForm = Ext.create('TMS.location.forms.Form', {
			scope: this,
			plugins: [Ext.create('TMS.form.plugin.StatusBar')],
			customer_id: this.customerLookup.getValue()
		});
		var win = Ext.create('TMS.ActionWindow', Ext.apply({
			scope: this,
			modal: true,
			minHeight:400,
			layout: 'fit',
			form: locationForm,
			items:[locationForm],
			dockedItems: [{
				xtype: 'toolbar',
				dock: 'bottom',
				ui: 'footer',
				layout:{
					pack: 'center'
				},
				items: [{
					scope: this,
					type: 'button',
					text: 'Save',
					handler: function(){
						win.form.submit();
					}
				},{
					scope: this,
					type: 'button',
					text: 'Cancel',
					handler: function(){
						win.destroy();
					}
				}]
			}]
		}, config));
		return win;
	}
});
Ext.define('TMS.contacts.forms.sections.ContactInformation', {
	extend:'Ext.panel.Panel',
	
	//Requires
	requires:[
		'TMS.contacts.forms.sections.ContactMethods',
		'TMS.contacts.forms.sections.ContactInterval'
	],
	
	//Config
	icon: '/resources/icons/contact-info-24.png',
	border: false,
	layout:{
		type: 'hbox',
		align: 'stretch'
	},
	autoSave: false,
	contact_id: 0,
	
	initComponent: function(){
		this.items = this.items || [];
		this.dockedItems = this.dockedItems || [];
		this.init();
		this.callParent(arguments);
	},
	
	init: function() {
		this.initContactMethods();
		this.initContactInterval();
	},
	
	initContactMethods: function(){
		this.contactMethods = Ext.create('TMS.contacts.forms.sections.ContactMethods', {
			scope: this,
			title: 'Methods',
			baseTitle: 'Methods',
			flex: 1,
			contact_id: this.contact_id,
			autoSave: this.autoSave
		});
		this.items.push(this.contactMethods);
	},
	
	initContactInterval: function(){
		this.contactInterval = Ext.create('TMS.contacts.forms.sections.ContactInterval', {
			title: 'Interval',
			flex: 1,
			call_interval:14,
			email_interval:14,
			disabled: true,
			contact_id: this.contact_id,
			autoSave: this.autoSave
		});
		this.items.push(this.contactInterval);
	}
});
Ext.define('TMS.contacts.forms.sections.ContactInterval', {
	extend:'TMS.form.Abstract',
	requires:[
		'TMS.ActionWindow'
	],
	
	bodyStyle:{
		padding:'10px'
	},
	title:'Contact Intervals (in days)',
	processingPage:'/at-ajax/modules/contact/process/',
	url:'/at-ajax/modules/contact/process/save-contact-interval',
	contact_id:0,
	autoSave:false,
	isLoaded:false,
	
	initComponent: function(){
		this.items = [];
		this.addEvents('recordload');
		this.init();
		this.callParent(arguments);
	},
	
	init: function() {
		this.initCall();
		this.initEmail();
		this.initVisit();
		this.initHidden();
		
		if (!this.contact_id) {
			this.nextCallField.disable();
			this.nextEmailField.disable();
			this.nextVisitField.disable();
		}
		
		this.initListeners();
		this.getContactData(this.contact_id);
	},
	
	initCall: function() {
		
		this.callInterval = Ext.create('Ext.form.field.Text', {
			border:false,
			fieldLabel:'Call',
			labelWidth:60,
			width:100,
			name:'call_interval',
			value:this.call_interval || 0
		});
		
		this.nextCallField = Ext.create('Ext.form.field.Date', {
			fieldLabel:'Next Action',
			name:'next_call',
			margin:'0 0 0 10',
			minValue:new Date()
		});
		
		this.callPanel = Ext.create('Ext.panel.Panel', {
			layout:'hbox',
			items:[
				this.callInterval,
				this.nextCallField
			],
			border:false
		});
		
		this.items.push(this.callPanel);
	},
	
	initEmail: function() {
		
		this.emailInterval = Ext.create('Ext.form.field.Text', {
			border:false,
			fieldLabel:'Email',
			labelWidth:60,
			width:100,
			name:'email_interval',
			value:this.email_interval || 0
		});
		
		this.nextEmailField = Ext.create('Ext.form.field.Date', {
			fieldLabel:'Next Action',
			name:'next_email',
			margin:'0 0 0 10',
			minValue:new Date()
		});
		
		this.emailPanel = Ext.create('Ext.panel.Panel', {
			layout:'hbox',
			items:[
				this.emailInterval,
				this.nextEmailField
			],
			border:false
		});
		
		this.items.push(this.emailPanel);
	},
	
	initVisit: function() {
		
		this.visitInterval = Ext.create('Ext.form.field.Text', {
			border:false,
			fieldLabel:'Visit',
			labelWidth:60,
			width:100,
			name:'visit_interval',
			value:this.visit_interval || 0
		});
		
		this.nextVisitField = Ext.create('Ext.form.field.Date', {
			fieldLabel:'Next Action',
			name:'next_visit',
			margin:'0 0 0 10',
			minValue:new Date()
		});
		
		this.visitPanel = Ext.create('Ext.panel.Panel', {
			layout:'hbox',
			items:[
				this.visitInterval,
				this.nextVisitField
			],
			border:false
		});
		
		this.items.push(this.visitPanel);
	},
	
	initHidden: function() {
		this.contactIdField = Ext.create('Ext.form.field.Hidden', {
			name:'contact_id',
			value:this.contact_id
		});
		this.items.push(this.contactIdField);
	},
	
	initListeners: function() {
		this.callInterval.on('change', this.save, this, {
			buffer:500
		});
		this.emailInterval.on('change', this.save, this, {
			buffer:500
		});
		this.visitInterval.on('change', this.save, this, {
			buffer:500
		});
		
		this.nextCallField.on('select', function(field, value) {
			this.save();
		}, this);
		this.nextEmailField.on('select', function(field, value) {
			this.save();
		}, this);
		this.nextVisitField.on('select', function(field, value) {
			this.save();
		}, this);
		
	},
	
	getContactData: function(contact_id) {
		this.contact_id = contact_id;
		if (this.contact_id) {
			Ext.Ajax.request({
				scope:this,
				method:'post',
				url:this.processingPage + 'get-contact-interval-data',
				params:{
					contact_id:this.contact_id
				},
				success: function(r) {
					var response = Ext.decode(r.responseText);
					var record = response.record;
					this.fireEvent('recordload', this, record);
					this.getForm().setValues(record);
					
					if (record.now > record.next_call_ts) {
						this.nextCallField.disable();
					}
					if (record.now > record.next_email_ts) {
						this.nextEmailField.disable();
					}
					if (record.now > record.next_visit_ts) {
						this.nextVisitField.disable();
					}
					
					
					setTimeout(Ext.bind(function() {
						this.isLoaded = true;
					}, this), 500);
				}
			});
		}
	},
	
	save: function() {
		if (this.autoSave && this.contact_id && this.isLoaded) {
			this.submit();
		}
	},
	
	setDueDate: function() {
		this.dateWindow = Ext.create('TMS.ActionWindow', {
			title:'Select a new due date',
			width:null,
			height:null,
			items: [{
				scope:this,
				xtype:'datepicker',
				minDate: new Date(),
				handler: function(picker, date) {
					Ext.Ajax.request({
						scope:this,
						method:'post',
						url:this.processingPage + 'set-due-date',
						params:{
							contact_id:this.contact_id,
							field:field,
							date:date
						},
						success: function(r) {
							var response = Ext.decode(r.responseText);
							this.fireEvent('setdate');
						}
					});
					this.dateWindow.destroy();
				}
			}]
		});
	}
	
});
Ext.define('TMS.contacts.forms.sections.ContactMethodRow', {
	extend:'Ext.panel.Panel',
	
	autoHeight:true,
	layout:'hbox',
	border:false,
	defaults:{
		border:false
	},
	store:false,
	
	initComponent: function() {
		this.items = this.items || [];
		this.init();
		this.callParent(arguments);
	},
	
	init: function() {
		this.initContactMethodSelector();
		this.initMethodField();
		this.initButton();
		this.initListeners();
	},
	
	initContactMethodSelector: function() {
		this.contactMethodSelector = Ext.create('Ext.ux.form.field.RealComboBox', {
			flex:1,
			valueField:'method_id',
			displayField:'method_type',
			store: this.store,
			queryMode: 'local',
			editable:false,
			margin:'2'
		});
		this.items.push(this.contactMethodSelector);
	},
	
	initMethodField: function() {
		this.contactMethodField = Ext.create('Ext.form.field.Text', {
			flex:1,
			xtype: 'textfield',
			margin:'2',
			itemId:'method_data',
			enableKeyEvents:true
		});
		this.items.push(this.contactMethodField);
	},
	
	initButton: function() {
		this.button = Ext.create('Ext.button.Button', {
			margin:'2',
			icon:'/resources/icons/delete-16.png',
			width:24,
			scope:this,
			handler:function(button) {
				// remove if not the last one
				button.ownerCt.destroy();
			}
		});
		this.items.push(this.button);
	},
	
	initListeners: function() {
		
	}
	
});
Ext.define('TMS.contacts.forms.sections.ContactMethods', {
	extend:'TMS.form.Abstract',
	requires:[
		'Ext.ux.form.field.RealComboBox',
		'TMS.contacts.forms.sections.ContactMethodRow'
	],
	
	title:'Contact Methods',
	baseTitle:'Contact Methods',
	bodyStyle:{
		padding:'8px'
	},
	processingPage:'/at-ajax/modules/contact/process/',
	url:'/at-ajax/modules/contact/process/save-contact-methods',
	contact_id:0,
	
	autoSave:false,
	
	initComponent: function(){
		this.items = [];
		this.addEvents('save', 'recordload');
		this.init();
		this.callParent(arguments);
	},
	
	init: function() {
		this.initHidden();
		this.initListeners();
		this.initStore();
		this.loadRecord();
	},
	
	initHidden: function() {
		this.contactIdField = Ext.create('Ext.form.field.Hidden', {
			name:'contact_id',
			value:this.contact_id
		});
		this.items.push(this.contactIdField);
	},
	
	initListeners: function() {
		this.on('add', this.itemAdded, this, {buffer:500});
		this.on('remove', this.itemRemoved, this, {buffer: 1000});
		this.on('beforesubmit', function(form){
			if(!this.rendered){
				return;
			}
			
			var rows = this.getRows();
			var numRows = rows.length;
			var types = [];
			var data = [];
			
			for (var i = 0; i < numRows; i++) {
				types.push(rows[i].contactMethodSelector.getValue());
				data.push(rows[i].contactMethodField.getValue());
				
				rows[i].contactMethodSelector.name = 'contact_method_type_' + i;
				rows[i].contactMethodField.name =  'contact_method_data_' + i;
			}
			
			this.contactIdField.setValue(this.contact_id);
			form.setParam('contact_method_types', Ext.encode(types));
			form.setParam('contact_method_data', Ext.encode(data));
		}, this);
	},
	
	getEmail: function() {
		var email = false;
		var rows = this.getRows();
		var numRows = rows.length;
		for (var i = 0; i < numRows; i++) {
			if (rows[i].contactMethodSelector.getRawValue() == 'Email') {
				return rows[i].contactMethodField.getValue();
			}
		}
	},
	
	initStore: function() {
		this.contactMethodStore = Ext.create('Ext.data.Store', {
			fields: [
				'method_id',
				'method_type',
				'method_group_id'
			],
			proxy: {
				type: 'ajax',
				url: this.processingPage + 'get-contact-method-types',
				reader: {
					type: 'json',
					root: 'records'
				}
			}
		});
		
		this.contactMethodStore.load();
	},
	
	selectFirst: function(combobox) {
		if (combobox && combobox.store) {
			var record = combobox.store.getAt(0);
			if (record) {
				combobox.setValue(record.get('method_id'));
			}
		}
	},
	
	getFirstUnusedIndex: function(combobox) {
		var indexToSelect = 0;
		
		// Loop through existing selections and store the currently used ids
		var existingIds = [];
		var items = this.getRows();
		for (var i = 0; i < items.length - 1; i++) {
			var subItem = items[i].items.items[0];
			var typeId = subItem.getValue();
			existingIds.push(typeId);
		}

		// Loop through records and find the first one that isnt in use
		var records = combobox.store.data.items;
		var numRecords = records.length;
		for (var i = 0; i < numRecords; i++) {
			if (existingIds.indexOf(records[i].data.method_id) == -1) {
				indexToSelect = i;
				break;
			}
		}
		
		return indexToSelect;
	},
	
	selectFirstUnused: function(combobox) {
		if (combobox && combobox.store) {
			var record = combobox.store.getAt(this.getFirstUnusedIndex(combobox));
			combobox.setValue(record.get('method_id'));
		}
	},
	
	addContactMethod: function() {
		
	},
	
	createRow: function() {
		var rowPanel = Ext.create('TMS.contacts.forms.sections.ContactMethodRow', {
			store:this.contactMethodStore
		});
		
		rowPanel.contactMethodField.on('keyup', function(textfield) {
			if (textfield.getValue().length) {
				var fields = this.query('#method_data');
				var lastField = fields[fields.length-1];
				if (lastField.getValue().length) {
					// add another field
					var newRow = this.createRow();
					this.add(newRow);
					this.selectFirstUnused(newRow.contactMethodSelector);
				}
			}
		}, this);
		
		rowPanel.contactMethodField.on('change', function(textfield) {
			if (!textfield.getValue().length) {
				var fields = this.query('#method_data');
				var lastField = fields[fields.length-1];
				if (textfield != lastField) {
					textfield.ownerCt.destroy();
				}
			}
			this.save();
		}, this, {buffer: 700 });
		
		return rowPanel;
	},
	
	loadRecord: function(contact_id, name) {
		this.contact_id = contact_id || this.contact_id;
		var newTitle = this.baseTitle;
		if (name != null && this.baseTitle.length) {
			newTitle = this.baseTitle + ' - ' + name;
		}
		
		if (this.rendered) {
			this.setTitle(newTitle);
		}
		else {
			this.title = newTitle;
		}
		
		if (this.contactMethodStore.isLoading()) {
			this.contactMethodStore.on('load', function() {
				this.loadRecord();
			}, this);
		}
		else {
			if (this.contact_id) {
				this.setLoading(true);
				Ext.Ajax.request({
					scope:this,
					method:'post',
					url:this.processingPage + 'get-contact-method-data',
					params:{
						contact_id:this.contact_id
					},
					success: function(r) {
						this.setLoading(false);
						var response = Ext.decode(r.responseText);
						var records = response.records;
						this.fireEvent('recordload', this, records);
						
						// remove old rows - need to suspend events so this remove doesn't trigger for a previous contact
						this.suspendEvents();
						this.destroyRows();
						this.resumeEvents();
						
						// loop through all contact method records and make a row for each
						for (var i = 0; i < records.length; i++) {
							var panel = this.createRow();
							panel.contactMethodSelector.setValue(records[i].method_id);
							panel.contactMethodField.setRawValue(records[i].contact_value_1);
							this.add(panel);
						}
						// add another field
						var newRow = this.createRow();
						this.add(newRow);
						this.selectFirst(newRow.contactMethodSelector);
					}
				});
			}
			else {
				var newRow = this.createRow();
				this.add(newRow);
				this.selectFirst(newRow.contactMethodSelector);
			}
		}
	},
	
	destroyRows: function() {
		Ext.each(this.query('> .panel'), function(el){
			el.destroy();
		});
	},
	
	itemAdded: function(panel, item, options) {
		var rows = this.query('> .panel');
		this.manageRemoveButtons(rows);
	},
	
	
	itemRemoved: function(panel, item, options) {
		// Get all rows
		var rows = this.query('> .panel');
		if (rows.length) {
			this.manageRemoveButtons(rows);
			this.save();
		}
	},
	
	manageRemoveButtons: function(rows) {
		if (rows.length) {
			for (var i = 0; i < rows.length-1; i++) {
				rows[i].down('.button').enable();
			}
			rows[rows.length-1].down('.button').disable();
		}
	},
	
	getRows: function() {
		return this.query('> .panel');
	},
	
	save: function() {
		if (this.contact_id && this.autoSave) {
			this.submit();
		}
	}
	
});
Ext.define('TMS.contacts.forms.sections.Email', {
	extend:'TMS.form.Abstract',
	
	//Requires
	requires:[
	],
	
	//Config
	bodyStyle:{
		padding:'8px'
	},
	url:'/at-ajax/modules/contact/process/send-email',
	layout: {
		type: 'vbox',
		align: 'stretch'
	},
	contact_id: 0,
	contactMethodsUrl: '/at-ajax/modules/contact/process/get-contact-method-data',

	
	initComponent: function(){
		this.items = [];
		this.init();
		this.callParent(arguments);
	},
	
	init: function() {
		this.initHidden();
		this.initEmail();
		this.initSubject();
		this.initMessage();
		this.loadData();
	},
	
	loadData: function(){
		if(this.contact_id){
			Ext.Ajax.request({
				scope:this,
				method:'post',
				url: this.contactMethodsUrl,
				params:{
					contact_id: this.contact_id
				},
				success: function(r) {
					var response = Ext.decode(r.responseText);
					var records = response.records;
					var emails = [];
					Ext.each(records, function(record){
						if(record.method_type == "Email"){
							emails.push({
								email: record.contact_value_1
							});
						}
					}, this);
					this.emailStore.loadData(emails);
					if(emails.length){
						this.emailSelect.select(this.emailStore.getAt(0));
					}
					else{
						this.emailSelect.setValue('');
					}
				}
			});
		}
	},
	
	initHidden: function(){
		this.items.push({
			xtype: 'hidden',
			name: 'contact_id',
			value: this.contact_id
		});
	},
	
	initEmail: function(){
		this.emailStore = Ext.create('Ext.data.Store', {
			fields:[
				'email'
			],
			proxy: {
				type: 'memory',
				reader: {
					type: 'json',
					root: 'records'
				}
			}
		});
		this.emailSelect = new Ext.form.field.ComboBox({
			scope: this,
			flex: 1,
			name: 'email',
			queryMode:'local',
			displayField: 'email',
			valueField:'email',
			store:this.emailStore
		});
		
		this.emailAdd = new Ext.button.Button({
			scope: this,
			text: 'Add Email',
			icon: '/resources/icons/add-16.png',
			margin: '0 0 0 4',
			handler: function(){
				var contactMethods = Ext.create('TMS.contacts.forms.sections.ContactMethods', {
					contact_id:this.contact_id,
					title: '',
					baseTitle: '',
					plugins: [
						Ext.create('TMS.form.plugin.StatusBar', {
							scope: this,
							items:[{
								text: 'Save',
								cls: 'submit',
								icon: '/resources/icons/save-16.png',
								handler: function(){
									contactMethods.submit();
								}
							}]
						})
					]
				});
				
				//Listeners
				contactMethods.on('success', function(){
					this.loadData();
				}, this);
				
				Ext.create('TMS.ActionWindow', {
					title: 'Contact Methods',
					layout: 'fit',
					items:[contactMethods]
				});
			}
		});
		
		//Create the email container
		this.emailContainer = Ext.create('Ext.form.FieldContainer', {
			scope: this,
			fieldLabel: 'Email',
			combineErrors: true,
			layout: 'hbox',
			defaults: {
				hideLabel: true
			},
			items:[
				this.emailSelect,
				this.emailAdd
			]
		});
		
		this.items.push(this.emailContainer);
	},
	
	initSubject: function(){
		this.subject = new Ext.form.field.Text({
			scope: this,
			name: 'subject',
			fieldLabel: 'Subject'
		});
		this.items.push(this.subject);
	},
	
	initMessage: function(){
		this.message = Ext.create('Ext.form.HtmlEditor', {
			name: 'message',
			flex: 1,
			allowBlank: false,
			value: '&nbsp;'
		});
		this.items.push(this.message);
	}
});
Ext.define('TMS.contacts.forms.sections.GeneralInformation', {
	extend:'TMS.form.Abstract',
	requires:[
		'Ext.ux.form.field.RealComboBox',
		'TMS.contacts.lookup.Contact'
	],
	title:'General Information',
	icon: '/resources/icons/general-info-24.png',
	processingPage:'/at-ajax/modules/contact/process/',
	url:'/at-ajax/modules/contact/process/save-contact',
	contact_id:0,
	
	fieldValues:{},
	layout:{
		type: 'hbox',
		align: 'stretch'
	},
	
	autoSave:false,
	
	initComponent: function(){
		this.items = [];
		this.addEvents('recordload');
		this.init();
		this.callParent(arguments);
	},
	
	init: function() {
		this.initListeners();
		this.loadRecord();
		
		this.initLeftContainer();
		this.initRightContainer();
		
		if (this.contact_id) {
			this.initOtherContactsPanel();
		}
		else {
			this.initSimilarPanel();
		}
		this.initFields();
	},
	
	initListeners: function() {
		
	},
	
	loadRecord: function(contact_id) {
		this.contact_id = contact_id || this.contact_id;
		if (this.contact_id) {
			Ext.Ajax.request({
				scope:this,
				method:'post',
				url:this.processingPage + 'get-contact-data',
				params:{
					contact_id:this.contact_id
				},
				success: function(r) {
					var response = Ext.decode(r.responseText);
					this.record = response.record;
					this.fireEvent('recordload', this, this.record);
					this.setData();
				}
			});
		}
	},
	
	setData: function(data) {
		if (this.typeStore.isLoading()) {
			this.typeStore.on('load', function() {
				this.setData();
			}, this);
		}
		else {
			this.down('#contact_type_id').setValue(this.record.contact_type_id);
			this.down('#contact_type_id').disable();
			this.down('#contact_name').setValue(this.record.contact_name);
			this.down('#contact_title').setValue(this.record.contact_title);
			// if customer, show the status
			if (this.record.contact_type_id == 2) {
				this.down('#status_id').show();
				if (this.statusTypeStore.isLoading()) {
					this.statusTypeStore.on('load', function() {
						this.down('#status_id').suspendEvents();
						this.down('#status_id').setValue(this.record.status_id);
						this.down('#status_id').resumeEvents();
					}, this);
				}
				else {
					this.down('#status_id').suspendEvents();
					this.down('#status_id').setValue(this.record.status_id);
					this.down('#status_id').resumeEvents();
				}
			}
		}
	},
	
	focusField: function(el) {
		this.fieldValues[el.id] = el.getValue();
	},
	
	blurField: function(el) {
		if (this.fieldValues[el.id] != null) {
			if (this.fieldValues[el.id] != el.getValue()) {
				this.save();
			}
		}
	},
	
	initLeftContainer: function(){
		this.leftContainer = new Ext.panel.Panel({
			scope: this,
			layout: 'anchor',
			autoHeight: true,
			flex: 1,
			border: false,
			bodyPadding: 10,
			defaults: {
				anchor: '98%'
			}
		});
		this.items.push(this.leftContainer);
	},
	
	initRightContainer: function(){
		this.rightContainer = new Ext.panel.Panel({
			cls: 'similar-contacts-panel',
			layout: 'anchor',
			bodyPadding: 5,
			scope: this,
			frame: false,
			flex: 1,
			autoScroll: true,
			height: 200,
			bodyStyle:{
				'border-right': '0px',
				'border-top': '0px',
				'border-bottom': '0px'
			},
			defaults:{
				anchor: '98%'
			}
		});
		this.items.push(this.rightContainer);
	},
	
	initFields: function() {
		this.typeStore = Ext.create('Ext.data.Store', {
			fields: [
				'type_id',
				'type_name'
			],
			proxy: {
				type: 'ajax',
				url: this.processingPage + 'get-contact-types',
				reader: {
					type: 'json',
					root: 'records'
				}
			}
		});
		
		this.typeStore.on('load', function(store, records){
			if(records.length == 1){
				this.typeSelector.select(records[0]);
			}
		}, this);
		
		this.typeStore.load();
		
		this.typeSelector = Ext.create('Ext.ux.form.field.RealComboBox', {
			store:this.typeStore,
			displayField:'type_name',
			valueField:'type_id',
			hiddenName:'contact_type_id',
			fieldLabel:'Contact Type',
			queryMode:'local',
			editable:false,
			itemId:'contact_type_id',
			id:'contact_type_id',
			name:'contact_type_id',
			allowBlank: false,
			listeners:{
				scope:this,
				change:function(el, value) {
					if (value == 2) {
						this.down('#status_id').show();
					}
					else {
						this.down('#status_id').hide();
					}
				}
			}
		});
		this.leftContainer.add(this.typeSelector);
		
		this.typeSelector.on('change', function(){
			this.nameField.enable();
			this.titleField.enable();
		}, this, { single: true });
		
		this.nameField = this.leftContainer.add({
			xtype:'textfield',
			plugins:[
				Ext.create('TMS.form.plugin.Help',
					'This is the first name, and last name of the contact.'
				)
			],
			border:false,
			fieldLabel:'Name',
			name:'contact_name',
			itemId:'contact_name',
			enableKeyEvents: true,
			allowBlank: false,
			listeners:{
				scope:this,
				focus:this.focusField,
				blur:this.blurField
			},
			disabled: true
		});
		
		this.titleField = this.leftContainer.add({
			xtype:'textfield',
			border:false,
			fieldLabel:'Title',
			name:'contact_title',
			itemId:'contact_title',
			listeners:{
				scope:this,
				focus:this.focusField,
				blur:this.blurField
			},
			disabled: true
		});
		
		this.statusTypeStore = Ext.create('Ext.data.Store', {
			fields: [
				'status_id',
				'status_name'
			],
			proxy: {
				type: 'ajax',
				url: this.processingPage + 'get-contact-status-types',
				reader: {
					type: 'json',
					root: 'records'
				}
			}
		});
		this.statusTypeStore.load();
		this.leftContainer.add({
			xtype:'realcombobox',
			plugins:[
				Ext.create('TMS.form.plugin.Help',
					'<ul>' +
						'<li><b>Cold: </b>Location is unknown, new contact.' +
						'<li><b>Warm: </b> May pssibly do business with this person.' +
						'<li><b>Hot: </b> Required to do business with this person, ready to book a load.' +
					'</ul>'
				)
			],
			store:this.statusTypeStore,
			displayField:'status_name',
			valueField:'status_id',
			hiddenName:'status_id',
			fieldLabel:'Status',
			queryMode:'local',
			editable:false,
			itemId:'status_id',
			name:'status_id',
			hidden:true,
			listeners:{
				scope:this,
				change:function(combobox, newValue, oldValue) {
					if (newValue != null) {
						this.save();
					}
				}
			}
		});
		
		this.contactIdField = Ext.create('Ext.form.field.Hidden', {
			name:'contact_id',
			value:this.contact_id
		});
		this.items.push(this.contactIdField);
	},
	
	initSimilarPanel: function(){
		this.similarStore = new Ext.data.Store({
			fields: [
				'name',
				'location',
				'owner'
			],
			proxy: {
				type: 'ajax',
				url: this.processingPage + 'get-similar',
				reader: {
					type: 'json',
					root: 'records'
				}
			}
		});
		
		this.similarTemplate = new Ext.XTemplate(
			'<div class="similar-contacts-container">',
				'<tpl for=".">',
					'<div class="similar-contact">',
						'<div class="name-location">',
							'<span class="name">{name}</span>',
							'<tpl if="location.length">',
								'<span class="at"> at</span> <span class="location">{location}</span>',
							'</tpl>',
						'</div>',
						'<tpl if="owner.length">',
							'<div class="owner">owned by {owner}</div>',
						'</tpl>',
					'</div>',
				'</tpl>',
			'</div>'
		);
		
		this.similarView = new Ext.view.View({
			scope: this,
			store: this.similarStore,
			tpl: this.similarTemplate,
			autoHeight: true,
			multiSelect: false,
            trackOver: true,
			deferEmptyText:false,
            overItemCls: 'similar-contact-over',
            itemSelector: '.similar-contact',
            emptyText: 'No similar contacts...'
		});
		
		this.similarView.on('refresh', function(store, records){
			this.doLayout();
		}, this);
		
		this.on('afterrender', function(){
			var nameField = this.down('#contact_name');
			var contactTypeField = this.typeSelector;
			
			//Setup listeners for the contact type
			contactTypeField.on('change', function(field, value, oldValue){
				if(value == oldValue){
					return false;
				}
				this.similarStore.proxy.extraParams.contactTypeId = value;
				if(this.similarStore.proxy.extraParams.query != null && this.similarStore.proxy.extraParams.query.length){
					this.similarStore.load();
				}
				
			}, this);
			
			//Set up listeners for the name field
			nameField.on('keyup', function(field, event, options){
				this.similarStore.proxy.extraParams.query = field.getValue();
				this.similarStore.load();
			}, this, {buffer: 250});
		}, this);
		
		
		this.rightContainer.setTitle('Similar Contacts');
		this.rightContainer.add(this.similarView);
	},
	
	initOtherContactsPanel: function() {
		this.otherContactSelector = Ext.create('TMS.contacts.lookup.Contact', {
			anchor: '98%',
			hideTrigger:false
		});
		this.otherContactSelector.on('select', function(field, records) {
			if (records && records.length) {
				var record = records[0];
				var contactId = record.data.contact_id;
				var url = '/contacts/?d=contacts&a=view&id=' + contactId;
				this.otherContactSelector.setRawValue('');
				window.open(url, '_blank');
			}
		}, this);
		
		this.otherContactSelector.store.proxy.url = '/at-ajax/modules/contact/lookup/other-contacts';
		this.otherContactSelector.store.proxy.extraParams.contact_id = this.contact_id;
		this.otherContactSelector.store.load();
		
		this.rightContainer.setTitle('Other Customer Contacts');
		this.rightContainer.add(this.otherContactSelector);
	},
	
	save: function() {
		if (this.contact_id && this.autoSave) {
			this.submit();
		}
	}
	
});
Ext.define('TMS.contacts.forms.sections.ModesEquipment', {
	extend:'TMS.form.Abstract',
	requires:[
		'Ext.ux.form.field.RealComboBox',
		'Ext.ux.form.field.BoxSelect'
	],
	bodyStyle:{
		padding:'10px'
	},
	title:'Allowed Modes and Equipment',
	autoHeight:true,
	processingPage:'/at-ajax/modules/contact/process/',
	url:'/at-ajax/modules/contact/process/save-modes-equipment',
	
	autoSave: true,
	layout:'hbox',
	
	contact_id:0,
	carrier_id:0,
	
	modeIds:[],
	equipmentIds:[],
	
	modesLoaded:false,
	equipmentLoaded:false,
	loaded: false,
	
	initComponent: function(){
		this.items = [];
		this.addEvents('recordload');
		this.init();
		this.callParent(arguments);
	},
	
	init: function() {
		this.initListeners();
		this.initStore();
		
		this.initHidden();
		this.initFields();
		
		this.loadData();
	},
	
	initListeners: function() {
		this.on('afterrender', function() {
			if (this.contact_id || this.carrier_id) {
			}
		}, this);
		
		this.on('beforesubmit', function(form){
			if(!this.rendered){
				return;
			}
			
			this.modes.setValue(Ext.encode(this.modesAllowed.getValue()));
			this.equipment.setValue(Ext.encode(this.equipmentAllowed.getValue()));
			
			//Add in the contact or customer
			if(form == this){
				this.setParams({
					contact_id: this.contact_id,
					carrier_id: this.carrier_id
				});
			}
		}, this);
	},
	
	initStore: function() {
		this.modesStore = Ext.create('Ext.data.Store', {
			fields: [
				'mode_id',
				'mode_name'
			],
			proxy: {
				type: 'ajax',
				url: this.processingPage + 'get-modes-list',
				reader: {
					type: 'json',
					root: 'modeList'
				}
			}
		});
		
		this.equipmentStore = Ext.create('Ext.data.Store', {
			fields: [
				'CarrEquipId',
				'CarrEquipDesc'
			],
			proxy: {
				type: 'ajax',
				url: this.processingPage + 'get-equipment-list',
				reader: {
					type: 'json',
					root: 'equipmentList'
				}
			}
		});
		
		this.modesStore.load();
		this.equipmentStore.load();
	},
	
	initHidden: function(){
		this.modes = Ext.create('Ext.form.field.Hidden', {
			name:'modesAllowed'
		});
		this.items.push(this.modes);
		
		this.equipment = Ext.create('Ext.form.field.Hidden', {
			name:'equipmentAllowed'
		});
		this.items.push(this.equipment);
	},
	
	initFields: function() {
		this.modesAllowed = Ext.create('Ext.ux.form.field.BoxSelect', {
			store:this.modesStore,
			multiSelect:true,
			labelAlign: 'top',
			fieldLabel: 'Modes Allowed',
			displayField:'mode_name',
			valueField:'mode_id',
			//hiddenName:'modesAllowed',
			//name:'modesAllowed',
			itemId:'modesAllowed',
			flex: 1,
			margin: 2,
			queryMode:'local'
		});
		
		this.modesAllowed.on('afterrender', function(){
			this.modesAllowed.on('change', function(){
				this.save();
			}, this, {buffer: 1000 });
		}, this);
		
		if(this.modeIds.length){
			this.modesAllowed.store.on('load', function(){
				var records = [];
				Ext.each(this.modeIds, function(modeId){
					var record = this.modesAllowed.store.getAt(this.modesAllowed.store.find('mode_id', modeId));
					records.push(record);
				}, this);
				this.modesAllowed.select(records);
			}, this);
		}
		
		this.items.push(this.modesAllowed);
		
		this.equipmentAllowed = Ext.create('Ext.ux.form.field.BoxSelect', {
			store:this.equipmentStore,
			multiSelect:true,
			labelAlign: 'top',
			fieldLabel: 'Equipment Allowed',
			displayField:'CarrEquipDesc',
			valueField:'CarrEquipId',
			//hiddenName:'equipmentAllowed',
			//name:'equipmentAllowed',
			itemId:'equipmentAllowed',
			flex: 1,
			margin: 2,
			queryMode:'local'
		});
		
		this.equipmentAllowed.on('afterrender', function(){
			this.equipmentAllowed.on('change', function(){
				this.save();
			}, this, {buffer: 1000 });
		}, this);
		
		if(this.equipmentIds.length){
			this.equipmentAllowed.store.on('load', function(){
				var records = [];
				Ext.each(this.equipmentIds, function(equipmentId){
					var record = this.equipmentAllowed.store.getAt(this.equipmentAllowed.store.find('CarrEquipId', equipmentId));
					records.push(record);
				}, this);
				this.equipmentAllowed.select(records);
			}, this);
		}
		
		this.items.push(this.equipmentAllowed);
		
	},
	
	loadData: function() {
		if(!this.rendered){
			this.on('afterrender', function(){
				this.loadData();
			}, this);
			return;
		}
		if (this.contact_id || this.carrier_id) {
			Ext.Ajax.request({
				scope:this,
				method:'post',
				url:this.processingPage + 'get-modes-equipment',
				params:{
					contact_id:this.contact_id,
					carrier_id:this.carrier_id
				},
				success: function(r) {
					this.setLoading(false);
					var response = Ext.decode(r.responseText);
					this.fireEvent('recordload', this, response);
					this.modeIds = response.modeIds;
					this.equipmentIds = response.equipmentIds;
					if (this.modesStore.isLoading()) {
						this.modesStore.on('load', function() {
							this.modesAllowed.setValue(this.modeIds);
							this.modesLoaded = true;
							this.checkLoaded();
						}, this);
					}
					else {
						this.modesAllowed.setValue(this.modeIds);
						this.modesLoaded = true;
						this.checkLoaded();
					}
					
					if (this.equipmentStore.isLoading()) {
						this.equipmentStore.on('load', function() {
							this.equipmentAllowed.setValue(this.equipmentIds);
							this.equipmentLoaded = true;
							this.checkLoaded();
						}, this);
					}
					else {
						this.equipmentAllowed.setValue(this.equipmentIds);
						this.equipmentLoaded = true;
						this.checkLoaded();
					}
				}
			});
		}
		else {
			this.modesLoaded = true;
			this.equipmentLoaded = true;
			this.checkLoaded();
		}
	},
	
	checkLoaded: function(){
		if(this.loaded){
			return;
		}
		if(this.equipmentLoaded && this.modesLoaded){
			setTimeout(Ext.bind(function(){
				this.loaded = true;
			}, this), 1100);
		}
	},
	
	loadContact: function(contact_id) {
		this.contact_id = contact_id;
		this.carrier_id = 0;
		this.loadData();
	},
	
	loadCarrier: function(carrier_id) {
		this.carrier_id = carrier_id;
		this.contact_id = 0;
		this.loadData();
	},
	
	save: function() {
		if ((this.contact_id || this.carrier_id) && this.autoSave && this.loaded) {
			this.submit();
		}
	}
	
});
Ext.define('TMS.contacts.forms.sections.PayTo', {
	extend:'TMS.form.Abstract',
	
	//Requires
	requires:[
		'Ext.ux.form.field.RealComboBox',
		'TMS.customer.lookup.Customer',
		'TMS.location.lookup.Location'
	],
	
	//Config
	carrier_id:0,
	loadedCarrierId:0,
	pay_to_location_id:0,
	bodyStyle:{
		padding:'8px'
	},
	url: '/at-ajax/modules/carrier/process/save-pay-to',
	processingPage:'/at-ajax/modules/carrier/process/',
	title:'Pay To',
	baseTitle:'Pay To',
	layout: 'anchor',
	defaults:{
		anchor: '100%'
	},
	
	initComponent: function(){
		this.items = [];
		this.init();
		this.callParent(arguments);
	},
	
	init: function() {
		this.initCustomerSelector();
		this.initLocationSelector();
		this.initListeners();
		this.load(this.carrier_id);
	},
	
	initCustomerSelector: function() {
		this.customerSelector = Ext.create('TMS.customer.lookup.Customer', {
			fieldLabel:'Company',
			proxyParams:{
				isPayTo:1
			}
		});
		this.items.push(this.customerSelector);
	},
	
	initLocationSelector: function() {
		this.locationSelector = Ext.create('TMS.location.lookup.Location', {
			fieldLabel:'Location',
			type:'customer'
		});
		this.items.push(this.locationSelector);
	},
	
	initListeners: function() {
		this.customerSelector.on('select', function(field, records) {
			if(!records.length){
				this.locationSelector.disable();
				return false;
			}
			this.locationSelector.enable();
			var record = records[0];
			this.locationSelector.setRawValue('');
			this.locationSelector.setValue(0);
			this.locationSelector.store.proxy.extraParams.to_id = record.get('customer_id');
			this.locationSelector.store.load();
			this.locationSelector.focus(true, 50);
		}, this);
		
		this.locationSelector.on('select', function(field, records) {
			var record = records[0];
			this.pay_to_location_id = record.get('location_id');
			this.save();
		}, this);
		
		this.on('beforesubmit', function(form){
			form.setParams({
				carrier_id:this.carrier_id,
				pay_to_location_id:this.pay_to_location_id
			});
		}, this);
	},
	
	save: function() {
		if (this.carrier_id && this.pay_to_location_id) {
			this.submit();
		}
	},
	
	load: function(carrier_id) {
		this.carrier_id = carrier_id;
		
		if (this.carrier_id && this.carrier_id != this.loadedCarrierId) {

			Ext.Ajax.request({
				scope:this,
				method:'post',
				url:this.processingPage + 'get-pay-to-data',
				params:{
					carrier_id:this.carrier_id
				},
				success: function(r) {
					var response = Ext.decode(r.responseText);
					if (response.success) {
						this.loadedCarrierId = this.carrier_id;
						var addedRecords = this.customerSelector.store.add({
							customer_id: response.data.customer_id,
							customer_name: response.data.customer_name
						});
						
						//Select customer record
						this.customerSelector.suspendEvents(false);
						this.customerSelector.select(addedRecords[0]);
						this.customerSelector.resumeEvents();
						
						
						//Select location record
						addedRecords = this.locationSelector.store.add({
							location_id: response.data.location_id,
							location_display: response.data.location_name
						});
						this.locationSelector.select(addedRecords[0]);
						
						//Set the title
						this.setTitle(this.baseTitle + ' for ' + response.data.forCarrierName);
					}
					else {
						this.customerSelector.setValue(0);
						this.customerSelector.setRawValue('');
						this.locationSelector.setValue(0);
						this.locationSelector.setRawValue('');
					}
				}
			});
		}
	}
	
});
Ext.define('TMS.contacts.forms.sections.PreferredStates', {
	extend:'TMS.form.Abstract',
	
	//Requires
	requires:[
		'Ext.ux.form.field.RealComboBox',
		'Ext.ux.form.field.BoxSelect'
	],
	
	//Config
	title:'Preferred States',
	baseTitle:'Preferred States',
	contact_id:0,
	carrier_id:0,
	layout:'hbox',
	url: '/at-ajax/modules/contact/process/save-preferred-states',
	processingPage:'/at-ajax/modules/contact/process/',
	loaded: false,
	
	initComponent: function(){
		this.items = [];
		this.init();
		this.callParent(arguments);
	},
	
	init: function() {
		this.initLayoutPanels();
		this.initStore();
		this.initOriginStates();
		this.initDestinationStates();
		this.initListeners();
	},
	
	initLayoutPanels: function() {
		this.leftPanel = Ext.create('Ext.panel.Panel', {
			flex:1,
			autoHeight:true,
			border:0,
			layout:'anchor',
			defaults:{
				anchor: '98%'
			}
		});
		this.rightPanel = Ext.create('Ext.panel.Panel', {
			flex:1,
			autoHeight:true,
			border:0,
			layout:'anchor',
			defaults:{
				anchor: '98%'
			}
		});
		
		this.items.push(this.leftPanel, this.rightPanel);
	},
	
	initStore: function() {
		this.statesStore = Ext.create('Ext.data.Store', {
			fields: [
				'stateCode',
				'stateName'
			],
			proxy: {
				type: 'ajax',
				url: this.processingPage + 'get-state-list',
				reader: {
					type: 'json',
					root: 'records'
				}
			}
		});
		this.statesStore.load();
	},
	
	initOriginStates: function() {
		this.originStates = Ext.create('Ext.ux.form.field.BoxSelect', {
			store:this.statesStore,
			displayField:'stateName',
			valueField:'stateCode',
			queryMode:'local',
			multiSelect:true,
			padding:10,
			fieldLabel:'Origin',
			anchor:'100%'
		});
		this.leftPanel.add(this.originStates);
	},
	
	initDestinationStates: function() {
		this.destinationStates = Ext.create('Ext.ux.form.field.BoxSelect', {
			store:this.statesStore,
			displayField:'stateName',
			valueField:'stateCode',
			queryMode:'local',
			multiSelect:true,
			padding:10,
			fieldLabel:'Destination',
			anchor:'100%'
		});
		this.rightPanel.add(this.destinationStates);
	},
	
	loadContact: function(contact_id, carrier_id, name) {
		this.contact_id = contact_id || this.contact_id;
		this.carrier_id = carrier_id || this.carrier_id;
		var newTitle = this.baseTitle;
		if (name != null) {
			newTitle = this.baseTitle + ' - ' + name;
		}
		
		if (this.rendered) {
			this.setTitle(newTitle);
		}
		else {
			this.title = newTitle;
		}
		
		if (this.statesStore.isLoading()) {
			this.statesStore.on('load', function() {
				this.loadContact();
			}, this);
		}
		else {
			if (this.contact_id) {
				this.setLoading(true);
				Ext.Ajax.request({
					scope:this,
					method:'post',
					url:this.processingPage + 'get-preferred-states',
					params:{
						contact_id:this.contact_id,
						carrier_id:this.carrier_id
					},
					success: function(r) {
						this.setLoading(false);
						var response = Ext.decode(r.responseText);
						var records = response.records;
						var originStates = [];
						var destinationStates = [];
						for (var i = 0; i < records.length; i++) {
							if (parseInt(records[i].origin)) {
								originStates.push(records[i].state);
							}
							else {
								destinationStates.push(records[i].state);
							}
						}
						this.originStates.setValue(originStates);
						this.destinationStates.setValue(destinationStates);
						setTimeout(Ext.bind(function(){
							this.loaded = true;
						}, this), 800);
					}
				});
			}
		}
	},
	
	initListeners: function() {
		this.originStates.on('change', this.savePreferredStates, this, {buffer: 700});
		this.destinationStates.on('change', this.savePreferredStates, this, {buffer: 700});
		this.on('beforesubmit', function(form){
			if(!this.rendered){
				return;
			}
			//Add in the contact or customer
			if(form == this){
				this.setParams({
					contact_id: this.contact_id,
					carrier_id: this.carrier_id,
					originStates: Ext.encode(this.originStates.getValue()),
					destinationStates: Ext.encode(this.destinationStates.getValue())
				});
			}
		}, this);
	},
	
	savePreferredStates: function() {
		if(this.loaded){
			this.submit();
		}
		/*
		Ext.Ajax.request({
			scope:this,
			method:'post',
			url:this.processingPage + 'save-preferred-states',
			params:{
				contact_id:this.contact_id,
				carrier_id:this.carrier_id,
				'originStates[]':this.originStates.getValue(),
				'destinationStates[]':this.destinationStates.getValue()
			},
			success: function(r) {
				var response = Ext.decode(r.responseText);
				
			}
		});
		*/
	}
	
});
Ext.define('TMS.contacts.forms.sections.Release', {
	extend:'TMS.ActionWindow',
	
	//Requires
	requires:[
		'TMS.contacts.forms.sections.Transfer'
	],
	
	//Config
	title:'Confirm Release',
	processingPage:'/at-ajax/modules/contact/process/',
	contact_id:0,
	defaultText:'',
	bodyPadding: 10,
	sizePercent: 0.2,
	minSize: 200,
	
	init: function() {
		this.on('afterrender', this.getContactInfo, this);
		this.initButtons();
	},
	
	getContactInfo: function() {
		setTimeout(Ext.bind(function(){
			this.setLoading(true);
		}, this), 200);
		
		Ext.Ajax.request({
			scope:this,
			method:'post',
			url:this.processingPage + 'get-contact-data',
			params:{
				contact_id:this.contact_id
			},
			success: function(r) {
				this.setLoading(false);
				var response = Ext.decode(r.responseText);
				this.response = response;
				this.defaultText = '<p>Are you sure you want to release ' + response.record.contact_name + '?</p>';
				this.update(this.defaultText);
			}
		});
	},
	
	initButtons: function() {
		this.addBottomButton([{
			scope:this,
			text:'Cancel',
			scale: 'medium',
			icon: '/resources/icons/close-24.png',
			handler: function() {
				this.close();
			}
		},{
			scope:this,
			text:'Transfer Contact',
			scale: 'medium',
			icon: '/resources/icons/release-24.png',
			handler:this.transfer
		},{
			scope:this,
			text:'Release Restricted',
			scale: 'medium',
			icon: '/resources/icons/release-restricted-24.png',
			handler:function() {
				this.release(1)
			}
		},{
			scope:this,
			text:'Release Unrestricted',
			scale: 'medium',
			icon: '/resources/icons/release-unrestricted-24.png',
			handler:function() {
				this.release(0)
			}
		}]);
	},
	
	release: function(restricted) {
		this.setLoading(true);
		Ext.Ajax.request({
			scope:this,
			method:'post',
			url:this.processingPage + 'release',
			params:{
				contact_id:this.contact_id,
				restricted:restricted
			},
			success: function(r) {
				this.setLoading(false);
				var response = Ext.decode(r.responseText);
				if (response.success) {
					this.update(response.msg[0]);
					this.showCloseButton();
				}
				else {
					this.update(response.errorStr + this.defaultText);
				}
			}
		});
	},
	
	transfer: function() {
		Ext.create('TMS.contacts.forms.sections.Transfer', {
			contact_id:this.contact_id,
			title:'Confirm Transfer of ' + this.response.record.contact_name
		});
		this.close();
	}
	
});
Ext.define('TMS.contacts.forms.sections.Transfer', {
	extend:'TMS.ActionWindow',
	
	//Requires
	requires:[
		'TMS.user.lookup.User'
	],
	
	//Config
	title:'Confirm Transfer',
	processingPage:'/at-ajax/modules/contact/process/',
	contact_id:0,
	requested_by_id:0,
	defaultText:'',
	layout:'anchor',
	
	init: function() {
		if (this.requested_by_id) {
			this.on('afterrender', this.getContactInfo, this);
		}
		else {
			this.initUserSelector();
		}
		this.initButtons();
	},
	
	getContactInfo: function() {
		this.setLoading(true);
		Ext.Ajax.request({
			scope:this,
			method:'post',
			url:this.processingPage + 'get-transfer-data',
			params:{
				contact_id:this.contact_id,
				requested_by_id:this.requested_by_id
			},
			success: function(r) {
				this.setLoading(false);
				var response = Ext.decode(r.responseText);
				if (response.success) {
					this.defaultText = '<p>' + response.msg[0] + '</p>';
					this.update(this.defaultText);
				}
			}
		});
	},
	
	initUserSelector: function() {
		this.userSelector = Ext.create('TMS.user.lookup.User');
		this.userSelector.on('select', function(combobox, records) {
			var data = records[0].data;
			this.requested_by_id = data.user_id;
		}, this);
		
		this.items.push(this.userSelector);
	},
	
	initButtons: function() {
		this.addBottomButton({
			scope:this,
			text:'Cancel',
			handler: function() {
				this.close();
			}
		});
		
		if (this.requested_by_id) {
			this.addBottomButton({
				scope:this,
				text:'Deny Transfer',
				handler: this.deny
			});
		}
		
		this.addBottomButton({
			scope:this,
			text:'Transfer Contact',
			handler:this.transfer
		});
	},
	
	transfer: function() {
		this.setLoading(true);
		Ext.Ajax.request({
			scope:this,
			method:'post',
			url:this.processingPage + 'transfer-contact',
			params:{
				contact_id:this.contact_id,
				requested_by_id:this.requested_by_id
			},
			success: function(r) {
				this.setLoading(false);
				var response = Ext.decode(r.responseText);
				if (response.success) {
					this.fireEvent('taskcomplete');
					this.removeAll();
					this.update(response.msg[0]);
					this.showCloseButton();
				}
				else {
					this.update(response.errorStr);
				}
			}
		});
	},
	
	deny: function() {
		this.setLoading(true);
		Ext.Ajax.request({
			scope:this,
			method:'post',
			url:this.processingPage + 'deny-transfer-contact',
			params:{
				contact_id:this.contact_id,
				requested_by_id:this.requested_by_id
			},
			success: function(r) {
				this.setLoading(false);
				var response = Ext.decode(r.responseText);
				if (response.success) {
					this.fireEvent('taskcomplete');
					this.update(response.msg[0]);
					this.showCloseButton();
				}
				else {
					this.update(response.errorStr);
				}
			}
		});
	}
	
});
Ext.define('TMS.contacts.forms.Contact', {
	extend:'TMS.form.Navigation',
	
	requires:[
		'Ext.ux.form.field.RealComboBox',
		'TMS.contacts.forms.sections.GeneralInformation',
		'TMS.contacts.forms.sections.CompanyInformation',
		'TMS.contacts.forms.sections.CarrierInformation',
		'TMS.contacts.forms.sections.ContactInformation'
	],
	
	//Config
	title: 'Contacts',
	url: '/at-ajax/modules/contact/process/add',
	preloadCustomerId: 0,
	preloadCarrierId: 0,
	
	initComponent: function(){
		this.items = this.items || [];
		this.dockedItems = this.dockedItems || [];
		this.init();
		this.callParent(arguments);
	},
	
	init: function() {
		this.initButtons();
		this.initGeneralInformation();
		this.initContactInformation();
	},
	
	initButtons: function(){
		this.buttons = [{
			scope: this,
			text: 'Submit',
			icon: '/resources/icons/save-16.png',
			cls: 'submit',
			handler: function() {
				this.submit();
			}
		}];
	},
	
	initGeneralInformation: function() {
		this.generalInformation = Ext.create('TMS.contacts.forms.sections.GeneralInformation', {
			title:'General Information',
			border: true
		});
		this.items.push(this.generalInformation);
		
		// See if we need to preload a customer or carrier
		this.generalInformation.typeStore.on('load', function() {
			if (this.preloadCustomerId > 0) {
				this.generalInformation.typeSelector.setValue(2);
			}
			if (this.preloadCarrierId > 0) {
				this.generalInformation.typeSelector.setValue(3);
			}
		});
		
		//Determine which panel to show
		this.generalInformation.down('#contact_type_id').on('change', function(el, value) {
			var customerType = 2;
			var carrierType = 3;
			var billToType = 4;
			var payToType = 5;
			
			if(this.locationInformation != null){
				this.locationInformation.destroy();
			}
			if (value == customerType || value == billToType || value == payToType) {
				this.locationInformation = Ext.create('TMS.contacts.forms.sections.CompanyInformation', {
					scope: this,
					isPayTo:(value == payToType) ? 1 : 0
				});
				this.center.add(this.locationInformation);
				
				// Select the customer record if we need to preload one
				if (this.preloadCustomerId > 0) {
					this.locationInformation.customerLookup.store.on('load', function() {
						this.locationInformation.customerLookup.setValue(this.preloadCustomerId);
					}, this, {single:true});
					this.locationInformation.customerLookup.store.load({
						params:{
							customer_id: this.preloadCustomerId
						}
					});
				}
			}
			
			if (value == carrierType) {
				this.contactInterval.disable();
				this.locationInformation = Ext.create('TMS.contacts.forms.sections.CarrierInformation', {
					title:'Carrier Information'
				});
				this.center.add(this.locationInformation);
				
				if (this.preloadCarrierId > 0) {
					this.locationInformation.carrierLookup.store.on('load', function() {
						this.locationInformation.carrierLookup.setValue(this.preloadCarrierId);
					}, this, {single:true});
					this.locationInformation.carrierLookup.store.load({
						params:{
							carrier_id: this.preloadCarrierId
						}
					});
				}
			}
			if (value == customerType) {
				this.contactInterval.enable();
			}
			else {
				this.contactInterval.disable();
			}
			
		}, this);
	},
	
	initContactInformation: function(){
		this.contactInformation = Ext.create('TMS.contacts.forms.sections.ContactInformation', {
			scope: this,
			title: 'Contact Information'
		});
		this.items.push(this.contactInformation);
		
		//Backwards compatibility
		this.contactMethods = this.contactInformation.contactMethods;
		this.contactInterval = this.contactInformation.contactInterval;
		
		//Bind the forms
		this.bindForm(this.contactMethods);
		this.bindForm(this.contactInterval);
	}
});
Ext.define('TMS.contacts.forms.Update', {
	extend:'TMS.form.Navigation',
	
	//Requires
	requires:[
		'Ext.ux.form.field.RealComboBox',
		'TMS.contacts.forms.sections.Release',
		'TMS.contacts.forms.sections.GeneralInformation',
		'TMS.contacts.forms.sections.ContactInformation',
		'TMS.calendar.view.Small',
		'TMS.contacts.forms.sections.ModesEquipment',
		'TMS.contacts.forms.sections.BillTo',
		'TMS.documents.forms.sections.DocumentsRequired',
		'TMS.comment.forms.sections.Comments',
		'TMS.contacts.forms.sections.CompanyInformation',
		'TMS.documents.view.Interface',
		'TMS.orders.view.PreOrderFilteredGrid',
		'TMS.orders.view.FilteredGrid'
	],
	
	contact_id:0,
	
	//Config
	url: '/at-ajax/modules/contact/process/',
	
	initComponent: function(){
		this.items = this.items || [];
		this.dockedItems = this.dockedItems || [];
		this.init();
		
		this.callParent(arguments);
	},
	
	init: function() {
		this.initToolbar();
		this.initGeneralInformation();
		this.initContactInformation();
		this.initCalendar();
		
		this.initModesEquipmentPanel();
		this.initBillToPanel();
		this.initDocumentsRequiredPanel();
		
		this.initCommentsPanel();
		this.initCompanyInformation();
		this.initDocuments();
		this.initPreOrderGrid();
		this.initOrderGrid();
	},
	
	initToolbar: function() {
		this.releaseButton = Ext.create('Ext.button.Button', {
			scope:this,
			text:'Release',
			scale:'medium',
			icon:'/resources/icons/release-24.png',
			handler: function() {
				Ext.create('TMS.contacts.forms.sections.Release', {
					contact_id: this.contact_id
				});
			}
		});
		
		this.callButton = Ext.create('Ext.button.Button', {
			scope:this,
			text:'Call',
			scale:'medium',
			icon:'/resources/icons/phone-24.png',
			handler: function() {
				
			}
		});
		
		this.emailButton = Ext.create('Ext.button.Button', {
			scope:this,
			text:'Email',
			scale:'medium',
			icon:'/resources/icons/email-24.png',
			handler: function() {
				var email = this.contactMethodsPanel.getEmail();
				var form = Ext.create('TMS.contacts.forms.sections.Email', {
					contact_id: this.contact_id,
					plugins: [
						Ext.create('TMS.form.plugin.StatusBar', {
							scope: this,
							items:[{
								text: 'Send',
								cls: 'submit',
								icon: '/resources/icons/save-16.png',
								handler: function(){
									form.submit();
								}
							}]
						})
					]
				});
				Ext.create('TMS.ActionWindow', {
					title: 'Email',
					layout: 'fit',
					items:[form],
					form: form
				});
			}
		});
		
		this.topBar = Ext.create('Ext.toolbar.Toolbar', {
			dock:'top',
			items:[
				this.releaseButton,
				'-',
				this.callButton,
				'-',
				this.emailButton
			]
		});
		this.dockedItems.push(this.topBar);
	},
	
	initGeneralInformation: function() {
		
		this.generalInformation = Ext.create('TMS.contacts.forms.sections.GeneralInformation', {
			contact_id:this.contact_id,
			autoSave:true
		});
		
		this.generalInformation.on('recordload', function(panel, record) {
			this.setTitle(record.contact_name);
			
			if (record.contact_type_id == 2) {
				this.contactIntervalPanel.enable();
				this.modesEquipmentPanel.enable();
				
//				if ($roleId == UserRoles::Admin || $roleId == UserRoles::CreditAndCollections) {
				
				this.billToPanel.enable();
				this.documentsRequiredPanel.enable();
			}
		}, this);
		this.items.push(this.generalInformation);
	},
	
	initContactInformation: function(){
		this.contactInformation = Ext.create('TMS.contacts.forms.sections.ContactInformation', {
			scope: this,
			contact_id: this.contact_id,
			autoSave: true,
			title: 'Contact Information'
		});
		this.items.push(this.contactInformation);
		
		//Backwards compatibility
		this.contactMethodsPanel = this.contactInformation.contactMethods;
		this.contactIntervalPanel = this.contactInformation.contactInterval;
		
		//Bind the forms
		this.bindForm(this.contactMethodsPanel);
		this.bindForm(this.contactIntervalPanel);
	},
	
	initCalendar: function() {
		this.contactCalendarPanel = Ext.create('TMS.calendar.view.Small', {
			title: 'Contact Calendar',
			calendarConfig:{
				extraParams: {
					contact_id: this.contact_id
				}
			}
		});
		this.items.push(this.contactCalendarPanel);
	},
	
	initModesEquipmentPanel: function() {
		this.modesEquipmentPanel = Ext.create('TMS.contacts.forms.sections.ModesEquipment', {
			contact_id:this.contact_id,
			disabled:true
		});
		
		this.items.push(this.modesEquipmentPanel);
	},
	
	initBillToPanel: function() {
		this.billToPanel = Ext.create('TMS.contacts.forms.sections.BillTo', {
			contact_id:this.contact_id,
			autoSave:true,
			disabled:true
		});
		
		this.items.push(this.billToPanel);
				
	},
	
	initDocumentsRequiredPanel: function() {
		this.documentsRequiredPanel = Ext.create('TMS.documents.forms.sections.DocumentsRequired', {
			contact_id:this.contact_id,
			autoSave:true,
			disabled:true
		});
		
		this.items.push(this.documentsRequiredPanel);
	},
	
	initCommentsPanel: function() {
		this.commentsPanel = Ext.create('TMS.comment.forms.sections.Comments', {
			field_value: this.contact_id,
			type:'contact',
			cls: ''
		});
		
		this.items.push(this.commentsPanel);
	},
	
	initCompanyInformation: function() {
//		this.contactTypeId = Ext.get('contact_type_id').dom.value;
		this.contactTypeId = 2;
		this.companyInformation = Ext.create('TMS.contacts.forms.sections.CompanyInformation', {
			title: 'Company',
			contact_id: this.contact_id,
			isPayTo:(this.contactTypeId == 5) ? 1 : 0
		});
		
		this.companyInformation.customerLookup.on('change', function(field, value) {
			value = parseInt(value);
			if (isNaN(value)) {
				
			}
			else {
				
				this.customerDocumentsGrid.setExtraParams({
					customer_id:value
				});
				this.customerDocumentsGrid.setTitle(this.customerDocumentsGrid.baseTitle + ' for ' + field.getRawValue());
				this.customerDocumentsGrid.store.load();
			}
		}, this);
		
		this.items.push(this.companyInformation);
	},
	
	initDocuments: function(){
		this.documents = Ext.create('TMS.documents.view.Interface', {
			title: 'Documents'
		});
		this.items.push(this.documents);
		
		this.documents.on('minimize', function(){
			this.setActiveItem(this.documents);
			this.documents.doLayout();
		}, this);
	},
	
	initPreOrderGrid: function() {
		this.preOrderGrid = Ext.create('TMS.orders.view.PreOrderFilteredGrid', {
			title:'Quotes',
			gridConfig:{
				stateful: false,
				stateId: null
			},
			extraFilters:{
				ordered_by_id: this.contact_id
			}
		});
		this.items.push(this.preOrderGrid);
	},
	
	initOrderGrid: function() {
		this.orderGrid = Ext.create('TMS.orders.view.FilteredGrid', {
			gridConfig:{
				stateful: false,
				stateId: null
			},
			extraFilters:{
				ordered_by_id: this.contact_id
			}
		});
		this.items.push(this.orderGrid);
	}
	
});
Ext.ns('TMS.contacts.lookup.ContactTypes');
TMS.contacts.lookup.ContactTypes = {
	Contact: 'contact',
    Customer: 'customer',
    Carrier: 'carrier'
};

Ext.define('TMS.contacts.lookup.Contact', {
	extend: 'Ext.ux.form.field.RealComboBox',
	
	//Config
	type: TMS.contacts.lookup.ContactTypes.Contact,
	processingPage: '/at-ajax/modules/contact/lookup/contact',
	displayField: 'name',
	valueField: 'contact_id',
	emptyText: 'Search for contact...',
	typeAhead: false,
	hideTrigger:true,
	anchor: '100%',
	pageSize: 10,
	minChars: 0,
	listConfig: {
		loadingText: 'Searching...',
		emptyText: 'No matching contacts found.',

		// Custom rendering template for each item
		getInnerTpl: function() {
			return '{name}';
		}
	},
	params: {},
	
	constructor: function(){
		this.params = {};
		this.callParent(arguments);
	},
	
	initComponent: function(){
		this.init();
		this.callParent(arguments);
	},
	
	//Init Functions
	init: function(){
		this.initStore();
	},
	
	initStore: function(){
		this.store = new Ext.data.Store({
			fields: [
				'contact_id',
				'first_name',
				'last_name',
				'name',
				'location_id'
			],
			remoteSort: true,
			pageSize: 10,
			proxy: {
				type: 'ajax',
				url : this.processingPage,
				reader: {
					type: 'json',
					root: 'records',
					totalProperty: 'total'
				},
				extraParams: Ext.apply(this.params, {
					type: this.type
				})
			}
		});
	},
	
	setParam: function(param, value){
		this.store.proxy.extraParams[param] = value;
	}
});
            
Ext.define('TMS.contacts.model.Status', {
    extend: 'Ext.data.Model',
    fields: [
        {name: 'status_id', type: 'int'},
        {name: 'status_name',  type: 'string'}
    ]
});
Ext.define('TMS.contacts.view.FilteredGrid', {
	extend: 'Ext.panel.Panel',
	requires:[
		'TMS.contacts.filter.Contact',
		'TMS.contacts.view.Grid'
	],
	
	layout:'border',
	height:500,
	title:'Contacts',
	
	initComponent: function(){
		this.items = this.items || [];
		this.init();
		this.callParent(arguments);
	},
	
	//Init Functions
	init: function() {
		this.initFilter();
		this.initGrid();
	},
	
	initFilter: function(){
		this.filter = Ext.create('TMS.contacts.filter.Contact', {
			title: 'Search',
			region: 'east',
			width: 250,
			collapsible: true,
			collapsed: true,
			titleCollapse: true,
			split: true,
			floatable: false
		});
		this.items.push(this.filter);
	},
	
	initGrid: function() {
		this.grid = Ext.create('TMS.contacts.view.Grid', {
			region: 'center',
			filter: this.filter
		});
		this.items.push(this.grid);
	}
	
});
Ext.define('TMS.contacts.view.FreeAgentsGrid', {
	extend: 'Ext.grid.Panel',
	requires:[
		'TMS.contacts.forms.sections.Claim'
	],
	
	//Config
	processingPage: '/at-ajax/modules/contact/process/get-free-agents-records',
	viewConfig: {
		stripeRows: true
	},
	title:'Free Agents',
	
	initComponent: function(){
		this.init();
		this.callParent(arguments);
	},
	
	//Init Functions
	init: function(){
		this.initListeners();
		this.initColumns();
		this.initStore();
		this.initPager();
	},
	
	initListeners: function(){
		this.on('afterrender', function(){
			this.store.load();
		}, this);
		
		this.on('itemdblclick', function(view, record){
			this.setLoading(true);
			location.href = Ext.String.format('/contacts/?d=contacts&a=view&id={0}', record.get('contact_id'));
		}, this);
	},
	
	initPager: function(){
		this.pager = new Ext.toolbar.Paging({
			store: this.store,
			displayInfo: true
		});
		this.tbar = this.pager;
	},
	
	initColumns: function(){
		this.columns = [{
			header: 'Contact Name',
			dataIndex: 'contact_name',
			flex: 1
		},{
			header: 'Title',
			dataIndex: 'title',
			flex: 1
		},{
			header: 'Customer',
			dataIndex: 'customer_name',
			flex: 1
		},{
			header: 'Restriction',
			dataIndex: 'restrictionDisplay',
			flex: 1
		},{
			header: 'Date',
			dataIndex: 'updated_at',
			flex: 1,
			xtype:'templatecolumn',
			tpl:'{dateDisplay}'
		},{
			header: 'Claim',
			dataIndex: 'contact_id',
			flex: 1,
			xtype:'templatecolumn',
			tpl:'<div class="rounded5 button box-right">' +
					'<a href="#" class="claim-button" id="claim-{contact_id}">Claim</a>' +
				'</div>'
		}];
	},
	
	initStore: function(){
		this.store = new Ext.data.Store({
			fields: [
				'contact_id',
				'contact_name',
				'title',
				'updated_at',
				'dateDisplay',
				
				'owner_name',
				
				'customer_id',
				'customer_name',
				
				'restrictionDisplay'
			],
			remoteSort: true,
			pageSize: 20,
			proxy: {
				type: 'ajax',
				url : this.processingPage,
				reader: {
					type: 'json',
					root: 'records',
					totalProperty: 'total'
				}
			}
		});
		
		this.store.on('load', function() {
			Ext.select('.claim-button').on('click', function(e, el) {
				e.preventDefault();
				var contact_id = el.id.split('-')[1];
				var claimWindow = Ext.create('TMS.contacts.forms.sections.Claim', {
					contact_id:contact_id
				});
				claimWindow.on('close', function() {
					this.store.load();
				}, this);
			}, this);
		}, this);
	}
	
});
Ext.define('TMS.contacts.view.Grid', {
	extend: 'TMS.grid.Grid',
	
	//Config
	processingPage: '/at-ajax/modules/contact/process/get',
	viewConfig: {
		stripeRows: true
	},
	
	initComponent: function(){
		this.dockedItems = this.dockedItems || [];
		this.init();
		this.callParent(arguments);
	},
	
	//Init Functions
	init: function(){
		this.addEvents('editrecord');
		
		this.initSelectionModel();
		this.initColumns();
		this.initStore();
		
		this.initActionBar();
		this.initPager();
		
		this.initListeners();
	},
	
	initPager: function(){
		this.pager = new Ext.toolbar.Paging({
			store: this.store,
			displayInfo: true,
			dock:'top'
		});
		this.dockedItems.push(this.pager);
	},
	
	initActionBar: function() {
		this.topBar = Ext.create('Ext.toolbar.Toolbar', {
			dock:'top',
			items:[{
				scope:this,
				text:'Edit',
				icon:'/resources/icons/edit-24.png',
				scale:'medium',
				handler: function() {
					this.fireEvent('editrecord', this);
				}
			}]
		});
		this.dockedItems.push(this.topBar);
	},
	
	initSelectionModel: function() {
		this.selModel = Ext.create('Ext.selection.CheckboxModel');
	},
	
	initListeners: function(){
		this.on('afterrender', function(){
			this.store.load();
		}, this);
		
		this.on('itemdblclick', function(view, record){
			this.setLoading(true);
			location.href = Ext.String.format('/contacts/?d=contacts&a=view&id={0}', record.get('contact_id'));
		}, this);
	},
	
	initColumns: function(){
		this.columns = [{
			header: 'Name',
			dataIndex: 'contact_name',
			flex: 1,
			renderer: function(value, options, record){
				return Ext.String.format(
					'<a href="/contacts/?d=contacts&a=view&id={0}">{1}</a>',
					record.get('contact_id'),
					value
				);
			}
		},{
			header: 'Company',
			dataIndex: 'customer_name',
			flex: 1,
			xtype:'templatecolumn',
			tpl:'<a href="/customers/?d=customers&a=view&id={customer_id}">{customer_name}</a>'
		},{
			header: 'Status',
			dataIndex: 'status',
			flex: 1
		},{
			header: 'Next Action',
			dataIndex: 'next_action_date',
			flex: 1,
			xtype:'templatecolumn',
			tpl:'<tpl if="upToDate">' +
					'<span style="color:green;">{next_action_date_display}</span>' +
				'</tpl>' + 
				'<tpl if="!upToDate">' +
					'<span style="color:red;">{next_action_date_display}</span>' +
				'</tpl>'
		},{
			header: 'Owner',
			dataIndex: 'owner_name',
			flex: 1
		}];
	},
	
	initStore: function(){
		this.store = new Ext.data.Store({
			fields: [
				'contact_id',
				'contact_name',
				
				'customer_id',
				'customer_name',
				
				'status',
				'up_to_date',
				'next_action',
				'owner_name',
				'next_action_date',
				'next_action_date_display',
				'nextActionTs',
				'nowTs',
				'upToDate'
			],
			remoteSort: true,
			pageSize: 20,
			proxy: {
				type: 'ajax',
				url : this.processingPage,
				reader: {
					type: 'json',
					root: 'records',
					totalProperty: 'total'
				}
			}
		});
	}
});
Ext.define('TMS.contacts.view.Interface', {
	extend: 'Ext.tab.Panel',
	requires:[
		'TMS.contacts.view.FilteredGrid',
		'TMS.contacts.forms.Update'
	],
	
	//Config
	layout:'border',
	height:500,
	deferredRender:true,
	
	openTabs:{},
	
	initComponent: function(){
		this.items = this.items || [];
		this.plugins = this.plugins || [];
		this.init();
		this.callParent(arguments);
	},
	
	init: function() {
		this.initFilteredGrid();
		this.initListeners();
	},
	
	initFilteredGrid: function() {
		this.filteredGrid = Ext.create('TMS.contacts.view.FilteredGrid');
		this.items.push(this.filteredGrid);
	},
	
	initListeners: function() {
		this.filteredGrid.grid.on('editrecord', function(grid) {
			var selectedRecords = grid.selModel.getSelection();
			var numRecords = selectedRecords.length;
			if (numRecords) {
				var tabToShow = false;
				for (var i = 0; i < numRecords; i++) {
					if (this.openTabs[selectedRecords[i].data.contact_id]) {
						if (!tabToShow) {
							tabToShow = this.openTabs[selectedRecords[i].data.contact_id];
						}
					}
					else {
						var p = Ext.create('Ext.panel.Panel', {
							closable:true,
							title:selectedRecords[i].data.contact_name,
							layout:'fit'
						});
						p.on('afterrender', function(panel, options) {
							panel.setLoading();
							setTimeout(function(){
								panel.setLoading(false);
								panel.add(Ext.create('TMS.contacts.forms.Update', {
									contact_id:options.contact_id
								}));
							}, 100);
							this.openTabs[options.contact_id] = panel;
						}, this, {
							contact_id:selectedRecords[i].data.contact_id
						});
						p.on('close', function(panel, options) {
							this.openTabs[options.contact_id] = false;
						}, this, {
							contact_id:selectedRecords[i].data.contact_id
						});
						this.add(p);
						if (!tabToShow) {
							tabToShow = p;
						}
					}
				}
				tabToShow.show();
			}
		}, this);
	}
});
Ext.define('TMS.customer.filter.Customer', {
	extend: 'TMS.filter.Abstract',
	
	init: function(){
		this.initName();
	},
	
	initName: function(){
		this.items.push({
			name: 'name',
			fieldLabel: 'Name'
		});
	}
});
Ext.define('TMS.customer.forms.sections.CustomerContacts', {
	extend:'Ext.panel.Panel',
	
	//Requires
	requires:[
		'Ext.ux.form.field.RealComboBox',
		'Ext.ux.form.field.BoxSelect',
		'TMS.contacts.forms.sections.ContactMethods',
		'TMS.contacts.forms.sections.BillTo',
		'TMS.documents.forms.sections.DocumentsRequired'
	],
	
	//config
	customer_id:0,
	layout:{
		type: 'border',
	},
	processingPage:'/at-ajax/modules/customer/process/',
	title:'Customer Contacts',
	
	initComponent: function(){
		this.items = this.items || [];
		this.dockedItems = this.dockedItems || [];
		this.init();
		this.callParent(arguments);
	},
	
	init: function() {
		this.initToolbar();
		this.initLayoutPanels();
		this.initContactMethods();
		this.initBillTo();
		this.initDocumentsRequired();
		this.initContactStore();
		this.initContactSelectorView();
		this.initListeners();
	},
	
	initToolbar: function() {
		this.toolbar = Ext.create('Ext.toolbar.Toolbar', {
			dock:'top',
			items:[{
				scope:this,
				text:'Add New Contact',
				icon:'/resources/icons/add-16.png',
				handler:this.addNewContact
			}]
		});
		this.dockedItems.push(this.toolbar);
	},
	
	addNewContact: function() {
		var url = '/contacts/?d=contacts&a=add&customer_id=' + this.customer_id;
		window.open(url, '_blank');
	},
	
	initLayoutPanels: function() {
		this.leftPanel = Ext.create('Ext.panel.Panel', {
			title:'Contacts',
			region: 'west',
			collapsible: true,
			titleCollapse: true,
			floatable: false,
			split: true,
			width: 200,
			autoScroll: true
		});
		
		this.viewContactPageButton = Ext.create('Ext.button.Button', {
			scope:this,
			text:'View Contact Page',
			handler:this.viewContactPageClick,
			icon:'/resources/icons/preview-16.png'
		});
		this.rightPanel = Ext.create('Ext.tab.Panel', {
			flex: 1,
			region: 'center',
			tbar:[
				this.viewContactPageButton
			]
		});
		
		this.items.push(this.leftPanel, this.rightPanel);
	},
	
	viewContactPageClick: function() {
		var records = this.contactSelectorView.getSelectionModel().getSelection();
		if (records && records.length) {
			var record = records[0];
			var url = '/contacts/?d=contacts&a=view&id=' + record.data.contact_id;
			window.open(url, '_blank');
		}
	},
	
	initContactMethods: function() {
		this.contactMethods = Ext.create('TMS.contacts.forms.sections.ContactMethods', {
			title: 'Contact Methods',
			autoSave:true
		});
		this.rightPanel.add(this.contactMethods);
		
		this.rightPanel.setActiveTab(this.contactMethods);
	},
	
	initBillTo: function() {
		this.billTo = Ext.create('TMS.contacts.forms.sections.BillTo', {
			title: 'Bill To',
			autoSave:true
		});
		
		this.rightPanel.add(this.billTo);
	},
	
	initDocumentsRequired: function() {
		this.documentsRequired = Ext.create('TMS.documents.forms.sections.DocumentsRequired', {
			title: 'Documents Required',
			autoSave:true
		});
		this.rightPanel.add(this.documentsRequired);
	},
	
	initContactStore: function() {
		this.contactStore = Ext.create('Ext.data.Store', {
			fields: [
				'contact_id',
				'first_name',
				'last_name',
				'owner_name'
			],
			proxy: {
				type: 'ajax',
				url: this.processingPage + 'get-contacts',
				extraParams:{
					customer_id:this.customer_id
				},
				reader: {
					type: 'json',
					root: 'records'
				}
			}
		});
		this.contactStore.on('load', this.selectFirst, this);
		this.on('afterrender', function(){
			this.contactStore.load();
		}, this);
	},
	
	initContactSelectorView: function() {
		this.contactSelectorView = Ext.create('Ext.view.View', {
			title:'Contacts',
			store:this.contactStore,
			tpl:[
				'<tpl for=".">',
					'<div class="carrier-contact-row">{first_name} {last_name}</div>',
				'</tpl>',
				'<div class="x-clear"></div>',
			],
			trackOver: true,
			overItemCls:'carrier-contact-row-hover',
			selectedItemCls:'carrier-contact-row-selected',
			itemSelector:'.carrier-contact-row',
			emptyText: 'No contacts',
			deferEmptyText:false,
			listeners: {
				scope:this,
				selectionchange: function(dv, nodes) {
					if (nodes.length) {
						this.selectRecord(nodes[0].index);
					}
				}
			}
		});
		this.leftPanel.add(this.contactSelectorView);
	},
	
	selectFirst: function() {
		if (this.contactStore.count()) {
			this.leftPanel.doComponentLayout();
			this.contactSelectorView.suspendEvents();
			this.selectRecord(0);
			this.contactSelectorView.resumeEvents();
		}
		else {
			this.rightPanel.hide();
		}
	},
	
	selectRecord: function(index) {
		// Get the record based on the index
		this.contactSelectorView.select(index);
		var record = this.contactStore.getAt(index);
		var contact_id = record.data.contact_id;
		
		// Update the right side panel's title
		var name = record.data.first_name + ' ' + record.data.last_name;
		name += ' owned by ' + record.data.owner_name;
		this.rightPanel.setTitle(name);
		
		// Load the information panels for this contact
		this.contactMethods.loadRecord(contact_id);
		this.billTo.load(contact_id);
		this.documentsRequired.loadContact(contact_id);
	},
	
	initListeners: function() {
		
	}
	
});
Ext.define('TMS.customer.forms.sections.CustomerDuplicates', {
	extend:'Ext.panel.Panel',
	requires:[
		'TMS.customer.lookup.Customer',
		'TMS.customer.view.DuplicatesGrid'
	],
	
	//Config
	customer_id: 0,
	processingPage:'/at-ajax/modules/customer/process/',
	title:'Duplicate Customers',
	baseTitle:'Duplicate Customers',
	layout: 'anchor',
	defaults:{
		anchor: '100%'
	},
	
	initComponent: function(){
		this.items = [];
		this.init();
		this.callParent(arguments);
	},
	
	init: function() {
		this.initGrid();
		this.initCustomerSearch();
		this.initListeners();
	},
	
	initCustomerSearch: function(){
		this.searchBox = Ext.create('TMS.customer.lookup.Customer', {
			flex: 5
		});
		this.search = Ext.create('Ext.form.FieldContainer', {
			layout: 'hbox',
			items: [
				this.searchBox,{
				flex: 1,
				xtype: 'button',
				scope: this,
				text: 'Add',
				handler: function() {
					this.saveDuplicate();
				}
			}]
		});
		//this.items.push(this.search);
	},
	
	initGrid: function() {
		this.grid = Ext.create('TMS.customer.view.DuplicatesGrid', {
			customer_id: this.customer_id
		});
		this.items.push(this.grid);
	},
	
	initListeners: function() {
		if (this.collapsed) {
			this.collapsed = false;
			this.on('afterrender', function() {
				this.collapse();
			}, this);
		}
		this.on('expand', function() {
			this.grid.doLayout();
			this.scrollIntoView();
		}, this);
	},
	
	save: function() {
	},
	
	load: function(carrier_id) {
	},
	
	saveDuplicate: function() {
		this.setLoading(true);
		Ext.Ajax.request({
			scope: this,
			url: this.processingPage + 'add-duplicate',
			params: {
				customer_id: this.customer_id,
				duplicate_id: this.searchBox.getValue()
			},
			success: function(response){
				this.grid.store.load();
				this.searchBox.store.load();
				console.log(response);
				this.searchBox.setValue('');
				this.setLoading(false);
			}
		});
	}
});
Ext.define('TMS.customer.forms.sections.CustomerLocations', {
	extend:'Ext.panel.Panel',
	
	//Requires
	requires:[
		'Ext.ux.form.field.RealComboBox',
		'Ext.ux.form.field.BoxSelect',
		'TMS.location.forms.sections.Location'
	],
	
	//Config
	customer_id:0,
	layout: {
		type: 'hbox',
		align: 'stretch'
	},
	processingPage:'/at-ajax/modules/customer/process/',
	locationProcessingPage:'/at-ajax/modules/location/process/',
	
	initComponent: function(){
		this.items = this.items || [];
		this.dockedItems = this.dockedItems || [];
		this.init();
		this.callParent(arguments);
	},
	
	init: function() {
		this.initTopBar();
		this.initButtons();
		this.initLayoutPanels();
		this.initLocationStore();
		this.initLocationSelectorView();
		this.initLocationEditor();
	},
	
	initTopBar: function() {
		this.topToolbar = Ext.create('Ext.toolbar.Toolbar', {
			dock:'top'
		});
		this.dockedItems.push(this.topToolbar);
	},
	
	initButtons: function() {
		this.topToolbar.add({
			scope:this,
			text:'Add New Location',
			icon: '/resources/icons/add-16.png',
			handler:this.addNewLocation
		})
	},
	
	initLayoutPanels: function() {
		this.leftPanel = Ext.create('Ext.panel.Panel', {
			title:'Locations',
			width: 200,
			autoScroll: true
		});
		this.rightPanel = Ext.create('Ext.panel.Panel', {
			layout: 'fit',
			flex: 1,
			border:false
		});
		
		this.items.push(this.leftPanel, this.rightPanel);
	},
	
	initLocationStore: function() {
		this.locationStore = Ext.create('Ext.data.Store', {
			fields: [
				'location_id',
				'location_name_1',
				'location_name_2'
			],
			proxy: {
				type: 'ajax',
				url: this.processingPage + 'get-locations',
				extraParams:{
					customer_id:this.customer_id
				},
				reader: {
					type: 'json',
					root: 'records'
				}
			}
		});
		this.locationStore.on('load', this.selectFirst, this);
		this.locationStore.load();
	},
	
	initLocationSelectorView: function() {
		this.locationSelectorView = Ext.create('Ext.view.View', {
			title:'Locations',
			store:this.locationStore,
			tpl:[
				'<tpl for=".">',
					'<div class="carrier-contact-row">{location_name_1} {location_name_2}</div>',
				'</tpl>',
				'<div class="x-clear"></div>'
			],
			autoHeight:true,
			trackOver: true,
			overItemCls:'carrier-contact-row-hover',
			selectedItemCls:'carrier-contact-row-selected',
			itemSelector:'.carrier-contact-row',
			emptyText: 'No Locations',
			deferEmptyText:false,
			listeners: {
				scope:this,
				selectionchange: function(dv, nodes) {
					if (nodes.length) {
						this.selectRecord(nodes[0].index);
					}
				}
			}
		});
		this.leftPanel.add(this.locationSelectorView);
	},
	
	initLocationEditor: function() {
		this.locationEditor = Ext.create('TMS.location.forms.sections.Location', {
			title:'Location Information',
			bodyPadding:10,
			disabled:true,
			url:this.locationProcessingPage + 'process',
			buttons:[{
				scope:this,
				text:'Save',
				cls: 'submit',
				handler: function() {
					this.locationEditor.submit();
				}
			}]
		});
		
		this.locationEditor.on('success', function(form, action){
			var record = action.result.record;
			this.locationEditor.getForm().setValues(record);
			this.locationStore.un('load', this.selectFirst, this);
			this.locationStore.on('load', this.selectCurrent, this);
			this.locationStore.load();
		}, this);
		
		this.locationEditor.setValues({
			customer_id: this.customer_id
		});
		this.rightPanel.add(this.locationEditor);
	},
	
	selectFirst: function() {
		if (this.locationStore.count()) {
			this.leftPanel.doComponentLayout();
			this.locationSelectorView.suspendEvents();
			this.selectRecord(0);
			this.locationSelectorView.resumeEvents();
		}
	},
	
	selectCurrent: function() {
		var locationId = this.locationEditor.getForm().getValues()['location_id'];
		if (locationId) {
			var record = this.locationStore.findRecord('location_id', locationId);
			if (record) {
				this.leftPanel.doComponentLayout();
				this.locationSelectorView.suspendEvents();
				this.selectRecord(record.index);
				this.locationSelectorView.resumeEvents();
			}
			else {
				this.selectRecord(0);
			}
		}
	},
	
	selectRecord: function(index) {
		this.locationSelectorView.select(index);
		var record = this.locationStore.getAt(index);
		var location_id = record.data.location_id;
		var name = record.data.location_name_1;
		
		this.locationEditor.enable();
		this.locationEditor.loadLocation(location_id);
		this.locationEditor.setTitle('Location Information - ' + name);
		
	},
	
	addNewLocation: function() {
		// clear the form
		this.locationEditor.show();
		this.locationEditor.enable();
		this.locationEditor.setTitle('New Location');
		this.locationEditor.getForm().reset();
		this.locationEditor.setValues({
			customer_id: this.customer_id
		});
	},
	
	saveLocationData: function() {
		
	}
	
});
Ext.define('TMS.customer.forms.Customer', {
	extend:'TMS.form.Navigation',
	
	requires:[
		'Ext.ux.form.field.RealComboBox',
		'TMS.customer.forms.sections.CustomerLocations',
		'TMS.customer.forms.sections.CustomerDuplicates',
		'TMS.customer.forms.sections.CustomerContacts',
		'TMS.documents.view.Interface',
		'TMS.comment.forms.sections.Comments',
		'TMS.orders.view.FilteredGrid',
		'TMS.orders.view.PreOrderFilteredGrid'
	],
	
	//Config
	title: 'Customer',
	url: '',
	customer_id: 0,
	record: null,
	
	initComponent: function(){
		this.items = this.items || [];
		this.dockedItems = this.dockedItems || [];
		this.init();
		this.callParent(arguments);
	},
	
	init: function() {
		this.initTitle();
		this.initLocations();
		this.initDuplicates();
		this.initContacts();
		this.initDocuments();
		this.initComments();
		this.initOrders();
		this.initQuotes();
	},
	
	initTitle: function(){
		if(this.record != null){
			this.title = this.record.customer_name;
		}
	},
	
	initLocations: function(){
		this.locations = Ext.create('TMS.customer.forms.sections.CustomerLocations', {
			title:'Customer Locations',
			customer_id: this.customer_id
		});
		this.items.push(this.locations);
		
		this.bindForm(this.locations.locationEditor);
	},
	
	initDuplicates: function(){
		this.duplicates = Ext.create('TMS.customer.forms.sections.CustomerDuplicates', {
			customer_id: this.customer_id
		});
		this.items.push(this.duplicates);
	},
	
	initContacts: function(){
		this.contacts = Ext.create('TMS.customer.forms.sections.CustomerContacts', {
			customer_id: this.customer_id
		});
		this.items.push(this.contacts);
		
		this.bindForm(this.contacts.contactMethods);
		this.bindForm(this.contacts.documentsRequired);
		this.bindForm(this.contacts.billTo);
	},
	
	initDocuments: function(){
		this.documents = Ext.create('TMS.documents.view.Interface', {
			extraParams:{
				customer_id: this.customer_id
			}
		});
		this.items.push(this.documents);
		
		this.documents.on('minimize', function(){
			this.setActiveItem(this.documents);
			this.documents.doLayout();
		}, this);
	},
	
	initComments: function(){
		this.comments = Ext.create('TMS.comment.forms.sections.Comments', {
			field_value: this.customer_id,
			type:'customer',
			border: false
		});
		this.items.push(this.comments);
	},
	
	initOrders: function(){
		this.orders = Ext.create('TMS.orders.view.FilteredGrid', {
			title:'Orders',
			extraFilters:{
				customer_id: this.customer_id
			},
			border: false
		});
		this.items.push(this.orders);
	},
	
	initQuotes: function(){
		this.quotes = Ext.create('TMS.orders.view.PreOrderFilteredGrid', {
			title:'Quotes',
			extraFilters:{
				customer_id: this.customer_id
			},
			border: false
		});
		this.items.push(this.quotes);
	}
	
});
Ext.define('TMS.customer.forms.Form', {
	extend: 'TMS.form.Abstract',
	
	//Config
	url: '/at-ajax/modules/customer/process/add',
	bodyPadding: 10,
	isPayTo:false,
	
	initComponent: function(){
		this.items = [];
		this.init();
		this.callParent(arguments);
	},
	
	init: function(){
		this.initCustomerName();
		
		if (this.isPayTo) {
			this.items.push({
				xtype:'hidden',
				name:'isPayTo',
				value:1
			});
		}
	},
	
	initCustomerName: function() {
		this.customerName = Ext.create('Ext.form.field.Text', {
			fieldLabel:'Company Name',
			anchor:'100%',
			name:'customerName',
			enableKeyEvents:true
		});
		this.customerName.on('keypress', function(field, e) {
			if (e.keyCode == 13) {
				this.fireEvent('pressedenter');
			}
		}, this);
		this.items.push(this.customerName);
	}
	
});
Ext.define('TMS.customer.lookup.Customer', {
	extend: 'Ext.ux.form.field.RealComboBox',
	
	//Config
	lastQueryValue: '',
	processingPage: '/at-ajax/modules/customer/lookup/customer',
	displayField: 'customer_name',
	valueField: 'customer_id',
	emptyText: 'Search by name...',
	cls: 'customer-lookup',
	typeAhead: false,
	hideTrigger:true,
	anchor: '100%',
	pageSize: 10,
	minChars: 0,
	width: 250,
	listConfig: {
		loadingText: 'Searching...',
		cls: 'customer-lookup-list',
		emptyText: 'No matching customers found.',

		// Custom rendering template for each item
		getInnerTpl: function() {
			return '<div class="customer-name">{customer_name}</div>';
		}
	},
	proxyParams:{},
	
	initComponent: function(){
		this.init();
		this.callParent(arguments);
	},
	
	//Init Functions
	init: function(){
		this.initStore();
		this.initListeners();
	},
	
	initListeners: function(){
	},
	
	initStore: function(){
		this.store = new Ext.data.Store({
			fields: [
				'customer_id',
				'customer_name'
			],
			remoteSort: true,
			pageSize: 10,
			proxy: {
				type: 'ajax',
				url : this.processingPage,
				extraParams:this.proxyParams,
				reader: {
					type: 'json',
					root: 'records',
					totalProperty: 'total'
				}
			}
		});
	}
});
            
Ext.define('TMS.customer.view.DuplicatesGrid', {
	extend: 'Ext.grid.Panel',
	
	//Config
	processingPage: '/at-ajax/modules/customer/process/get-duplicate-records',
	viewConfig: {
		stripeRows: true
	},
	
	customer_id: 0,
	
	initComponent: function(){
		this.init();
		this.callParent(arguments);
	},
	
	//Init Functions
	init: function(){
		this.initColumns();
		this.initStore();
		this.initPager();
		this.initListeners();
	},
	
	initColumns: function(){
		this.columns = [{
			header: 'Duplicate Name',
			dataIndex: 'customer_name',
			flex: 9,
			renderer: function(value, options, record){
				return value;
				return Ext.String.format(
					'<a href="/customers/?d=customers&a=view&id={0}">{1}</a>',
					record.get('customer_id'),
					value
				);
			}
		}];
	},
	
	initStore: function(){
		this.store = new Ext.data.Store({
			fields: [
				'customer_id',
				'customer_name'
			],
			remoteSort: true,
			pageSize: 20,
			proxy: {
				type: 'ajax',
				url : this.processingPage,
				reader: {
					type: 'json',
					root: 'records',
					totalProperty: 'total'
				},
				extraParams: {
					customer_id: this.customer_id
				}
			}
		});
	},
	
	initPager: function(){
		this.pager = new Ext.toolbar.Paging({
			store: this.store,
			displayInfo: true
		});
		this.tbar = this.pager;
	},
	
	initListeners: function(){
		this.on('afterrender', function(){
			this.store.load();
		}, this);
		
		this.on('itemdblclick', function(view, record){
			//this.setLoading(true);
			//location.href = Ext.String.format('/customers/?d=customers&a=view&id={0}', record.get('customer_id'));
		}, this);
	},
	
	initFilters: function(){
	}
	
});
Ext.define('TMS.customer.view.Grid', {
	extend: 'Ext.grid.Panel',
	
	//Config
	processingPage: '/at-ajax/modules/customer/process/get-grid-records',
	viewConfig: {
		stripeRows: true
	},
	
	initComponent: function(){
		this.init();
		this.callParent(arguments);
	},
	
	//Init Functions
	init: function(){
		this.initColumns();
		this.initStore();
		this.initPager();
		this.initListeners();
	},
	
	initColumns: function(){
		this.columns = [{
			header: 'Name',
			dataIndex: 'customer_name',
			flex: 5,
			renderer: function(value, options, record){
				return Ext.String.format(
					'<a href="/customers/?d=customers&a=view&id={0}">{1}</a>',
					record.get('customer_id'),
					value
				);
			}
		},{
			header: 'Locations',
			flex: 1,
			dataIndex: 'location_count'
		}];
	},
	
	initStore: function(){
		this.store = new Ext.data.Store({
			fields: [
				'customer_id',
				'customer_name',
				'location_count'
			],
			remoteSort: true,
			pageSize: 20,
			proxy: {
				type: 'ajax',
				url : this.processingPage,
				reader: {
					type: 'json',
					root: 'records',
					totalProperty: 'total'
				}
			}
		});
	},
	
	initPager: function(){
		this.pager = new Ext.toolbar.Paging({
			store: this.store,
			displayInfo: true
		});
		this.tbar = this.pager;
	},
	
	initListeners: function(){
		this.on('afterrender', function(){
			this.store.load();
		}, this);
		
		this.on('itemdblclick', function(view, record){
			this.setLoading(true);
			location.href = Ext.String.format('/customers/?d=customers&a=view&id={0}', record.get('customer_id'));
		}, this);
	},
	
	initFilters: function(){
		this.filterPanel.add(new Ext.form.field.Text({ fieldLabel: 'Name'}));
	}
	
});
Ext.define('TMS.data.Model', {
    extend: 'Ext.data.Model',
	
	//Config
	idProperty: '',
	url: '',
	
	onClassExtended: function(cls, data) {
		this.init()
		return this.callParent(arguments);
	},
	
	init: function(){
		this.initProxy();
	},
	
	initProxy: function(){
		this.proxy = {
			type: 'ajax',
			api: {
				read: '/at-ajax/modules/league/season/read',
				create: '/at-ajax/modules/league/season/create',
				update: '/at-ajax/modules/league/season/update',
				destroy: '/at-ajax/modules/league/season/destroy'
			},
			reader: {
				idProperty: 'season_id',
				type: 'json',
				root: 'records',
				totalProperty: 'total'
			},
			writer: {
				type: 'json',
				allowSingle: false,
				writeAllFields: false,
				root: 'records',
				encode: true
			}
		};
	}
});
Ext.define('TMS.documents.filter.Document', {
	extend: 'TMS.filter.Abstract',
	processingPage: '/at-ajax/modules/document/grid/',
	
	//Requires
	requires:[
		'Ext.ux.form.field.RealComboBox'
	],
	
	init: function(){
		this.initTaskTypes();
		this.initTaskOwners();
		this.initCreatedBy();
		this.initAssignedTo();
		this.initDueDateOn();
		this.initDueDateFrom();
		this.initDueDateTo();
	},
	
	initTaskTypes: function() {
		this.typeStore = Ext.create('Ext.data.Store', {
			fields: [
				'task_type_id',
				'task_name'
			],
			proxy: {
				type: 'ajax',
				url: this.processingPage + 'get-task-type-list',
				reader: {
					type: 'json',
					root: 'records'
				}
			}
		});
		this.typeStore.load();
		
		this.items.push({
			xtype:'realcombobox',
			queryMode:'local',
			name: 'status',
			displayField:'task_name',
			valueField:'task_type_id',
			fieldLabel: 'Task Type',
			store:this.typeStore
		});
	},
	
	initTaskOwners: function() {
		var data = {
			data:[{
				'value':'all',
				'display':'All'
			},{
				'value':'unclaimed',
				'display':'Unclaimed'
			},{
				'value':'me',
				'display':'Me'
			},{
				'value':'others',
				'display':'Others'
			}]
		};
		this.taskOwnerStore = Ext.create('Ext.data.Store', {
			autoLoad: true,
			fields:['value', 'display'],
			data:data,
			proxy: {
				type: 'memory',
				reader: {
					type: 'json',
					root: 'data'
				}
			}
		});
		this.items.push({
			xtype:'realcombobox',
			queryMode:'local',
			name: 'taskOwner',
			displayField:'display',
			valueField:'value',
			fieldLabel: 'Task Owners',
			store:this.taskOwnerStore
		});
	},
	
	initCreatedBy: function(){
		this.items.push({
			name: 'created_by',
			fieldLabel: 'Created By'
		});
	},
	
	initAssignedTo: function() {
		this.items.push({
			name: 'assigned_to',
			fieldLabel: 'Assigned To'
		});
	},
	
	initDueDateOn: function() {
		this.items.push({
			xtype:'datefield',
			name:'dueDateOn',
			fieldLabel:'Due Date On'
		});
	},
	
	initDueDateFrom: function() {
		this.items.push({
			xtype:'datefield',
			name:'dueDateFrom',
			fieldLabel:'Due Date From'
		});
	},
	
	initDueDateTo: function() {
		this.items.push({
			xtype:'datefield',
			name:'dueDateTo',
			fieldLabel:'Due Date To'
		});
	}
	
});
Ext.define('TMS.documents.forms.sections.DocumentsRequired', {
	extend:'TMS.form.Abstract',
	requires:[
		'Ext.ux.form.field.RealComboBox',
		'TMS.documents.forms.sections.DocumentsRequiredRow'
	],
	
	title:'Documents Required',
	baseTitle:'Documents Required',
	bodyStyle:{
		padding:'8px'
	},
	processingPage:'/at-ajax/modules/contact/process/',
	url:'/at-ajax/modules/contact/process/save-documents-required',
	contact_id:0,
	order_id:0,
	autoSave:false,
	readOnly: false,
	
	initComponent: function(){
		this.items = this.items || [];
		this.addEvents('dataload');
		this.init();
		this.callParent(arguments);
	},
	
	init: function() {
		this.initHidden();
		this.initListeners();
		this.initStore();
		
		if (this.contact_id) {
			this.loadContact(this.contact_id);
		}
		if (this.order_id) {
			this.loadData();
		}
	},
	
	initHidden: function() {
		this.contactIdField = Ext.create('Ext.form.field.Hidden', {
			name:'contact_id',
			value:this.contact_id
		});
		this.items.push(this.contactIdField);
		
		this.documentTypeIds = Ext.create('Ext.form.field.Hidden', {
			name:'document_type_ids'
		});
		this.items.push(this.documentTypeIds);
		
		this.documentTypeQuantities = Ext.create('Ext.form.field.Hidden', {
			name:'document_type_quantities'
		});
		this.items.push(this.documentTypeQuantities);
		
	},
	
	initListeners: function() {
		this.on('add', this.itemAdded, this, {buffer:500});
		this.on('remove', this.itemRemoved, this);
		this.on('beforesubmit', function(form){
			var rows = this.getRows();
			var numRows = rows.length;
			var types = [];
			var data = [];
			
			for (var i = 0; i < numRows; i++) {
				types.push(rows[i].typeSelector.getValue());
				data.push(rows[i].quantityField.getValue());
				
				rows[i].typeSelector.name = 'document_type_id_' + i;
				rows[i].quantityField.name =  'document_type_quantity_' + i;
			}
			
			this.documentTypeIds.setValue(Ext.encode(types));
			this.documentTypeQuantities.setValue(Ext.encode(data));
			this.contactIdField.setValue(this.contact_id);
		}, this);
	},
	
	initStore: function() {
		this.documentTypeStore = Ext.create('Ext.data.Store', {
			fields: [
				'document_type_id',
				'document_type_name'
			],
			proxy: {
				type: 'ajax',
				extraParams:{
					showAll:false
				},
				url: this.processingPage + 'get-document-types',
				reader: {
					type: 'json',
					root: 'records'
				}
			}
		});
		
		this.documentTypeStore.load();
	},
	
	selectFirst: function(combobox) {
		var record = combobox.store.getAt(0);
		if (record) {
			combobox.setValue(record.get('document_type_id'));
		}
		
	},
	
	getFirstUnusedIndex: function(combobox) {
		var indexToSelect = 0;
		
		// Loop through existing selections and store the currently used ids
		var existingIds = [];
		var items = this.getRows();
		for (var i = 0; i < items.length - 1; i++) {
			var subItem = items[i].items.items[0];
			var typeId = subItem.getValue();
			existingIds.push(typeId);
		}

		// Loop through records and find the first one that isnt in use
		var records = combobox.store.data.items;
		var numRecords = records.length;
		for (var i = 0; i < numRecords; i++) {
			if (existingIds.indexOf(records[i].data.document_type_id) == -1) {
				indexToSelect = i;
				break;
			}
		}
		
		return indexToSelect;
	},
	
	selectFirstUnused: function(combobox) {
		if (combobox && combobox.store) {
			var record = combobox.store.getAt(this.getFirstUnusedIndex(combobox));
			combobox.setValue(record.get('document_type_id'));
		}
	},
	
	createRow: function() {
		var rowPanel = Ext.create('TMS.documents.forms.sections.DocumentsRequiredRow', {
			store:this.documentTypeStore,
			readOnly: this.readOnly
		});
		rowPanel.quantityField.on('keyup', function(textfield) {
			if (textfield.getValue().length) {
				var fields = this.query('#document_type_quantity');
				var lastField = fields[fields.length-1];
				if (lastField.getValue().length) {
					// add another field
					var newRow = this.createRow();
					this.add(newRow);
					this.selectFirstUnused(newRow.typeSelector);
				}
			}
		}, this);
		
		rowPanel.quantityField.on('change', function(textfield) {
			if (!textfield.getValue().length) {
				var fields = this.query('#document_type_quantity');
				var lastField = fields[fields.length-1];
				if (textfield != lastField) {
					textfield.ownerCt.destroy();
				}
			}
			this.save();
		}, this, {buffer:500});
		
		return rowPanel;
	},
	
	loadData: function() {
		if (this.documentTypeStore.isLoading()) {
			this.documentTypeStore.on('load', function() {
				this.loadData();
			}, this);
			return;
		}
		
		if (this.order_id || this.contact_id) {
			this.setLoading(true);
			Ext.Ajax.request({
				scope:this,
				method:'post',
				url:this.processingPage + 'get-documents-required-data',
				params:{
					contact_id:this.contact_id,
					order_id:this.order_id
				},
				success: function(r) {
					this.setLoading(false);
					var response = Ext.decode(r.responseText);
					var records = response.records;

					// remove old rows - need to suspend events so this remove doesn't trigger for a previous contact
					this.suspendEvents();
					this.destroyRows();
					this.resumeEvents();

					// loop through all records and make a row for each
					for (var i = 0; i < records.length; i++) {
						var panel = this.createRow();
						panel.on('afterrender', function(panel, options) {
							var combobox = panel.typeSelector;
							var textfield = panel.quantityField;
							combobox.setValue(options.record.document_type_id);
							textfield.setRawValue(options.record.quantity);
						}, this, {
							record:records[i]
						});
						this.add(panel);
					}
					
					// add another field
					if(!this.readOnly){
						var newRow = this.createRow();
						this.add(newRow);
						this.selectFirst(newRow.typeSelector);
					}
					
					this.fireEvent('dataload', this);
				}
			});
		}
	},
	
	loadContact: function(contact_id, name) {
		this.contact_id = contact_id;
		var newTitle = this.title;
		if (name != null) {
			newTitle = this.baseTitle + ' for ' + name;
		}
		
		if (this.rendered) {
			this.setTitle(newTitle);
		}
		else {
			this.title = newTitle;
		}
		
		if (this.documentTypeStore.isLoading()) {
			this.documentTypeStore.on('load', function() {
				this.loadContact(this.contact_id);
			}, this);
		}
		else {
			if (this.contact_id) {
				this.loadData();
			}
			else {
				if(!this.readOnly){
					var newRow = this.createRow();
					this.add(newRow);
					this.selectFirst(newRow.typeSelector);
				}
			}
		}
	},
	
	destroyRows: function() {
		Ext.each(this.query('> .panel'), function(el){
			el.destroy();
		});
	},
	
	itemAdded: function(panel, item, options) {
		var rows = this.query('> .panel');
		this.manageRemoveButtons(rows);
	},
	
	
	itemRemoved: function(panel, item, options) {
		// Get all rows
		var rows = this.query('> .panel');
		if (rows.length) {
			this.manageRemoveButtons(rows);
			this.save();
		}
	},
	
	manageRemoveButtons: function(rows) {
		if (rows.length) {
			for (var i = 0; i < rows.length-1; i++) {
				rows[i].down('.button').enable();
			}
			rows[rows.length-1].down('.button').disable();
		}
	},
	
	getRows: function() {
		return this.query('> .panel');
	},
	
	save: function() {
		if (this.contact_id && this.autoSave) {
			this.submit();
		}
	}
	
});
Ext.define('TMS.documents.forms.sections.DocumentsRequiredRow', {
	extend:'Ext.panel.Panel',
	requires:['Ext.ux.form.field.RealComboBox'],
	
	autoHeight:true,
	layout:'hbox',
	border:false,
	defaults:{
		border:false
	},
	readOnly: false,
	
	initComponent: function() {
		this.items = this.items || [];
		this.init();
		this.callParent(arguments);
	},
	
	init: function() {
		this.initTypeSelector();
		this.initQuantityField();
		this.initButton();
		this.initListeners();
	},
	
	initTypeSelector: function() {
		var config = {};
		if(this.readOnly){
			Ext.apply(config, {
				readOnly: true
			});
		}
		
		this.typeSelector = Ext.create('Ext.ux.form.field.RealComboBox', Ext.apply({
			flex:1,
			valueField:'document_type_id',
			displayField:'document_type_name',
			store: this.store,
			queryMode: 'local',
			editable:false,
			margin:'2'
		}, config));
		this.items.push(this.typeSelector);
	},
	
	initQuantityField: function() {
		var config = {};
		if(this.readOnly){
			Ext.apply(config, {
				readOnly: true
			});
		}
		
		this.quantityField = Ext.create('Ext.form.field.Text', Ext.apply({
			flex:1,
			margin:'2',
			itemId:'document_type_quantity',
			enableKeyEvents:true,
			emptyText:'Quantity'
		}, config));
		this.items.push(this.quantityField);
	},
	
	initButton: function() {
		var config = {};
		if(this.readOnly){
			Ext.apply(config, {
				hidden: true
			});
		}
		this.button = Ext.create('Ext.button.Button', Ext.apply({
			margin:'2',
			icon:'/resources/icons/delete-16.png',
			width:24,
			scope:this,
			handler:function(button) {
				// remove if not the last one
				button.ownerCt.destroy();
			}
		}, config));
		this.items.push(this.button);
	},
	
	initListeners: function() {
		
	}
	
});
Ext.define('TMS.documents.forms.ScannerImport', {
	extend:'TMS.form.Abstract',
	url:'/at-ajax/modules/document/process/import-documents',
	
	initComponent: function() {
		this.items = this.items || [];
		this.init();
		this.callParent(arguments);
	},
	
	init: function() {
		this.initScannerStore();
		this.initScannerSelect();
		this.initButtons();
		this.initListeners();
	},
	
	initScannerStore: function() {
		this.scannerStore = Ext.create('Ext.data.Store', {
			fields: [
				'scannerName',
				'scannerDisplay'
			],
			proxy: {
				type: 'ajax',
				url: '/at-ajax/modules/document/process/get-scanner-list',
				reader: {
					type: 'json',
					root: 'records'
				}
			}
		});
		this.scannerStore.load();
	},
	
	initScannerSelect: function() {
		this.scannerSelector = Ext.create('Ext.form.field.ComboBox', {
			fieldLabel:'Scanner',
			name:'scannerName',
			store:this.scannerStore,
			
			triggerAction: 'all',
			queryMode:'local',
			valueField:'scannerName',
			displayField:'scannerDisplay',
			editable:false
		});
		this.items.push(this.scannerSelector);
	},
	
	initButtons: function() {
		this.buttons = [{
			scope:this,
			text:'Import 10',
			scale:'medium',
			icon:'/resources/icons/download-24.png',
			handler: function() {
				this.submitParams.limit = 10;
				this.submit();
			}
		},{
			scope:this,
			text:'Import 20',
			scale:'medium',
			icon:'/resources/icons/download-24.png',
			handler: function() {
				this.submitParams.limit = 20;
				this.submit();
			}
		},{
			scope:this,
			text:'Import All',
			scale:'medium',
			icon:'/resources/icons/download-24.png',
			handler: function() {
				this.submitParams.limit = -1;
				this.submit();
			}
		}]
	},
	
	initListeners: function() {
		this.on('beforesubmit', function() {
			this.setLoading();
		}, this);
		
		this.on('submit', function() {
			this.setLoading(false);
			
		}, this);
		
	}
	
});
Ext.define('TMS.documents.view.Grid', {
	extend: 'Ext.grid.Panel',
	requires:[
		'TMS.documents.forms.ScannerImport',
		'TMS.ActionWindow',
		'TMS.IframeWindow'
	],
	
	//Config
	processingPage: '/at-ajax/modules/document/process/',
	viewConfig: {
		stripeRows: true
	},
	
	baseTitle:'Documents',
	
	extraParams:false,
	
//	verticalScrollerType: 'paginggridscroller',
//	loadMask: true,
//	disableSelection: true,
//	invalidateScrollerOnRefresh: false,
//	viewConfig: {
//		trackOver: false
//	},
	
	initComponent: function(){
		this.extraParams = this.extraParams || {};
		this.dockedItems = this.dockedItems || [];
		this.init();
		this.callParent(arguments);
	},
	
	//Init Functions
	init: function(){
		this.initPlugins();
		this.initTopBar();
		this.initDocumentTypeStore();
		this.initRelationTypeStore();
		this.initColumns();
		this.initStore();
		this.initUploader();
		if (this.extraParams !== false) {
			this.initImportButton();
		}
		this.initPager();
		this.initListeners();
	},
	
	setExtraParams: function(extraParams) {
		Ext.apply(this.extraParams, extraParams);
		this.store.proxy.extraParams.filter = Ext.encode(this.extraParams);
		this.initUploader();
	},
	
	initPlugins: function() {
		this.cellEditing = Ext.create('Ext.grid.plugin.CellEditing', {
			clicksToEdit: 1
		});
		this.plugins = [
			this.cellEditing
		];
	},
	
	initTopBar: function() {
		this.topBar = Ext.create('Ext.toolbar.Toolbar', {
			dock:'top'
		});
		this.dockedItems.push(this.topBar);
	},
	
	initDocumentTypeStore: function() {
		this.documentTypeStore = Ext.create('Ext.data.Store', {
			fields: [
				'document_type_id',
				'document_type_name'
			],
			proxy: {
				type: 'ajax',
				url: '/at-ajax/modules/contact/process/get-document-types',
				reader: {
					type: 'json',
					root: 'records'
				}
			}
		});
		
		this.documentTypeStore.load();
		
	},
	
	initRelationTypeStore: function() {
		this.relationTypeStore = Ext.create('Ext.data.Store', {
			fields: [
				'relation_table_name',
				'relation_table_display'
			],
			proxy: {
				type: 'ajax',
				url: '/at-ajax/modules/document/process/get-relation-types',
				reader: {
					type: 'json',
					root: 'records'
				}
			}
		});
		
		this.relationTypeStore.load();
	},
	
	initColumns: function(){
		this.columns = [{
			header: 'ID',
			dataIndex: 'document_id',
			hidden:true
		},{
			header: 'Document Type',
			dataIndex: 'document_type_name',
			sortable:false,
			field: {
				xtype: 'combobox',
				triggerAction: 'all',
				selectOnTab: true,
				queryMode:'local',
				store: this.documentTypeStore,
				valueField:'document_type_name',
				displayField:'document_type_name',
				editable:false
			}
		},{
			header: 'Description',
			dataIndex: 'description',
			sortable:false,
			flex:1,
			field: {
				type:'textarea'
			}
		},{
			header: 'File Type',
			dataIndex: 'file_type',
			sortable:false,
			hidden:true
		},{
			header:'Relation',
			width:90,
			dataIndex:'relation_table_display',
			sortable:false,
			field: {
				xtype: 'combobox',
				triggerAction: 'all',
				selectOnTab: true,
				queryMode:'local',
				store: this.relationTypeStore,
				valueField:'relation_table_display',
				displayField:'relation_table_display',
				editable:false,
				triggerAction:'all'
			}
		},{
			header:'Relation ID',
			width:60,
			dataIndex:'relation_table_key',
			sortable:false,
			field: {
				type:'textarea'
			}
		},{
			header: 'Created',
			dataIndex: 'created_at',
			renderer: function(value) {
				var dt = new Date(value*1000);
				return Ext.Date.format(dt, 'n/j/Y');
			}
		},{
			header: '',
			sortable:false,
			dataIndex: 'downloadUrl',
			width: 70,
			xtype:'templatecolumn',
			tpl:'<a href="{downloadUrl}">' +
		'<img src="/resources/icons/download-16.png" alt="Download" title="Download" />' +
		'</a>&nbsp;&nbsp;' + 
		'<a href="{downloadUrl}" class="preview-link">' +
		'<img src="/resources/icons/preview-16.png" alt="Preview" title="Preview" id="preview-{document_id}" />' +
		'</a>'
		}];
	},
	
	initStore: function(){
		this.store = new Ext.data.Store({
			fields: [
			'document_id',
			'file_type',
			'description',
			'document_type_name',
			'relation_table_display',
			'relation_table_name',
			'relation_table_key',
			'created_at',
			'downloadUrl'
			],
			
			pageSize:25,
//			buffered:true,
			
			remoteSort: true,
			proxy: {
				type: 'ajax',
				url : this.processingPage + 'get-grid-records',
				reader: {
					type: 'json',
					root: 'records',
					totalProperty: 'total'
				},
				extraParams:{
					filter:Ext.encode(this.extraParams)
				}
			}
		});
//		this.store.guaranteeRange(0, 14);
	},
	
	initPager: function(){
		this.pager = new Ext.toolbar.Paging({
			store: this.store,
			displayInfo: true,
			dock:'top'
		});
		this.dockedItems.push(this.pager);
//		this.tbar = this.pager;
	},
	
	initUploader: function() {
		if (this.uploader) {
			this.uploader.destroy();
		}
		var hasProperties = false;
		for (var i in this.extraParams) {
			hasProperties = true;
			break;
		}
		if (!hasProperties) {
			return false;
		}
		
		this.uploader = Ext.create('Ext.ux.Uploader', {
			url:this.processingPage + 'upload-file',
			autoUpload:true,
			useSmallDisplay:true,
			extraParams:this.extraParams,
			scale:'medium',
			icon:'/resources/icons/upload-24.png',
			border: false,
			config:{
				filters : [{
					title:"PDFs",
					extensions:"pdf"
				},{
					title:"TIFs",
					extensions:"tif"
				},{
					title:"Zip files",
					extensions:"zip"
				}]
			}
		});
		this.uploader.on('uploadcomplete', function() {
			this.store.load();
		}, this);
		
		this.topBar.add(this.uploader);
	},
	
	initImportButton: function() {
		this.importButton = Ext.create('Ext.button.Button', {
			text:'Import',
			scale:'medium',
			icon:'/resources/icons/download-24.png',
			scope:this,
			handler: function() {
				var importPanel = Ext.create('TMS.documents.forms.ScannerImport', {
					
				});
				
				this.actionWindow = Ext.create('TMS.ActionWindow', {
					title:'Import From Scanners',
					items:[
						importPanel
					]
				});
				importPanel.on('submit', function() {
					this.actionWindow.destroy();
				}, this);
			}
		})
		this.topBar.add(this.importButton);
	},
	
	initListeners: function(){
		this.cellEditing.on('edit', function(editor, e, options) {
			if (e.record.dirty) {
				Ext.Ajax.request({
					scope:this,
					method:'post',
					url:this.processingPage + 'update-record',
					params:{
						field:e.field,
						value:e.record.data[e.field],
						documentId:e.record.data.document_id
					},
					success: function(r) {
						var response = Ext.decode(r.responseText);
						e.record.commit();
					}
				});
			}
		}, this);
		
		if (this.collapsed) {
			this.on('expand', function() {
				if (!this.store.getTotalCount()) {
					this.store.load();
				}
			}, this);
		}
		else {
			this.store.load();
		}
		
		this.on('expand', function() {
			this.setHeight(null);
			this.pager.doLayout();
			this.scrollIntoView();
		}, this);
		
		this.on('itemclick', function(view, record, el, index, event, options) {
			if (event.getTarget('.preview-link')) {
				Ext.create('TMS.IframeWindow', {
					title:'Document Preview',
					url:record.data.downloadUrl,
					widthPercent: 0.9,
					heightPercent: 0.9
				});
			}
		}, this);
		
		this.on('afterrender', function() {
			this.store.on('load', function() {
				var links = this.getEl().select('.preview-link');
				var numLinks = links.elements.length;
				for (var i = 0; i < numLinks; i++) {
					Ext.get(links.elements[i]).on('click', function(e, el) {
						e.preventDefault();
						var parts = el.id.split('-');
						var documentId = parts[parts.length-1];

					}, this);
				}
			}, this);
		}, this);
		
		
		setInterval(Ext.bind(function() {
			//this.topBar.doLayout();
		}, this), 1000);
	}
	
});
Ext.define('TMS.documents.view.Interface', {
	extend: 'Ext.panel.Panel',
	
	//requires
	requires:[
		'TMS.panel.plugin.FullScreen',
		'TMS.documents.view.Grid',
		'TMS.panel.plugin.FullScreen',
		'TMS.documents.view.Grid'
	],
	
	layout:'border',
	title: 'Documents',
	
	extraFilters:{},
	extraParams:{},
	lastRecordId:false,
	
	initComponent: function(){
		this.items = this.items || [];
		this.plugins = this.plugins || [];
		
		//Add Events
		this.addEvents(
			'maximize',
			'minimize'
		);
		
		this.init();
		this.callParent(arguments);
	},
	
	//Init Functions
	init: function() {
		this.initTools();
		this.initGrid();
		this.initDocumentPreview();
	},
	
	initTools: function() {
		this.tools = [{
			itemId:'plus',
			type: 'plus',
			scope:this,
			handler: function(){
				this.onMaximize();
			}
		}, {
			itemId:'minus',
			type: 'minus',
			scope:this,
			hidden: true,
			handler: function(){
				this.onMinimize();
			}
		}];
	
		this.fullScreenPlugin = Ext.create('TMS.panel.plugin.FullScreen');
		this.plugins.push(this.fullScreenPlugin);
	},
	
	initGrid: function() {
		this.gridPanel = Ext.create('TMS.documents.view.Grid', {
			region: 'center',
			border: false,
			filter: this.filterPanel,
			extraParams:this.extraParams
		});
		this.gridPanel.on('itemclick', function(grid, record) {
			if (record.data.document_id != this.lastRecordId) {
				this.lastRecordId = record.data.document_id;
				this.iframe.dom.src = record.data.downloadUrl;
			}
		}, this);
		
		this.items.push(this.gridPanel);
	},
	
	initDocumentPreview: function() {
		this.documentPreview = Ext.create('Ext.panel.Panel', {
			title:'Document Preview',
			region: 'east',
			width: 250,
			html:'<iframe></iframe>'
		});
		this.documentPreview.on('afterrender', function() {
			this.iframe = this.documentPreview.getEl().down('iframe');
			this.iframe.set({
				width:'100%',
				height:'100%',
				frameborder:0
			});
		}, this);
		
		this.items.push(this.documentPreview);
	},

	onMaximize: function(){
		this.query('#plus')[0].hide();
		this.query('#minus')[0].show();
		this.fullScreenPlugin.maximize(this);
		this.fireEvent('maximize', this);
	},
	
	onMinimize: function(){
		
		this.query('#minus')[0].hide();
		this.query('#plus')[0].show();
		this.fullScreenPlugin.minimize(this);
		this.fireEvent('minimize', this);
	}
	
});
Ext.define('TMS.edi.form.Respond', {
	extend:'TMS.form.Abstract',
	
	requires:[
		'Ext.ux.form.field.RealComboBox',
		'TMS.edi.model.Log'
	],
	
	//Config
	url: '/at-ajax/modules/contact/process/',
	
	initComponent: function(){
		this.items = [];
		this.dockedItems = this.dockedItems || [];
		this.init();
		
		this.callParent(arguments);
	},
	
	init: function() {
		this.initContentField();
		TMS.edi.model.Log.load(3, {
			scope: this,
			success: function(record, response){
				this.loadRecord(record);
			}
		});
	},
	
	initContentField: function(){
		console.log(this.items);
		this.content = new Ext.form.field.TextArea({
			name: 'content'
		});
		this.items.push(this.content);
	}
});
Ext.define('TMS.edi.model.Log', {
    extend: 'Ext.data.Model',
	idProperty: 'id',
	
	//Fields
    fields: [{
		name: 'id',
		type: 'int'
	},{
		name: 'type',
		type: 'int'
	},{
		name: 'pre_order_id',
		type: 'int'
	},{
		name: 'customer_id',
		type: 'int'
	},{
		name: 'broker_id',
		type: 'int'
	},{
		name: 'status',
		type: 'int'
	},{
		name: 'responded_at',
		type: 'date'
	},{
		name: 'comments',
		type: 'string'
	},{
		name: 'created_at',
		type: 'date'
	},{
		name: 'content',
		type: 'string'
	},{
		name: 'description',
		type: 'string'
	}],
	
	//Proxy
	proxy: {
		type: 'ajax',
		api: {
			read: '/at-ajax/modules/edi/log/read',
			create: '/at-ajax/modules/edi/log/create',
			update: '/at-ajax/modules/edi/log/update',
			destroy: '/at-ajax/modules/edi/log/destroy'
		},
		reader: {
			idProperty: 'id',
			type: 'json',
			root: 'records',
			totalProperty: 'total'
		},
		writer: {
			type: 'json',
			allowSingle: false,
			writeAllFields: false,
			root: 'records',
			encode: true
		}
	}
});
Ext.define('TMS.form.plugin.Help', {
	extend: 'Ext.util.Observable',
	
	//Config
	field: null,
	message: '',
	
	constructor: function(message, config){
		this.message = message;
		this.callParent([config]);
	},
	
	// private
    init: function(field) {
		
		//Save the field
		this.field = field;

		//Make sure this is a field
		if(!Ext.ComponentQuery.is(this.field, 'field')){
			return;
		}
		
		if (!this.field.rendered) {
			field.on('afterrender', this.onAfterRender, this);
		}
		else {
			// probably an existing input element transformed to extjs field
			this.onAfterRender();
		}
    },
	
	initLabel: function(){
		this.field.labelEl.set({
			style:{
				cursor: 'help'
			}
		});
	},
	
	initTip: function(){
		this.tip = Ext.create('Ext.tip.ToolTip', {
			scope: this,
			target: this.field.labelEl,
			anchor: 'top',
			autoHide: true,
			html: this.message,
			listeners: {
				'beforeshow': Ext.bind(function(){
					
				}, this)
			}
		});
	},
	
	onAfterRender: function(){
		var labelEl = this.field.labelEl;
		if(labelEl == null){
			return;
		}
		this.initLabel();
		this.initTip();
	}
});
Ext.define('TMS.form.plugin.StatusBar', {
	extend: 'Ext.util.Observable',
	
	//Config
	form: null,
	dockTo: null,
	redirect: true,
	redirectTimeout: 2000,
	
	constructor: function(){
		this.callParent(arguments);
		this.addEvents('showerror');
	},
	
	// private
    init: function(form) {
		
		//Save the form
		this.form = form;

		//Make sure this is a tms form
		if(!Ext.ComponentQuery.is(this.form, 'tmsform')){
			return;
		}
		
		//Init the listeners
		this.initListeners();
		
		//Init the statusbar
		this.initStatusBar();
    },
	
	initListeners: function(){
		//before submit listener
		this.form.on('beforesubmit', this.onBeforeSubmit, this);
		
		//Submit listener
		this.form.on('submit', this.onSubmit, this);
		
		//Cancel listener
		this.form.on('cancelsubmit', this.onCancelSubmit, this);
		
		//Failure Listener
		this.form.on('failure', function(form, response){
			this.onFailure(response.result);
		}, this);
		
		//Success Listener
		this.form.on('success', function(form, response){
			this.onSuccess(response.result);
		}, this);
	},
	
	initStatusBar: function(){
		this.statusBar = Ext.create('Ext.ux.statusbar.StatusBar', {
			scope: this,
			docked: 'bottom',
			dock: 'bottom',
			items: this.items || []
		});
		
		this.statusBar.on('afterrender', function(){
			this.statusTip = Ext.create('Ext.tip.ToolTip', {
				scope: this,
				target: this.statusBar.getEl(),
				anchor: 'top',
				autoHide: false,
				hasContent: false,
				listeners: {
					'beforeshow': Ext.bind(function(){
						if(!this.statusTip.hasContent){
							return false;
						}
					}, this)
				}
			});
			this.statusTip.on('afterrender', function(){
				this.statusTip.getEl().on('click', function(event, el){
					var element = event.getTarget('li');
					if(element == null){
						return;
					}
					var field = Ext.get(element).getAttribute('field');
					var formField = this.form.getForm().findField(field);
					this.fireEvent('showerror', field);
					this.statusTip.hide();
				}, this);
			}, this);

		}, this);
		
		if(this.dockTo){
			this.dockTo.addDocked(this.statusBar);
		}
		else{
			this.form.addDocked(this.statusBar);
		}
	},
	
	setStatus: function(config){
		this.statusBar.clearStatus();
		this.statusBar.setStatus(config);
		
		//Check if there is a config tooltip
		if(config.tooltip != null){
			//Update the message of the tip
			this.statusTip.update(config.tooltip);
			this.statusTip.hasContent = true;
			this.statusTip.show();
		}
		else{
			this.statusTip.hasContent = false;
			this.statusTip.update('');
		}
	},
	
	onBeforeSubmit: function() {
		this.statusBar.showBusy('Saving...');
	},
	
	onSubmit: function() {
		//Was this form invalid
		if(!this.form.getForm().isValid()){
			
			//Build the error string
			var errorStr = '<div class="form-errors"><ul>';
			this.form.getForm().getFields().each(function(field){
				var msg = field.getErrors()[0];
				if (msg) {
					errorStr += '<li field="' + field.name + '">' + field.name + ' - ' + msg + '</li>';
				}
			}, this);
			errorStr += '</div>';
			
			this.setStatus({
				text: 'There are errors in your form.',
				iconCls: 'warning-icon-16',
				tooltip: errorStr
			});
		}
	},
	
	onCancelSubmit: function(){
		this.setStatus({
			text: ''
		});
	},
	
	onSuccess: function(response) {
		this.setStatus({
			text: response.msgStr,
			iconCls: 'check-icon-16'
		});

		//Redirect
		if(this.redirect && response.redirect.length){
			setTimeout(Ext.bind(function(){
				location.href = response.redirect;
			}, this), this.redirectTimeout);
		}
		else{
			setTimeout(Ext.bind(function(){
				this.statusBar.clearStatus();
			}, this), 4000);
		}
	},
	
	onFailure: function(response) {
		this.setStatus({
			text: 'There was an error submitting the form.',
			iconCls: 'warning-icon-16',
			tooltip: response.errorStr
		});
	}
});
Ext.define('TMS.form.Submission', {
	extend:'Ext.util.Observable',
	processingPage:'/at-ajax/modules/task/process/',
	
	redirect:true,
	removeSubmit:true,
	timeoutSeconds:30,
	callback:function() {},
	scrollToMessage:false,
	autoSubmit:true,
	extraParams:{},
	invalidCls:'form-invalid',
	
	constructor: function(formId, config) {
		Ext.apply(this, config);
		this.form = Ext.get(formId);
		this.addEvents('success', 'failure', 'complete');
		this.submitButton = this.form.down('input[type=submit]');
		
		if (this.autoSubmit) {
			this.submit();
		}
		
		return this;
	},
	
	submit: function() {
		this.submitButton.focus();
		this.messageDiv = this.form.down('.message');
		this.form.select('.' + this.invalidCls).removeCls(this.invalidCls);
		if (this.messageDiv == null) {
			this.messageDiv = Ext.get(document.createElement('div')).appendTo(this.submitButton.parent()).addCls('message');
		}
		this.messageDiv.dom.innerHTML = '<span class="loadingSpinner"></span><span class="messageText">Submitting...</span>';
		this.messageText = this.messageDiv.down('.messageText');
				
		this.statusTimeout = setTimeout(Ext.Function.bind(function() {
			this.messageText.dom.innerHTML += 'Still working...';
		}, this), 10000);
		this.unlockTimeout = setTimeout(Ext.Function.bind(function() {
			this.messageDiv.dom.innerHTML = 'There was a problem processing your request. Please wait a few minutes and try submitting again.';
			if (this.request.abort) {
				this.request.abort();
			}
			this.enableForm();
		}, this), this.timeoutSeconds * 1000);
		this.request = Ext.Ajax.request({
			form:this.form,
			params:Ext.urlEncode(this.extraParams),
			success:this.complete,
			scope:this
		});
		this.disableForm();
	},
	
	complete: function(r) {
		var response = Ext.decode(r.responseText);
		this.submitButton.focus();
		this.messageDiv.removeCls('form-errors');
		this.messageDiv.removeCls('form-messages');
		if (response.success) {
			this.messageDiv.addCls('form-messages');
			this.messageDiv.update(response.msg);
			
			this.fireEvent('success', this, response);
			
			if (this.removeSubmit) {
				this.form.select('input[type=submit]').remove();
			}
			if (response.redirect && this.redirect) {
				location.href = response.redirect;
			}
		}
		else {
			this.messageDiv.addCls('form-errors');
			var field;
			var errorMessages = '<ul>';
			for(var i in response.errors) {
				errorMessages += '<li>' + response.errors[i] + '</li>';
				if (this.form.dom[i]) {
					field = Ext.get(this.form.dom[i]);
					if (field) {
						field.addCls(this.invalidCls);
					}
				}
			}
			errorMessages += '</ul>';
			this.fireEvent('failure', this, response);
			this.messageDiv.dom.innerHTML = errorMessages;
		}
		this.fireEvent('complete', this, response);
		
		if (this.scrollToMessage) {
			Ext.get(this.messageDiv).scrollIntoView();
			Ext.get(this.messageDiv).frame();
		}
		else {
			var messageFocus = Ext.get(Ext.core.DomHelper.append(this.messageDiv, {
				tag: 'input',
				type: 'text'
			}));
			messageFocus.focus();
			messageFocus.remove();
		}
		
		this.enableForm();
		clearTimeout(this.statusTimeout);
		clearTimeout(this.unlockTimeout);
	},
	
	enableForm: function() {
		this.form.select(TMS.form.itemTypes).each(function(el) {
			el.dom.disabled = false;
		});
	},
	
	disableForm: function() {
		this.form.select(TMS.form.itemTypes).each(function(el) {
			el.dom.disabled = true;
		});
	}
	
});

Ext.ns('TMS.form');
TMS.form.itemTypes = 'input,button,select,textarea';
TMS.form.focus = function(id) {
	var item = Ext.get(id);
	if (item) {
		item.focus();
		item.frame();
	}
};
TMS.form.enable = function(form) {
	Ext.get(form).select(TMS.form.itemTypes).each(function(el) {
		el.dom.disabled = false;
	});
};
TMS.form.disable = function(form) {
	Ext.get(form).select(TMS.form.itemTypes).each(function(el) {
		el.dom.disabled = true;
	});
};

Ext.define('TMS.league.form.Game', {
	extend:'Ext.form.Panel',
	requires:[
		'TMS.league.store.Team',
		'TMS.league.model.Game'
	],
	
	//Config
	bodyPadding: 10,
	showFooter: true,
	
	initComponent: function(){
		this.items = this.items || [];
		this.dockedItems = this.dockedItems || [];
		this.init();
		this.callParent(arguments);
	},
	
	init: function() {
		this.initStore();
		this.initHomeTeam();
		this.initAwayTeam();
		this.initHidden();
		this.initFooter();
	},
	
	initStore: function(){
		this.store = Ext.create('TMS.league.store.Team');
	},
	
	initHomeTeam: function(){
		this.homeTeam = new Ext.form.ComboBox({
			name: 'home_team_id',
			fieldLabel: 'Home Team',
			store: this.store,
			queryMode: 'local',
			displayField: 'team_name',
			valueField: 'league_team_id'
		});
		this.store.on('load', function(){
			this.homeTeam.setValue(this.homeTeam.getValue());
		}, this);
		this.items.push(this.homeTeam);
	},
	
	initAwayTeam: function(){
		this.awayTeam = new Ext.form.ComboBox({
			name: 'away_team_id',
			fieldLabel: 'Away Team',
			store: this.store,
			queryMode: 'local',
			displayField: 'team_name',
			valueField: 'league_team_id'
		});
		this.store.on('load', function(){
			this.awayTeam.setValue(this.awayTeam.getValue());
		}, this);
		this.items.push(this.awayTeam);
	},
	
	initHidden: function() {
		this.gameId = Ext.create('Ext.form.field.Hidden', {
			name: 'game_id'
		});
		this.items.push(this.gameId);
	},
	
	initFooter: function(){
		if(!this.showFooter){
			return false;
		}
		
		this.footer = new Ext.toolbar.Toolbar({
			dock: 'bottom',
			ui: 'footer',
			items: ['->', {
				scope: this,
				itemId: 'save',
				text: 'Save',
				formBind: true,
				handler: this.save
			}]
		});
		this.dockedItems.push(this.footer);
	},
	
	save: function(){
        var form = this.getForm();
		var record = form.getRecord();

		//If form is invalid return
		if(!form.isValid()){
			return;
		}
		
		//If there is not a record fire the create event, else update the record and fire the update event
        if (!record) {
			record = Ext.create('TMS.league.model.Game', form.getValues());
			this.setLoading('Saving...');
			record.save({
				scope: this,
				callback: function(records){
					this.setLoading(false);
					this.fireEvent('create', this, records);
				}
			});
        }
        else{
			this.setLoading('Saving...');
            form.updateRecord(record);
			record.save({
				scope: this,
				callback: function(records){
					this.setLoading(false);
					this.fireEvent('update', this, records);
				}
			});
        }
    },
	
	cancel: function(){
		this.fireEvent('cancel', this);
	}
});
Ext.define('TMS.league.form.Season', {
	extend:'Ext.form.Panel',
	
	//Requires
	requires:[
		'TMS.league.model.Season'
	],
	
	//Config
	bodyPadding: 10,
	showFooter: true,
	
	initComponent: function(){
		this.items = this.items || [];
		this.dockedItems = this.dockedItems || [];
		this.init();
		this.callParent(arguments);
	},
	
	init: function() {
		this.initTitle();
		this.initStartDate();
		this.initEndDate();
		this.initHidden();
		this.initFooter();
	},
	
	initTitle: function() {
		this.titleField = new Ext.form.field.Text({
			scope: this,
			name: 'title',
			fieldLabel: 'Title',
			allowBlank: false
		});
		this.items.push(this.titleField);
	},
	
	initStartDate: function(){
		this.startDate = new Ext.form.field.Date({
			scope: this,
			name: 'start_date',
			fieldLabel: 'Start Date',
			allowBlank: false
		});
		this.items.push(this.startDate);
	},
	
	initEndDate: function(){
		this.endDate = new Ext.form.field.Date({
			scope: this,
			name: 'end_date',
			fieldLabel: 'End Date',
			allowBlank: false
		});
		this.items.push(this.endDate);
	},
	
	initHidden: function() {
		this.seasonId = Ext.create('Ext.form.field.Hidden', {
			name:'season_id'
		});
		this.items.push(this.seasonId);
	},
	
	initFooter: function(){
		if(!this.showFooter){
			return false;
		}
		
		this.footer = new Ext.toolbar.Toolbar({
			dock: 'bottom',
			ui: 'footer',
			items: ['->', {
				scope: this,
				itemId: 'save',
				text: 'Save',
				formBind: true,
				handler: this.save
			},{
				text: 'Cancel',
				scope: this,
				handler: this.cancel
			}]
		});
		this.dockedItems.push(this.footer);
	},
	
	save: function(){
        var form = this.getForm();
		var record = form.getRecord();

		//If form is invalid return
		if(!form.isValid()){
			return;
		}
		
		//If there is not a record fire the create event, else update the record and fire the update event
        if (!record) {
			record = Ext.create('TMS.league.model.Season', form.getValues());
			this.setLoading('Saving...');
			record.save({
				scope: this,
				callback: function(records){
					this.setLoading(false);
					this.fireEvent('create', this, records);
				}
			});
        }
        else{
            form.updateRecord(record);
			this.fireEvent('update', this, record);
        }
    },
	
	cancel: function(){
		this.fireEvent('cancel', this);
	}
});
Ext.define('TMS.league.form.Week', {
	extend:'Ext.form.Panel',
	
	//Config
	bodyPadding: 10,
	showFooter: true,
	
	initComponent: function(){
		this.items = this.items || [];
		this.dockedItems = this.dockedItems || [];
		this.init();
		this.callParent(arguments);
	},
	
	init: function() {
		this.initTitle();
		this.initStartDate();
		this.initEndDate();
		this.initHidden();
		this.initFooter();
	},
	
	initTitle: function() {
		this.titleField = new Ext.form.field.Text({
			scope: this,
			name: 'title',
			fieldLabel: 'Title',
			allowBlank: false
		});
		this.items.push(this.titleField);
	},
	
	initStartDate: function(){
		this.startDate = new Ext.form.field.Date({
			scope: this,
			name: 'start_date',
			fieldLabel: 'Start Date',
			allowBlank: false
		});
		this.items.push(this.startDate);
	},
	
	initEndDate: function(){
		this.endDate = new Ext.form.field.Date({
			scope: this,
			name: 'end_date',
			fieldLabel: 'End Date',
			allowBlank: false
		});
		this.items.push(this.endDate);
	},
	
	initHidden: function() {
		this.weekId = Ext.create('Ext.form.field.Hidden', {
			name:'week_id'
		});
		this.items.push(this.weekId);
	},
	
	initFooter: function(){
		if(!this.showFooter){
			return false;
		}
		
		this.footer = new Ext.toolbar.Toolbar({
			dock: 'bottom',
			ui: 'footer',
			items: ['->', {
				scope: this,
				itemId: 'save',
				text: 'Save',
				formBind: true,
				handler: this.save
			}]
		});
		this.dockedItems.push(this.footer);
	},
	
	save: function(){
        var form = this.getForm();
		var record = form.getRecord();

		//If form is invalid return
		if(!form.isValid()){
			return;
		}
		
		//If there is not a record fire the create event, else update the record and fire the update event
        if (!record) {
            this.fireEvent('create', this, form.getValues());
        }
        else{
            form.updateRecord(record);
			this.fireEvent('update', this, record);
        }
    },
	
	cancel: function(){
		this.fireEvent('cancel', this);
	}
});
Ext.define('TMS.league.grid.Season', {
	extend: 'TMS.grid.Grid',
	
	//Requires
	requires:[
		'TMS.league.store.Season'
	],
	
	initComponent: function() {
		this.dockedItems = this.dockedItems || [];
		this.plugins = this.plugins || [];
		this.init();
		this.callParent(arguments);
	},
	
	//Init Functions
	init: function() {
		this.initEditing();
		this.initToolbar();
		this.initColumns();
		this.initStore();
		this.initPager();
	},
	
	initEditing: function(){
		this.editing = Ext.create('Ext.grid.plugin.CellEditing');
		this.plugins.push(this.editing);
	},
	
	initToolbar: function(){
		this.toolbar = new Ext.panel.Panel();
		this.tbar = this.toolbar;
	},
	
	initColumns: function() {
		this.columns = [{
			xtype:'actioncolumn', 
            width:50,
            items: [{
				scope: this,
                icon: '/resources/icons/edit-16.png',
                tooltip: 'Edit',
                handler: function(grid, rowIndex, colIndex) {
                    var record = grid.getStore().getAt(rowIndex);
					this.fireEvent('editaction', this, record);
                }
            },{
				scope: this,
                icon: '/resources/icons/delete-16.png',
                tooltip: 'Delete',
                handler: function(grid, rowIndex, colIndex) {
                    var record = grid.getStore().getAt(rowIndex);
					this.deleteRecord(record);
                }                
            }]
		},{
			header: 'Title',
			dataIndex: 'title',
			flex: 1,
			field: {
				type: 'textfield'
			}
		},{
			header: 'Start Date',
			dataIndex: 'start_date',
			flex: 1
		},{
			header: 'End Date',
			dataIndex: 'end_date',
			flex: 1
		}];
	},
	
	initStore: function(){
		if(this.store != null){
			return false;
		}
		this.store = Ext.create('TMS.league.store.Season');
	},
	
	initPager: function(){
		this.pager = new Ext.toolbar.Paging({
			store: this.store,
			displayInfo: true
		});
		this.toolbar.add(this.pager);
	},
	deleteRecord: function(record){
		this.fireEvent('delete', this, record);
		this.store.remove(record);
		record.destroy();
	}
});
Ext.define('TMS.league.grid.Standings', {
	extend: 'TMS.grid.Grid',
	
	//Config
	processingPage: '/at-ajax/modules/league/season/standings',
	viewConfig: {
		stripeRows: true
	},
	
	initComponent: function() {
		this.dockedItems = this.dockedItems || [];
		this.plugins = this.plugins || [];
		this.init();
		this.callParent(arguments);
	},
	
	//Init Functions
	init: function() {
		this.initToolbar();
		this.initColumns();
		this.initStore();
	},
	
	initToolbar: function(){
		this.toolbar = new Ext.panel.Panel();
		this.tbar = this.toolbar;
	},
	
	initColumns: function() {
		this.columns = [{
			header: 'Rank',
			dataIndex: 'rank',
			width: 40
		},{
			dataIndex: 'team_pic',
			width: 75,
			renderer: function(value){
				return '<img src="' + value + '" width="50" />';
			}
		},{
			header: 'Team',
			dataIndex: 'team_name',
			flex: 1,
			renderer: function(value, options, record){
				return Ext.String.format(
					'<a href="/mypage/?section=teams&id={0}">{1}</a>',
					record.get('league_team_id'),
					value
				);
			}
		},{
			header: 'W',
			dataIndex: 'wins',
			width: 40,
			renderer: function(value){
				return '<span style="color: green">' + value + '</span>';
			}
		},{
			header: 'L',
			dataIndex: 'losses',
			width: 40,
			renderer: function(value){
				return '<span style="color: red">' + value + '</span>';
			}
		},{
			header: 'Points',
			dataIndex: 'points'
		}];
	},
	
	initStore: function(){
		this.store = new Ext.data.Store({
			fields: [
				'league_team_id',
				'team_name',
				'team_pic',
				'wins',
				'losses',
				'rank',
				'points'
			],
			proxy: {
				type: 'ajax',
				url : this.processingPage,
				reader: {
					type: 'json',
					root: 'records'
				}
			}
		});
		
		this.on('afterrender', function(){
			this.store.load();
		}, this);
	}
});
Ext.define('TMS.league.model.Game', {
    extend: 'Ext.data.Model',
	idProperty: 'game_id',
	
	//Fields
    fields: [{
		name: 'game_id',
		type: 'int'
	},{
		name: 'week_id',
		type: 'int'
	},{
		name: 'home_team_id',
		type: 'int'
	},{
		name: 'away_team_id',
		type: 'int'
	},{
		name: 'winning_team_id',
		type: 'int'
	},{
		name: 'losing_team_id',
		type: 'int'
	},{
		name: 'home_team_name',
		type: 'string'
	},{
		name: 'away_team_name',
		type: 'string'
	},{
		name: 'home_team_pic',
		type: 'string'
	},{
		name: 'away_team_pic',
		type: 'string'
	},{
		name: 'home_team_record'
	},{
		name: 'away_team_record'
	},{
		name: 'home_score',
		type: 'int'
	},{
		name: 'away_score',
		type: 'int'
	}],

	//Proxy
	proxy: {
		type: 'ajax',
		api: {
			read: '/at-ajax/modules/league/game/read',
			create: '/at-ajax/modules/league/game/create',
			update: '/at-ajax/modules/league/game/update',
			destroy: '/at-ajax/modules/league/game/destroy'
		},
		reader: {
			idProperty: 'game_id',
			type: 'json',
			root: 'records',
			totalProperty: 'total'
		},
		writer: {
			type: 'json',
			allowSingle: false,
			writeAllFields: false,
			root: 'records',
			encode: true
		}
	}
	//Relations
	/*
	belongsTo:[{
		model: 'TMS.league.model.Week',
		primaryKey: 'game_id',
		associationKey: 'week_id',
		foreignKey: 'week_id',
		getterName: 'getWeek',
		setterName: 'setWeek'
	}]
	*/
});
Ext.define('TMS.league.model.Season', {
    extend: 'Ext.data.Model',
	idProperty: 'season_id',
	
	//Requires
	requires:[
		'TMS.league.model.Week'
	],
	
	//Fields
    fields: [{
		name: 'season_id',
		type: 'int'
	},{
		name: 'title',
		type: 'string'
	},{
		name: 'start_date',
		type: 'date'
		
	},{
		name: 'end_date',
		type: 'date'
	}],
	
	//Proxy
	proxy: {
		type: 'ajax',
		api: {
			read: '/at-ajax/modules/league/season/read',
			create: '/at-ajax/modules/league/season/create',
			update: '/at-ajax/modules/league/season/update',
			destroy: '/at-ajax/modules/league/season/destroy'
		},
		reader: {
			idProperty: 'season_id',
			type: 'json',
			root: 'records',
			totalProperty: 'total'
		},
		writer: {
			type: 'json',
			allowSingle: false,
			writeAllFields: false,
			root: 'records',
			encode: true
		}
	},

	//Relations
	hasMany: {
		model: 'TMS.league.model.Week',
		name: 'weeks',
		primaryKey: 'season_id',
		associationKey: 'season_id',
		foreignKey: 'season_id'
	}
});
Ext.define('TMS.league.model.Team', {
    extend: 'Ext.data.Model',
	idProperty: 'league_team_id',
	
	//Requires
	requires:[
		'TMS.league.model.Game'
	],
	
	//Fields
    fields: [{
		name: 'league_team_id',
		type: 'int'
	},{
		name: 'team_name',
		type: 'string'
	},{
		name: 'team_pic',
		type: 'string'
	},{
		name: 'team_music',
		type: 'string'

	},{
		name: 'team_video',
		type: 'string'
	},{
		name: 'captain_id',
		type: 'int'
	}],

	//Proxy
	proxy: {
		type: 'ajax',
		startParam: undefined,
		limitParam: undefined,
		api: {
			read: '/at-ajax/modules/league/team/read',
			create: '/at-ajax/modules/league/team/create',
			update: '/at-ajax/modules/league/team/update',
			destroy: '/at-ajax/modules/league/team/destroy'
		},
		reader: {
			idProperty: 'league_team_id',
			type: 'json',
			root: 'records',
			totalProperty: 'total'
		},
		writer: {
			type: 'json',
			allowSingle: false,
			writeAllFields: false,
			root: 'records',
			encode: true
		}
	}
});
Ext.define('TMS.league.model.Week', {
    extend: 'Ext.data.Model',
	idProperty: 'week_id',
	
	//Requires
	requires:[
		'TMS.league.model.Game'
	],
	
	//Fields
    fields: [{
		name: 'week_id',
		type: 'int'
	},{
		name: 'season_id',
		type: 'int'
	},{
		name: 'title',
		type: 'string'
	},{
		name: 'start_date',
		type: 'date'

	},{
		name: 'end_date',
		type: 'date'
	}],

	//Proxy
	proxy: {
		type: 'ajax',
		startParam: undefined,
		limitParam: undefined,
		api: {
			read: '/at-ajax/modules/league/week/read',
			create: '/at-ajax/modules/league/week/create',
			update: '/at-ajax/modules/league/week/update',
			destroy: '/at-ajax/modules/league/week/destroy'
		},
		reader: {
			idProperty: 'week_id',
			type: 'json',
			root: 'records',
			totalProperty: 'total'
		},
		writer: {
			type: 'json',
			allowSingle: false,
			writeAllFields: false,
			root: 'records',
			encode: true
		}
	},
	
	//Relations
	hasMany: [{
		model: 'TMS.league.model.Game',
		name: 'games',
		primaryKey: 'week_id',
		associationKey: 'week_id',
		foreignKey: 'week_id'
	}],
	belongsTo: 'TMS.league.model.Season',
	
	//Functions
	isActive: function(){
		var today = new Date();
		var startDate = new Date(this.get('start_date'));
		var endDate = new Date(this.get('end_date'));
		
		if(today >= startDate && today <= endDate){
			return true;
		}
		else{
			return false;
		}
	}
});
Ext.define('TMS.league.store.Season', {
	extend: 'Ext.data.Store',
	requires:[
		'TMS.league.model.Season'
	],
	model: 'TMS.league.model.Season',
	autoLoad: true,
    autoSync: true,
	remoteSort: true,
	pageSize: 10
});
Ext.define('TMS.league.store.Team', {
	extend: 'Ext.data.Store',
	requires:[
		'TMS.league.model.Team'
	],
	model: 'TMS.league.model.Team',
	autoLoad: true,
    autoSync: true,
	remoteSort: true
});
Ext.define('TMS.league.view.Game', {
	extend:'Ext.view.View',
	
	//Config
	autoScroll: true,
	multiSelect: false,
	trackOver: true,
	deferEmptyText:false,
	overItemCls: 'league-game-over',
	itemSelector: '.league-game',
	emptyText: 'No games...',
	
	//Inits
	initComponent: function(){
		this.items = [];
		this.dockedItems = [];
		this.init();
		return this.callParent(arguments);
	},
	
	init: function(){
		this.initTemplate();
	},
	
	initTemplate: function(){
		this.tpl = new Ext.XTemplate(
			'<tpl for=".">',
				'<div class="league-game-container">',
					'<div class="league-game">',
						'<div class="team home-team">',
							'<div class="image"><img src="{home_team_pic}" /></div>',
							'<div class="name">{[this.getTeamName(values.home_team_name)]}</div>',
							'<div class="score">{home_score}</div>',
							'<div class="clear"></div>',
						'</div>',
						'<div class="team away-team">',
							'<div class="image"><img src="{away_team_pic}" /></div>',
							'<div class="name">{[this.getTeamName(values.away_team_name)]}</div>',
							'<div class="score">{away_score}</div>',
							'<div class="clear"></div>',
						'</div>',
						'<div class="game-footer">',
							'Click to view game details',
						'</div>',
					'</div>',
				'</div>',
			'</tpl>',
			'<div class="clear"></div>',
			{
				getTeamName: function(team){
					if(!team.length){
						return 'Bye';
					}
					return team;
				}
			}
		);
	}
});
Ext.define('TMS.league.view.League', {
	extend:'Ext.panel.Panel',

	//Requires
	requires:[
		'TMS.league.store.Season',
		'TMS.league.grid.Season',
		'TMS.league.form.Season',
		'TMS.league.view.Schedule'
	],
	
	//Config
	layout: 'border',

	initComponent: function(){
		this.items = this.items || [];
		this.dockedItems = this.dockedItems || [];
		this.init();
		this.callParent(arguments);
	},
	
	init: function() {
		//Init Layout
		this.initCenter();
		this.initTabPanel();
		
		//Init Season Components
		this.initSeasonStore();
		this.initSeasonGrid();
		this.initSeasonForm();
		
		//Init schedule components
		this.initSchedule();
	},
	
	initCenter: function(){
		this.center = new Ext.panel.Panel({
			scope: this,
			region: 'center',
			layout: 'card'
		});
		this.items.push(this.center);
	}, 
	
	initTabPanel: function(){
		this.tabPanel = new Ext.tab.Panel({
			scope: this,
			activeTab: 0
		});
		this.center.add(this.tabPanel);
	},
	
	initSeasonStore: function(){
		this.seasonStore = Ext.create('TMS.league.store.Season');
	},
	
	initSeasonGrid: function(){
		this.seasonGrid = Ext.create('TMS.league.grid.Season', {
			scope: this,
			store: this.seasonStore
		});
		this.center.add(this.seasonGrid);
		this.setActiveItem(this.seasonGrid);
		
		//Add toolbar
		this.seasonGrid.toolbar.add(0, new Ext.toolbar.Toolbar({
			scope: this,
			items:[{
				scope: this,
				text: 'Add',
				handler: function(){
					this.setActiveItem(this.tabPanel);
					this.tabPanel.setActiveTab(this.seasonForm);
				}
			}]
		}));
		
		this.seasonGrid.on('editaction', function(grid, record){
			this.editSeason(record);
		}, this);
	},
	
	initSeasonForm: function(){
		this.seasonForm = Ext.create('TMS.league.form.Season', {
			scope: this,
			title: 'Details'
		});
		this.tabPanel.add(this.seasonForm);
		
		//Form listeners
		this.seasonForm.on('create', this.addSeason, this);
		this.seasonForm.on('update', this.updateSeason, this);
	},
	
	initSchedule: function(){
		this.schedule = Ext.create('TMS.league.view.Schedule', {
			scope: this,
			title: 'Schedule',
			disabled: true
		});
		this.tabPanel.add(this.schedule);
	},
	
	setActiveItem: function(item){
		if(this.center.rendered){
			this.center.getLayout().setActiveItem(item);
		}
		else{
			this.center.activeItem = item;
		}
	},
	
	getActiveItem: function(item){
		return this.center.getLayout().getActiveItem();
	},
	
	addSeason: function(form, records){
		this.seasonStore.add(records);
		this.setActiveItem(this.seasonGrid);
	},
	
	updateSeason: function(form, record){
		
	},
	
	editSeason: function(record){
		//Set the season form to active
		this.seasonForm.loadRecord(record);
		this.setActiveItem(this.tabPanel);
		this.tabPanel.setActiveTab(this.seasonForm);
		
		//Load the schedule
		this.loadSchedule(record);
	},
	
	loadSchedule: function(record){
		this.schedule.enable();
		this.schedule.loadSeason(record);
	},
	
	save: function(){
		//Save all forms
		this.seasonForm.save();
	}
});
Ext.define('TMS.league.view.Schedule', {
	extend:'Ext.panel.Panel',
	
	//Requires
	requires:[
		'TMS.league.view.Week',
		'TMS.league.view.Game',
		'TMS.league.form.Week',
		'TMS.league.form.Game'
	],
	
	//Config
	layout: 'border',

	//Inits
	initComponent: function(){
		this.items = [];
		this.dockedItems = [];
		this.init();
		return this.callParent(arguments);
	},
	
	init: function(){
		this.initCenter();
		this.initWest();
		this.initWeekView();
		this.initGameView();
	},
	
	initCenter: function(){
		this.center = new Ext.panel.Panel({
			scope: this,
			title: 'Games',
			region: 'center',
			layout: 'fit'
		});
		this.items.push(this.center);
	},
	
	initWest: function(){
		this.west = new Ext.panel.Panel({
			scope: this,
			title: 'Weeks',
			region: 'west',
			width: 250,
			autoScroll: true
		});
		this.items.push(this.west);
	},
	
	initWeekView: function(){
		this.weekView = Ext.create('TMS.league.view.Week', {
			scope: this
		});
		this.west.add(this.weekView);
		
		//Listeners
		this.weekView.on('selectionchange', function(view, records, options ){
			if(!records.length){
				return;
			}
			var record = records[0];
			this.gameView.bindStore(record.games());
			record.games().load();
		}, this);
		
		this.weekView.on('itemcontextmenu', function(view, record, item, index, event, options){
			event.preventDefault();
			event.stopPropagation();
			event.stopEvent();
			var menu = new Ext.menu.Menu({
				scope: this,
				items: [{
					scope: this,
					text: 'Edit',
					record: record,
					handler: function(item){
						this.editWeek(item.record);
					}
				}]
			});
			menu.showAt(event.getXY());
		}, this);
	},
	
	initGameView: function(){
		this.gameView = Ext.create('TMS.league.view.Game', {
			scope: this
		});
		this.center.add(this.gameView);
		
		this.gameView.on('itemcontextmenu', function(view, record, item, index, event, options){
			event.preventDefault();
			event.stopPropagation();
			event.stopEvent();
			var menu = new Ext.menu.Menu({
				scope: this,
				items: [{
					scope: this,
					text: 'Edit',
					record: record,
					handler: function(item){
						this.editGame(item.record);
					}
				}]
			});
			menu.showAt(event.getXY());
		}, this);
	},
	
	loadSeason: function(record){
		this.weekView.bindStore(record.weeks());
		record.weeks().load();
	},
	
	editWeek: function(record){
		if(this.weekForm == null){
			this.weekForm = Ext.create('TMS.league.form.Week');
			this.weekWindow = new Ext.window.Window({
				scope: this,
				title: '',
				items: [this.weekForm],
				closeAction: 'hide',
				modal: true
			});
		}
		this.weekWindow.setTitle(record.get('title'));
		this.weekForm.loadRecord(record);
		this.weekWindow.show();
	},
	
	editGame: function(record){
		if(this.gameForm == null){
			this.gameForm = Ext.create('TMS.league.form.Game');
			this.gameWindow = new Ext.window.Window({
				scope: this,
				title: '',
				items: [this.gameForm],
				closeAction: 'hide',
				modal: true
			});
		}
		//this.weekWindow.setTitle(record.get('title'));
		this.gameForm.loadRecord(record);
		this.gameWindow.show();
	}
});
Ext.define('TMS.league.view.Team', {
	extend:'Ext.view.View',
	
	//Requires
	requires:[
		'TMS.league.store.Team'
	],
	
	//Config
	autoScroll: true,
	multiSelect: false,
	trackOver: true,
	deferEmptyText:false,
	overItemCls: 'league-team-over',
	itemSelector: '.league-team',
	emptyText: 'No teams...',
	
	//Inits
	initComponent: function(){
		this.items = [];
		this.dockedItems = [];
		this.init();
		return this.callParent(arguments);
	},
	
	init: function(){
		this.initTemplate();
		this.initStore();
	},
	
	initTemplate: function(){
		this.tpl = new Ext.XTemplate(
			'<tpl for=".">',
				'<div class="league-team">',
					'<div class="image"><img src="{team_pic}" /></div>',
					'<div class="name">{team_name}</div>',
				'</div>',
			'</tpl>'
		);
	},
	
	initStore: function(){
		if(this.store){
			return;
		}
		this.store = Ext.create('TMS.league.store.Team');
	}
});
Ext.define('TMS.league.view.Week', {
	extend:'Ext.view.View',
	
	//Config
	autoScroll: true,
	multiSelect: false,
	trackOver: true,
	deferEmptyText:false,
	overItemCls: 'league-week-over',
	itemSelector: '.league-week',
	emptyText: 'No weeks...',
	
	//Inits
	initComponent: function(){
		this.items = [];
		this.dockedItems = [];
		this.init();
		return this.callParent(arguments);
	},
	
	init: function(){
		this.initTemplate();
	},
	
	initTemplate: function(){
		this.tpl = new Ext.XTemplate(
			'<tpl for=".">',
				'<div class="league-week">',
					'<div class="title">{title}</div>',
					'<div class="date">{[this.renderDate(values.start_date)]} - {[this.renderDate(values.end_date)]}</div>',
				'</div>',
			'</tpl>',
			{
				renderDate: Ext.util.Format.dateRenderer('M j, Y')
			}
		);
	}
});
Ext.define('TMS.location.forms.sections.BillTo', {
	extend:'Ext.form.Panel',
	requires:[
		'TMS.customer.lookup.Customer',
		'TMS.location.lookup.Location'
	],
	
	//Config
    layout: 'anchor',
    defaults: {
        anchor: '100%',
		xtype: 'textfield'
    },
	
	processingPage:'/at-ajax/modules/location/process/',
	autoSave:false,
	
	border:false,
//	frame:true,
	
//	title:'Bill To',
	
	initComponent: function(){
		this.items = [];
		this.init();
		this.callParent(arguments);
	},
	
	init: function(){
//		this.initCustomerSelector();
		this.initLocationSelector();
		this.initListeners();
	},
	
	initCustomerSelector: function() {
		this.customerSelector = Ext.create('TMS.customer.lookup.Customer', {
			fieldLabel:'Customer',
			name:'bill_to_customer_id'
		});
		this.items.push(this.customerSelector);
	},
	
	initLocationSelector: function() {
		this.locationSelector = Ext.create('TMS.location.lookup.Location', {
			fieldLabel:'Billing Location',
			disabled:true,
			type:'customer',
			name:'bill_to_location_id'
		});
		this.items.push(this.locationSelector);
	},
	
	filterByCustomer: function(customerId) {
		this.locationSelector.setRawValue('');
		this.locationSelector.setValue(0);
		this.locationSelector.store.proxy.extraParams.to_id = customerId;
		this.locationSelector.store.proxy.extraParams.locationType = 'Bill To';
	},
	
	initListeners: function() {
		return;
		
		this.customerSelector.on('select', function(field, records) {
			if(!records.length){
				this.locationSelector.disable();
				return false;
			}
			
			//Enable the contact selector
			this.locationSelector.enable();
			
			//Load all the hot contacts for this customer
			var record = records[0];
			this.locationSelector.setRawValue('');
			this.locationSelector.setValue(0);
			this.locationSelector.store.proxy.extraParams.to_id = record.get('customer_id');
			this.locationSelector.store.loadPage(1);
			this.locationSelector.focus(true, 50);
			this.locationSelector.expand();
		}, this);
		
		this.customerSelector.on('change', function(field, value) {
			if (value == null) {
				this.locationSelector.setRawValue('');
				this.locationSelector.setValue(0);
				this.locationSelector.store.proxy.extraParams.to_id = 0;
			}
		}, this);
	},
	
	getValue: function() {
		return this.locationSelector.getValue();
	},
	
	getValues: function() {
		var params = {
			bill_to_id:this.locationSelector.getValue(),
			bill_to_location_id:this.locationSelector.getValue()
//			bill_to_customer_id:this.customerSelector.getValue()
		};
		return params;
	},
	
	loadLocation: function(locationId) {
		
	},
	
	setRecord: function(record) {
//		var records = this.customerSelector.store.add({
//			customer_id: record.bill_to_customer_id,
//			customer_name: record.bill_to_customer_name
//		});
//		this.customerSelector.select(records[0]);
		
		this.locationSelector.enable();
		records = this.locationSelector.store.add({
			location_id: record.bill_to_location_id,
			location_display: record.bill_to_location_name
		});
		this.locationSelector.select(records[0]);
	},
	
	lookupCustomer: function(customerId) {
		this.locationSelector.store.proxy.extraParams.to_id = customerId;
		this.locationSelector.store.proxy.extraParams.locationType = 'Billing';
		Ext.Ajax.request({
			scope:this,
			method:'post',
			url:this.processingPage + 'lookup-customer',
			params:{
				customerId:customerId,
				locationType:'Billing'
			},
			success: function(r) {
				var response = Ext.decode(r.responseText);
				if (response.success) {
					this.setRecord(response.record);
				}
			}
		});
	},
	
	lookupContact: function(contactId) {
		Ext.Ajax.request({
			scope:this,
			method:'post',
			url:this.processingPage + 'lookup-contact',
			params:{
				contactId:contactId
			},
			success: function(r) {
				var response = Ext.decode(r.responseText);
				if (response.success) {
					this.setRecord(response.record);
				}
			}
		});
	}
	
});
Ext.define('TMS.location.forms.sections.Location', {
	extend:'TMS.form.Abstract',
	requires:[
		'Ext.ux.form.field.RealComboBox'
	],
	
	//Config
	utilPage: '/at-ajax/modules/util/',
    layout: 'anchor',
    defaults: {
        anchor: '100%',
		xtype: 'textfield'
    },
	
	processingPage:'/at-ajax/modules/location/process/',
	autoSave:false,
	location_id: 0,
	customer_id: 0,
	carrier_id: 0,
	
	initComponent: function(){
		this.items = [];
		this.init();
		this.callParent(arguments);
	},
	
	init: function(){
		//Name
		this.initName1();
		this.initName2();
		
		//Address
		this.initAddress1();
		this.initAddress2();
		this.initAddress3();
		
		//City, state zip
		this.initZip();
		this.initCity();
		this.initStateField();
		
		this.initType();
		
		//Hidden
		this.initHidden();
	},
	
	initName1: function(){
		this.name1Field = Ext.create('Ext.form.field.Text', {
			name: 'name1',
			fieldLabel: 'Location Name'
		});
		
		this.name1Field.on('blur', function(d){
			var name = d.getValue();
			if( name.length ){
				this.checkLocationName(name);
			}
		}, this);
		this.items.push(this.name1Field);
	},
	
	initName2: function(){
		this.name2Field = Ext.create('Ext.form.field.Text', {
			name: 'name2',
			fieldLabel: '&nbsp;',
			labelSeparator: ''
		});
		this.items.push(this.name2Field);
	},
	
	initAddress1: function(){
		this.address1Field = Ext.create('Ext.form.field.Text', {
			name: 'address1',
			fieldLabel: 'Address'
		});
		this.items.push(this.address1Field);
	},
	
	initAddress2: function(){
		this.address2Field = Ext.create('Ext.form.field.Text', {
			name: 'address2',
			fieldLabel: '&nbsp;',
			labelSeparator: ''
		});
		this.address2Field.on('blur', function(d){
			if (d.getValue().length) {
				this.address3Field.show();
				this.address3Field.focus();
			}
		}, this);
		this.items.push(this.address2Field);
	},
	
	initAddress3: function(){
		this.address3Field = Ext.create('Ext.form.field.Text', {
			name: 'address3',
			fieldLabel: '&nbsp;',
			labelSeparator: '',
			hidden: true
		});
		this.items.push(this.address3Field);
	},
	
	initCity: function(){
		this.cityField = Ext.create('Ext.form.field.Text', {
			name: 'city',
			fieldLabel: 'City'
		});
		this.items.push(this.cityField);
	},
	
	initStateField: function(){
		this.stateField = Ext.create('Ext.form.field.ComboBox', {
			name: 'state',
			fieldLabel: 'State',
			valueField: 'value',
			displayField: 'display',
			queryMode: 'local',
			store: new Ext.data.Store({
				fields: [
					'value',
					'display'
				],
				autoLoad: true,
				proxy: {
					type: 'ajax',
					url : '/at-ajax/modules/util/data/states',
					reader: {
						type: 'json',
						root: 'records'
					}
				}
			})
		});
		this.items.push(this.stateField);
	},
	
	initZip: function(){
		this.zipField = new Ext.form.field.Text({
			scope: this,
			name: 'zip',
			fieldLabel: 'Zip',
			enableKeyEvents: true
		});
		this.zipField.on('keyup', this.getZipDetails, this, { buffer: 300});
		this.zipField.on('change', this.getZipDetails, this, { buffer: 300});
		this.items.push(this.zipField);
	},
	
	initType: function() {
		this.typeStore = Ext.create('Ext.data.Store', {
			fields: [
				'location_type_id',
				'name'
			],
			proxy: {
				type: 'ajax',
				url: this.processingPage + 'get-location-types',
				reader: {
					type: 'json',
					root: 'records'
				}
			},
			autoLoad:true
		});
		this.typeSelector = Ext.create('Ext.ux.form.field.RealComboBox', {
			flex:1,
			valueField:'location_type_id',
			displayField:'name',
			store: this.typeStore,
			queryMode: 'local',
			editable:false,
			margin:'2',
			fieldLabel:'Type',
			name:'locationTypeId'
		});
		this.items.push(this.typeSelector);
	},
	
	initHidden: function(){
		this.locationId = new Ext.form.field.Hidden({
			scope: this,
			name: 'location_id',
			value: this.location_id
		});
		this.customerId = new Ext.form.field.Hidden({
			scope: this,
			name: 'customer_id',
			value: this.customer_id
		});
		this.carrierId = new Ext.form.field.Hidden({
			scope: this,
			name: 'carrier_id',
			value: this.carrier_id
		});
		
		this.items.push(this.locationId);
		this.items.push(this.customerId);
		this.items.push(this.carrierId);
	},
	
	getZipDetails: function(){
		if (this.zipField.getValue().length > 4){
			Ext.Ajax.request({
				scope: this,
				url: this.utilPage + 'data/zip/',
				params: {
					zip: this.zipField.getValue()
				},
				success: function(r){
					var response = Ext.JSON.decode(r.responseText);
					if(response.record != null){
						this.down('textfield[name=city]').setValue(response.record.city);
						this.down('textfield[name=state]').setValue(response.record.state);
					}
				}
			});
		}
	},
	
	checkLocationName: function(name){
		Ext.Ajax.request({
			scope:this,
			method:'post',
			url:this.processingPage + 'check-name',
			params:{
				name: name
			},
			success: function(r) {
				var response = Ext.decode(r.responseText);
				var nameExists = response.record.exists;
				
			}
		});
	},
	
	loadLocation: function(location_id, name) {
		this.location_id = location_id;
		if (this.location_id) {
			this.setLoading(true);
			Ext.Ajax.request({
				scope:this,
				method:'post',
				url:this.processingPage + 'get-location-data',
				params:{
					location_id:this.location_id
				},
				success: function(r) {
					this.setLoading(false);
					var response = Ext.decode(r.responseText);
					if (response.success) {
						this.setFieldValues(response.record);
					}
				}
			});
		}
	},
	
	setFieldValues: function(record) {
		this.name1Field.setValue(record.location_name_1);
		this.name2Field.setValue(record.location_name_2);
		this.address1Field.setValue(record.address_1);
		this.address2Field.setValue(record.address_2);
		this.address3Field.setValue(record.address_3);
		this.zipField.setValue(record.zip);
		this.locationId.setValue(record.location_id);
		this.typeSelector.setValue(record.type);
	},
	
	clearFieldValues: function() {
		var record = {};
		record.location_name_1 = '';
		record.location_name_2 = '';
		record.address_1 = '';
		record.address_2 = '';
		record.address_3 = '';
		record.zip = '';
		record.location_id = '';
		record.type = 0;
		this.setFieldValues(record);
	}
});
Ext.define('TMS.location.forms.Form', {
	extend:'TMS.form.Abstract',
	requires:[
		'TMS.location.forms.sections.Location'
	],
	
	//Config
	url: '/at-ajax/modules/location/process/process',
	bodyPadding: 10,
	location_id: 0,
	customer_id: 0,
	carrier_id: 0,
	
	initComponent: function(){
		this.items = [];
		this.init();
		this.callParent(arguments);
	},
	
	init: function(){
		this.initLocationSection();
	},
	
	initLocationSection: function(){
		this.locationSection = Ext.create('TMS.location.forms.sections.Location', {
			border: false,
			location_id: this.location_id,
			customer_id: this.customer_id,
			carrier_id: this.carrier_id
		});
		this.items.push(this.locationSection);
	}
});
Ext.define('TMS.location.lookup.Location', {
	extend: 'Ext.ux.form.field.RealComboBox',
	
	//Config
	type: 'contact',
	processingPage: '/at-ajax/modules/location/lookup/location',
	displayField: 'location_display',
	valueField: 'location_id',
	emptyText: 'Search for location...',
	typeAhead: false,
	hideTrigger:true,
	anchor: '100%',
	pageSize: 10,
	minChars: 0,
	width: 250,
	listConfig: {
		loadingText: 'Searching...',
		emptyText: 'No matching locations found.',

		// Custom rendering template for each item
		getInnerTpl: function() {
			return '<div class="location-name">{location_name_1}</div>' +
					'<div class="location-address">{address_1}</div>' +
					'<div class="location-city-state-zip">{city}, {state} {zip}</div>';
		}
	},
	
	initComponent: function(){
		this.init();
		this.callParent(arguments);
	},
	
	//Init Functions
	init: function(){
		this.initStore();
	},
	
	initStore: function(){
		this.store = new Ext.data.Store({
			fields: [
				'location_id',
				'location_display',
				'location_name_1',
				'address_1',
				'city',
				'state',
				'zip',
				'lat',
				'lng'
			],
			remoteSort: true,
			pageSize: 10,
			proxy: {
				type: 'ajax',
				url : this.processingPage,
				reader: {
					type: 'json',
					root: 'records',
					totalProperty: 'total'
				},
				extraParams:{
					type: this.type
				}
			}
		});
	}
});
            
Ext.define('TMS.mypage.charts.leaderboard.Branch', {
	extend: 'Ext.chart.Chart',
	
	requires:[
		'TMS.mypage.charts.Theme'
	],
	
	//Config
	processingPage: '/at-ajax/modules/stats/leaderboard/branch',
	animate: true,
	shadow: true,
	theme: 'TMS',
	axes: [{
		type: 'Numeric',
		position: 'bottom',
		fields: ['value'],
		grid: true,
		minimum: 0
	}, {
		type: 'Category',
		position: 'left',
		fields: ['name']
	}],
	series: [{
		type: 'bar',
		axis: 'bottom',
		highlight: true,
		label: {
			display: 'insideEnd',
			field: 'value',
			renderer: Ext.util.Format.numberRenderer('0'),
			orientation: 'horizontal',
			color: '#333',
			'text-anchor': 'middle'
		},
		xField: 'name',
		yField: ['value']
	}],
	
	//Inits
	initComponent: function(){
		this.init();
		this.callParent(arguments);
	},
	
	init: function(){
		this.initStore();
	},
	
	initStore: function(){
		this.store = new Ext.data.Store({
			fields: [
				'name',
				'value',
				'image'
			],
			proxy: {
				type: 'ajax',
				url : this.processingPage,
				reader: {
					type: 'json',
					root: 'records'
				},
				extraParams:{
					reverse: true
				}
			}
		});
	}
	
});
Ext.define('TMS.mypage.charts.leaderboard.Individual', {
	extend: 'Ext.chart.Chart',

	requires:[
		'TMS.mypage.charts.Theme'
	],
	
	//Config
	processingPage: '/at-ajax/modules/stats/leaderboard/individual',
	animate: true,
	shadow: true,
	theme: 'TMS',
	axes: [{
		type: 'Numeric',
		position: 'bottom',
		fields: ['value'],
		grid: true,
		minimum: 0
	}, {
		type: 'Category',
		position: 'left',
		fields: ['name']
	}],
	series: [{
		type: 'bar',
		axis: 'bottom',
		highlight: true,
		label: {
			display: 'insideEnd',
			field: 'value',
			orientation: 'horizontal',
			color: '#333',
			'text-anchor': 'middle'
		},
		xField: 'name',
		yField: ['value'],
		tips:{
			renderer: function(storeItem, item) {
				this.update(Ext.String.format(
					"<div class=\"tip-title\">{0}</div>" + 
					"<div class=\"tip-text\"><b>Value:</b> {1}</div>",
					storeItem.get('name'),
					storeItem.get('value')
				));
			}
		}
	}],
	
	//Inits
	initComponent: function(){
		this.init();
		this.callParent(arguments);
	},
	
	init: function(){
		this.initListeners();
		this.initStore();
	},
	
	initListeners: function(){
		this.on('afterrender', function(){
			var series = this.series.get(0);
			series.on('itemmouseup', function(item) {
				 this.fireEvent('itemclick', item);
			}, this);
		}, this);
	},
	
	initStore: function(){
		this.store = new Ext.data.Store({
			fields: [
				'name',
				'value',
				'image'
			],
			autoLoad: false,
			pageSize: 5,
			proxy: {
				type: 'ajax',
				url : this.processingPage,
				reader: {
					type: 'json',
					root: 'records',
					totalProperty: 'total'
				},
				extraParams:{
					reverse: true
				}
			}
		});
	}
	
});
Ext.define('TMS.mypage.charts.leaderboard.Team', {
	extend: 'Ext.chart.Chart',
	
	requires:[
		'TMS.mypage.charts.Theme'
	],
	
	//Config
	processingPage: '/at-ajax/modules/stats/leaderboard/team',
	animate: true,
	shadow: true,
	theme: "TMS",
	axes: [{
		type: 'Numeric',
		position: 'bottom',
		fields: ['value'],
		grid: true,
		minimum: 0
	}, {
		type: 'Category',
		position: 'left',
		fields: ['name']
	}],
	series: [{
		type: 'bar',
		axis: 'bottom',
		highlight: true,
		color: '#FFFFFF',
		label: {
			display: 'insideEnd',
			field: 'value',
			renderer: Ext.util.Format.numberRenderer('0'),
			orientation: 'horizontal',
			color: '#333',
			'text-anchor': 'middle'
		},
		xField: 'name',
		yField: ['value'],
		tips:{
			renderer: function(storeItem, item) {
				this.update(Ext.String.format(
					"<div class=\"tip-title\">{0}</div>" + 
					"<div class=\"tip-text\"><b>Value:</b> {1}</div>",
					storeItem.get('name'),
					storeItem.get('value')
				));
			}
		}
	}],
	
	//Inits
	initComponent: function(){
		this.init();
		this.callParent(arguments);
	},
	
	init: function(){
		this.initStore();
	},
	
	initStore: function(){
		this.store = new Ext.data.Store({
			fields: [
				'name',
				'value',
				'image'
			],
			pageSize: 5,
			proxy: {
				type: 'ajax',
				url : this.processingPage,
				reader: {
					type: 'json',
					root: 'records',
					totalProperty: 'total'
				},
				extraParams:{
					reverse: true
				}
			}
		});
	}
	
});
Ext.define('TMS.mypage.charts.Compare', {
	extend: 'Ext.chart.Chart',
	
	requires:[
		'TMS.mypage.charts.Theme'
	],
	
	//Config
	processingPage: '/at-ajax/modules/stats/user/compare',
	chartType: 'points',
	chartTypeTitle: 'Points',
	animate: true,
	shadow: true,
	theme: 'TMS',
	legend: {
		position: 'top'
	},
	axes: [{
		type: 'Numeric',
		position: 'left',
		fields: ['value', 'company', 'branch'],
		grid: true,
		minimum: 0
	}, {
		type: 'Category',
		position: 'bottom',
		fields: ['date']
	}],
	
	//Inits
	initComponent: function(){
		this.init();
		this.callParent(arguments);
	},
	
	init: function(){
		this.initChartSeries();
		this.initStore();
		this.initListeners();
	},
	
	initChartSeries: function(){
		this.series = [{
			title: "My Average",
			type: 'line',
			highlight: {
				size: 7,
				radius: 7
			},
			fill: true,
			smooth: true,
			axis: 'left',
			xField: 'date',
			yField: 'value',
			tips:{
				renderer: this.tipRender
			}
		},{
			title: "Company Average",
			type: 'line',
			highlight: {
				size: 7,
				radius: 7
			},
			axis: 'left',
			//fill: true,
			smooth: true,
			xField: 'date',
			yField: 'company',
			tips:{
				renderer: this.tipRender
			}
		},{
			id: 'average',
			title: "Branch Average",
			type: 'line',
			highlight: {
				size: 7,
				radius: 7
			},
			axis: 'left',
			//fill: true,
			smooth: true,
			xField: 'date',
			yField: 'branch',
			tips:{
				renderer: this.tipRender
			}
		}];
	},
	
	initListeners: function(){
		this.on('afterrender', function(){
			this.store.load();
		}, this);
	},
	
	initStore: function(){
		this.store = new Ext.data.Store({
			fields: [
				'date',
				'value',
				'company',
				'branch'
			],
			proxy: {
				type: 'ajax',
				url : this.processingPage,
				reader: {
					type: 'json',
					root: 'records'
				},
				extraParams:{
					type: this.chartType
				}
			}
		});
	},
	
	tipRender: function(storeItem, item){
		this.update(Ext.String.format(
			"<div class=\"tip-title\">{0}</div>" + 
			"<div class=\"tip-text\"><b>My Average:</b> {1}</div>" +
			"<div class=\"tip-text\"><b>Company Average:</b> {2}</div>" +
			"<div class=\"tip-text\"><b>Branch Average:</b> {3}</div>",
			storeItem.get('date'),
			storeItem.get('value'),
			storeItem.get('company'),
			storeItem.get('branch')
		));
	}
});
Ext.define('TMS.mypage.charts.Stats', {
	extend: 'Ext.chart.Chart',
	
	requires:[
		'TMS.mypage.charts.Theme'
	],
	
	//Config
	processingPage: '/at-ajax/modules/stats/user/stats',
	animate: true,
	shadow: true,
	theme: 'TMS',
	axes: [{
		type: 'Numeric',
		position: 'left',
		fields: ['value'],
		grid: true,
		minimum: 0,
		label:{
			renderer: Ext.util.Format.numberRenderer('0')
		}
	}, {
		type: 'Category',
		position: 'bottom',
		fields: ['date'],
		label: {
			font: '11px Arial'
		}
	}],
	series: [{
		type: 'line',
		fill: true,
		smooth: true,
		axis: 'left',
		xField: 'date',
		yField: 'value',
		highlight: true,
		tips:{
			renderer: function(storeItem, item) {
				this.update(Ext.String.format(
					"<div class=\"tip-title\">{0}</div>" + 
					"<div class=\"tip-text\"><b>{1}:</b> {2}</div>",
					storeItem.get('date'),
					storeItem.get('type'),
					storeItem.get('value')
				));
			}
		}
	}],
	
	//Inits
	initComponent: function(){
		this.init();
		this.callParent(arguments);
	},
	
	init: function(){
		//this.initAutoUpdate();
		this.initStore();
	},
	
	initAutoUpdate: function(){
		this.on('afterrender', function(){
			setInterval(Ext.bind(function(){
				this.store.load();
			}, this), 15000);
		}, this);
	},
	
	initStore: function(){
		this.store = new Ext.data.Store({
			fields: [
				'date',
				'value',
				'type',
				'group'
			],
			proxy: {
				type: 'ajax',
				url : this.processingPage,
				reader: {
					type: 'json',
					root: 'records'
				}
			}
		});
		
		this.store.on('load', function(store, records){
			if(!records.length){
				/*
				this.getEl().mask(
					'<div class="no-data"><div class="image"><img src="/resources/icons/info-32.png" /></div><div class="message">This graph takes a minimum of two days of data to populate correctly. Unfortunatly, you do not have enough data in the system for this graph to display. Please check back soon when you have more data in the system.</div><div class="clear"></div></div>'
				);
				*/
			}
		}, this);
	}
});
Ext.define('TMS.mypage.charts.Theme', {});
Ext.define('Ext.chart.theme.TMS', {
	extend: 'Ext.chart.theme.Base',
	constructor: function(config) {
        Ext.chart.theme.call(this, config, {
			baseColor: "#001B7C",
            background: false,
            axis: {
                stroke: '#444',
                'stroke-width': 1
            },
            axisLabelTop: {
                fill: '#444',
                font: '12px Arial, Helvetica, sans-serif',
                spacing: 2,
                padding: 5,
                renderer: function(v) { return v; }
            },
            axisLabelRight: {
                fill: '#444',
                font: '12px Arial, Helvetica, sans-serif',
                spacing: 2,
                padding: 5,
                renderer: function(v) { return v; }
            },
            axisLabelBottom: {
                fill: '#444',
                font: '12px Arial, Helvetica, sans-serif',
                spacing: 2,
                padding: 5,
                renderer: function(v) { return v; }
            },
            axisLabelLeft: {
                fill: '#444',
                font: '12px Arial, Helvetica, sans-serif',
                spacing: 2,
                padding: 5,
                renderer: function(v) { return v; }
            },
            axisTitleTop: {
                font: 'bold 18px Arial',
                fill: '#444'
            },
            axisTitleRight: {
                font: 'bold 18px Arial',
                fill: '#444',
                rotate: {
                    x:0, y:0,
                    degrees: 270
                }
            },
            axisTitleBottom: {
                font: 'bold 18px Arial',
                fill: '#444'
            },
            axisTitleLeft: {
                font: 'bold 18px Arial',
                fill: '#444',
                rotate: {
                    x:0, y:0,
                    degrees: 270
                }
            },
            series: {
                'stroke-width': 0
            },
            seriesLabel: {
                font: 'bold 12px Arial',
                fill: '#fff'
            },
            marker: {
                stroke: '#555',
                fill: '#000',
                radius: 3,
                size: 3
            },
            colors: ["#001B7C", "#E12210", "#F28900"],
            seriesThemes: [{
                fill: "#001B7C"
            }, {
                fill: "#E12210"
            }, {
                fill: "#F28900"
            }, {
                fill: "#ff8809"
            }, {
                fill: "#ffd13e"
            }, {
                fill: "#a61187"
            }, {
                fill: "#24ad9a"
            }, {
                fill: "#7c7474"
            }, {
                fill: "#a66111"
            }],
            markerThemes: [{
                fill: "#001B7C",
                type: 'circle' 
            }, {
                fill: "#E12210",
                type: 'cross'
            }, {
                fill: "#F28900",
                type: 'plus'
            }]
        });
    }
	
});

Ext.define('TMS.mypage.dashboard.Leaderboard', {
	extend: 'Ext.panel.Panel',
	
	requires:[
		'TMS.mypage.Util',
		'TMS.mypage.filter.Filter',
		'TMS.mypage.grids.Stats'
	],
	
	//Config
	border: false,
	defaults: {
		cls: 'mypage-leaderboard'
	},
	chartHeight: 200,
	
	//Stat Types
	statTypes: [],
	
	//Init Functions
	initComponent: function(){
		this.init();
		this.callParent(arguments);
	},
	
	init: function(){
		this.items = [];
		
		//Filter
		this.initFilter();
		
		//Init the containers
		this.initLeaderPanel();
		this.initWestPanel();
		this.initCenterPanel();
		
		//Leaderboard charts
		this.initInfoTemplate();
		this.initIndividualChart();
		this.initTeamChart();
		this.initBranchChart();
		
		//Stats Grid
		this.initStatsGrid();
	},
	
	initLeaderPanel: function(){
		this.leaderPanel = new Ext.panel.Panel({
			scope: this,
			height: 300,
			layout: 'border',
			border: false,
			unstyled: true
		});
		this.items.push(this.leaderPanel);
	},
	
	initWestPanel: function(){
		this.westPanel = new Ext.panel.Panel({
			scope: this,
			region: 'west',
			width: 200,
			margin: '2',
			border: false,
			unstyled: true,
			layout: {
				type:'vbox',
				align:'stretch'
			}
		});
		this.leaderPanel.add(this.westPanel);
	},
	
	initCenterPanel: function(){
		this.centerPanel = new Ext.panel.Panel({
			scope: this,
			region: 'center',
			border: false,
			margin: '2',
			layout: {
				type: 'card',
				deferredRender: true
			},
			activeItem: false
		});
		this.on('afterrender', function(){
			this.westPanel.child('button').toggle(true);
		}, this);
		this.leaderPanel.add(this.centerPanel);
	},
	
	initFilter: function(){
		this.filterPanel = Ext.create('TMS.mypage.filter.Filter', {
			scope: this,
			border: false,
			unstyled: true
		});
		this.items.push(this.filterPanel);
	},
	
	initInfoTemplate: function(){
		this.infoTemplate = new Ext.XTemplate(
			'<div class="image">',
				'<img src="{image}" />',
				'<div class="name">',
					'{name}',
				'</div>',
			'</div>'
		);
	},
	
	initIndividualChart: function(){
		this.createLeaderboard({
			type: 'individual',
			title: 'Individual Leaders',
			chartClass: 'TMS.mypage.charts.leaderboard.Individual',
			icon: '/resources/icons/user-black-32.png'
		});
	},
	
	initTeamChart: function(){
		this.createLeaderboard({
			type: 'team',
			title: 'Team Leaders',
			chartClass: 'TMS.mypage.charts.leaderboard.Team',
			icon: '/resources/icons/group-black-32.png'
		});
	},
	
	initBranchChart: function(){
		this.createLeaderboard({
			type: 'branch',
			title: 'Branch Leaders',
			chartClass: 'TMS.mypage.charts.leaderboard.Branch',
			icon: '/resources/icons/group-black-32.png'
		});
	},
	
	initStatsGrid: function(){
		this.statsGrid = Ext.create('TMS.mypage.grids.Stats', {
			scope: this,
			title: 'Complete Leaders',
			margin: '10 0 0 0'
		});
		this.items.push(this.statsGrid);
		
		this.on('statchange', function(type){
			this.statsGrid.store.proxy.extraParams.type = type;
			this.statsGrid.store.loadPage(1);
		}, this);
		
		this.on('typechange', function(type){
			this.statsGrid.setProxy(this.statsGrid.processingPages[type]);
			this.statsGrid.store.loadPage(1);
		}, this);
		
		this.filterPanel.on('filter', function(panel, filter){
			Ext.apply(this.statsGrid.store.proxy.extraParams, filter);
			this.statsGrid.store.loadPage(1);
		}, this);
	},
	
	createLeaderboard: function(userConfig){
		//Create the default config
		var defaultConfig = {
			icon: ''
		};
		var config = {};
		Ext.apply(config, userConfig, defaultConfig);
		
		//Build the item string we will be creating
		var chart = config.type + 'Chart';
		var chartPanel = config.type + 'ChartPanel';
		var infoPanel = config.type + 'InfoPanel';
		var panel = config.type + 'Panel';
		var button = config.type + 'Button';
		
		//Create the chart
		this[chart] = Ext.create(config.chartClass, {
			height: this.chartHeight
		});
		
		//Tell the charts store to load after render
		this[chart].on('afterrender', function(){
			this[chart].store.load({
				params:{
					start: 0,
					limit: 5
				}
			});
		}, this);
		
		this[chart].on('itemclick', function(item){
			//Update the info template
			var record = item.storeItem;
			this[config.type + 'InfoPanel'].update(this.infoTemplate.apply({
				image: record.get('image'),
				name: record.get('name') + " (" + record.get('value') + ")"
			}));
		}, this);
		
		//Update the info panel after this charts store loads
		this[chart].store.on('load', function(store, records){
			if(records.length){
				//get the last record
				var record = records[records.length-1];
				
				//Update the info template
				this[config.type + 'InfoPanel'].update(this.infoTemplate.apply({
					image: record.get('image'),
					name: record.get('name') + " (" + record.get('value') + ")"
				}));
			}
		}, this);
		
		//Create the charts panel
		this[chartPanel] = new Ext.panel.Panel({
			columnWidth: 1,
			border: false
		});
		
		this[chartPanel].on('afterrender', function(){
			this[chart].setWidth(this[chartPanel].getWidth());
			this[chartPanel].add(this[chart]);
			this[chartPanel].doLayout();
		}, this);
		
		//Create the info panel
		this[infoPanel] = new Ext.panel.Panel({
			width: 200,
			height: this.chartHeight,
			border: false,
			autoHeight: true,
			html: '&nbsp;'
		});
		
		//Create the container panel
		this[panel] = new Ext.panel.Panel(Ext.apply({
			//Config
			title: config.title,
			layout: 'column',
			autoHeight: true,
			
			//Items
			items: [this[infoPanel], this[chartPanel]]

//			tbar: new Ext.toolbar.Paging({
//				store: this[chart].store,
//				displayInfo: true,
//				displayMsg: 'Rankings: {0} - {1}'
//		   })
		}, this.defaults));
		
		//Add a button/menu to the header
		this[panel].on('afterrender', function(panel, options){
			this.createStatTypeMenu(options.panel, options.chart);
		}, this, { panel: this[panel], chart: this[chart]});
		
		//Create some store listeners
		this[chart].store.on('beforeload', function(store, operation, options){
			options.panel.setLoading(true);
		}, this, { panel: this[panel] });
		
		this[chart].store.on('load', function(store, records, successful, options){
			options.panel.setLoading(false);
		}, this, { panel: this[panel] });
		
		//listen for filter change
		this.filterPanel.on('filter', function(panel, filter, options){
			Ext.apply(options.chart.store.proxy.extraParams, filter);
			if(options.chart.rendered && this.centerPanel.getLayout().getActiveItem() == options.container){
				options.chart.store.load();
			}
		}, this, {chart: this[chart], container:this[panel]});
		
		
		//Add the container panel to the center panel
		this.centerPanel.add(this[panel]);
		
		//Create the button
		this[button] = new Ext.button.Button({
			scope: this,
			text: config.title,
			panel: this[panel],
			cls: 'leaderboard-button',
			icon: config.icon,
			type: config.type,
			scale: 'large',
			margin: '5',
			flex: 1,
			enableToggle: true,
			toggleGroup: 'tms-stats-leaderboard'
		});
		this[button].on('toggle', function(button, pressed, options){
			if(pressed){
				this.centerPanel.getLayout().setActiveItem(button.panel);
				this.fireEvent('typechange', button.type);
			}
		}, this);
		this.westPanel.add(this[button]);
	},
	
	createStatTypeMenu: function(panel, chart){
		if(panel.header == null){
			return false;
		}
		
		//Create the menu
		var menu = new Ext.menu.Menu();
		
		//create the menu button
		var menuButton = new Ext.button.Button({
			text: 'Stat Type (Points)',
			icon: '/resources/icons/bar-chart-16.png',
			menu: menu
		});
		
		//Create the menu items
		Ext.each(TMS.mypage.Util.getStatTypes(), function(type){
			var menuItem = new Ext.menu.Item({
				scope: this,
				text: type.title,
				chart: chart,
				panel: panel,
				type: type,
				parentMenu: menu,
				parentMenuButton: menuButton,
				handler: function(button){
					//Set the parent text
					button.parentMenuButton.setText('Stat Type (' + button.text + ')');
					button.panel.doComponentLayout();
					
					//Set the stores proxy to load this stat type
					button.chart.store.proxy.extraParams.type = button.type.field;
					button.chart.store.loadPage(1);
					
					//Fire event
					this.fireEvent('statchange', button.type.field);
				}
			});
			menu.add(menuItem);
		}, this);
		
		panel.header.add(menuButton);
		panel.header.doComponentLayout();
	}
});
Ext.define('TMS.mypage.dashboard.Scores', {
	extend: 'Ext.panel.Panel',
	
	//Requires
	requires:[
		'Ext.ux.Spinner',
		'TMS.league.model.Week',
		'TMS.league.view.Week',
		'TMS.league.store.Team',
		'TMS.league.view.Game',
		'TMS.ActionWindow'
	],
	
	//Config
	layout: 'border',
	
	//Init Functions
	initComponent: function(){
		this.init();
		this.callParent(arguments);
	},
	
	init: function(){
		this.items = [];
		
		//Layout Containers
		this.initLeft();
		this.initCenter();
		
		//week
		//this.initWeekPanel();
		this.initWeekView();
		
		//Game
		this.initGameFilter();
		this.initGamePanel();
		this.initGameView();
		this.initGameDetails();
	},
	
	initLeft: function(){
		this.left = new Ext.panel.Panel({
			scope: this,
			region: 'west',
			width: 200,
			autoScroll: true
		});
		this.items.push(this.left);
	},
	
	initCenter: function(){
		this.center = new Ext.panel.Panel({
			scope: this,
			region: 'center',
			layout: 'fit',
			border: false
		});
		this.items.push(this.center);
	},
	
	initWeekView: function(){
		this.weekView = Ext.create('TMS.league.view.Week', {
			scope: this,
			store: new Ext.data.Store({
				model: 'TMS.league.model.Week'
			})
		});
		this.left.add(this.weekView);
		
		//Load the store after render
		this.on('afterrender', function(){
			this.weekView.store.load({
				params:{
					active: true
				}
			});
		}, this);
		
		//Listeners
		this.weekView.store.on('load', function(){
			this.left.doLayout();
		}, this);
		
		this.weekView.on('refresh', function(view, options){
			var nodes = this.weekView.getNodes();
			Ext.each(nodes, function(node){
				var record = this.weekView.getRecord(node);
				if(record.isActive()){
					this.weekView.select(record);
				}
			}, this);
		}, this);
	},
	
	initGameFilter: function(){
		
		//Team Combo
		this.teamCombo = new Ext.form.field.ComboBox({
			fieldLabel: 'Team',
			store: Ext.create('TMS.league.store.Team',{
				autoSync: false
			}),
			labelWidth: 60,
			queryMode: 'local',
			displayField: 'team_name',
			valueField: 'league_team_id'
		});
		
		this.teamCombo.store.on('load', function(){
			this.teamCombo.store.insert(0, {
				team_name: 'All Teams...',
				league_team_id: 0
			});
		}, this);
		
		this.teamCombo.on('select', function(combo, records, options){
			if(!records.length){
				return;
			}
			var record = records[0];
			if(record.get('league_team_id')){
				this.gameView.store.filter('team_id', record.get('league_team_id'));
			}
			else{
				Ext.each(this.gameView.store.filters.items, function(filter){
					if(filter.property == "team_id"){
						this.gameView.store.filters.remove(filter);
					}
				}, this);
				this.gameView.store.load();
			}
		}, this);
		
		//Branch Combo
		/*
		this.branchCombo = new Ext.form.field.ComboBox({
			fieldLabel: 'Branch',
			store: Ext.create('Ext.data.Store',{
				model: 'TMS.user.model.Branches',
				autoLoad: true
			}),
			labelWidth: 60,
			queryMode: 'local',
			displayField: 'branch_name',
			valueField: 'branch_id'
		});
		
		this.branchCombo.store.on('load', function(){
			this.branchCombo.store.insert(0, {
				branch_name: 'All Branches...',
				branch_id: 0
			});
		}, this);
		
		this.branchCombo.on('select', function(combo, records, options){
			if(!records.length){
				return;
			}
			var record = records[0];
			if(record.get('branch_id')){
				this.gameView.store.filter('branch_id', record.get('branch_id'));
			}
			else{
				this.gameView.store.clearFilter();
			}
		}, this);
		*/
		
		
		//Create the game filter toolbar to hold all the filters
		this.gameFilter = new Ext.toolbar.Toolbar({
			scope: this,
			items:[this.teamCombo]
		});
	},
	
	initGamePanel: function(){
		this.gamePanel = new Ext.panel.Panel({
			scope: this,
			layout: 'fit',
			height: 350,
			autoScroll: true,
			tbar: this.gameFilter
		});
		this.center.add(this.gamePanel);
	},
	
	initGameView: function(){
		this.gameView = Ext.create('TMS.league.view.Game', {
			store: new Ext.data.Store({
				model: 'TMS.league.model.Game',
				remoteFilter: true
			})
		});
		this.gamePanel.add(this.gameView);
		
		//listen for a week selection change
		this.weekView.on('selectionchange', function(view, records, options){
			if(!records.length){
				return;
			}
			
			var record = records[0];
			this.gameView.store.filter('week_id', record.get('week_id'));
		}, this);
	},
	
	initGameDetails: function(){
		this.gameDetailsTemplate = new Ext.XTemplate(
			'<div class="league-game-details">',
				'<div class="league-game-details-header">',
					'<div class="team-header home-team-header">',
						'<div class="image">',
							'<img src="{home_team.team_pic}" />',
						'</div>',
						'<div class="name">',
							'{home_team.team_name} <span class="record">({home_team.record.wins} - {home_team.record.losses})</span>',
						'</div>',
						'<div class="score">',
							'{home_score}',
						'</div>',
						'<div class="clear"></div>',
					'</div>',
					'<div class="team-header away-team-header">',
						'<div class="image">',
							'<img src="{away_team.team_pic}" />',
						'</div>',
						'<div class="name">',
							'{away_team.team_name} <span class="record">({away_team.record.wins} - {away_team.record.losses})</span>',
						'</div>',
						'<div class="score">',
							'{away_score}',
						'</div>',
						'<div class="clear"></div>',
					'</div>',
					'<div class="clear"></div>',
				'</div>',
				'<div class="league-game-details-body">',
					'<div class="home-team">',
						'<table width="100%">',
							'<thead>',
								'<tr>',
									'<th>',
										'{home_team.team_name}',
									'</th>',
									'<tpl for="dates">',
										'<th>{[this.renderDate(values.date)]}</th>',
									'</tpl>',
									'<th>',
										'Score',
									'</th>',
								'</tr>',
							'</thead>',
							'<tbody>',
								'<tpl for="home_team.members">',
									'<tr>',
										'<td class="member-name">',
											'<a href="/mypage?id={user_id}">{first_name} {last_name}</a>',
										'</td>',
										'<tpl for="stats">',
											'<td class="{[this.createDateClass(values.date)]}">',
												'{value}',
											'</td>',
										'</tpl>',
										'<td>',
											'{[this.computeAverage(values.stats)]}',
										'</td>',
									'</tr>',
								'</tpl>',
							'</tbody>',
						'</table>',
						'<div class="clear"></div>',
					'</div>',
					'<div class="away-team">',
						'<table width="100%">',
							'<thead>',
								'<tr>',
									'<th>',
										'{away_team.team_name}',
									'</th>',
									'<tpl for="dates">',
										'<th>{[this.renderDate(values.date)]}</th>',
									'</tpl>',
									'<th>',
										'Score',
									'</th>',
								'</tr>',
							'</thead>',
							'<tbody>',
								'<tpl for="away_team.members">',
									'<tr>',
										'<td class="member-name">',
											'<a href="/mypage?id={user_id}">{first_name} {last_name}</a>',
										'</td>',
										'<tpl for="stats">',
											'<td class="{[this.createDateClass(values.date)]}">',
												'{value}',
											'</td>',
										'</tpl>',
										'<td>',
											'{[this.computeAverage(values.stats)]}',
										'</td>',
									'</tr>',
								'</tpl>',
							'</tbody>',
						'</table>',
						'<div class="clear"></div>',
					'</div>',
				'</div>',
			'</div>',
			{
				renderDate: Ext.util.Format.dateRenderer('M jS'),
				createDateClass: function(date){
					return 'league-game-details-date-' + Ext.Date.format(new Date(date), 'n-j-y');
				},
				computeAverage: function(records){
					var total = 0;
					var count = 0;
					var today = new Date();
					Ext.each(records, function(record){
						//Dont compute dates greater than today
						var date = new Date(record.date);
						var value = parseInt(record.value);
						if(date <= today && value){
							total += value;
							count++;
						}
					}, this);
					if(count){
						return Math.ceil(total / count);
					}
					return 0;
				}
			}
		);
		this.gameContainer = new Ext.panel.Panel({
			scope: this,
			border: false,
			html: '',
			autoScroll: true
		});
		
		this.gameWindow = Ext.create('TMS.ActionWindow', {
			scope: this,
			autoShow: false,
			layout: 'fit',
			title: 'Game Details',
			frame: false,
			items: [this.gameContainer],
			closeAction: 'hide',
			modal: true,
			resizable: false
		});
		this.gameWindow.on('beforeshow', function(){
			this.gameWindow.setWidth(Ext.Element.getViewportWidth() * .7);
			this.gameWindow.setHeight(Ext.Element.getViewportHeight() * .7);
		}, this);

		//Listeners
		this.gameView.on('selectionchange', function(view, records, options){
			if(!records.length){
				return;
			}
			
			//Get the record
			var record = records[0];
			
			//show spinner
			var opts = {
				lines: 10, // The number of lines to draw
				length: 0, // The length of each line
				width: 5, // The line thickness
				radius: 10, // The radius of the inner circle
				color: '#fff', // #rbg or #rrggbb
				speed: 1, // Rounds per second
				trail: 100, // Afterglow percentage
				shadow: true // Whether to render a shadow
			};
			var spinner = new Spinner(opts).spin(this.gameView.getNode(record));
			
			Ext.Ajax.request({
				scope: this,
				url: '/at-ajax/modules/league/game/details',
				params: {
					game_id: record.get('game_id')
				},
				success: function(r){
					var response = Ext.decode(r.responseText);
					this.gameContainer.update(this.gameDetailsTemplate.apply(response.record), false, Ext.bind(function(){
						return;
						//Transform into grids
						var tables = this.gameContainer.getEl().select('table').elements;
						Ext.each(tables, function(table){
							table = Ext.get(table);
							var grid = Ext.create('Ext.ux.grid.TransformGrid', table.dom.id, {
								stripeRows: true,
								height: table.getHeight()
							});
							grid.render();
						}, this);
					}, this));
					this.gameWindow.show();
					spinner.stop();
					
					//Add class to todays date
					var selector = '.' + this.gameDetailsTemplate.createDateClass(new Date(), 'n/j/Y');
					this.gameContainer.getEl().select(selector).each(function(el){
						el.addCls('active-date');
					}, this);
				}
			});
		}, this);
	}
});
Ext.define('TMS.mypage.dashboard.Standings', {
	extend: 'Ext.panel.Panel',
	
	//Requires
	requires:[
		'TMS.league.store.Season',
		'TMS.league.grid.Standings'
	],
	
	//Config
	layout: 'fit',

	//Init Functions
	initComponent: function(){
		this.init();
		this.callParent(arguments);
	},
	
	init: function(){
		this.items = [];
		this.dockedItems = [];
		
		this.initToolbar();
		this.initSeasonCombo();
		this.initStandingsGrid();
	},
	
	initToolbar: function(){
		this.toolbar = new Ext.toolbar.Toolbar({
			scope: this,
			docked: 'top'
		});
		
		this.dockedItems.push(this.toolbar);
	},
	
	initSeasonCombo: function(){
		this.seasonCombo = Ext.create('Ext.form.ComboBox', {
			fieldLabel: 'Season',
			store: Ext.create('TMS.league.store.Season'),
			queryMode: 'local',
			displayField: 'title',
			valueField: 'season_id'
		});
		this.toolbar.add(this.seasonCombo);
		
		this.seasonCombo.on('select', function(field, records, options){
			if(!records.length){
				return;
			}
			
			var record = records[0];
			this.standingsGrid.store.load({
				params:{
					season_id: record.get('season_id')
				}
			});
		}, this);
	},
	
	initStandingsGrid: function(){
		this.standingsGrid = Ext.create('TMS.league.grid.Standings', {
			scope: this
		});
		this.items.push(this.standingsGrid);
	}
});
Ext.define('TMS.mypage.dashboard.Stats', {
	extend: 'Ext.panel.Panel',
	
	//Requires
	requires:[
		'Ext.ux.form.field.RealComboBox',
		'TMS.mypage.Util',
		'TMS.mypage.filter.Filter',
		'TMS.mypage.user.Info',
		'TMS.mypage.charts.Compare',
		'TMS.mypage.user.Overview'
	],
	
	//Config
	userProcessingPage: '/at-ajax/modules/stats/user/',
	charts: {},
	filter: {},
	layout: 'column',
	
	//Init Functions
	initComponent: function(){
		this.init();
		this.callParent(arguments);
	},
	
	init: function(){
		this.items = [];
		
		//Init the containers
		this.initLeft();
		this.initCenter();
		
		this.initFilter();
		this.initUserSelect();
		this.initUserInfo();
		this.initChartPanel();
		this.initTypeMenu();
		this.initCompareCharts();
		this.initUserOverview();
	},
	
	initLeft: function(){
		this.left = new Ext.panel.Panel({
			scope: this,
			width: 210,
			border: false,
			unstyled: true,
			margin: '0 10 0 0'
		});
		this.items.push(this.left);
	},
	
	initCenter: function(){
		this.center = new Ext.panel.Panel({
			scope: this,
			columnWidth: 1,
			border: true,
			unstyled: true
		});
		this.items.push(this.center);
	},
	
	initFilter: function(){
		this.filterPanel = Ext.create('TMS.mypage.filter.Filter', {
			scope: this,
			border: false,
			unstyled: true
		});
		this.center.add(this.filterPanel);
	},
	
	initUserSelect: function(){
		var params = this.getParams();
		
		this.userStore = new Ext.data.Store({
			fields: [
				'id',
				'name',
				'image'
			],
			proxy: {
				type: 'ajax',
				url : this.userProcessingPage + 'list',
				reader: {
					type: 'json',
					root: 'records'
				}
			}
		});
		
		this.userSelect = new Ext.ux.form.field.RealComboBox({
			displayField: 'name',
			fieldLabel: 'User',
			labelWidth: 50,
			emptyText: 'Search by name...',
			typeAhead: false,
			pageSize: 10,
			minChars: 0,
			listConfig: {
				loadingText: 'Searching...',
				emptyText: 'No users were found.',
				getInnerTpl: function() {
					return	'<div class="mypage-user-list-item">' +
								'<div class="image"><img src="{image}" /></div>' +
								'<div class="name">{name}</div>' +
								'<div class="clear"></div>' +
							'</div>';
				}
			},
			store: this.userStore
		});
		
		if(params.id != null){
			this.userSelect.loadFromStore({
				userId: params.id
			}, false);
		}
		
		this.userSelect.on('select', function(field, records, options){
			if(!records.length){
				return false;
			}
			var record = records[0];
			this.filterPanel.updateFilter({
				userId: record.get('id')
			});
		}, this);
		
		this.filterPanel.insert(0, this.userSelect);
	},
	
	initUserInfo: function(){
		this.userInfo = Ext.create('TMS.mypage.user.Info');
		this.left.add(this.userInfo);
		
		var getParams = this.getParams();
		var params = {};
		if(getParams.id != null){
			params.userId = getParams.id;
		}
		
		this.userInfo.on('afterrender', function(){
			Ext.Ajax.request({
				scope: this,
				url: this.userProcessingPage + 'info',
				params: params,
				success: function(r){
					var response = Ext.decode(r.responseText);
					this.userInfo.update(response.record);
				}
			});
		}, this);
		
		this.filterPanel.on('filter', function(panel, filter, options){
			Ext.Ajax.request({
				scope: this,
				url: this.userProcessingPage + 'info',
				params: filter,
				success: function(r){
					var response = Ext.decode(r.responseText);
					this.userInfo.update(response.record);
				}
			});
		}, this);
	},
	
	initChartPanel: function(){
		this.chartPanel = new Ext.panel.Panel({
			height: 300,
			title: 'Points',
			layout: {
				type: 'card',
				deferredRender: true
			}
		});
		this.center.add(this.chartPanel);
		
		this.chartPanel.on('afterrender', function(){
			var chart = this.initChartType({
				title: 'Points',
				field: 'points'
			});
			this.chartPanel.getLayout().setActiveItem(0);
			chart.store.load();
		}, this);
	},
	
	initTypeMenu: function(){
		this.typeMenu = new Ext.menu.Menu();
		
		this.chartPanel.on('afterrender', function(){
			if(this.chartPanel.header == null){
				return false;
			}

			//create the menu button
			this.typeButton = new Ext.button.Button({
				text: 'Stat Type (Points)',
				icon: '/resources/icons/bar-chart-16.png',
				menu: this.typeMenu
			});

			this.chartPanel.header.add(this.typeButton);
			this.chartPanel.header.doComponentLayout();
		}, this);
	},
	
	initCompareCharts: function(){
		Ext.each(TMS.mypage.Util.getStatTypes(), function(type){
			//Add a menu item
			this.typeMenu.add({
				scope: this,
				text: type.title,
				type: type,
				icon: '/resources/icons/bar-chart-32.png',
				handler: function(button){
					if(this.charts[button.type.field] == null){
						this.initChartType(button.type);
					}
					this.chartPanel.getLayout().setActiveItem(this.charts[button.type.field]);
					
					//Update the type button
					this.typeButton.setText('Stat Type (' + button.type.title + ')');
					this.chartPanel.header.doLayout();
					
					//Update the chart panel title
					this.chartPanel.setTitle(button.type.title);
				}
			});
		}, this);
	},
	
	initChartType: function(type){
		
		//Create the chart
		var chart = Ext.create('TMS.mypage.charts.Compare', {
			chartType: type.field,
			chartTypeTitle: type.title,
			width: this.chartPanel.getWidth(),
			height: this.chartPanel.getHeight()
		});
		
		//Add the filters
		var params = this.getParams();
		if(params.id != null){
			chart.store.proxy.extraParams.userId = params.id;
		}
		
		//listen for filter change
		this.filterPanel.on('filter', function(panel, filter, options){
			Ext.apply(options.chart.store.proxy.extraParams, filter);
			if(options.chart.rendered && this.chartPanel.getLayout().getActiveItem() == options.chart.ownerCt){
				options.chart.store.load();
			}
		}, this, {chart: chart});
		
		//Create the chart panel
		var chartPanel = new Ext.panel.Panel({
			scope: this,
			border: false,
			unstyled: true,
			chart: chart,
			bodyPadding: 10
		});
		
		chartPanel.on('afterrender', function(panel){
			panel.chart.setWidth(panel.getWidth() - 20);
			panel.chart.setHeight(this.chartPanel.getHeight() - 50);
			panel.add(panel.chart);
			panel.doComponentLayout();
			panel.chart.store.load();
		}, this, {single: true});
		
		this.charts[type.field] = chartPanel;
		this.chartPanel.add(chartPanel);
		return chart;
	},
	
	initUserOverview: function(){
		this.userOverviewPanel = new Ext.panel.Panel({
			scope: this,
			border: false,
			margin: '10 0 0 0'
		});
		this.center.add(this.userOverviewPanel);
		
		this.userOverview = Ext.create('TMS.mypage.user.Overview');
		this.userOverviewPanel.add(this.userOverview);
		
		//Add the filters
		var params = this.getParams();
		if(params.id != null){
			this.userOverview.store.proxy.extraParams.userId = params.id;
		}
		
		this.userOverview.store.on('load', function(){
			this.userOverviewPanel.doLayout();
		}, this);
		
		this.userOverview.on('afterrender', function(){
			this.userOverview.store.load();
		}, this);
		
		this.filterPanel.on('filter', function(panel, filter, options){
			Ext.apply(this.userOverview.store.proxy.extraParams, filter);
			this.userOverview.store.load();
		}, this);
	},
	
	getParams: function(){
		var parts = location.href.split('?');
		var params = {};
		if(parts.length > 1){
			params = Ext.Object.fromQueryString(parts[1]);
		}
		return params;
	}
});

Ext.define('TMS.mypage.dashboard.Teams', {
	extend: 'Ext.panel.Panel',
	
	//Requires
	requires:[
		'TMS.league.view.Team'
	],
	
	//Config
	layout: 'border',
	
	//Init Functions
	initComponent: function(){
		this.init();
		this.callParent(arguments);
	},
	
	init: function(){
		this.items = [];
		
		//Containers
		this.initLeft();
		this.initCenter();
		
		//Views
		this.initTeamView();
		this.initTeamDetails();
	},
	
	initLeft: function(){
		this.left = new Ext.panel.Panel({
			scope: this,
			region: 'west',
			width: 250,
			autoScroll: true
		});
		this.items.push(this.left);
	},
	
	initCenter: function(){
		this.center = new Ext.panel.Panel({
			scope: this,
			layout: 'fit',
			region: 'center',
			border: false
		});
		this.items.push(this.center);
	},
	
	initTeamView: function(){
		this.teamView = Ext.create('TMS.league.view.Team', {
			scope: this
		});
		this.left.add(this.teamView);
		
		//Listeners
		this.teamView.store.on('load', function(){
			this.left.doLayout();
		}, this);
		
		this.teamView.store.on('load', function(store, records){
			var parts = location.href.split('?');
			var record = records[0];
			if(parts.length){
				var params = Ext.Object.fromQueryString(parts[1]);
				if(params.id != null){
					record = this.teamView.store.getAt(this.teamView.store.find('league_team_id', params.id));
				}
			}
			
			//Select a record if not null
			if(record != null){
				this.teamView.select(record);
				this.teamView.getNode(record).scrollIntoView(this.left.body);
			}
		}, this, {single: true});
	},
	
	initTeamDetails: function(){
		this.teamDetailsTemplate = new Ext.XTemplate(
			'<div class="league-team-details">',
				'<div class="league-team-details-header">',
					'<div class="image"><img src="{team_pic}" /></div>',
					'<div class="name">{team_name}</div>',
					'<div class="record">{[this.computeRecord(values)]}</div>',
				'</div>',
				'<div class="sub-header">Schedule</div>',
				'<div class="schedule">',
					'<table width="100%">',
						'<thead>',
							'<tr>',
								'<th>',
									'Week',
								'</th>',
								'<th>',
									'Date',
								'</th>',
								'<th>',
									'Opponent',
								'</th>',
								'<th>',
									'Result',
								'</th>',
							'</tr>',
						'</thead>',
						'<tbody>',
							'<tpl for="schedule">',
								'<tr>',
									'<td>',
										'{title}',
									'</td>',
									'<td>',
										'{[this.renderGameDate(values.start_date)]} - {[this.renderGameDate(values.end_date)]}',
									'</td>',
									'<td>',
										'{[this.getOpponent(values, parent)]}',
									'</td>',
									'<td>',
										'{[this.getResult(values, parent)]}',
									'</td>',
								'</tr>',
							'</tpl>',
						'</tbody>',
					'</table>',
				'</div>',
				'<div class="sub-header" style="margin-top: 10px;">Roster</div>',
				'<div class="members">',
					'<table width="100%">',
						'<thead>',
							'<tr>',
								'<th>',
									'Rank',
								'</th>',
								'<th>',
									'Name',
								'</th>',
								'<th>',
									'Joined',
								'</th>',
							'</tr>',
						'</thead>',
						'<tbody>',
							'<tpl for="members">',
								'<tr>',
									'<td width="40">',
										'{rank}',
									'</td>',
									'<td>',
										'{first_name} {last_name}',
									'</td>',
									'<td>',
										'{[this.renderDate(values.created_at)]}',
									'</td>',
								'</tr>',
							'</tpl>',
						'</tbody>',
					'</table>',
				'</div>',
			'</div>',
			{
				renderGameDate: Ext.util.Format.dateRenderer('M jS'),
				renderDate: Ext.util.Format.dateRenderer('F j, Y'),
				getOpponent: function(values, parent){
					if(values.home_team_id != parent.league_team_id){
						return values.home_team_name;
					}
					else{
						return values.away_team_name;
					}
				},
				getResult: function(values, parent){
					var result = "";
					if(parseInt(values.winning_team_id)){
						if(values.winning_team_id == parent.league_team_id){
							result = '<span style="color: green">W</span>';
						}
						else{
							result = '<span style="color: red">L</span>';
						}
					}
					
					return Ext.String.format(
						"{0} ({1} - {2})",
						result,
						values.home_score,
						values.away_score
					);
				},
				computeRecord: function(values){
					//Loop through schedule and compute record
					var wins = 0;
					var losses = 0;
					
					Ext.each(values.schedule, function(game){
						if(game.winning_team_id == values.league_team_id){
							wins++;
						}
						if(game.losing_team_id == values.league_team_id){
							losses++;
						}
					});
					
					return Ext.String.format(
						"({0} - {1})",
						wins,
						losses
					);
				}
			}
		);
			
		this.teamDetails = new Ext.panel.Panel({
			scope: this,
			border: false,
			bodyPadding: 10,
			autoScroll: true
		});
		this.center.add(this.teamDetails);
		
		//Listeners
		this.teamView.on('selectionchange', function(view, records, options){
			if(!records.length){
				return;
			}
			
			var record = records[0];
			this.teamDetails.update('');
			this.teamDetails.setHeight(150);
			this.teamDetails.setLoading(true);
			Ext.Ajax.request({
				scope: this,
				url: '/at-ajax/modules/league/team/details',
				params: {
					league_team_id: record.get('league_team_id')
				},
				success: function(r){
					var response = Ext.decode(r.responseText);
					this.teamDetails.update(this.teamDetailsTemplate.apply(response.record), false, Ext.bind(function(){
						return;
						//Transform into grids
						var containers = this.teamDetails.getEl().select('.members').elements;
						Ext.each(containers, function(container){
							container = Ext.get(container);
							var table = container.down('table');
							var grid = Ext.create('Ext.ux.grid.TransformGrid', table.dom.id, {
								stripeRows: true
							});
							var panel = new Ext.panel.Panel({
								scope: this,
								items:[grid],
								renderTo: container
							});
						}, this);
					}, this));
					this.teamDetails.setHeight(null);
					this.teamDetails.setLoading(false);
				}
			});
		}, this);
	}
});
Ext.define('TMS.mypage.filter.Filter', {
	extend: 'Ext.panel.Panel',
	
	//Config
	layout: 'hbox',
	defaults:{
		margin: 2,
		flex: 1
	},
	filter: {},
	
	initComponent: function(){
		this.items = [];
		this.filter = {};
		this.init();
		this.callParent(arguments);
	},
	
	//Init Functions
	init: function(){
		this.initStartDate();
		this.initStopDate();
	},
	
	initStartDate: function(){
		//Create the start date field
		this.startDate = new Ext.form.field.Date({
			fieldLabel: 'Start Date',
			labelWidth: 70,
			emptyText: 'Select start date...'
		});
		
		//Listen for when the date is changed
		this.startDate.on('select', function(field, value){
			//If the stop date value is null set it to one week ahead
			if(this.stopDate.getValue() == null){
				var date = new Date(value);
				date.setDate(date.getDate() + 7);
				this.stopDate.setValue(Ext.Date.format(date, 'n/j/Y'));
			}
			//or if the start date is after the stop date
			else{
				var startDate = new Date(value);
				var stopDate = new Date(this.stopDate.getValue());
				if(startDate >= stopDate){
					startDate.setDate(startDate.getDate() + 7);
					this.stopDate.setValue(Ext.Date.format(startDate, 'n/j/Y'));
				}
			}
			
			//Update the filter
			this.updateFilter({
				startDate: this.startDate.getValue(),
				stopDate: this.stopDate.getValue()
			});
			
		}, this);
		
		this.items.push(this.startDate);
	},
	
	initStopDate: function(){
		//Create the stop date
		this.stopDate = new Ext.form.field.Date({
			fieldLabel: 'End Date',
			labelWidth: 70,
			emptyText: 'Select stop date...'
		});
		
		//Listen for when the date is changed
		this.stopDate.on('select', function(field, value){
			//Check to see if the start date is null
			if(this.startDate.getValue() == null){
				var date = new Date(value);
				date.setDate(date.getDate() - 7);
				this.startDate.setValue(Ext.Date.format(date, 'n/j/Y'));
			}
			//or if the stop date is before the start date
			else{
				var startDate = new Date(this.startDate.getValue());
				var stopDate = new Date(value);
				if(stopDate <= startDate){
					stopDate.setDate(stopDate.getDate() - 7);
					this.startDate.setValue(Ext.Date.format(stopDate, 'n/j/Y'));
				}
			}
			
			//Update the filter
			this.updateFilter({
				startDate: this.startDate.getValue(),
				stopDate: this.stopDate.getValue()
			});
			
		}, this);
		
		this.items.push(this.stopDate);
	},
	
	updateFilter: function(filter){
		Ext.apply(this.filter, filter);
		this.fireEvent('filter', this, this.filter);
	}
});
Ext.define('TMS.mypage.grids.Branch', {
	extend: 'Ext.grid.Panel',
	
	//Config
	processingPage: '/at-ajax/modules/stats/branch/grid',
	branchListPage: '/at-ajax/modules/stats/branch/list',
	
	initComponent: function(){
		this.init();
		this.callParent(arguments);
	},
	
	//Init Functions
	init: function(){
		this.initListeners();
		this.initTbar();
		this.initColumns();
		this.initStore();
		this.initFilters();
	},
	
	initListeners: function(){
		this.on('afterrender', function(){
			this.store.load();
		}, this);
	},
	
	initTbar: function(){
		//Tbar
		this.tbar = new Ext.toolbar.Toolbar({
			scope: this,
			items:[]
		});
	},
	
	initColumns: function(){
		this.columns = [{
			header: 'Name',
			dataIndex: 'name',
			flex: 1
		},{
			header: 'Value',
			dataIndex: 'value'
		}];
	},
	
	initStore: function(){
		this.store = new Ext.data.Store({
			fields: [
				'name',
				'value',
			],
			proxy: {
				type: 'ajax',
				url : this.processingPage,
				reader: {
					type: 'json',
					root: 'records'
				}
			}
		});
	},
	
	initFilters: function(){
		//Create the team filter
		this.branchStore = new Ext.data.Store({
			fields: [
				'id',
				'name',
			],
			proxy: {
				type: 'ajax',
				url : this.branchListPage,
				reader: {
					type: 'json',
					root: 'records'
				}
			}
		})
		this.branchSelect = new Ext.form.field.ComboBox({
			scope: this,
			fieldLabel: 'Branch',
			labelWidth: 50,
			store: this.branchStore,
			displayField: 'name',
			valueField: 'id'
		});
		this.branchSelect.on('select', function(field, records, options){
			var record = null;
			if(records.length){
				record = records[0];
				this.store.proxy.extraParams.branchId = record.get('id');
				this.store.load();
			}
		}, this);
		
		//Create the date filter
		this.dateFilter = new Ext.form.field.Date({
			scope: this,
			fieldLabel: 'Date',
			labelWidth: 50,
			emptyText: 'Select date...'
		});
		this.dateFilter.on('change', function(field, value){
			this.store.proxy.extraParams.date = value;
			this.store.load();
		}, this);
		
		
		//Create the refresh button
		this.refreshButton = new Ext.button.Button({
			scope: this,
			text: "Refresh",
			icon: '/resources/icons/refresh-24.png',
			handler: function(){
				this.store.load();
			}
		});
		
		//Add items to the toolbar
		this.tbar.add(this.branchSelect, this.dateFilter);
	}
	
});
Ext.define('TMS.mypage.grids.Stats', {
	extend: 'Ext.grid.Panel',
	processingPages: {
		individual: '/at-ajax/modules/stats/leaderboard/individual',
		team: '/at-ajax/modules/stats/leaderboard/team',
		branch: '/at-ajax/modules/stats/leaderboard/branch'
	},
	
	//Config
	initComponent: function(){
		this.init();
		this.callParent(arguments);
	},
	
	//Init Functions
	init: function(){
		this.initColumns();
		this.initStore();
		this.initPager();
	},
	
	initPager: function(){
		//Tbar
		this.tbar = new Ext.toolbar.Paging({
			store: this.store,
			displayInfo: true
	   });
	},
	
	initColumns: function(){
		this.columns = [{
			header: 'Rank',
			dataIndex: 'rank',
			width: 50
		},{
			dataIndex: 'image',
			width: 50,
			renderer: function(value, options, record){
				return '<img src="' + value + '" width="30" />';
			}
		},{
			header: 'Name',
			dataIndex: 'name',
			flex: 1,
			renderer: function(value, options, record){
				if(record.get('url').length){
					return Ext.String.format(
						'<a href="{0}">{1}</a>',
						record.get('url'),
						value
					);
				}
				else{
					return value;
				}
			}
		},{
			header: 'Value',
			dataIndex: 'value'
		}];
	},
	
	initStore: function(){
		this.store = new Ext.data.Store({
			fields: [
				'name',
				'url',
				'image',
				'value',
				'rank'
			],
			remoteSort: true,
			remoteFilter: true
		});
		
		this.setProxy(this.processingPages.individual);
		
		this.on('afterrender', function(){
			this.store.load();
		}, this);
		
	},
	
	setProxy: function(url){
		this.store.setProxy({
			type: 'ajax',
			url : url,
			pageSize: 50,
			reader: {
				type: 'json',
				root: 'records'
			}
		});
	}
	
});
Ext.define('TMS.mypage.grids.Team', {
	extend: 'Ext.grid.Panel',
	
	//Config
	processingPage: '/at-ajax/modules/stats/team/grid',
	teamListPage: '/at-ajax/modules/stats/team/list',
	
	initComponent: function(){
		this.init();
		this.callParent(arguments);
	},
	
	//Init Functions
	init: function(){
		this.initListeners();
		this.initTbar();
		this.initColumns();
		this.initStore();
		this.initFilters();
	},
	
	initListeners: function(){
		this.on('afterrender', function(){
			this.store.load();
		}, this);
	},
	
	initTbar: function(){
		//Tbar
		this.tbar = new Ext.toolbar.Toolbar({
			scope: this,
			items:[]
		});
	},
	
	initColumns: function(){
		this.columns = [{
			header: 'Name',
			dataIndex: 'name',
			flex: 1
		},{
			header: 'Value',
			dataIndex: 'value'
		}];
	},
	
	initStore: function(){
		this.store = new Ext.data.Store({
			fields: [
				'name',
				'value',
			],
			proxy: {
				type: 'ajax',
				url : this.processingPage,
				reader: {
					type: 'json',
					root: 'records'
				}
			}
		});
	},
	
	initFilters: function(){
		//Create the team filter
		this.teamStore = new Ext.data.Store({
			fields: [
				'id',
				'name',
			],
			proxy: {
				type: 'ajax',
				url : this.teamListPage,
				reader: {
					type: 'json',
					root: 'records'
				}
			}
		})
		this.teamSelect = new Ext.form.field.ComboBox({
			scope: this,
			fieldLabel: 'Team',
			labelWidth: 50,
			store: this.teamStore,
			displayField: 'name',
			valueField: 'id'
		});
		this.teamSelect.on('select', function(field, records, options){
			var record = null;
			if(records.length){
				record = records[0];
				this.store.proxy.extraParams.teamId = record.get('id');
				this.store.load();
			}
		}, this);
		
		//Create the date filter
		this.dateFilter = new Ext.form.field.Date({
			scope: this,
			fieldLabel: 'Date',
			labelWidth: 50,
			emptyText: 'Select date...'
		});
		this.dateFilter.on('change', function(field, value){
			this.store.proxy.extraParams.date = value;
			this.store.load();
		}, this);
		
		
		//Create the refresh button
		this.refreshButton = new Ext.button.Button({
			scope: this,
			text: "Refresh",
			icon: '/resources/icons/refresh-24.png',
			handler: function(){
				this.store.load();
			}
		});
		
		//Add items to the toolbar
		this.tbar.add(this.teamSelect, this.dateFilter);
	}
	
});
Ext.define('TMS.mypage.user.Grid', {
	extend: 'Ext.grid.Panel',
	
	//Config
	processingPage: '/at-ajax/modules/stats/user/grid',
	
	initComponent: function(){
		this.init();
		this.callParent(arguments);
	},
	
	//Init Functions
	init: function(){
		this.initListeners();
		this.initColumns();
		this.initStore();
	},
	
	initListeners: function(){
		this.on('afterrender', function(){
			this.store.load();
		}, this);
	},
	
	initColumns: function(){
		this.columns = [{
			header: 'Name',
			dataIndex: 'name',
			flex: 1
		},{
			header: 'Value',
			dataIndex: 'value'
		}];
	},
	
	initStore: function(){
		this.store = new Ext.data.Store({
			fields: [
				'name',
				'value'
			],
			proxy: {
				type: 'ajax',
				url : this.processingPage,
				reader: {
					type: 'json',
					root: 'records'
				}
			}
		});
	}
});
Ext.define('TMS.mypage.user.Info', {
	extend: 'Ext.container.Container',
	
	//Config
	border: false,
	unstyled: true,
	cls: 'mypage-user-info',
	height: 250,
	
	initComponent: function(){
		this.init();
		this.callParent(arguments);
	},
	
	//Init Functions
	init: function(){
		this.items = [];
		this.initInfoTemplate();
	},
	
	initInfoTemplate: function(){
		this.infoTemplate = new Ext.XTemplate(
			'<div class="name">',
				'{name} | {team_name}',
			'</div>',
			'<div class="branch">',
				'{branch_name}',
			'</div>',
			'<div class="image">',
				'<img src="{image}" />',
			'</div>',
			'<div class="points">',
				'<span class="points-text">Points: </span>{points}',
			'</div>',
			'<div class="rank">',
				'<span class="rank-text">Rank: </span>{[Ext.util.Inflector.ordinalize(values.rank)]} of {total} ({[this.getPercentile(values.rank, values.total)]})',
			'</div>',
			{
				getPercentile: function(rank, total){
					var percent = Math.floor((rank/total) * 100);
					var verb = "Top";
					if(percent > 50){
						verb = "Bottom";
						percent = 100 - percent;
						
						//Round Up
						if(percent > 10){
							percent = ((Math.ceil((percent/10))) * 10);
						}
					}
					else{
						//Round down
						if(percent > 10){
							percent = (Math.floor((percent/10))) * 10;
						}
					}
					
					//check for 0
					if(percent == 0){
						percent = 1;
					}
					
					return verb + " " + percent + "%";
				}
			}
		);
	},
	
	update: function(data){
		this.callParent([this.infoTemplate.apply(data)]);
	}
});
Ext.define('TMS.mypage.user.Margin', {
	extend: 'Ext.panel.Panel',
	
	//Config
	chartHeight: 300,
	autoHeight: true,
	
	initComponent: function(){
		this.init();
		this.callParent(arguments);
	},
	
	//Init Functions
	init: function(){
		this.initListeners();
		this.initTbar();
		this.initChart();
		this.initFilters();
	},
	
	initListeners: function(){
	},
	
	initTbar: function(){
		//Tbar
		this.tbar = new Ext.toolbar.Toolbar({
			scope: this,
			items:[]
		});
	},
	
	initFilters: function(){
		this.initView();
	},
	
	initView: function(){
		//Create the view menu
		this.viewMenu = new Ext.menu.Menu();
		
		//Loop through the series and add a disable/enable checkbox
		this.chart.on('afterrender', function(){
			Ext.each(this.chart.series.items, function(series){
				var menuItem = new Ext.menu.CheckItem({
					scope: this,
					text: series.title,
					checked: true,
					series: series,
					checkHandler: function(item, checked){
						if(checked){
							series.showAll();
						}
						else{
							series.hideAll();
						}
						this.chart.doComponentLayout();
					}
				});
				this.viewMenu.add(menuItem);
			}, this);
			this.viewMenu.doComponentLayout();
		}, this);
		
		//Create the view button
		this.viewButton = new Ext.button.Button({
			scope: this,
			text: "View",
			menu: this.viewMenu
		});
		this.tbar.add(this.viewButton);
	},
	
	initChart: function(){
		this.chart = new MyPage.charts.Margin({});
		this.on('afterrender', function(){
			this.chart.setWidth(this.getWidth());
			this.chart.setHeight(this.chartHeight);
			this.add(this.chart);
			this.doLayout();
			this.chart.store.load();
		}, this);
	}
	
});
Ext.define('TMS.mypage.user.Overview', {
	extend:'Ext.view.View',
	
	//Config
	processingPage: '/at-ajax/modules/stats/user/grid',
	multiSelect: false,
	trackOver: true,
	deferEmptyText:false,
	overItemCls: 'mypage-user-overview-item-over',
	itemSelector: '.mypage-user-overview-item',
	emptyText: 'No stats...',
	
	//Inits
	initComponent: function(){
		this.items = [];
		this.dockedItems = [];
		this.init();
		return this.callParent(arguments);
	},
	
	init: function(){
		this.initStore();
		this.initTemplate();
	},
	
	initStore: function(){
		this.store = new Ext.data.Store({
			fields: [
				'name',
				'value'
			],
			proxy: {
				type: 'ajax',
				url : this.processingPage,
				reader: {
					type: 'json',
					root: 'records'
				}
			}
		});
	},
	
	initTemplate: function(){
		this.tpl = new Ext.XTemplate(
			'<table class="mypage-user-overview-table">',
				'<tbody>',
					'<tpl for=".">',
						'<tr>',
							'<td class="name">',
								'{name}',
							'</td>',
							'<td class="value">',
								'{value}',
							'</td>',
						'</tr>',
					'</tpl>',
				'</tbody>',
			'</table>'
		);
	}
});
Ext.define('TMS.mypage.user.Stats', {
	extend: 'Ext.panel.Panel',
	
	//Requires
	requires:[
		'TMS.mypage.charts.Stats',
		'TMS.mypage.user.Overview'
	],
	
	//Config
	imageEl: false,
	chartHeight: 200,
	layout: 'column',
	bodyCls: 'header-info-panel',
	border: false,
	
	initComponent: function(){
		this.init();
		this.callParent(arguments);
	},
	
	//Init Functions
	init: function(){
		this.items = [];
		
		//Init Containers
		this.initLeftPanel();
		this.initCenterPanel();
		
		//Init Filter items
		this.initFilterPanel();
		this.initUserSelect();
		this.initDateFilters();
		
		//Init User info
		this.initInfoTemplate();
		
		//Init Chart Panels
		this.initChartToolbar();
		this.initChartStatTypes();
		this.initChartFilters();
		this.initChartPanel();
		this.initChart();
		
		//user info
		this.initImagePanel();
		this.initUserOverview();
	},
	
	initInfoTemplate: function(){
		this.infoTemplate = new Ext.XTemplate(
			'<div class="name">',
				'{name} | {team_name}',
			'</div>',
			'<div class="branch">',
				'{branch_name}',
			'</div>',
			'<div class="image">',
				'<img src="{image}" />',
			'</div>'
		);
	},
	
	initLeftPanel: function(){
		this.leftPanel = new Ext.panel.Panel({
			scope: this,
			unstyled: true,
			border: false,
			width: 210,
			margin: '0 10 0 0'
		});
		this.items.push(this.leftPanel);
	},
	
	initCenterPanel: function(){
		this.centerPanel = new Ext.panel.Panel({
			scope: this,
			unstyled: true,
			border: false,
			columnWidth: 1
		});
		this.items.push(this.centerPanel);
	},
	
	initFilterPanel: function(){
		this.filterPanel = new Ext.panel.Panel({
			scope: this,
			title: 'Filter',
			layout: 'hbox',
			collapsed: true,
			collapsible: true,
			titleCollapse: true,
			autoHeight: true,
			defaults:{
				margin: 2,
				flex: 1
			}
		});
		this.centerPanel.add(this.filterPanel);
	},
	
	initUserSelect: function(){
		var parts = location.href.split('?');
		var params = {};
		if(parts.length){
			params = Ext.Object.fromQueryString(parts[1]);
		}
		console.log(params);
		
		this.userStore = new Ext.data.Store({
			fields: [
				'id',
				'name',
				'image'
			],
			proxy: {
				type: 'ajax',
				url : this.userProcessingPage + 'list',
				reader: {
					type: 'json',
					root: 'records'
				}
			}
		});
		
		this.userSelect = new Ext.ux.form.field.RealComboBox({
			value: params.id,
			displayField: 'name',
			fieldLabel: 'User',
			labelWidth: 50,
			emptyText: 'Search by name...',
			typeAhead: false,
			pageSize: 10,
			minChars: 0,
			listConfig: {
				loadingText: 'Searching...',
				emptyText: 'No users were found.',
				getInnerTpl: function() {
					return	'<div class="mypage-user-list-item">' +
								'<div class="image"><img src="{image}" /></div>' +
								'<div class="name">{name}</div>' +
								'<div class="clear"></div>' +
							'</div>';
				}
			},
			store: this.userStore
		});
		
		this.userSelect.on('select', function(field, records, options){
			if(!records.length){
				return false;
			}
			var record = records[0];
			this.updateFilter({
				userId: record.get('id')
			});
		}, this);
		
		this.filterPanel.add(this.userSelect);
	},
	
	initDateFilters: function(){
		
		//Create the start date field
		this.startDate = new Ext.form.field.Date({
			fieldLabel: 'Start Date',
			labelWidth: 70,
			emptyText: 'Select start date...'
		});
		
		//Listen for when the date is changed
		this.startDate.on('select', function(field, value){
			//If the stop date value is null set it to one week ahead
			if(this.stopDate.getValue() == null){
				var date = new Date(value);
				date.setDate(date.getDate() + 7);
				this.stopDate.setValue(Ext.Date.format(date, 'n/j/Y'));
			}
			//or if the start date is after the stop date
			else{
				var startDate = new Date(value);
				var stopDate = new Date(this.stopDate.getValue());
				if(startDate >= stopDate){
					startDate.setDate(startDate.getDate() + 7);
					this.stopDate.setValue(Ext.Date.format(startDate, 'n/j/Y'));
				}
			}
			
			//Update the filter
			this.updateFilter({
				startDate: this.startDate.getValue(),
				stopDate: this.stopDate.getValue()
			});
			
		}, this);
		
		//Create the stop date
		this.stopDate = new Ext.form.field.Date({
			fieldLabel: 'End Date',
			labelWidth: 70,
			emptyText: 'Select stop date...'
		});
		
		//Listen for when the date is changed
		this.stopDate.on('select', function(field, value){
			//Check to see if the start date is null
			if(this.startDate.getValue() == null){
				var date = new Date(value);
				date.setDate(date.getDate() - 7);
				this.startDate.setValue(Ext.Date.format(date, 'n/j/Y'));
			}
			//or if the stop date is before the start date
			else{
				var startDate = new Date(this.startDate.getValue());
				var stopDate = new Date(value);
				if(stopDate <= startDate){
					stopDate.setDate(stopDate.getDate() - 7);
					this.startDate.setValue(Ext.Date.format(stopDate, 'n/j/Y'));
				}
			}
			
			//Update the filter
			this.updateFilter({
				startDate: this.startDate.getValue(),
				stopDate: this.stopDate.getValue()
			});
			
		}, this);
		
		
		//Add the dates to the toolbar
		this.filterPanel.add(
			this.startDate,
			this.stopDate
		);
	},
	
	initChartToolbar: function(){
		this.chartToolbar = new Ext.toolbar.Toolbar({
			scope: this,
			items: []
		});
	},
	
	initChartFilters: function(){
		this.refreshButton = new Ext.button.Button({
			scope: this,
			text: "Refresh",
			icon: "/resources/icons/refresh-16.png",
			handler: function(){
				this.chart.store.load();
			}
		});
		
		this.chartToolbar.add("->", this.refreshButton);
	},
	
	initChartStatTypes: function(){
		//Create the menu
		var menu = new Ext.menu.Menu({
			scope: this
		});
		
		//create the menu button
		var menuButton = new Ext.button.Button({
			scope: this,
			text: 'Stat Type (Points)',
			icon: '/resources/icons/bar-chart-16.png',
			menu: menu
		});
		
		//Create the menu items
		Ext.each(TMS.mypage.Util.getStatTypes(), function(type){
			var menuItem = new Ext.menu.Item({
				scope: this,
				text: type.title,
				chart: this.chart,
				panel: this,
				type: type,
				parentMenu: menu,
				parentMenuButton: menuButton,
				handler: function(button){
					//Set the parent text
					button.parentMenuButton.setText('Stat Type (' + button.text + ')');
					button.panel.doComponentLayout();
					
					//Set the stores proxy to load this stat type
					this.chart.store.proxy.extraParams.type = button.type.field;
					this.chart.store.proxy.extraParams.typeName = button.type.title;
					this.chart.store.loadPage(1);
				}
			});
			menu.add(menuItem);
		}, this);
		
		this.chartToolbar.add(menuButton);
	},
	
	initChartPanel: function(){
		this.chartPanel = new Ext.panel.Panel({
			layout: 'fit',
			height: 250,
			margin: '10 0 0 0',
			tbar: this.chartToolbar
		});
		this.centerPanel.add(this.chartPanel);
	},
	
	initChart: function(){
		this.chart = Ext.create('TMS.mypage.charts.Stats', {});
		this.chartPanel.on('afterrender', function(){
			this.chart.setWidth(this.chartPanel.getWidth());
			this.chart.setHeight(this.chartHeight);
			this.chartPanel.add(this.chart);
			this.doLayout();
			this.chart.store.load();
		}, this);
	},
	
	initImagePanel: function(){
		this.imagePanel = new Ext.container.Container({
			scope: this,
			cls: 'mypage-user-info',
			unstyled: true,
			border: false,
			autoHeight: true
		});
		
		this.chart.store.on('load', function(){
			this.imagePanel.update(this.infoTemplate.apply(this.chart.store.getProxy().getReader().rawData.user));
			this.leftPanel.doLayout();
		}, this);
		
		this.leftPanel.add(this.imagePanel);
	},
	
	initUserOverview: function(){
		this.userOverviewPanel = new Ext.panel.Panel({
			scope: this,
			border: false,
			margin: '10 0 0 0'
		});
		this.centerPanel.add(this.userOverviewPanel);
		
		this.userOverview = Ext.create('TMS.mypage.user.Overview');
		this.userOverviewPanel.add(this.userOverview);
		
		this.userOverview.store.on('load', function(){
			this.userOverviewPanel.doLayout();
		}, this);
		
		this.userOverview.on('afterrender', function(){
			this.userOverview.store.load();
		}, this);
	}
	
});
Ext.define('TMS.mypage.Util', {
	extend: 'Ext.util.Observable',
	singleton: true,
	statTypes: false,
	utilProcessingPage: '/at-ajax/modules/stats/util/',
	
	getStatTypes: function(){
		if(!this.statTypes){
			Ext.Ajax.request({
				scope: this,
				async: false,
				url: this.utilProcessingPage + 'stat-types',
				success: function(r){
					var response = Ext.JSON.decode(r.responseText);
					this.statTypes = response.records;
				}
			});
		}
		
		return this.statTypes;
	}
});
Ext.define('TMS.orders.filter.Order', {
	extend: 'TMS.filter.Abstract',
	
	//Requires
	requires:[
		'Ext.ux.form.field.RealComboBox'
	],
	
	init: function(){
		this.initStatus();
		this.initCustomer();
//		this.initOrderedBy();
//		this.initBillTo();
		this.initOwner();
		this.initCarrier();
		this.initBOL();
		this.initPro();
		this.initCustomerReference();
//		this.initOrigin();
//		this.initDestination();
	},
	
	initStatus: function() {
		this.statusTypeStore = Ext.create('Ext.data.Store', {
			fields: [
				'status_id',
				'status_name'
			],
			proxy: {
				type: 'ajax',
				url: '/at-ajax/modules/tools/status-types/get-filter-list',
				reader: {
					type: 'json',
					root: 'records'
				}
			}
		});
		this.statusTypeStore.load();
		
		this.items.push({
			xtype:'realcombobox',
			queryMode:'local',
			name: 'status',
			displayField:'status_name',
			valueField:'status_id',
			fieldLabel: 'Status',
			store:this.statusTypeStore
		});
	},
	
	initCustomer: function(){
		this.items.push({
			name: 'company',
			fieldLabel: 'Customer'
		});
	},
	
	initOrderedBy: function() {
		this.items.push({
			name: 'ordered_by',
			fieldLabel: 'Ordered By'
		});
	},
	
	initBillTo: function(){
		this.items.push({
			name: 'bill_to',
			fieldLabel: 'Bill To'
		});
	},
	
	initOwner: function() {
		this.items.push({
			name: 'owner',
			fieldLabel: 'Owner'
		});
	},
	
	initCarrier: function() {
		this.items.push({
			name: 'carrier',
			fieldLabel: 'Carrier'
		});
	},
	
	initBOL: function() {
		this.items.push({
			name: 'bolNumber',
			fieldLabel: 'BOL #'
		});
	},
	
	initPro: function() {
		this.items.push({
			name: 'proNumber',
			fieldLabel: 'Pro #'
		});
	},
	
	initCustomerReference: function() {
		this.items.push({
			name: 'customerReference',
			fieldLabel: 'Customer Reference #'
		});
	},
	
	initOrigin: function() {
		this.items.push({
			name: 'origin',
			fieldLabel:' Origin'
		});
	},
	
	initDestination: function() {
		this.items.push({
			name: 'destination',
			fieldLabel:' Destination'
		});
	}
	
});
Ext.define('TMS.orders.filter.PreOrder', {
	extend: 'TMS.filter.Abstract',
	
	//Requires
	requires:[
		'Ext.ux.form.field.RealComboBox'
	],
	
	init: function(){
		this.initCustomer();
		this.initOwner();
//		this.initCarrier();
		this.initBOL();
		this.initPro();
		this.initCustomerReference();
	},
	
	initCustomer: function(){
		this.items.push({
			name: 'company',
			fieldLabel: 'Customer'
		});
	},
	
	initOwner: function() {
		this.items.push({
			name: 'owner',
			fieldLabel: 'Owner'
		});
	},
	
	initCarrier: function() {
		this.items.push({
			name: 'carrier',
			fieldLabel: 'Carrier'
		});
	},
	
	initBOL: function() {
		this.items.push({
			name: 'bolNumber',
			fieldLabel: 'BOL #'
		});
	},
	
	initPro: function() {
		this.items.push({
			name: 'proNumber',
			fieldLabel: 'Pro #'
		});
	},
	
	initCustomerReference: function() {
		this.items.push({
			name: 'customerReference',
			fieldLabel: 'Customer Reference #'
		});
	}
});
Ext.define('TMS.orders.forms.sections.Accessorial', {
	extend:'Ext.form.Panel',
	requires:[
		'Ext.ux.form.field.RealComboBox',
		'TMS.customer.lookup.Customer'
	],
	
	title:'New Accessorial',
	baseTitle:'New Accessorial',
	
	bodyStyle:{
		padding:'8px'
	},
	processingPage:'/at-ajax/modules/order/accessorial/',
	accessorial_id:0,
	margin:8,
	layout:'anchor',
	data:{},
	
	autoSave:false,
	
	initComponent: function(){
		this.items = this.items || [];
		this.dockedItems = this.dockedItems || [];
		this.tools = this.tools || [];
		this.init();
		this.callParent(arguments);
	},
	
	init: function() {
		this.initCustomTools();
		this.initSelector();
		this.initAmount();
		this.initQuantity();
		this.initCheckbox();
		this.initBillToSelector();
		this.initHidden();
		this.initListeners();
	},
	
	initCustomTools: function() {
		this.closeButton = Ext.create('Ext.panel.Tool', {
			scope: this,
			type:'close',
			tooltip: 'Remove',
			handler: function(event, toolEl, panel) {
				this.destroy();
			}
		});
		this.tools.push(this.closeButton);
	},
	
	initSelector: function() {
		this.typeSelector = Ext.create('Ext.ux.form.field.RealComboBox', {
			store:this.store,
			valueField:'AccCodeID',
			displayField:'AccCodeDesc',
			queryMode: 'local',
			hiddenName:'accessorial_id[]',
			fieldLabel:'Type'
		});
		this.items.push(this.typeSelector);
	},
	
	initAmount: function() {
		this.amount = Ext.create('Ext.form.field.Text', {
			fieldLabel:'Amount',
			name:'amount'
		})
		this.items.push(this.amount);
	},
	
	initQuantity: function() {
		this.quantity = Ext.create('Ext.form.field.Text', {
			fieldLabel:'Quantity',
			name:'quantity'
		})
		this.items.push(this.quantity);
	},
	
	initCheckbox: function() {
		this.billToCheckbox = Ext.create('Ext.form.field.Checkbox', {
			fieldLabel:'Bill separately',
			name:'billSeparately[]',
			hiddenName:'billSeparately[]'
		});
		this.items.push(this.billToCheckbox);
	},
	
	initBillToSelector: function() {
		this.billToSelector = Ext.create('TMS.customer.lookup.Customer', {
			fieldLabel:'Bill To',
			name: 'accessorial_bill_to_id',
			hiddenName: 'accessorial_bill_to_id',
			hidden:true,
			value:0
		});
		this.items.push(this.billToSelector);
	},
	
	initHidden: function() {
		this.accessorialId = Ext.create('Ext.form.field.Hidden', {
			name:'accessorialId',
			value:0
		});
		this.items.push(this.accessorialId);
	},
	
	initListeners: function() {
		this.typeSelector.on('select', function(combobox, value) {
			var rawValue = combobox.getRawValue();
			this.baseTitle = rawValue;
			this.updateTitle();
		}, this);
		
		this.amount.on('change', this.updateTotal, this);
		this.quantity.on('change', this.updateTotal, this);
		
		this.billToCheckbox.on('change', function(checkbox) {
			if (checkbox.checked) {
				this.billToSelector.show();
				this.billToSelector.setRawValue('');
				this.billToSelector.setValue(0);
			}
			else {
				this.billToSelector.hide();
			}
		}, this);
		
		this.on('afterrender', this.loadInitialData, this);
	},
	
	loadInitialData: function() {
		if (this.data.accessorial_type_id != null) {
			this.typeSelector.setValue(this.data.accessorial_type_id);
			this.typeSelector.setRawValue(this.data.accessorial_type_name);
			this.amount.setValue(this.data.accessorial_per_unit);
			this.quantity.setValue(this.data.accessorial_qty);
			if (!this.data.bill_to || this.data.bill_to_id == this.data.bill_to) {
				this.billToCheckbox.setValue(false);
			}
			else {
				this.billToCheckbox.setValue(true);
			}
			this.billToSelector.setValue(this.data.bill_to);
			this.billToSelector.setRawValue(this.data.bill_to_name);
			this.accessorialId.setValue(this.data.order_accessorial_id);
			this.updateTotal();
		}
	},
	
	updateTotal: function() {
		clearTimeout(this.updateTotalTimeout);
		this.updateTotalTimeout = setTimeout(Ext.bind(function(){
			this.updateTitle();
			this.fireEvent('updatetotal');
		}, this), 1000);
	},
	
	updateTitle: function() {
		if (this.rendered) {
			this.baseTitle = this.typeSelector.getRawValue();
		}
		else {
			this.baseTitle = this.data.accessorial_type_name;
		}
		
		this.setTitle(this.baseTitle + ' $' + this.getTotal());
	},
	
	getTotal: function() {
		var total = 0;
		
		if (this.rendered) {
			total = this.amount.getValue() * this.quantity.getValue();
		}
		else {
			total = this.data.accessorial_per_unit * this.data.accessorial_qty;
		}
		
		if (isNaN(total)) {
			total = 0;
		}
		total = total.toFixed(2);
		return parseFloat(total);
	},
	
	getValues: function() {
		var values = {
			accessorialId:this.accessorialId.getValue(),
			amount:this.amount.getValue(),
			quantity:this.quantity.getValue(),
			type:this.typeSelector.getValue(),
			billToId:this.billToSelector.getValue(),
			billToCheckbox:this.billToCheckbox.getValue()
		};
		return values;
	}
	
});
Ext.define('TMS.orders.forms.sections.Accessorials', {
	extend:'Ext.form.Panel',
	
	//Requires
	requires:[
		'Ext.ux.form.field.RealComboBox',
		'TMS.orders.forms.sections.Accessorial'
	],
	
	//Config
	autoScroll: true,
	title:'Accessorials',
	baseTitle:'Accessorials',
	processingPage:'/at-ajax/modules/order/accessorial/',
	order_id:0,
	autoSave:false,
	
	initComponent: function(){
		this.items = this.items || [];
		this.dockedItems = this.dockedItems || [];
		this.init();
		this.callParent(arguments);
	},
	
	init: function() {
		this.initToolbar();
		this.initStore();
		this.initListeners();
	},
	
	initToolbar: function() {
		this.toolbar = new Ext.toolbar.Toolbar({
			scope: this,
			dock:'top',
			items:[{
				scope: this,
				text: 'Add Accessorial',
				icon: '/resources/icons/add-16.png',
				handler: this.addAccessorial
			},{
				scope: this,
				text: 'Collapse All',
				handler: this.collapseAll
			},{
				scope: this,
				text: 'Expand All',
				handler: this.expandAll
			}]
		});
		this.dockedItems.push(this.toolbar);
	},
	
	initStore: function() {
		this.store = Ext.create('Ext.data.Store', {
			fields: [
				'AccCodeID',
				'AccCode',
				'AccCodeDesc'
			],
			proxy: {
				type: 'ajax',
				url: this.processingPage + 'get-accessorial-list',
				reader: {
					type: 'json',
					root: 'records'
				}
			}
		});
		this.store.load();
	},
	
	initListeners: function() {
		
	},
	
	addAccessorial: function(data) {
		if (data) {
			if (data.length) {
				for (var i = 0; i < data.length; i++) {
					this.addAccessorial(data[i]);
				}
				return;
			}
		}
		
		var accessorial = Ext.create('TMS.orders.forms.sections.Accessorial', {
			store:this.store,
			data:data,
			collapsible: true,
			titleCollapse: true
		});
		accessorial.on('updatetotal', this.updateTitle, this);
		accessorial.on('destroy', this.updateTitle, this);
		this.add(accessorial);
	},
	
	updateTitle: function() {
		this.setTitle(this.baseTitle + ' $' + this.getTotal());
		this.fireEvent('updatetotal');
	},
	
	getTotal: function() {
		var items = this.items.items;
		var numItems = items.length;
		var total = 0;
		for (var i = 0; i < numItems; i++) {
			total += items[i].getTotal();
		}
		total = total.toFixed(2);
		return parseFloat(total);
	},
	
	collapseAll: function() {
		var items = this.items.items;
		var numItems = items.length;
		for (var i = 0; i < numItems; i++) {
			items[i].collapse();
		}
	},
	
	expandAll: function() {
		var items = this.items.items;
		var numItems = items.length;
		for (var i = 0; i < numItems; i++) {
			items[i].expand();
		}
	},
	
	getValues: function() {
		var items = this.items.items;
		var numItems = items.length;
		var values = [];
		for (var i = 0; i < numItems; i++) {
			values.push(items[i].getValues());
		}
		return values;
	}
	
});
Ext.define('TMS.orders.forms.sections.Audit', {
	extend:'TMS.ActionWindow',
	
	//Requires
	requires:[
		'TMS.orders.forms.sections.OrderDetails',
		'TMS.documents.forms.sections.DocumentsRequired',
		'TMS.comment.forms.sections.Form',
		'TMS.documents.view.Grid',
		'TMS.comment.view.Grid'
	],
	
	//Config
	layout: 'border',
	title:'Audit Order',
	processingPage:'/at-ajax/modules/order/audit/',
	order_id:0,
	widthPercent: .9,
	heightPercent: .9,
	
	init: function() {
		this.initTitle();
		this.initOrderDetails();
		this.initDocumentsRequired();
		this.initColumns();
		this.initCenter();
		this.initDocuments();
		this.initComments();
		this.initHidden();
		
		this.initButtons();
		
		this.initListeners();
	},
	
	initTitle: function(){
		if(this.title == null || !this.title.length){
			return;
		}
		
		this.title += ' - #' + this.order_id;
	},
	
	initColumns: function() {
		this.columns = Ext.create('Ext.panel.Panel', {
			layout:{
				type: 'vbox',
				align: 'stretch'
			},
			region: 'west',
			width: 250,
			split: true,
			items:[
				this.orderDetails,
				this.documentsRequired
			],
			border:0,
			frame:false
		});
		this.items.push(this.columns);
	},
	
	initCenter: function() {
		this.centerPanel = Ext.create('Ext.panel.Panel', {
			layout:{
				type: 'vbox',
				align: 'stretch'
			},
			region: 'center',
			border:0,
			frame:false
		});
		this.items.push(this.centerPanel);
	},
	
	initOrderDetails: function() {
		this.orderDetails = Ext.create('TMS.orders.forms.sections.OrderDetails', {
			readOnly: true,
			order_id:this.order_id,
			flex:1,
			autoScroll: true
		})
	},
	
	initDocumentsRequired: function() {
		this.documentsRequired = Ext.create('TMS.documents.forms.sections.DocumentsRequired', {
			order_id:this.order_id,
			readOnly: true,
			flex:1,
			autoScroll: true
		});
	},
	
	initDocuments: function() {
		this.documentsPanel = Ext.create('TMS.documents.view.Grid', {
			title: 'Order Documents',
			extraParams:{
				order_id:this.order_id
			},
			flex:1
		});
		this.centerPanel.add(this.documentsPanel);
	},
	
	initComments: function() {
		this.commentsPanel = Ext.create('TMS.comment.view.Grid', {
			title: 'Order Comments',
			field_value: this.order_id,
			type:'order',
			flex:1
		});
		this.centerPanel.add(this.commentsPanel);
	},
	
	initHidden: function() {
		this.orderIdField = Ext.create('Ext.form.field.Hidden', {
			name:'orderId',
			value:0
		});
		this.items.push(this.orderIdField);
	},
	
	initButtons: function() {
		this.approveButton = Ext.create('Ext.button.Button', {
			scope:this,
			text:'Approve',
			handler:this.approve,
			scale:'medium',
			icon: '/resources/icons/check-24.gif'
		});
		this.denyButton = Ext.create('Ext.button.Button', {
			scope:this,
			text:'Deny',
			handler:this.deny,
			scale:'medium',
			icon: '/resources/icons/close-24.png'
		});
		this.addTopButton([
			this.approveButton,
			this.denyButton
		]);
	},
	
	approve: function() {
		this.setLoading();
		Ext.Ajax.request({
			scope:this,
			method:'post',
			url:this.processingPage + 'approve',
			params:{
				order_id:this.order_id
			},
			success: function(r) {
				this.setLoading(false);
				var response = Ext.decode(r.responseText);
				this.fireEvent('taskcomplete');
				this.close();
			}
		});
	},
	
	deny: function() {
		// Show a comment box that will be entered as an order comment
		this.formPanel = Ext.create('TMS.comment.forms.sections.Form', {
			field_value:this.order_id,
			commentType:'order'
		});
		
		this.formWindow = Ext.create('Ext.window.Window', {
			title:'Enter a reason',
			autoShow:true,
			modal:true,
			resizable:false,
			draggable:false,
			width:400,
			items:[
				this.formPanel
			]
		});
		
		this.formPanel.on('formsuccess', function() {
			this.formWindow.close();
			
			this.setLoading();
			
			Ext.Ajax.request({
				scope:this,
				method:'post',
				url:this.processingPage + 'deny',
				params:{
					order_id:this.order_id
				},
				success: function(r) {
					this.setLoading(false);
					var response = Ext.decode(r.responseText);
					this.fireEvent('taskcomplete');
					this.close();
				}
			});
		}, this);
		
	},
	
	initListeners: function() {
		this.orderDetails.on('dataload', function() {
			this.center();
		} , this);
		
		this.documentsRequired.on('dataload', function() {
			this.center();
		} , this);
		
	}
	
});
Ext.define('TMS.orders.forms.sections.AuditCorrection', {
	extend:'TMS.ActionWindow',
	
	//Requires
	requires:[
		'TMS.orders.forms.sections.OrderDetails',
		'TMS.documents.forms.sections.DocumentsRequired',
		'TMS.documents.view.Grid'
	],
	
	//Config
	layout: 'fit',
	title:'Fix Order Details',
	processingPage:'/at-ajax/modules/order/audit/',
	order_id:0,
	widthPercent: 0.9,
	heightPercent: 0.9,
	
	init: function() {
		//Layout items
		this.initTabPanel();
		this.initAuditPanel();
		this.initOrderPanel();
		this.initColumns();
		this.initCenterPanel();
		
		//Audit panels
		this.initOrderDetails();
		this.initDocumentsRequired();
		this.initDocuments();
		this.initComments();
		
		this.initButtons();
		this.initListeners();
	},
	
	initTabPanel: function(){
		this.tabPanel = new Ext.tab.Panel({
			scope: this,
			border: false,
			deferredRender: true
		});
		this.items.push(this.tabPanel);
		
		this.tabPanel.on('afterrender', function(){
			this.tabPanel.setActiveTab(0);
		}, this);
	},
	
	initAuditPanel: function(){
		this.auditPanel = new Ext.panel.Panel({
			title: 'Audit Order',
			border: false,
			layout: 'border'
		});
		this.tabPanel.add(this.auditPanel);
	},
	
	initColumns: function() {
		this.columns = Ext.create('Ext.panel.Panel', {
			layout:{
				type: 'vbox',
				align: 'stretch'
			},
			region: 'west',
			width: 250,
			split: true,
			border: false
		});
		this.auditPanel.add(this.columns);
	},
	
	initCenterPanel: function(){
		this.centerPanel = Ext.create('Ext.panel.Panel', {
			layout: {
				type: 'vbox',
				align: 'stretch'
			},
			region: 'center',
			border: false,
			frame:false
		});
		this.auditPanel.add(this.centerPanel);
	},
	
	initOrderPanel: function(){
		this.orderContainer = new Ext.panel.Panel({
			scope: this,
			layout: 'fit',
			title: 'Order',
			border: false
		});
		this.tabPanel.add(this.orderContainer);
		this.orderContainer.on('afterrender', function(){
			this.order = Ext.create('TMS.orders.forms.Order', {
				orderId: this.order_id
			});
			this.orderContainer.add(this.order);
		}, this);
	},
	
	initOrderDetails: function() {
		this.orderDetails = Ext.create('TMS.orders.forms.sections.OrderDetails', {
			order_id:this.order_id,
			readOnly: true,
			flex:1
		});
		this.columns.add(this.orderDetails);
	},
	
	initDocumentsRequired: function() {
		this.documentsRequired = Ext.create('TMS.documents.forms.sections.DocumentsRequired', {
			order_id:this.order_id,
			readOnly: true,
			flex:1
		});
		this.columns.add(this.documentsRequired);
	},
	
	initDocuments: function() {
		this.documentsPanel = Ext.create('TMS.documents.view.Grid', {
			extraParams:{
				order_id:this.order_id
			},
			flex: 1,
			title:'Documents'
		});
		this.centerPanel.add(this.documentsPanel);
	},
	
	initComments: function() {
		this.commentsPanel = Ext.create('TMS.comment.view.Grid', {
			title: 'Order Comments',
			field_value: this.order_id,
			type:'order',
			flex:1
		});
		this.centerPanel.add(this.commentsPanel);
	},
	
	initButtons: function() {
		this.approveButton = Ext.create('Ext.button.Button', {
			scope:this,
			text:'Mark as Corrected',
			handler:this.approve,
			scale:'medium',
			icon: '/resources/icons/check-24.gif'
		});
		this.addTopButton([
			this.approveButton
		]);
	},
	
	approve: function() {
		this.setLoading();
		Ext.Ajax.request({
			scope:this,
			method:'post',
			url:this.processingPage + 'fix-order-details',
			params:{
				order_id:this.order_id
			},
			success: function(r) {
				this.setLoading(false);
				var response = Ext.decode(r.responseText);
				this.fireEvent('taskcomplete');
				this.close();
			}
		});
	},
	
	initListeners: function() {
		this.orderDetails.on('dataload', function() {
			this.center();
		} , this);
		
		this.documentsRequired.on('dataload', function() {
			this.center();
		} , this);
		
	}
	
});
Ext.define('TMS.orders.forms.sections.Carrier', {
	extend:'TMS.form.Abstract',
	
	//Requires
	requires:[
		'Ext.ux.form.field.RealComboBox',
		'TMS.carrier.lookup.Carrier',
		'TMS.contacts.lookup.Contact',
		'TMS.carrier.view.RadiusGrid'
	],
	
	//Config
	originalValues: false,
	
	order_id: 0,
	url:'/at-ajax/modules/order/process/set-carrier',
	processingPage: '/at-ajax/modules/carrier/process/',
	autoSave:false,
	layout: {
		type: 'vbox',
		align: 'stretch'
	},
	border: false,

	//Config
	initComponent: function(){
		this.items = [];
		this.originalValues = false;
		this.init();
		this.callParent(arguments);
	},
	
	init: function(){
		//Containers
		this.initFieldContainer();
		this.initGrid();
		
		//Fields
		this.initCarrierSearch();
		this.initContactLookup();
		this.initUsedEquip();
		this.initListeners();
		this.loadData();
	},
	
	initFieldContainer: function(){
		this.fieldContainer = new Ext.panel.Panel({
			scope: this,
			layout: 'anchor',
			bodyPadding: 10
		});
		this.items.push(this.fieldContainer);
	},
	
	initGrid: function(){
		this.grid = Ext.create('TMS.carrier.view.RadiusGrid', {
			scope: this,
			title: 'Radius Search',
			order_id: this.order_id,
			flex: 1
		});
		this.items.push(this.grid);
		
		this.grid.grid.on('itemclick', function(grid, record){
			this.carrier_search.loadFromStore({
				carrier_id: record.get('carrier_id')
			});
		}, this);
	},
	
	initCarrierSearch: function() {
		this.carrier_search = Ext.create('TMS.carrier.lookup.Carrier', {
			fieldLabel: 'Carrier Search',
			name:'carrier_id',
			hiddenName:'carrier_id'
		});
		
		this.carrier_search.on('select', function(field, records){
			if (records.length){
				var d = records[0].data;
				
				this.contactLookup.setParam('carrier_id', d.carrier_id);
				this.contactLookup.setReadOnly(false);
				this.contactLookup.enable();
				this.contactLookup.store.load();
				this.contactLookup.setRawValue('');
				this.contactLookup.setValue(0);
				this.contactLookup.focus(true, 50);
			}
			else {
				this.contactLookup.setReadOnly(true);
				this.contactLookup.disable();
			}
		}, this);
		this.fieldContainer.add(this.carrier_search);
	},
	
	initContactLookup: function(){
		this.contactLookup = Ext.create('TMS.contacts.lookup.Contact', { 
			type: 'carrier', 
			fieldLabel: 'Select Carrier Contact',
			name:'carrier_contact_id'
		});
		this.fieldContainer.add(this.contactLookup);
	},
	
	initUsedEquip: function(){
		var data = [];
		/*
		var equipId = modesEquipment.equipmentAllowed.getValue() ;

		Ext.each(equipId, function(r){
			var record = modesEquipment.equipmentAllowed.store.getAt( modesEquipment.equipmentAllowed.store.find('CarrEquipId', r) );
			data.push([record.get('CarrEquipId'), record.get('CarrEquipDesc')]);
		});
		*/

		this.availableEquipStore = Ext.create('Ext.data.ArrayStore', {
			fields: ['id', 'name'],
			data: data
		});

		this.usedEquip = Ext.create('Ext.ux.form.field.RealComboBox', {
			fieldLabel: "Select Equipment",
			store: this.availableEquipStore,
			displayField: 'name',
			valueField: 'id',
			readOnly: (data.length > 1 ? false : true),
			editable: false,
			name: 'used_equipment_id',
			hiddenName: 'used_equipment_id'
		});
		this.fieldContainer.add(this.usedEquip);
	},
	
	makeNewStore: function(data) {
		this.availableEquipStore = Ext.create('Ext.data.ArrayStore', {
			fields: ['id', 'name'],
			data: data
		});
		this.usedEquip.store = this.availableEquipStore;
		this.availableEquipStore.load();
		
		if (data.length == 1) {
			this.usedEquip.setValue(data[0][0]);
		}
	},
	
	initListeners: function() {
		this.carrier_search.on('select', this.save, this);
		this.contactLookup.on('select', this.save, this);
		this.usedEquip.on('select', this.save, this);
		this.on('beforesubmit', function(){
			this.setParam('order_id', this.order_id);
		}, this);
	},
	
	loadData: function(){
		if (this.order_id){
			this.setLoading(true);
			Ext.Ajax.request({
				scope:this,
				method:'post',
				url:this.processingPage + 'get-order-info',
				params:{
					order_id:this.order_id
				},
				success: function(r) {
					this.setLoading(false);
					var response = Ext.decode(r.responseText);
					//var records = response.records;
					
					var data = [];
					
					Ext.each(response.equipment_list, function(d){
						var o = [d.equipment_id, d.name];
						data.push(o);
					});
					this.makeNewStore(data);
					this.carrier_search.setValue(response.carrier_id);
					this.carrier_search.setRawValue(response.carrier_name);
					
					this.contactLookup.setValue(response.contact_id)
					this.contactLookup.setRawValue(response.contact_name);
					this.contactLookup.setParam('carrier_id', response.carrier_id);
					if (response.carrier_id > 0){
						this.contactLookup.store.load();
						this.contactLookup.setReadOnly(false);
						this.contactLookup.enable();
					}else{
						this.contactLookup.setReadOnly(true);
						this.contactLookup.disable();
						//this.contactLookup.store.removeAll();
					}
					
					if (response.equipment_id)
						this.usedEquip.setValue(response.equipment_id)
				}
			});
		}
	},
	
	save: function() {
		var params = this.getValues();
		params.order_id = this.order_id
		if (this.autoSave && params.order_id) {
			this.submit();
		}
	}
});
Ext.define('TMS.orders.forms.sections.Charge', {
	extend:'TMS.form.Abstract',
	requires:[
		'TMS.orders.forms.sections.Accessorials'
	],
	
	//Config
	layout: 'fit',
	processingPage:'/at-ajax/modules/order/revenue/',
	itemized:true,
	loadByKey:'order_id',
	order_id:0,
	
	initComponent: function(){
		this.baseTitle = this.title;
		this.items = [];
		this.init();
		this.callParent(arguments);
		
	},
	
	init: function() {
		//Init layout componenents
		this.initTabPanel();
		this.initFieldContainer();
		this.initAccessorials();
		
		//Init fields
		this.initLinehaul();
		this.initFuel();
		
		//listenres
		this.initListeners();
		
		//Load the data
		this.loadData(this[this.loadByKey]);
	},
	
	initTabPanel: function(){
		this.tabPanel = new Ext.tab.Panel({
			scope: this,
			activeTab: 0
		});
		this.items.push(this.tabPanel);
		
		this.tabPanel.on('afterrender', function(){
			this.tabPanel.setActiveTab(0);
		}, this);
	},
	
	initFieldContainer: function(){
		this.fieldContainer = new Ext.panel.Panel({
			scope: this,
			title: 'Charges',
			bodyStyle:{
				padding:'8px'
			}
		});
		this.tabPanel.add(this.fieldContainer);
	},
	
	initLinehaul: function(){
		this.linehaul = Ext.create('Ext.form.Text', {
			fieldLabel: 'Linehaul',
			name: 'linehaul',
			value:'0'
		});
		this.fieldContainer.add(this.linehaul);
	},
	
	initFuel: function() {
		this.fuel = Ext.create('Ext.form.Text', {
			fieldLabel: 'Fuel',
			name: 'fuel',
			value:'0'
		});
		this.fieldContainer.add(this.fuel);
		
	},
	
	initAccessorials: function() {
		if (this.itemized) {
			this.accessorials = Ext.create('TMS.orders.forms.sections.Accessorials', {
				title: 'Accessorials'
			});
		}
		else {
			this.accessorials = Ext.create('Ext.form.Text', {
				fieldLabel: 'Accessorial Charge',
				name: 'accessorialCharge',
				value:'0'
			});
		}
		this.tabPanel.add(this.accessorials);
	},
	
	initListeners: function() {
		this.linehaul.on('change', this.updateTitle, this);
		this.fuel.on('change', this.updateTitle, this);
		
		if (this.itemized) {
			this.accessorials.on('updatetotal', this.updateTitle, this);
		}
		else {
			this.accessorials.on('change', this.updateTitle, this);
		}
	},
	
	updateTitle: function() {
		this.setTitle(this.baseTitle + ' $' + this.getTotal());
		this.fireEvent('updatetotal');
	},
	
	getTotal: function() {
		var total = 0;
		if (!isNaN(parseFloat(this.linehaul.getValue()))) {
			total += parseFloat(this.linehaul.getValue());
		}
		if (!isNaN(parseFloat(this.fuel.getValue()))) {
			total += parseFloat(this.fuel.getValue());
		}
		if (this.itemized) {
			total += this.accessorials.getTotal();
		}
		else {
			if (!isNaN(parseFloat(this.accessorials.getValue()))) {
				total += parseFloat(this.accessorials.getValue());
			}
		}
		total = total.toFixed(2);
		return parseFloat(total);
	},
	
	getValues: function() {
		var accessorialValue = 0;
		if (this.itemized) {
			accessorialValue = this.accessorials.getValues()
		}
		else {
			accessorialValue = this.accessorials.getValue();
		}
		var values = {
			linehaul:this.linehaul.getValue(),
			fuel:this.fuel.getValue(),
			accessorials:accessorialValue
		};
		return values;
	},
	
	loadData: function(loadByValue) {
		this[this.loadByKey] = loadByValue;
		var params = {};
		params[this.loadByKey] = this[this.loadByKey];
		if (this[this.loadByKey]) {
			this.setLoading();
			Ext.Ajax.request({
				scope:this,
				method:'post',
				url:this.processingPage + 'get-charge-information',
				params:params,
				success: function(r) {
					this.setLoading(false);
					var response = Ext.decode(r.responseText);
					this.record = response.record;
					this.setData();
				}
			});
		}
	},
	
	setData: function() {
		if(this.record.linehaul_charge != null){
			this.linehaul.setValue(this.record.linehaul_charge);
		}
		
		if(this.record.fuel_charge != null){
			this.fuel.setValue(this.record.fuel_charge);
		}
		
		if (this.record.accessorialCharges && this.record.accessorialCharges.length) {
			this.accessorials.addAccessorial(this.record.accessorialCharges);
			this.accessorials.collapseAll();
		}
	}
	
});
Ext.define('TMS.orders.forms.sections.Collected', {
	extend:'TMS.ActionWindow',
	title:'Collection Call',
	processingPage:'/at-ajax/modules/order/audit/',
	
	order_id:0,
	width:900,
	autoSize:false,
	
	init: function() {
		this.initHidden();
		this.initButtons();
		this.initListeners();
	},
	
	initHidden: function() {
		this.orderIdField = Ext.create('Ext.form.field.Hidden', {
			name:'orderId',
			value:0
		});
		this.items.push(this.orderIdField);
	},
	
	initButtons: function() {
		this.approveButton = Ext.create('Ext.button.Button', {
			scope:this,
			text:'Mark as Complete',
			handler:this.complete,
			scale:'medium'
		});
		this.viewButton = Ext.create('Ext.button.Button', {
			scope:this,
			text:'View Full Order',
			handler:this.viewOrder,
			scale:'medium'
		});
		this.addTopButton([
			this.approveButton,
			this.viewButton
		]);
	},
	
	complete: function() {
		this.setLoading();
		Ext.Ajax.request({
			scope:this,
			method:'post',
			url:this.processingPage + 'mark-as-collected',
			params:{
				order_id:this.order_id
			},
			success: function(r) {
				this.setLoading(false);
				var response = Ext.decode(r.responseText);
				this.fireEvent('taskcomplete');
				this.close();
			}
		});
	},
	
	viewOrder: function() {
		location.href = '/orders/?d=orders&a=show&id=' + this.order_id;
	},
	
	initListeners: function() {
		
	}
	
});
Ext.define('TMS.orders.forms.sections.CustomerInformation', {
	extend:'TMS.form.Abstract',
	
	requires:[
		'Ext.ux.form.field.RealComboBox',
		'TMS.customer.lookup.Customer',
		'TMS.contacts.lookup.Contact',
		'TMS.location.forms.sections.BillTo'
	],
	
	title:'Customer Information',
	baseTitle:'Customer Information',
	processingPage:'/at-ajax/modules/order/process/',
	url:'/at-ajax/modules/order/process/',
	loadByKey:'order_id',
	order_id:0,
	autoSave:false,
	bodyPadding:10,
	layout:'anchor',
	
	initComponent: function(){
		this.items = [];
		this.init();
		this.callParent(arguments);
	},
	
	init: function() {
		this.initCustomer();
		this.initContact();
		this.initBillTo();
		this.initListeners();
		this.loadData(this[this.loadByKey]);
	},
	
	initCustomer: function(){
		this.customerSelector = Ext.create('TMS.customer.lookup.Customer', {
			fieldLabel:'Customer',
			name:'customer_id',
			hiddenName: 'customer_id'
		});
		this.items.push(this.customerSelector);
	},
	
	initContact: function(){
		this.contactSelector = Ext.create('TMS.contacts.lookup.Contact', {
			fieldLabel:'Ordered By',
			name:'ordered_by_id',
			hiddenName:'ordered_by_id'
		});
		this.items.push(this.contactSelector);
	},
	
	initBillTo: function(){
		this.billToPanel = Ext.create('TMS.location.forms.sections.BillTo', {
			fieldLabel:'Bill To'
		});
		this.items.push(this.billToPanel);
	},
	initListeners: function() {
		this.customerSelector.on('select', function(field, records) {
			if(!records.length){
				this.contactSelector.disable();
				return false;
			}
			
			//Enable the contact selector
			this.contactSelector.enable();
			
			//Load all the hot contacts for this customer
			var record = records[0];
			this.contactSelector.setRawValue('');
			this.contactSelector.setValue(0);
			this.contactSelector.store.proxy.url = this.processingPage + 'get-customer-hot-contacts';
			this.contactSelector.store.proxy.extraParams.customer_id = record.get('customer_id');
			this.contactSelector.store.proxy.extraParams.status = 'hot';
			this.contactSelector.store.loadPage(1);
			this.contactSelector.focus(true, 50);
			this.contactSelector.expand();
			
			// Look up the bill to for this customer and set the bill to panel to the customer's bill to
			this.billToPanel.lookupCustomer(this.customerSelector.getValue());
			
			// Always select a new bill to when the customer changes
			// If this needs to only change when the bill to is blank, remove the "|| true""
//			if (!this.billToPanel.getValue() || true) {
//				this.billToPanel.loadFromStore({
//					customer_id:this.customerSelector.getValue()
//				});
//			}
			
		}, this);
		
		this.contactSelector.on('select', function(field, records) {
			// Look up the bill to for this contact and set the bill to panel to the contact's bill to
			this.billToPanel.lookupContact(this.contactSelector.getValue());
		}, this);
		
	},
	
	/**
	 * Loads a record based on either order_id, or pre_order_id
	 */
	loadData: function(loadByValue) {
		this[this.loadByKey] = parseInt(loadByValue);
		var params = {};
		params[this.loadByKey] = this[this.loadByKey];
		if (this[this.loadByKey]) {
			this.setLoading();
			Ext.Ajax.request({
				scope:this,
				method:'post',
				url:this.processingPage + 'get-customer-information',
				params:params,
				success: function(r) {
					this.setLoading(false);
					var response = Ext.decode(r.responseText);
					this.record = response.record;
					this.setData();
				}
			});
		}
	},
	
	setData: function() {
		var records;
		
		//Create a customer record
		if(this.record.customer_id){
			records = this.customerSelector.store.add({
				customer_id: this.record.customer_id,
				customer_name: this.record.customer_name
			});
			this.customerSelector.select(records[0]);
			this.billToPanel.filterByCustomer(this.record.customer_id);
		}
		
		//Create a contact record
		if(this.record.contact_id){
			records = this.contactSelector.store.add({
				contact_id: this.record.contact_id,
				name: this.record.contact_name
			});
			this.contactSelector.select(records[0]);
		}
		
		//Create the bill to record
		if(this.record.bill_to_location_id){
			this.billToPanel.setRecord(this.record);
		}
	},
	
	save: function() {
		if (this.autoSave && this[this.loadByKey]) {
			var params = {
				contact_id:this.contact_id,
				name:this.down('#name').getValue(),
				title:this.down('#title').getValue(),
				status_id:this.down('#status_id').getValue()
			};
			Ext.Ajax.request({
				scope:this,
				method:'post',
				url:this.processingPage + 'save-contact',
				params:params,
				success:function(r) {
					var response = Ext.decode(r.responseText);
					
				}
			});
		}
	}
	
});
Ext.define('TMS.orders.forms.sections.Details', {
	extend:'Ext.panel.Panel',
	requires:[
		'Ext.ux.form.field.RealComboBox'
	],
	
	//Config
	processingPage:'/at-ajax/modules/tools/detail-types/',
	
	initComponent: function(){
		this.items = [];
		this.init();
		this.callParent(arguments);
	},
	
	init: function() {
		this.initListeners();
		this.initStore();
		this.on('afterrender', function(){
			this.detailStore.on('load', function(){
				var newRow = this.createRow();
				this.add(newRow);
				this.selectFirst(newRow.down('realcombobox'));
			}, this, {single: true});
			this.detailStore.load();
		}, this);
	},
	
	initListeners: function() {
		this.on('add', this.itemAdded, this);
		this.on('remove', this.itemRemoved, this);
	},
	
	initStore: function() {
		this.detailStore = Ext.create('Ext.data.Store', {
			fields: [
				'detail_type_id',
				'detail_type_name',
			],
			proxy: {
				type: 'ajax',
				url: this.processingPage + 'list',
				reader: {
					type: 'json',
					root: 'records'
				}
			}
		});
	},
	
	selectFirst: function(combobox) {
		combobox.setValue(combobox.store.getAt(0).get('detail_type_id'));
	},
	
	getFirstUnusedIndex: function(combobox) {
		var indexToSelect = 0;
		
		// Loop through existing selections and store the currently used ids
		var existingIds = [];
		var items = this.items.items;
		for (var i = 0; i < items.length - 1; i++) {
			var subItem = items[i].items.items[0];
			var typeId = subItem.getValue();
			existingIds.push(typeId);
		}

		// Loop through records and find the first one that isnt in use
		var records = combobox.store.data.items;
		var numRecords = records.length;
		for (var i = 0; i < numRecords; i++) {
			if (existingIds.indexOf(records[i].data.detail_type_id) == -1) {
				indexToSelect = i;
				break;
			}
		}
		
		return indexToSelect;
	},
	
	selectFirstUnused: function(combobox) {
		if (combobox && combobox.store) {
			var record = combobox.store.getAt(this.getFirstUnusedIndex(combobox));
			combobox.setValue(record.get('detail_type_id'));
		}
	},
	
	setValues: function(records) {
		if(!records.length){
			return false;
		}
		if(!this.rendered){
			this.on('afterrender', function(panel, options){
				this.setValues(options.records);
			}, this, {records: records});
			return false;
		}
		
		//Set the values
		this.setLoading(true);
		this.removeAll();
		Ext.each(records, function(record){
			var row = this.createRow();
			this.add(row);
			var type = row.down('#detail_type_id');
			var value = row.down('#detail_value');
			var detailId = row.down('#detail_id');
			
			if(!type.isStoreLoaded){
				this.detailStore.on('load', function(store, records, bool, options){
					var type = options.type;
					var record = options.record;
					type.select(this.detailStore.getAt(this.detailStore.find('detail_type_id', record.detail_type_id)));
					
				}, this, {record: record, type: type});
			}
			else{
				type.select(this.detailStore.getAt(this.detailStore.find('detail_type_id', record.detail_type_id)));
			}
			value.setValue(record.detail_value);
			detailId.setValue(record.detail_id);
		}, this);
		this.setLoading(false);
	},
	
	getValues: function() {
		var ids = this.query('#detail_type_id');
		var values = this.query('#detail_value');
		var detailIds = this.query('#detail_id');
		var records = [];
		for(var i = 0; i < ids.length; i++){
			var id = ids[i].getValue();
			var detailId = detailIds[i].getValue();
			var value = values[i].getValue();
			var record = {
				detail_id: detailId,
				detail_type_id: id,
				detail_value: value
			};
			if(value.length){
				records.push(record);
			}
		}
		
		return records;
	},
	
	getCount: function(){
		return this.items.items.length;
	},
	
	createRow: function() {
		var p = Ext.create('Ext.panel.Panel', {
			layout:'hbox',
			border:false,
			defaults:{
				border:false
			},
			items:[{
				flex:1,
				xtype:'realcombobox',
				valueField:'detail_type_id',
				displayField:'detail_type_name',
				store: this.detailStore,
				queryMode: 'local',
				editable:false,
				margin:'2',
				itemId:'detail_type_id',
				name:'detail_type_id[]'
			},{
				flex:1,
				xtype: 'textfield',
				enforceMaxLength: true,
				maxLength: 100,
				name: 'detail_value[]',
				margin:'2',
				itemId:'detail_value',
				enableKeyEvents:true,
				listeners:{
					scope:this,
					keyup:function(textfield) {
						if (textfield.getValue().length) {
							var fields = this.query('#detail_value');
							var lastField = fields[fields.length-1];
							if (lastField.getValue().length) {
								// add another field
								var newRow = this.createRow();
								this.add(newRow);
								this.selectFirstUnused(newRow.down('realcombobox'));
							}
						}
					},
					blur:function(textfield) {
						if (!textfield.getValue().length) {
							var fields = this.query('#detail_value');
							var lastField = fields[fields.length-1];
							if (textfield != lastField) {
								textfield.ownerCt.destroy();
							}
						}
					}
				}
			},{
				xtype: 'hiddenfield',
				name: 'detail_id',
				itemId: 'detail_id',
				value: 0
			},{
				xtype: 'button',
				margin:'2',
				icon:'/resources/icons/delete-16.png',
				width:24,
				scope:this,
				handler:function(button) {
					// remove if not the last one
					button.ownerCt.destroy();
				}
			}]
		});
		return p;
	},
	
	itemAdded: function(panel, item, options) {
		var rows = this.query('> .panel');
		this.manageRemoveButtons(rows);
		//this.doLayout();
	},
	
	
	itemRemoved: function(panel, item, options) {
		// Get all rows
		var rows = this.query('> .panel');
		if (rows.length) {
			this.manageRemoveButtons(rows);
		}
	},
	
	manageRemoveButtons: function(rows) {
		for (var i = 0; i < rows.length-1; i++) {
			rows[i].down('.button').enable();
		}
		rows[rows.length-1].down('.button').disable();
	}
	
});
Ext.define('TMS.orders.forms.sections.Goods', {
	extend:'Ext.form.Panel',
	
	title:'Goods',
	baseTitle:'Goods',
	bodyStyle:{
		padding:'8px'
	},
	processingPage:'/at-ajax/modules/order/goods/',
	loadByKey:'order_id',
	order_id:0,
	autoSave: false,
	
	initComponent: function(){
		this.baseTitle = this.title;
		this.items = [];
		this.init();
		this.callParent(arguments);
		
	},
	
	init: function() {
		this.initWeight();
		this.initDescription();
		this.initListeners();
		this.loadData(this[this.loadByKey]);
	},
	
	initWeight: function(){
		this.weight = Ext.create('Ext.form.Text', {
			fieldLabel: 'Load Weight (in lbs)',
			labelAlign: 'top',
			name: 'load_weight',
			value:'0'
		});
		this.items.push(this.weight);
	},
	
	initDescription: function() {
		this.description = Ext.create('Ext.form.TextArea', {
			grow: true,
			name: 'goods_desc',
			fieldLabel: 'Load Description',
			labelAlign: 'top',
			anchor: '100%',
			value: '',
			width: 450,
			hidden: true
		});
		this.items.push(this.description);
	},
	
	initListeners: function() {
		
	},
	
	loadData: function(loadByValue) {
		this[this.loadByKey] = loadByValue;
		var params = {};
		params[this.loadByKey] = this[this.loadByKey];
		if (this[this.loadByKey]) {
			this.setLoading();
			Ext.Ajax.request({
				scope:this,
				method:'post',
				url:this.processingPage + 'get',
				params:params,
				success: function(r) {
					this.setLoading(false);
					var response = Ext.decode(r.responseText);
					this.record = response.record;
					this.setData(response.record);
				}
			});
		}
	},
	
	setData: function(data) {
		this.weight.setValue(data.weight);
		this.description.setValue(data.desc);
	}
	
});
Ext.define('TMS.orders.forms.sections.Invoice', {
	extend:'TMS.ActionWindow',
	
	//Requires
	requires:[
		'TMS.documents.view.Interface'
	],
	
	title:'Send Invoice',
	processingPage:'/at-ajax/modules/order/audit/',
	order_id:0,
	widthPercent:.9,
	heightPercent:.9,
	
	init: function() {
		this.initBillToDetails();
		this.initDocuments();
		this.initHidden();
		
		this.initButtons();
		
		this.initListeners();
	},
	
	initBillToDetails: function() {
		this.billToDetails = Ext.create('Ext.panel.Panel', {
			
		});
		this.items.push(this.billToDetails);
	},
	
	initDocuments: function() {
		this.documentsPanel = Ext.create('TMS.documents.view.Interface', {
			extraParams:{
				order_id:this.order_id
			},
			height:300,
			collapsible:false
		});
		this.items.push(this.documentsPanel);
	},
	
	initHidden: function() {
		this.orderIdField = Ext.create('Ext.form.field.Hidden', {
			name:'orderId',
			value:0
		});
		this.items.push(this.orderIdField);
	},
	
	initButtons: function() {
		this.approveButton = Ext.create('Ext.button.Button', {
			scope:this,
			text:'Mark as Complete',
			handler:this.complete,
			scale:'medium'
		});
		this.viewButton = Ext.create('Ext.button.Button', {
			scope:this,
			text:'View Full Order',
			handler:this.viewOrder,
			scale:'medium'
		});
		this.addTopButton([
			this.approveButton,
			this.viewButton
		]);
	},
	
	complete: function() {
		this.setLoading();
		Ext.Ajax.request({
			scope:this,
			method:'post',
			url:this.processingPage + 'complete-invoice',
			params:{
				order_id:this.order_id
			},
			success: function(r) {
				this.setLoading(false);
				var response = Ext.decode(r.responseText);
				this.fireEvent('taskcomplete');
				this.close();
			}
		});
	},
	
	viewOrder: function() {
		location.href = '/orders/?d=orders&a=show&id=' + this.order_id;
	},
	
	initListeners: function() {
		
	}
	
});
Ext.define('TMS.orders.forms.sections.Load', {
	extend:'Ext.panel.Panel',
	
	//Requires
	requires:[
		'TMS.carrier.lookup.Carrier'
	],
	
	layout: 'anchor',
	bodyPadding: 5,

	//Config
	origin: {
		index: 0,
		location_id: 0,
		location_name: '',
		city: '',
		state: '',
		address_1: '',
		zip: ''
	},
	destination: {
		index: 1,
		location_id: 0,
		location_name: '',
		city: '',
		state: '',
		address_1: '',
		zip: ''
	},
	
	initComponent: function(){
		this.items = [];
		this.init();
		this.callParent(arguments);
	},
	
	init: function() {
		this.initCarrier();
		this.on('afterrender', function(){
			this.updateTitle();
		}, this);
	},
	
	initCarrier: function(){
		this.carrier = Ext.create('TMS.carrier.lookup.Carrier', {
			hiddenName: 'carrier_id',
			fieldLabel: 'Carrier',
			value: 0
		});
		this.items.push(this.carrier);
	},
	
	setOrigin: function(origin){
		Ext.apply(this.origin, origin);
		this.updateTitle();
	},
	
	setDestination: function(destination){
		Ext.apply(this.destination, destination);
		this.updateTitle();
	},
	
	updateTitle: function(){
		var originName = this.origin.location_name_1;
		var destinationName = this.destination.location_name_1;
		if(!this.origin.location_id){
			originName = "No Location Selected";
		}
		if(!this.destination.location_id){
			destinationName = "No Location Selected";
		}
		this.setTitle(originName + ' &raquo; ' + destinationName);
	}
});
Ext.define('TMS.orders.forms.sections.Loads', {
	extend:'Ext.panel.Panel',
	
	//Requires
	requires:[
		'TMS.orders.forms.sections.Stops',
		'TMS.orders.forms.sections.Load'
	],
	
	//Config

	initComponent: function(){
		this.items = [];
		this.init();
		this.callParent(arguments);
	},
	
	init: function(){
		this.initStops();
		this.initLoadsPanel();
	},
	
	initStops: function(){
		this.stops = Ext.create('TMS.orders.forms.sections.Stops', {
			height: 300,
			order_id: 505
		});
		this.items.push(this.stops);
		
		this.stops.on('set', function(panel, stops){
			this.setValues(stops);
		}, this);
	},
	
	initLoadsPanel: function(){
		this.loadsPanel = new Ext.panel.Panel({
			scope: this,
			title: 'Loads'
		});
		this.items.push(this.loadsPanel);
		
		this.stops.on('addstop', function(){
			this.setValues(this.stops.getValues());
		}, this);
		this.stops.on('removestop', function(){
			this.setValues(this.stops.getValues());
		}, this);
		this.stops.on('reorder', function(stops, event){
			this.setValues(this.stops.getValues());
		}, this);
		this.stops.on('locationchange', function(stops, event){
			this.setValues(this.stops.getValues());
		}, this);
	},
	
	setValues: function(stops){
		if(stops.length <= 1){
			return;
		}
		
		var loads = this.getLoadPanels();
		
		//Add or update any lodas
		Ext.each(stops, function(stop, index){
			if(index == stops.length -1){
				return;
			}
			var load = loads[index];
			//Add this load if it doesnt exist
			if(load == null){
				this.addLoad(stop, stops[index+1]);
			}
			else{
				load.setOrigin(stop);
				load.setDestination(stops[index+1]);
			}
		}, this);
		
		//Remove any loads not needed
		Ext.each(loads, function(load, index){
			if(stops[index+1] == null){
				load.destroy();
			}
		}, this);
	},
	
	addLoad: function(origin, destination){
		var load = Ext.create('TMS.orders.forms.sections.Load', {
			scope: this,
			margin: 10,
			origin: origin,
			destination: destination
		});
		this.loadsPanel.add(load);
	},
	
	getLoadPanels: function(){
		return this.loadsPanel.items.items;
	}
});
Ext.define('TMS.orders.forms.sections.OrderDetailRow', {
	extend:'Ext.panel.Panel',
	
	//Config
	layout:'hbox',
	border:false,
	defaults:{
		border:false
	},
	store:false,
	readOnly: false,
	
	initComponent: function() {
		this.items = this.items || [];
		this.init();
		this.callParent(arguments);
	},
	
	init: function() {
		this.initDetailType();
		this.initDetailValue();
		this.initButton();
	},
	
	initDetailType: function(){
		var config = {};
		if(this.readOnly){
			Ext.apply(config, {
				hideTrigger: true,
				readOnly: true
			});
		}
		
		this.detailType = Ext.create('Ext.ux.form.field.RealComboBox', Ext.apply({
			scope: this,
			flex:1,
			valueField:'detail_type_id',
			displayField:'detail_type_name',
			store: this.store,
			queryMode: 'local',
			editable:false,
			margin:'2',
			hiddenName:'order_detail_type_id[]'
		}, config));
		this.items.push(this.detailType);
	},
	
	initDetailValue: function(){
		var config = {};
		if(this.readOnly){
			Ext.apply(config, {
				readOnly: true
			});
		}
		
		this.detailValue = Ext.create('Ext.form.field.Text', Ext.apply({
			scope: this,
			itemId: 'detail_value',
			flex:1,
			margin:'2',
			enableKeyEvents:true,
			name: 'order_detail_value[]'
		}, config));
		this.items.push(this.detailValue);
	},
	
	initButton: function(){
		var config = {};
		if(this.readOnly){
			Ext.apply(config, {
				hidden: true
			});
		}
		this.button = Ext.create('Ext.button.Button', Ext.apply({
			scope: this,
			margin:'2',
			icon:'/resources/icons/delete-16.png',
			width:24,
			handler:function(button) {
				
			}
		}, config));
		this.items.push(this.button);
	}
});
Ext.define('TMS.orders.forms.sections.OrderDetails', {
	extend:'TMS.form.Abstract',
	
	//Requires
	requires:[
		'Ext.ux.form.field.RealComboBox',
		'TMS.orders.forms.sections.OrderDetailRow'
	],
	
	//Config
	title:'Order Details',
	baseTitle:'Order Details',
	bodyStyle:{
		padding:'8px'
	},
	processingPage:'/at-ajax/modules/order/process/',
	url:'/at-ajax/modules/order/process/save-contact-methods',
	loadByKey:'order_id',
	order_id:0,
	autoSave:false,
	readOnly: false,
	
	initComponent: function(){
		this.items = this.items || [];
		this.addEvents('dataload');
		this.init();
		this.callParent(arguments);
	},
	
	init: function() {
		this.initListeners();
		this.initStore();
		this.loadData();
	},
	
	initListeners: function() {
		this.on('add', this.itemAdded, this);
		this.on('remove', this.itemRemoved, this);
		this.on('beforesubmit', function(form){
			if(!this.rendered){
				return;
			}
			var rows = this.getRows();
			var numRows = rows.length;
			var types = [];
			var data = [];
			
			for (var i = 0; i < numRows; i++) {
				types.push(rows[i].detailType.getValue());
				data.push(rows[i].detailValue.getValue());
				
				rows[i].detailType.name = 'order_detail_type_id_' + i;
				rows[i].detailValue.name =  'order_detail_value_' + i;
			}
			
			form.setParam('order_detail_type_id', Ext.encode(types));
			form.setParam('order_detail_value', Ext.encode(data));
		}, this);
	},
	
	initStore: function() {
		this.store = Ext.create('Ext.data.Store', {
			fields: [
				'detail_type_id',
				'detail_type_name'
			],
			proxy: {
				type: 'ajax',
				url: this.processingPage + 'get-order-details-list',
				reader: {
					type: 'json',
					root: 'records'
				}
			}
		});
		
		this.store.load();
	},
	
	getRows: function() {
		return this.query('> .panel');
	},
	
	selectFirst: function(combobox) {
		if (combobox && combobox.store) {
			var record = combobox.store.getAt(0);
			if (record) {
				combobox.setValue(record.get('detail_type_id'));
			}
		}
	},
	
	getFirstUnusedIndex: function(combobox) {
		var indexToSelect = 0;
		
		// Loop through existing selections and store the currently used ids
		var existingIds = [];
		var items = this.getRows();
		for (var i = 0; i < items.length - 1; i++) {
			var subItem = items[i].items.items[0];
			var typeId = subItem.getValue();
			existingIds.push(typeId);
		}

		// Loop through records and find the first one that isnt in use
		var records = combobox.store.data.items;
		var numRecords = records.length;
		for (var i = 0; i < numRecords; i++) {
			if (existingIds.indexOf(records[i].data.detail_type_id) == -1) {
				indexToSelect = i;
				break;
			}
		}
		
		return indexToSelect;
	},
	
	selectFirstUnused: function(combobox) {
		if (combobox && combobox.store) {
			var record = combobox.store.getAt(this.getFirstUnusedIndex(combobox));
			combobox.setValue(record.get('detail_type_id'));
		}
	},
	
	addContactMethod: function() {
		
	},
	
	setValues: function() {
		
	},
	
	getValues: function() {
		var types = [];
		var data = [];
		var rows = this.getRows();
		for (var i = 0; i < rows.length; i++) {
			types.push(rows[i].detailType.getValue());
			data.push(rows[i].detailValue.getValue());
		}
		var params = {
			'order_detail_type_id[]':types,
			'order_detail_value[]':data
		};
		params[this.loadByKey] = this[this.loadByKey];
		return params;
	},
	
	createRow: function() {
		var row = Ext.create('TMS.orders.forms.sections.OrderDetailRow', {
			scope: this,
			store: this.store,
			readOnly: this.readOnly
		});
		
		//Listeners
		row.detailValue.on('keyup', function(textfield) {
			if (textfield.getValue().length) {
				var fields = this.query('#detail_value');
				var lastField = fields[fields.length-1];
				if (lastField.getValue().length) {
					// add another field
					var newRow = this.createRow();
					this.add(newRow);
					this.selectFirstUnused(newRow.detailType);
				}
			}
		}, this);
		
		row.detailValue.on('change', function(textfield) {
			if (!textfield.getValue().length) {
				var fields = this.query('#detail_value');
				var lastField = fields[fields.length-1];
				if (textfield != lastField) {
					textfield.ownerCt.destroy();
				}
			}
			this.save();
		}, this, {buffer:500});
		
		return row;
	},
	
	destroyRows: function() {
		Ext.each(this.query('> .panel'), function(el){
			el.destroy();
		});
	},
	
	loadData: function(loadByValue, name) {
		this[this.loadByKey] = loadByValue || this[this.loadByKey];
		var newTitle = this.baseTitle;
		if (name != null) {
			newTitle = this.baseTitle + ' - ' + name;
		}
		
		if (this.rendered) {
			this.setTitle(newTitle);
		}
		else {
			this.title = newTitle;
		}
		
		if (this.store.isLoading()) {
			this.store.on('load', function() {
				this.loadData();
			}, this);
		}
		else {
			if (this[this.loadByKey]) {
				this.setLoading(true);
				var params = {};
				params[this.loadByKey] = this[this.loadByKey];
				Ext.Ajax.request({
					scope:this,
					method:'post',
					url:this.processingPage + 'get-order-details-data',
					params:params,
					success: function(r) {
						this.setLoading(false);
						var response = Ext.decode(r.responseText);
						var records = response.records;
						
						// remove old rows - need to suspend events so this remove doesn't trigger for a previous contact
						this.suspendEvents();
						this.destroyRows();
						this.resumeEvents();
						
						// loop through all contact method records and make a row for each
						for (var i = 0; i < records.length; i++) {
							var panel = this.createRow();
							panel.on('afterrender', function(panel, options) {
								var combobox = panel.detailType;
								var textfield = panel.detailValue;
								combobox.setValue(options.record.detail_type_id);
								textfield.setRawValue(options.record.detail_value);
							}, this, {record: records[i]});
							this.add(panel);
						}
						// add another field
						if(!this.readOnly){
							var newRow = this.createRow();
							this.add(newRow);
							this.selectFirst(newRow.detailType);
						}
						this.fireEvent('dataload', this);
					}
				});
			}
			else {
				if(!this.readOnly){
					var newRow = this.createRow();
					this.add(newRow);
					this.selectFirst(newRow.detailType);
				}
			}
		}
	},
	
	itemAdded: function(panel, item, options) {
		var rows = this.query('> .panel');
		this.manageRemoveButtons(rows);
	},
	
	
	itemRemoved: function(panel, item, options) {
		// Get all rows
		var rows = this.query('> .panel');
		if (rows.length) {
			this.manageRemoveButtons(rows);
			this.save();
		}
	},
	
	manageRemoveButtons: function(rows) {
		if (rows.length) {
			for (var i = 0; i < rows.length-1; i++) {
				rows[i].down('.button').enable();
			}
			rows[rows.length-1].down('.button').disable();
		}
	},
	
	save: function() {
		if (this.autoSave && this[this.loadByKey]) {
			this.submit();
			var params = this.getValues();
			
			/*
			
			Ext.Ajax.request({
				scope:this,
				method:'post',
				url:this.processingPage + 'save-contact-methods',
				params:params,
				success:function(r) {
					var response = Ext.decode(r.responseText);
					
				}
			});
			*/
		}
	}
	
});
Ext.define('TMS.orders.forms.sections.Revenue', {
	extend:'Ext.form.Panel',
	
	//Requires
	requires:[
		'Ext.ux.form.field.RealComboBox',
		'TMS.orders.forms.sections.Charge'
	],
	
	title:'Revenue',
	baseTitle:'Revenue',
	
	processingPage:'/at-ajax/modules/order/revenue/',
	order_id:0,
	
	layout:{
		type: 'hbox',
		align: 'stretch'
	},
	
	initComponent: function(){
		this.items = [];
		this.init();
		this.callParent(arguments);
	},
	
	init: function() {
		this.initCharge();
		this.initCost();
		this.initProfit();
		this.initListeners();
		this.loadData(this.order_id);
	},
	
	initCharge: function(){
		this.charge = Ext.create('TMS.orders.forms.sections.Charge', {
			title:'Charge',
			flex:1
		});
		this.items.push(this.charge);
	},
	
	initCost: function(){
		this.cost = Ext.create('TMS.orders.forms.sections.Charge', {
			title:'Cost',
			flex:1
		});
		this.items.push(this.cost);
	},
	
	initProfit: function(){
		
	},
	
	initListeners: function() {
		this.charge.on('updatetotal', this.updateTitle, this);
		this.cost.on('updatetotal', this.updateTitle, this);
	},
	
	loadData: function(order_id) {
		this.order_id = order_id;
		if (this.order_id) {
			this.setLoading();
			Ext.Ajax.request({
				scope:this,
				method:'post',
				url:this.processingPage + 'get-revenue-information',
				params:{
					order_id:this.order_id
				},
				success: function(r) {
					this.setLoading(false);
					var response = Ext.decode(r.responseText);
					this.record = response.record;
					if (this.record) {
						this.setData();
					}
				}
			});
		}
	},
	
	setData: function() {
		this.charge.linehaul.setValue(this.record.linehaul_charge);
		this.charge.fuel.setValue(this.record.fuel_charge);
		this.cost.linehaul.setValue(this.record.linehaul_cost);
		this.cost.fuel.setValue(this.record.fuel_cost);
		
		if (this.record.accessorialCharges && this.record.accessorialCharges.length) {
			this.charge.accessorials.addAccessorial(this.record.accessorialCharges);
			this.charge.accessorials.updateTitle();
//			this.charge.accessorials.collapseAll();
		}
		
		if (this.record.accessorialCosts && this.record.accessorialCosts.length) {
			this.cost.accessorials.addAccessorial(this.record.accessorialCosts);
			this.charge.accessorials.updateTitle();
//			this.cost.accessorials.collapseAll();
		}
	},
	
	updateTitle: function() {
		var title = this.baseTitle;
		var total = this.getTotal();
		var chargeTotal = this.charge.getTotal();
		var color = 'green';
		var percent = 0;
		var percentDisplay = 'n/a';
		if (chargeTotal > 0) {
			percent = total / chargeTotal;
			percent *= 100;
			percent = percent.toFixed(2);
			percentDisplay = percent + '%';
		}
		if (total <= 0) {
			color = 'red';
		}
		title += ' <span style="color:' + color + ';"> $';
		title += total;
		title += ' (' + percentDisplay + ')';
		title += '</span>';
		this.setTitle(title);
		this.fireEvent('updatetotal');
	},
	
	getTotal: function() {
		var total = 0;
		total = this.charge.getTotal();
		total -= this.cost.getTotal();
		total = total.toFixed(2);
		return parseFloat(total);
	},
	
	getValues: function() {
		var values = {
			charges:this.charge.getValues(),
			costs:this.cost.getValues()
		};
		
		return values;
	}
	
});
Ext.define('TMS.orders.forms.sections.Stop', {
	extend: 'TMS.form.Abstract',
	
	//requires
	requires:[
		'TMS.location.lookup.Location',
		'TMS.contacts.lookup.Contact',
		'TMS.orders.forms.sections.Details',
		'TMS.ActionWindow',
		'TMS.orders.forms.sections.Details',
		'TMS.contacts.forms.sections.ContactMethods',
		'TMS.form.plugin.StatusBar',
		'TMS.location.forms.Form'
	],
	
	//Config
	layout: 'anchor',
	originalValues: false,
	type:'order',
	url: '',

	//Config
	initComponent: function(){
		this.items = [];
		this.dockedItems = this.dockedItems || [];
		this.originalValues = false;
		this.init();
		this.callParent(arguments);
	},
	
	init: function() {
		this.initFieldContainer();
		this.initZip();
		this.initLocation();
		this.initContact();
		this.initDateTimeStopType();
		this.initDetails();
		this.initHidden();
	},
	
	
	initFieldContainer: function(){
		this.fieldContainer = new Ext.panel.Panel({
			scope: true,
			unstyled: true,
			border: false,
			bodyPadding: 10,
			layout: 'anchor',
			anchor: '100%'
		});
		
		this.items.push(this.fieldContainer);
	},
	
	initZip: function() {
		var config = {};
		if (this.type != 'preorder') {
			Ext.apply(config, {
				hidden: true
			});
		}
		
		this.zip = Ext.create('Ext.form.field.Text', Ext.apply({
			fieldLabel:'Zip',
			name:'zip',
			anchor:'100%',
			enableKeyEvents:true
		}, config));

		this.zip.on('keypress', function(field, e) {
			// If user presses enter, fire an event, so a new stop can be added
			if (e.keyCode == 13) {
				this.fireEvent('pressedenter');
			}
		}, this);

		this.zip.on('change', function(field, e) {
			this.fireEvent('addresschange');
		}, this);

		this.fieldContainer.add(this.zip);
	},
	
	initLocation: function(){
		//Create the location selector
		this.location = Ext.create('TMS.location.lookup.Location', {
			name: 'location_id',
			value: '',
			flex: 1
		});
		
		//Create the add location button
		this.locationAddButton = new Ext.button.Button({
			scope: this,
			margin: '0 0 0 5',
			icon: '/resources/icons/add-16.png',
			text:'Add Location',
			handler:this.createLocationWindow
		});
		
		//Create the location container
		this.locationContainer = Ext.create('Ext.form.FieldContainer', {
			scope: this,
			fieldLabel: 'Location',
			combineErrors: true,
			layout: 'hbox',
			defaults: {
				hideLabel: true
			},
			items:[
				this.location,
				this.locationAddButton
			]
		});
		
		//Add container to the form
		this.fieldContainer.add(this.locationContainer);
		
		//Listeners
		this.on('set', function(panel, values){
			if(values.location_id == null || !values.location_id){
				return;
			}
			this.location.loadFromStore({
				location_id: values.location_id
			});
		}, this);
	},
	
	initContact: function(){
		
		//Create the contact field
		this.contact = Ext.create('TMS.contacts.lookup.Contact', {
			name: 'contact_id',
			value: 0,
			layout: 'anchor',
			flex: 1
		});
		
		//Create the add contact button
		this.contactAddButton = new Ext.button.Button({
			scope:this,
			margin: '0 0 0 5',
			icon: '/resources/icons/edit-16.png',
			text:'Manage Contact Methods',
			handler: this.manageContactMethods
		});
		
		//Create the contact container
		this.contactContainer = Ext.create('Ext.form.FieldContainer', {
			scope: this,
			disabled: true,
			fieldLabel: 'Contact',
			combineErrors: true,
			layout: 'hbox',
			defaults: {
				hideLabel: true
			},
			items:[
				this.contact,
				this.contactAddButton
			]
		});
		
		//Add container to the form
		this.fieldContainer.add(this.contactContainer);
		
		//Listeners
		this.location.on('change', function(field, value){
			this.contact.enable();
			this.contact.setParam('location_id', value);
		}, this);
		
		this.location.on('select', function(field, records, options){
			if(!records.length){
				return;
			}
			this.contact.setValue('');
			this.contact.setRawValue('');
			if(!records.length){
				this.contactContainer.disable();
				return;
			}
			//Set the contact location
			this.contactContainer.enable();
			var record = records[0];
			this.contact.setParam('location_id', record.get('location_id'));
			this.contact.store.loadPage(1);
			//this.contact.focus(true, 50);
			
			if (this.zip) {
				this.zip.setValue(record.get('zip'));
			}
			
			this.fireEvent('addresschange');
		}, this);
		
		this.on('set', function(panel, values){
			if(values.contact_id == null || !values.contact_id){
				return;
			}
			this.contact.loadFromStore({
				contact_id: values.contact_id
			});
		}, this);
	},
	
	initDateTimeStopType: function(){
		this.stopTypeHidden = new Ext.form.field.Hidden({
			name: 'stop_type',
			toggle: function(){
				if(this.getValue() == 'd'){
					this.setValue('p');
				}
				else{
					this.setValue('d');
				}
			},
			value: 'd'
		});
		this.stopTypeHidden.on('change', function(field, value, oldValue){
			this.stopType.updateImage();
		}, this);
		this.stopType = new Ext.panel.Panel({
			scope: this,
			width: 32,
			height: 32,
			unstyled: true,
			style:{
				cursor: 'pointer'
			},
			stopTypeHidden: this.stopTypeHidden,
			pickupDetails:{
				img: '/resources/silk_icons/lorry_add_32.png',
				title: 'Stop Type (Pickup)'
			},
			deliveryDetails: {
				img: '/resources/silk_icons/lorry_delete_32.png',
				title: 'Stop Type (Delivery)'
			},
			updateImage: function(){
				var value = this.stopTypeHidden.getValue();
				var displayObject;
				if(value == "d"){
					displayObject = this.deliveryDetails;
				}
				else{
					displayObject = this.pickupDetails;
				}
				this.update(Ext.String.format(
					'<img src="{0}" title="{1}" />',
					displayObject.img,
					displayObject.title
				));
			}
		});
		this.stopType.on('afterrender', function(){
			this.stopType.updateImage();
			this.stopType.getEl().on('click', function(){
				this.stopTypeHidden.toggle();
			}, this);
		}, this);
		
		this.fieldContainer.add({
			xtype: 'fieldcontainer',
			fieldLabel: 'Date and Time',
			labelWidth: 100,
			anchor: '100%',

			// The body area will contain three text fields, arranged
			// horizontally, separated by draggable splitters.
			layout: 'hbox',
			items: [{
				xtype: 'datefield',
				name: 'date',
				submitFormat: 'n/j/Y',
				flex: 1,
				margin: '0 5 0 0',
				value: ''
			},{
				xtype: 'timefield',
				name: 'time',
				flex: 1,
				margin: '0 5 0 0',
				value: '8:00 AM',
				allowBlank: false
			}, this.stopType]
		});
		
		this.fieldContainer.add(this.stopTypeHidden);
	},
	
	initDetails: function(){
		//Create the details field button
		this.detailsButton = new Ext.button.Button({
			scope: this,
			text: 'Edit Details',
			baseText: 'Edit Details',
			handler: function(){
				this.detailsWindow.show();
			}
		});
		
		//Create the field container to hold the button
		this.fieldContainer.add({
			xtype: 'fieldcontainer',
			fieldLabel: 'Details',
			combineErrors: true,
			layout: 'hbox',
			defaults: {
				hideLabel: true
			},
			items:[this.detailsButton]
		});
		
		//Create the details panel
		this.detailsPanel = Ext.create('TMS.orders.forms.sections.Details', {
		});
		
		this.detailsPanel.on('add', function(){
			this.detailsButton.setText(this.detailsButton.baseText + ' (' + (this.detailsPanel.getCount()-1) + ')');
		}, this);
		this.detailsPanel.on('remove', function(){
			this.detailsButton.setText(this.detailsButton.baseText + ' (' + (this.detailsPanel.getCount()-1) + ')');
		}, this);
		
		//Listeners
		this.on('set', function(panel, values){
			if(values.details == null){
				return;
			}
			this.detailsPanel.setValues(values.details);
			this.detailsButton.setText(this.detailsButton.baseText + ' (' + (values.details.length) + ')');
		}, this);
		
		//Create the details window
		this.detailsWindow = Ext.create('TMS.ActionWindow', {
			scope: this,
			autoShow: false,
			title: 'Stop Details',
			layout: 'fit',
			closeAction: 'hide',
			items:[this.detailsPanel],
			bottomItems: [{
				scope: this,
				text: 'Save & Close',
				cls: 'submit',
				handler: function(){
					this.detailsWindow.hide();
				}
			}]
		});
	},
	
	initDetailsPanel: function(){
		this.detailsPanel = Ext.create('TMS.orders.forms.sections.Details', {
			title: 'Details',
			baseTitle: 'Details'
		});
		this.detailsPanel.on('expand', function(){
			this.detailsPanel.setHeight(null);
			this.doLayout(true);
		}, this);
		this.detailsPanel.on('collapse', function(){
			this.doLayout(true);
		}, this);
		this.detailsPanel.on('add', function(){
			this.detailsPanel.setTitle(this.detailsPanel.baseTitle + ' (' + (this.detailsPanel.getCount()-1) + ')');
		}, this);
		this.detailsPanel.on('remove', function(){
			this.detailsPanel.setTitle(this.detailsPanel.baseTitle + ' (' + (this.detailsPanel.getCount()-1) + ')');
		}, this);
		
		this.on('set', function(panel, values){
			if(values.details == null){
				return;
			}
			this.detailsPanel.setValues(values.details);
		}, this);
		
		this.items.push(this.detailsPanel);
	},
	
	initHidden: function(){
		this.fieldContainer.add({
			xtype: 'hiddenfield',
			name: 'stop_id',
			value: 0
		});
	},
	
	setValues: function(values){
		this.callParent(arguments);
		
		if(this.originalValues == false){
			this.originalValues = values;
		}
		
		this.fireEvent('set', this, values);
	},
	
	getValues: function(){
		//Merge in location record
		var locationRecord = this.location.store.getAt(this.location.store.find('location_id', this.location.getValue()));
		if(locationRecord != null){
			this.setParams(locationRecord.data);
		}
		
		//Add details
		this.setParam('details', this.detailsPanel.getValues());
		
		//Return the values
		return this.callParent(arguments);
	},
	
	manageContactMethods: function() {
		var contactId = parseInt(this.contact.getValue());
		if (contactId) {
			var contactMethods = Ext.create('TMS.contacts.forms.sections.ContactMethods', {
				title: '',
				baseTitle: '',
				contact_id: contactId,
				autoSave: true,
				plugins: [Ext.create('TMS.form.plugin.StatusBar')]
			});

			var contactMethodsWindow = Ext.create('TMS.ActionWindow', {
				layout: 'fit',
				items:[contactMethods],
				title: this.contact.getRawValue() + ' - Contact Methods'
			});
			contactMethodsWindow.showCloseButton();
		}
		
	},
	
	createLocationWindow: function(){
		this.locationForm = Ext.create('TMS.location.forms.Form', {
			scope: this,
			plugins: [Ext.create('TMS.form.plugin.StatusBar')]
		});
		
		this.locationForm.on('success', function(form, action){
			this.locationWindow.destroy();
			var record = action.result.record;
			this.location.setValue(record.location_id);
			this.location.loadFromStore({
				location_id: record.location_id
			});
		}, this);
		
		//Create a hidden field for job site
		this.locationForm.add({
			xtype: 'checkboxfield',
			boxLabel: 'This location is a Job Site',
			name: 'job_site',
			inputValue: '1'
		});

		this.locationWindow = Ext.create('TMS.ActionWindow', {
			items:[this.locationForm],
			title:"Add shipping address",
			bottomItems: [{
				xtype: 'button',
				cls: 'submit',
				scope: this,
				text: 'Save',
				handler: function() {
					this.locationForm.submit();
				}
			},{
				xtype: 'button',
				cls: 'submit',
				scope: this,
				text: 'Cancel',
				handler: function() { 
					this.locationWindow.destroy(); 
				}
			}]
		});
	}
});
Ext.define('TMS.orders.forms.sections.Stops', {
	extend:'Ext.tab.Panel',
	
	//Requires
	requires:[
		'Ext.ux.GMapPanel',
		'TMS.portal.Column',
		'TMS.portal.Panel',
		'TMS.orders.forms.sections.Stop'
	],

	//Config
	activeItem: 0,
	autoScroll: false,
	orderProcessingPage: '/at-ajax/modules/order/order/',
	order_id: 0,
	pre_order_id: 0,
	type:'order',
	
	title:'Stops',
	baseTitle:'Stops',
	
	initComponent: function(){
		this.items = [];
		
		this.addEvents(
			'addstop',
			'removestop',
			'reorder',
			'locationchange',
			'set',
			'get'
		);
		
		this.init();
		this.callParent(arguments);
	},
	
	init: function() {
		this.initEastPanel();
		this.initMapPanel();
		this.initStopContainer();
		this.initMap();
		this.initListeners();
		this.initStops();
	},
	
	initStops: function(){
		if(!this.rendered){
			this.on('afterrender', function(){
				this.initStops();
			}, this, { delay: 100 });
			return;
		}
		
		if(this.order_id || this.pre_order_id){
			this.setLoading(true);
			Ext.Ajax.request({
				scope: this,
				url: this.orderProcessingPage + 'get-stops',
				params: {
					order_id: this.order_id,
					pre_order_id: this.pre_order_id,
					type:this.type
				},
				success: function(r){
					var response = Ext.decode(r.responseText);
					var stops = this.setValues(response.records);
					Ext.each(stops, function(stop){
						stop.collapse();
					}, this);
					this.setLoading(false);
				}
			});
		}
		else{
			this.addStop();
		}
	},
	
	initMapPanel: function(){
		this.mapPanel = Ext.create('Ext.ux.GMapPanel', {
			scope: this,
			title: 'Map',
			gmapType: 'map',
			mapConfig: {
				scrollwheel: false
				//navigationControl: false,
				//mapTypeControl: false,
				//scaleControl: false,
				//draggable: false
			}
		})
		this.items.push(this.mapPanel);
		
		this.mapPanel.on('show', function(){
			this.findMarkers();
		}, this);
	},
	
	initMap: function(){
		this.mapPanel.on('afterrender', function(){
		   this.map = this.mapPanel.gmap;
		}, this, {single: true});
	},
	
	initEastPanel: function(){
		this.eastToolbar = new Ext.toolbar.Toolbar({
			scope: this,
			items:[{
				scope: this,
				text: 'Add Stop',
				icon: '/resources/icons/add-16.png',
				handler: function(){
					var stop = this.addStop({
						collapsed: false
					});
					this.goToStop(stop);
					
				}
			},{
				scope: this,
				text: 'Collapse All',
				handler: function(){
					var stops = this.getStopPanels();
					Ext.each(stops, function(stop){
						stop.collapse();
					}, this);
					this.stopContainer.doLayout();
				}
			},{
				scope: this,
				text: 'Expand All',
				handler: function(){
					var stops = this.getStopPanels();
					Ext.each(stops, function(stop, index){
						setTimeout(Ext.bind(function(){
							stop.expand();
						}, stop), (index*0));
					}, this);
				}
			}]
		});
		
		this.eastPanel = new Ext.panel.Panel({
			scope: this,
			title: 'Stops',
			region: 'east',
			//columnWidth: 1,
			autoScroll: true,
			border: false,
			tbar: this.eastToolbar
		});
		
		this.items.push(this.eastPanel);
	},
	
	initStopContainer: function(){
		this.stopPortal = Ext.create('TMS.portal.Column', {
			border: false
		});
		this.stopContainer = Ext.create('TMS.portal.Panel', {
			scope: this,
			border: false,
			unstyled: true,
			bodyPadding: '10',
			autoScroll: false,
			items:[this.stopPortal]
		});
		
		this.stopContainer.on('drop', function(event){
			this.fireEvent('reorder', this, event);
		}, this);
		
		this.eastPanel.add(this.stopContainer);
	},
	
	setValues: function(stops){
		if(!this.rendered){
			this.on('afterrender', function(panel, options){
				this.setValues(options.stops);
			}, this, {stops: stops});
			return;
		}
		
		var createdStops = [];
		Ext.each(stops, function(record){
			var stop = this.addStop();
			this.setStopValues(stop, record);
			createdStops.push(stop);
		}, this);
		
		//Fire the set event
		this.fireEvent('set', this, stops);
		
		this.updateMileage();
		
		return createdStops;
	},
	
	getValues: function(){
		var stops = [];
		Ext.each(this.getStopPanels(), function(stop){
			stop.useDefaultNames();
			if(stop.getValues != null){
				var data = stop.getValues()
				data['street'] = data['address_1'];
				stops.push(data);
			}
			stop.usePrefixPostfixNames();
		}, this);
		
		//Fire the get event
		this.fireEvent('get', this, stops);
		
		return stops;
	},
	
	addStop: function(config){
		if(config == null){
			config = {};
		}
		
		//Create the stop panel
		var stop = Ext.create('TMS.orders.forms.sections.Stop', Ext.apply({
			scope: this,
			fieldPrefix: 'stop',
			fieldPostfix: this.getStopPanels().length,
			draggable: true,
			cls: 'x-portlet',
			title: 'No Location Selected',
			baseTitle: 'No Location Selected',
			frame: true,
			margin: '0 0 10 0',
			collapsible: true,
			type:this.type,
			//collapsed: true,
			titleCollapse: true,
			animCollapse: false,
			tools:[{
				scope: this,
				type:'close',
				tooltip: 'Remove',
				handler: function(event, toolEl, panel){
					//remove
					this.removeStop(panel.up('panel'));
				}
			}]
		}, config));
		
		stop.on('expand', function(panel){
			panel.doLayout();
		}, this);
		
		stop.on('pressedenter', function() {
			var stop = this.addStop({
				collapsed: false
			});
			this.goToStop(stop);
			stop.zip.focus();
		}, this);
		
		stop.on('addresschange', function(){
			this.updateMileage();
		}, this);
		
		
		//Set the stop type
		if(!this.getStopPanels().length){
			stop.on('afterrender', function(panel, options){
				panel.stopTypeHidden.setValue('p');
			}, this);
		}
		
		//Setup on destroy action
		stop.on('destroy', function(panel){
			if(panel.marker != null){
				panel.marker.setVisible(false);
			}
			this.findMarkers();
			this.stopContainer.doLayout();
			
			//Fire remove event
			this.fireEvent('removestop', this, stop);
			
			this.updateMileage();
			
		}, this, {stop: stop});
		
		
		//Listen for a location change
		stop.location.on('select', function(field, records, options){
			if(!records.length){
				return false;
			}
			var record = records[0];
			
			//Update the title
			var name = record.get('location_name_1');
			if(name.length > 50){
				name = name.substr(0, 50) + '...';
			}
			stop.setTitle(Ext.String.format(
				'<span>{0} ({1})</span>',
				name,
				record.get('zip')
			));
			stop.baseTitle = stop.title;
			
			//Add the marker to the map
			this.addMarker(options.stop, record.get('lat'), record.get('lng'), record.get('location_name_1'));
			
			//Fire location change event
			this.fireEvent('locationchange', this, options.stop);
			
		}, this, {stop: stop});
		
		//Add the stop to the container panel
		this.stopPortal.add(stop);
		this.doLayout();
		
		//Fire the event
		this.fireEvent('addstop', this, stop);
		
		//Return the stop
		return stop;
	},
	
	removeStop: function(stop){
		stop.getEl().fadeOut({
			callback: Ext.bind(function(stop){
				this.stopPortal.remove(stop);
				stop.destroy();
			}, this, [stop])
		});
	},
	
	getStopPanels: function(){
		return this.stopPortal.items.items;
	},
	
	addMarker: function(stop, lat, lng, title) {
		if(this.map == null){
			this.mapPanel.on('afterrender', function(panel, options){
				this.addMarker(options.stop, options.lat, options.lng, options.title);
			}, this, {stop: stop, lat: lat, lng: lng, title: title});
			return;
		}
		
		//Remove old marker if it exists
		if(stop.marker != null){
			stop.marker.setVisible(false);
		}
		
		//Create the new marker
		stop.marker = new google.maps.Marker({
		  map: this.map,
		  position: new google.maps.LatLng(lat, lng),
		  title: title
		});
		stop.marker.setVisible(false);
		
		//Make sure the map shows all markers
		this.findMarkers();
	},
	
	findMarkers: function(){
		if(this.map == null){
			this.on('afterrender', function(){
				this.findMarkers();
			}, this);
			return;
		}
		var stops = this.getStopPanels();
		var latLngList = [];
		Ext.each(stops, function(stop){
			if(stop.marker != null){
				latLngList.push(stop.marker.getPosition());
			}
		}, this);
		
		if(!latLngList.length){
			return;
		}
		
		var bounds = new google.maps.LatLngBounds();
		for (var i = 0; i < latLngList.length; i++) {
		  bounds.extend(latLngList[i]);
		}
		
		this.map.fitBounds(bounds);
		
		//Set the route
		if(latLngList.length > 1){
			if(this.directionsDisplay == null){
				this.directionsDisplay = new google.maps.DirectionsRenderer();
				this.directionsService = new google.maps.DirectionsService();
			}
			this.directionsDisplay.setMap(null);
			this.directionsDisplay.setMap(this.map);
			
			var origin = latLngList.shift();
			var destination = latLngList.pop();
			var wayPoints = [];
			Ext.each(latLngList, function(latLng){
				wayPoints.push({
					location: latLng
				});
			}, this);
			var request = {
				origin: origin,
				destination: destination,
				waypoints: wayPoints,
				travelMode: google.maps.TravelMode.DRIVING
			};
			this.directionsService.route(request, Ext.bind(function(result, status) {
				if (status == google.maps.DirectionsStatus.OK) {
					this.directionsDisplay.setDirections(result);
				}
			}, this));
		}
	},
	
	bounceMarker: function(marker, bounce){
		if(bounce == null){
			bounce = true;
		}
		
		if(bounce){
			marker.setAnimation(google.maps.Animation.BOUNCE);
		}
		else{
			marker.setAnimation();
		}
	},
	
	goToStop: function(stop){
		//Check if rendered
		if(!stop.rendered){
			stop.on('afterrender', function(panel, options){
				this.goToStop(options.stop);
			}, this, {stop: stop});
			return;
		}
		
		//Scroll into view
		setTimeout(Ext.bind(function(){
			Ext.get(this.stopContainer.body).scrollTo('top', stop.getBox().y, {
				scope: stop,
				duration: 300,
				callback: function(){
					stop.down('field').focus(true, 50);
				}
			});
		}, this), 50);
	},
	
	setStopValues: function(stop, values){
		//Check if rendered
		if(!stop.rendered){
			stop.on('afterrender', function(stop, options){
				this.setStopValues(stop, options.values);
			}, this, {values: values});
			return;
		}
		
		//Add the marker
		if(values.location_id){
			this.addMarker(stop, values.lat, values.lng, values.location_name_1);
		}

		//Set the title
		var name = values.location_name_1;
		if(name.length){
			if(name.length > 50){
				name = name.substr(0, 50) + '...';
			}
			stop.setTitle(Ext.String.format(
				'<span>{0} ({1})</span>',
				name,
				values.zip
			));
			stop.baseTitle = stop.title;
		}
		
		//Set the actual stop values
		stop.setValues(values);
	},
	
	updateMileage: function() {
		clearTimeout(this.updateMileageTimeout);
		this.updateMileageTimeout = setTimeout(Ext.bind(function(){
			this.doUpdateMileage();
		}, this), 500);
	},
	
	doUpdateMileage: function(){
		
		this.setTitle(this.baseTitle + ' (Calculating mileage...)');
		
		var stops = this.getValues();
		if (stops.length < 2) {
			this.setTitle(this.baseTitle + ' - Add 2 or more stops to calculate mileage');
		}
		// Only send request if we have at least 5 characters in the zip of all of them
		for (var i = 0; i < stops.length; i++) {
			if (!stops[i].zip || stops[i].zip && stops[i].zip.length < 5) {
				// Need to display an error to complete all zips/locations
				
				this.setTitle(this.baseTitle + ' - Complete stop locations to update mileage');
				return false;
			}
		}
		
		Ext.Ajax.request({
			scope:this,
			method:'post',
			url:'/at-ajax/modules/mileage/process/calculate-miles',
			params:{
				stops:Ext.encode(stops)
			},
			success: function(r) {
				var response = Ext.decode(r.responseText);
				if (response.success) {
					// Check google miles
					var data = false;
					var icon = '';
					if (response.results.google.distance) {
						data = response.results.google;
						icon = '<span><img src="/resources/icons/google-16.png" /></span>';
					}
					if (data) {
						if (data.distanceDisplay) {
							this.setTitle(this.baseTitle + ' - ' + icon + ' - ' + data.distanceDisplay);
						}
						else {
							this.setTitle(this.baseTitle);
						}

						// Update stop panel titles
						var stopPanels = this.getStopPanels();
						stopPanels[0].setTitle(stopPanels[0].baseTitle);
						for (var i = 1; i < stopPanels.length; i++) {
							if (data.movements[i-1] && data.movements[i-1]['distanceDisplay']) {
								stopPanels[i].setTitle(stopPanels[i].baseTitle + ' - ' + icon + ' - ' + data.movements[i-1]['distanceDisplay']);
							}
						}
					}
				}
			}
		});
	},
	
	initListeners: function() {
		this.on('reorder', this.onReorder, this);
		this.on('reorder', function() {
			this.updateMileage();
		}, this);
	},
	
	onReorder: function(){
		var stops = this.getStopPanels();
		Ext.each(stops, function(stop, index){
			stop.setFieldPostfix(index);
		}, this);
	}
});
Ext.define('TMS.orders.forms.Order', {
	extend:'TMS.form.Navigation',
	
	//Requires
	requires:[
		'TMS.orders.forms.sections.CustomerInformation',
		'TMS.orders.forms.sections.Stops',
		'TMS.orders.forms.sections.OrderDetails',
		'TMS.orders.forms.sections.Goods',
		'TMS.contacts.forms.sections.ModesEquipment',
		'TMS.orders.forms.sections.Carrier',
		'TMS.documents.view.Interface',
		'TMS.comment.forms.sections.Comments',
		'TMS.orders.forms.sections.Revenue',
		'TMS.orders.rateconfirmation.Preview'
	],
	
	//Config
	title: 'Order',
	url: '/at-ajax/modules/order/process/save-order',
	deferredRender: true,
	orderId: 0,
	
	initComponent: function(){
		this.items = this.items || [];
		this.dockedItems = this.dockedItems || [];
		this.orderId = parseInt(this.orderId);
		this.init();
		this.callParent(arguments);
	},
	
	init: function() {
		this.initTitle();
		this.initButtons();
		this.initCustomerInformation();
		this.initStops();
		this.initOrderDetails();
		this.initGoods();
		this.initModesEquipment();
		this.initCarrier();
		this.initDocuments();
		this.initComments();
		this.initRevenue();
	},
	
	initTitle: function(){
		this.baseTitle = this.title;
		if(this.orderId){
			this.title = 'Editing ' + this.baseTitle + ' - ' + this.orderId;
		}
		else{
			this.title = 'New ' + this.baseTitle;
		}
	},
	
	initButtons: function(){
		this.buttons = [{
			scope: this,
			text: 'Preview Rate Confirmation',
			icon: '/resources/icons/preview-16.png',
			cls: 'submit',
			handler: function() {
				this.on('submit', function(){
					this.previewRateConfirmation();
				}, this, {single: true });
				this.submit();
				
			}
		},{
			scope: this,
			text: 'Cancel',
			icon: '/resources/icons/delete-16.png',
			cls: 'submit',
			handler: function() {
				
			}
		},{
			scope: this,
			text: 'Save',
			icon: '/resources/icons/save-16.png',
			cls: 'submit',
			handler: function() {
				this.submit();
			}
		}];
	},
	
	initCustomerInformation: function(){
		this.customerInformation = Ext.create('TMS.orders.forms.sections.CustomerInformation', {
			order_id: this.orderId
		});
		this.items.push(this.customerInformation);
		
		this.items.push({
			xtype: 'hidden',
			name: 'order_id',
			value: this.orderId
		});
	},
	
	initStops: function(){
		this.stops = Ext.create('TMS.orders.forms.sections.Stops', {
			order_id: this.orderId
		});
		this.items.push(this.stops);
		
		this.stops.on('addstop', function(stops, stop){
			this.bindForm(stop);
		}, this);
		
		//Before submit listener
		this.on('beforesubmit', function(){
			if(this.stops.rendered){
				this.setParam('stops', Ext.encode(this.stops.getValues()));
			}
		}, this);
	},
	
	initOrderDetails: function(){
		this.orderDetails = Ext.create('TMS.orders.forms.sections.OrderDetails', {
			order_id: this.orderId
			//autoSave: true
		});
		this.items.push(this.orderDetails);
	},
	
	initGoods: function(){
		this.goods = Ext.create('TMS.orders.forms.sections.Goods', {
			order_id: this.orderId
		});
		this.items.push(this.goods);
	},
	
	initModesEquipment: function(){
		this.modesEquipment = Ext.create('TMS.contacts.forms.sections.ModesEquipment', {
		});
		this.items.push(this.modesEquipment);
		
		this.customerInformation.contactSelector.on('change', function(field, value) {
			if (isNaN(value)) {
				return;
			}
			else {
				this.modesEquipment.loadContact(value);
			}
		}, this);
	},
	
	initCarrier: function(){
		this.carrier = Ext.create('TMS.orders.forms.sections.Carrier', {
			title: 'Carrier',
			order_id: this.orderId
		});
		this.items.push(this.carrier);
		
		this.carrier.on('show', function(){
			if(this.stops.rendered){
				this.carrier.grid.fromSelect.store.loadData(this.stops.getValues());
			}
		}, this);
	},
	
	initDocuments: function(){
		this.documents = Ext.create('TMS.documents.view.Interface', {
			autoDestroy: false,
			extraParams:{
				order_id: this.orderId
			}
		});
		this.items.push(this.documents);
		
		this.documents.on('minimize', function(){
			this.setActiveItem(this.documents);
			this.documents.doLayout();
		}, this);
	},
	
	initComments: function(){
		this.comments = Ext.create('TMS.comment.forms.sections.Comments', {
			field_value: this.orderId,
			type:'order'
		});
		this.items.push(this.comments);
	},
	
	initRevenue: function(){
		this.revenue = Ext.create('TMS.orders.forms.sections.Revenue', {
			title: 'Revenue',
			order_id: this.orderId
		});
		this.items.push(this.revenue);
		
		//Before submit listener
		this.on('beforesubmit', function(){
			if(this.revenue.rendered){
				this.setParam('revenue', Ext.encode(this.revenue.getValues()));
			}
		}, this);
	},
	
	previewRateConfirmation: function(){
		if(this.rateConfirmation == null){
			this.rateConfirmation = Ext.create('TMS.orders.rateconfirmation.Preview', {
				order_id: this.orderId
			});
		}
		else {
			this.rateConfirmation.show();
			this.rateConfirmation.loadOrder(this.orderId);
		}
	}
});
Ext.define('TMS.orders.rateconfirmation.Email', {
	extend:'TMS.ActionWindow',
	
	//Requires
	requires:[
		'Ext.ux.form.field.RealComboBox',
		'TMS.contacts.forms.sections.ContactMethods',
		'TMS.ActionWindow'
	],
	
	order_id:0,
	contact_id:0,
	contactName:'',
	title:'Rate Confirmation Email',
	baseTitle:'Rate Confirmation Email',
	processingPage:'/at-ajax/modules/order/process/',
	layout:'hbox',
	
	init: function() {
		this.initEmailBox();
		this.initButtons();
	},
	
	initEmailBox: function() {
		this.emailStore = Ext.create('Ext.data.Store', {
			fields: [
				'email',
				'contact_id',
				'contactName'
			],
			proxy: {
				type: 'ajax',
				url : this.processingPage + 'get-carrier-contact-email-list',
				extraParams: {
					order_id:this.order_id
				},
				reader: {
					type: 'json',
					root: 'records'
				}
			}
		});
		this.emailBox = Ext.create('Ext.ux.form.field.RealComboBox', {
			store:this.emailStore,
			displayField:'email',
			valueField:'email',
			queryMode:'local',
			flex:1,
			emptyText: 'No emails for this contact',
			editable:false
		});
		this.items.push(this.emailBox);
		
		this.emailStore.on('load', function() {
			if (this.emailStore.data.length) {
				this.emailBox.setValue(this.emailStore.getAt(0).get('email'));
				this.contact_id = this.emailStore.getAt(0).get('contact_id');
				this.contactName = this.emailStore.getAt(0).get('contactName');
				this.updateData();
			}
			else {
				// ajax to get contact info
				this.setLoading(true);
				Ext.Ajax.request({
					scope:this,
					method:'post',
					url:this.processingPage + 'get-carrier-contact',
					params: {
						order_id:this.order_id
					},
					success: function(r) {
						this.setLoading(false);
						var response = Ext.decode(r.responseText);
						this.contact_id = response.contact_id;
						this.contactName = response.contactName;
						this.updateData();
					}
				});
			}
		}, this);
		this.emailStore.load();
	},
	
	updateData: function() {
		this.setTitle(this.baseTitle + ' - ' + this.contactName);
		if (this.contact_id) {
			this.manageContactMethodsButton.enable();
			if (this.emailStore.data.length) {
				this.sendEmailButton.enable();
			}
			else {
				this.sendEmailButton.disable();
			}
		}
		else {
			this.manageContactMethodsButton.disable();
			this.sendEmailButton.disable();
		}
	},
	
	initButtons: function() {
		this.sendEmailButton = Ext.create('Ext.button.Button', {
			scope:this,
			text:'Send Email',
			handler:this.sendEmail,
			itemId:'sendEmailButton',
			icon:'/resources/icons/email-16.png'
		});
		
		this.manageContactMethodsButton = Ext.create('Ext.button.Button', {
			scope:this,
			text:'Manage Contact Methods',
			handler:this.manageContactMethods,
			itemId:'manageContactMethodsButton'
		});
		
		this.addTopButton([this.sendEmailButton, this.manageContactMethodsButton]);
		this.showCloseButton();
	},
	
	sendEmail: function() {
		// send email should only be enabled if there is a contact and email selected
		var email = this.emailBox.getValue();
		this.setLoading('Sending email to ' + email);
		Ext.Ajax.request({
			scope:this,
			method:'post',
			url:this.processingPage + 'email-confirmation',
			params:{
				order_id:this.order_id,
				email:email
			},
			success: function(r) {
				this.setLoading(false);
				var response = Ext.decode(r.responseText);
				if (response.success) {
					this.update(response.msg[0]);
					this.topToolbar.hide();
				}
			}
		});
	},
	
	manageContactMethods: function() {
		var contactMethods = Ext.create('TMS.contacts.forms.sections.ContactMethods', {
			contact_id:this.contact_id
		});
		
		var contactMethodsWindow = Ext.create('TMS.ActionWindow', {
			title:this.contactName,
			width:400,
			height:300,
			items:[contactMethods]
		})
		contactMethodsWindow.showCloseButton();
		contactMethodsWindow.on('close', function() {
			this.emailBox.setValue('');
			this.emailStore.load();
		}, this);
	}
	
});
Ext.define('TMS.orders.rateconfirmation.Fax', {
	extend:'TMS.ActionWindow',
	
	//Requires
	requires:[
		'Ext.ux.form.field.RealComboBox',
		'TMS.contacts.forms.sections.ContactMethods',
		'TMS.ActionWindow'
	],
	
	order_id:0,
	contact_id:0,
	contactName:'',
	title:'Rate Confirmation Fax',
	baseTitle:'Rate Confirmation Fax',
	processingPage:'/at-ajax/modules/order/process/',
	layout:'hbox',
	
	init: function() {
		this.initFaxBox();
		this.initButtons();
	},
	
	initFaxBox: function() {
		this.faxStore = Ext.create('Ext.data.Store', {
			fields: [
				'fax',
				'contact_id',
				'contactName'
			],
			proxy: {
				type: 'ajax',
				url : this.processingPage + 'get-carrier-contact-fax-list',
				extraParams: {
					order_id:this.order_id
				},
				reader: {
					type: 'json',
					root: 'records'
				}
			}
		});
		this.faxBox = Ext.create('Ext.ux.form.field.RealComboBox', {
			store:this.faxStore,
			displayField:'fax',
			valueField:'fax',
			queryMode:'local',
			flex:1,
			emptyText: 'No faxes for this contact',
			editable:false
		});
		this.items.push(this.faxBox);
		
		this.faxStore.on('load', function() {
			if (this.faxStore.data.length) {
				this.faxBox.setValue(this.faxStore.getAt(0).get('fax'));
				this.contact_id = this.faxStore.getAt(0).get('contact_id');
				this.contactName = this.faxStore.getAt(0).get('contactName');
				this.updateData();
			}
			else {
				// ajax to get contact info
				this.setLoading(true);
				Ext.Ajax.request({
					scope:this,
					method:'post',
					url:this.processingPage + 'get-carrier-contact',
					params: {
						order_id:this.order_id
					},
					success: function(r) {
						this.setLoading(false);
						var response = Ext.decode(r.responseText);
						this.contact_id = response.contact_id;
						this.contactName = response.contactName;
						this.updateData();
					}
				});
			}
		}, this);
		this.faxStore.load();
	},
	
	updateData: function() {
		this.setTitle(this.baseTitle + ' - ' + this.contactName);
		if (this.contact_id) {
			this.manageContactMethodsButton.enable();
			if (this.faxStore.data.length) {
				console.log(this.faxStore);
				this.sendFaxButton.enable();
			}
			else {
				this.sendFaxButton.disable();
			}
		}
		else {
			this.manageContactMethodsButton.disable();
			this.sendFaxButton.disable();
		}
	},
	
	initButtons: function() {
		this.sendFaxButton = Ext.create('Ext.button.Button', {
			scope:this,
			text:'Send Fax',
			handler:this.sendFax,
			itemId:'sendFaxButton',
			icon:'/resources/icons/fax-16.png'
		});
		
		this.manageContactMethodsButton = Ext.create('Ext.button.Button', {
			scope:this,
			text:'Manage Contact Methods',
			handler:this.manageContactMethods,
			itemId:'manageContactMethodsButton'
		});
		
		this.addTopButton([this.sendFaxButton, this.manageContactMethodsButton]);
		this.showCloseButton();
	},
	
	sendFax: function() {
		// send fax should only be enabled if there is a contact and fax selected
		var fax = this.faxBox.getValue();
		this.setLoading('Sending fax to ' + fax);
		Ext.Ajax.request({
			scope:this,
			method:'post',
			url:this.processingPage + 'fax-confirmation',
			params:{
				order_id:this.order_id,
				fax:fax
			},
			success: function(r) {
				this.setLoading(false);
				var response = Ext.decode(r.responseText);
				if (response.success) {
					this.update(response.msg[0]);
					this.topToolbar.hide();
				}
			}
		});
	},
	
	manageContactMethods: function() {
		var contactMethods = Ext.create('TMS.contacts.forms.sections.ContactMethods', {
			contact_id:this.contact_id
		});
		
		var contactMethodsWindow = Ext.create('TMS.ActionWindow', {
			title:this.contactName,
			width:400,
			height:300,
			items:[contactMethods]
		})
		contactMethodsWindow.showCloseButton();
		contactMethodsWindow.on('close', function() {
			this.faxBox.setValue('');
			this.faxStore.load();
		}, this);
	}
	
});
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
Ext.define('TMS.orders.view.FilteredGrid', {
	extend: 'Ext.panel.Panel',
	requires:[
		'TMS.orders.filter.Order',
		'TMS.orders.view.Grid'
	],
	
	layout:'border',
	height: 500,
	title:'Orders',
	
	extraFilters:{},
	gridConfig: {},
	
	constructor: function(){
		this.extraFilters = {};
		this.gridConfig = {};
		return this.callParent(arguments);
	},
	
	initComponent: function(){
		this.items = this.items || [];
		this.init();
		this.callParent(arguments);
	},
	
	//Init Functions
	init: function() {
		this.initFilters();
		this.initGrid();
		this.initListeners();
	},
	
	initFilters: function() {
		this.filterPanel = Ext.create('TMS.orders.filter.Order', {
			region:'east',
			title:'Search',
			width: 250,
			collapsible: true,
			collapsed: true,
			extraFilters: this.extraFilters
		});
		this.items.push(this.filterPanel);
	},
	
	initGrid: function() {
		this.gridPanel = Ext.create('TMS.orders.view.Grid', Ext.apply({
			height: 500,
			region:'center',
			filter: this.filterPanel
		}, this.gridConfig));
		this.items.push(this.gridPanel);
		
		this.gridPanel.store.on('load', function(){
			
		}, this);
		
		//Register the quicksearch
		this.filterPanel.registerFilter(this.gridPanel.quickSearch);
	},
	
	initListeners: function() {
		this.gridPanel.on('filter', function(grid, field){
			this.filterPanel.filter();
		}, this);
	}
	
});
Ext.define('TMS.orders.view.Grid', {
	extend: 'TMS.grid.Grid',
	
	//Requires
	requires:[
		'TMS.orders.forms.sections.Carrier',
		'TMS.form.plugin.StatusBar',
		'TMS.ActionWindow'
	],
	
	//Config
	processingPage: '/at-ajax/modules/order/order/',
	toolsProcessingPage: '/at-ajax/modules/tools/status-types/list',
	viewConfig: {
		stripeRows: true
	},
	
	initComponent: function() {
		this.dockedItems = this.dockedItems || [];
		this.init();
		this.callParent(arguments);
	},
	
	//Init Functions
	init: function() {
		this.initToolbar();
		this.initColumns();
		this.initStore();
		this.initPager();
		this.initListeners();
	},
	
	initToolbar: function() {
		this.quickSearch = Ext.create('Ext.form.field.Text', {
			fieldLabel:'Quick Search',
			name: 'quickSearch'
		});
		this.quickSearch.on('change', function(field) {
			this.fireEvent('filter', this, field);
		}, this, {buffer:500});
		
		this.toolbar = Ext.create('Ext.toolbar.Toolbar', {
			dock:'top',
			items: [
				'->',
				this.quickSearch
			]
		});
		this.dockedItems.push(this.toolbar);
	},
	
	initColumns: function() {
		this.columns = [{
			header: 'Order #',
			dataIndex: 'order_id',
			width: 85,
			renderer: function(value, options, record) {
				var str = '<a href="/orders/?d=orders&a=show&id='+record.get('order_id')+'">'+record.get('order_display')+'</a>';
				if (record.get('detail_value') == this.quickSearch.getValue()) {
					str += '<p>' + record.get('detail_type_name') + '</p>'
				}
				return str;
			}
		},{
			header: 'Status',
			dataIndex: 'status_id',
			width:80,
			renderer: function(value, options, record) {
				return record.get('status_name')
			}
		},{
			header: 'Customer',
			dataIndex: 'customer_name',
			flex: 1,
			xtype:'templatecolumn',
			tpl:'<a href="/customers/?d=customers&a=view&id={customer_id}">' +
					'{customer_name}' +
				'</a>'
		},{
			header:'Ordered By',
			dataIndex:'ordered_by_name',
			xtype:'templatecolumn',
			tpl:'<a href="/contacts/?d=contacts&a=view&id={ordered_by_id}">' + 
					'{ordered_by_name}' +
				'</a>',
			hidden:true
		},{
			header:'Bill To',
			dataIndex:'bill_to_name',
			xtype:'templatecolumn',
			tpl:'<a href="/customers/?d=customers&a=view&id={bill_to_id}">' + 
					'{bill_to_name}' +
				'</a>',
			hidden:true
		},{
			header: 'Origin',
			dataIndex: 'origin',
			sortable: false,
			flex: 1
		},{
			header: 'Destination',
			dataIndex: 'destination',
			sortable: false,
			flex: 1
		},{
			header: 'Owner',
			dataIndex: 'broker_name',
			xtype:'templatecolumn',
			tpl:'<a href="/contacts/?d=contacts&a=view&id={contact_id}">' +
					'{broker_name}' +
				'</a>'
		},{
			header: 'Charge',
			dataIndex: 'total_charge',
			renderer: Ext.util.Format.usMoney
		},{
			header: 'Margin',
			dataIndex: 'total_profit_pct',
			renderer: function(value, metaData, record){
				var display = '';
				var color = 'green';
				var percent = 0;
				var percentDisplay = 'n/a';
				var revenue = record.data.total_charge - record.data.total_cost;
				if (record.data.total_charge && record.data.total_charge > 0) {
					percent = revenue / record.data.total_charge;
					percent *= 100;
					percent = percent.toFixed(2);
					percentDisplay = percent + '%';
				}
				if (revenue <= 0) {
					color = 'red';
				}
				
				display += ' <span style="color:' + color + ';"> $';
				display += revenue;
				display += '<br />' + percentDisplay;
				display += '</span>';
				
				return display;
				
				if (value) {
					return value + "%";
				}
				else {
					return 'n/a';
				}
			}
		},{
			header: 'Carrier',
			dataIndex: 'carrier_name',
			flex: 1,
			sortable:false,
			renderer: function(value, metaData, record, rowIndex, colIndex, store, view) {
				if(!parseInt(record.get('carrier_id')) && parseInt(record.get('origin_stop_id')) && parseInt(record.get('destination_stop_id'))){
					return Ext.String.format(
						'<div class="button">' +
							'<a href="#{0}" class="carrier_search_tool">' +
								'<img src="/resources/silk_icons/lorry_go.png" alt="Find Carrier" title="Find Carrier" />' +
								'Find Carrier' +
							'</a>' +
						'</div>',
						record.get('order_id')
					);
				}
				else if (value) {
					return Ext.String.format(
						'<a href="/carriers/?d=carriers&action=view&id={0}">' +
							'{1}' +
						'</a>',
						record.get('carrier_id'),
						record.get('carrier_name')
					);
				}
				else {
					return '';
				}
			}
		}];
	},
	
	initStore: function(){
		this.store = new Ext.data.Store({
			fields: [
				'order_id',
				'order_display',
				'customer_id',
				'customer_name',
				'ordered_by_id',
				'ordered_by_name',
				
				'bill_to_id',
				'bill_to_name',
				
				'status_id',
				'contact_id',
				'charge_id',
				
				'total_charge',
				
				'total_cost',
				'fuel_cost',
				'linehaul_cost',
				'accessorial_cost',
				
				'total_profit',
				'total_profit_pct',
				'broker_name',
				'status_name',
				'origin',
				'origin_stop_id',
				'destination',
				'destination_stop_id',
				'carrier_id',
				'carrier_name',
				
				'detail_type_id',
				'detail_type_name',
				'detail_value'
			],
			remoteSort: true,
			pageSize: 25,
			proxy: {
				type: 'ajax',
				url : this.processingPage + 'get',
				reader: {
					type: 'json',
					root: 'records',
					totalProperty: 'total'
				}
			}
		});
	},
	
	initPager: function(){
		this.pager = new Ext.toolbar.Paging({
			store: this.store,
			displayInfo: true
		});
		this.tbar = this.pager;
	},
	
	initListeners: function() {
		this.on('afterrender', function(){
			this.store.load();
		}, this);
		
		this.on('itemdblclick', function(view, record){
			this.setLoading(true);
			location.href = Ext.String.format('?d=orders&a=show&id={0}', record.get('order_id'));
		}, this);
		
		this.on('afterrender', function() {
			this.getView().on('cellcontextmenu', function(view, cell, cellIndex, record, row, rowIndex, event) {
                var column = view.getHeaderByCell(cell);
                var position = view.getPositionByEvent(event);
                var columnIndex = position.column;
                var dataIndex = column.dataIndex;
                event.preventDefault();
				
				if(dataIndex == "status_id"){
					if(this.statusMenu == null){
						this.statusMenu = new Ext.menu.Menu({
							scope: this,
							items:[{
								text: 'Loading...',
								icon: '/resources/js/extjs/resources/themes/images/gray/grid/loading.gif'
							}]
						});
						Ext.Ajax.request({
							scope: this,
							url: this.toolsProcessingPage,
							event: event,
							record: record,
							success: function(r, request){
								var response = Ext.JSON.decode(r.responseText);
								if(response.success && response.records != null){
									this.statusMenu.removeAll();
									Ext.each(response.records, function(record){
										var menuItem = new Ext.menu.Item({
											scope: this,
											text: record.status_name,
											record: record,
											handler: function(item){
												this.updateStatus(this.statusMenu.record.get('order_id'), item.record.status_id);
											}
										});
										this.statusMenu.add(menuItem);
									}, this);
									this.statusMenu.doComponentLayout();
								}
							}
						});
					}
					this.statusMenu.record = record;
					this.statusMenu.showAt(event.getXY());
				}
            }, this);  
		}, this);
		
		this.store.on('load', function() {
			// set the click handler for the find carrier buttons
			var buttons = Ext.select('.carrier_search_tool', true);
			var numButtons = buttons.elements.length;
			for (var i = 0; i < numButtons; i++) {
				buttons.elements[i].on('click', function(e, el) {
					e.preventDefault();
					var orderId = el.href.split('#')[1];
					var carrierSearch = Ext.create('TMS.orders.forms.sections.Carrier', {
						order_id: orderId,
						plugins: [Ext.create('TMS.form.plugin.StatusBar')]
					});
					var actionWindow = Ext.create('TMS.ActionWindow', {
						title:'Find A Carrier',
						layout: 'fit',
						sizePercent: 0.9,
						items:[
							carrierSearch
						],
						bottomItems: [{
							text: 'Save',
							scale: 'medium',
							icon: '/resources/icons/save-24.png',
							handler: function(){
								carrierSearch.submit();
							}
						}]
					})
					actionWindow.on('close', function() {
						this.store.load();
					}, this);
				}, this);
			}
		}, this);
	},
	
	initFilters: function(){
		this.filterPanel.add(new Ext.form.field.Text({fieldLabel: 'Name'}));
	},
	
	updateStatus: function(orderId, statusId) {
		Ext.Ajax.request({
			scope: this,
			url: this.processingPage + 'update-status',
			params:{
				order_id: orderId,
				status_id: statusId
			},
			success: function(r, request){
				var response = Ext.JSON.decode(r.responseText);
				this.store.load();
			}
		});
	}
	
});
Ext.define('TMS.orders.view.PostGrid', {
	extend: 'Ext.grid.Panel',
	
	//Config
	processingPage: '/at-ajax/modules/order/posting/get',
	viewConfig: {
		stripeRows: true
	},
	features: [{
		id: 'group',
		ftype: 'groupingsummary',
		groupHeaderTpl: 'Quote #: {name}',
		hideGroupedHeader: true,
		showSummaryRow: false,
		remoteRoot: 'summaryData'
	}],
	
	initComponent: function(){
		this.init();
		this.callParent(arguments);
	},
	
	//Init Functions
	init: function(){
		this.initColumns();
		this.initStore();
		this.initPager();
		this.initListeners();
	},
	
	initListeners: function(){
		this.on('afterrender', function(){
			this.store.load();
		}, this);
		
		this.on('itemdblclick', function(view, record){
			this.setLoading(true);
			location.href = Ext.String.format('?d=quotes&a=show&id={0}', record.get('pre_order_id'));
		}, this);
	},
	
	initPager: function(){
		this.pager = new Ext.toolbar.Paging({
			store: this.store,
			displayInfo: true
		});
		this.tbar = this.pager;
	},
	
	initColumns: function(){
		this.columns = [{
			header: 'Pre Order',
			dataIndex: 'pre_order_id',
			flex: 1
		},{
			header: 'Service',
			dataIndex: 'posting_service_name',
			flex: 1,
			renderer: function(value, options, record){
				return Ext.String.format(
					'<a href="{0}" target="_blank">{1}</a>',
					record.get('url'),
					value
				);
			}
		},{
			header: 'Date',
			dataIndex: 'posting_created_at',
			flex: 1
		},{
			//?d=posts&a=cancel&id=17
			xtype:'templatecolumn',
			tpl:'<div class="button" style="width: 75px;">' +
				'<a href="?d=posts&a=cancel&id={pre_order_id}">' +
					'<img src="/resources/silk_icons/cross.png" /> ' +
							'Cancel' +
						'</a>' +
				'</div>'
		}];
	},
	
	initStore: function(){
		this.store = new Ext.data.Store({
			fields: [
				'pre_order_id',
				'posting_created_at',
				'posting_service_name',
				'url',
			],
			remoteSort: true,
			pageSize: 50,
			groupField: 'pre_order_id',
			proxy: {
				type: 'ajax',
				url : this.processingPage,
				reader: {
					type: 'json',
					root: 'records',
					totalProperty: 'total'
				}
			}
		});
	}
});
Ext.define('TMS.orders.view.PreOrderFilteredGrid', {
	extend: 'Ext.panel.Panel',
	
	//Requires
	requires:[
		'TMS.orders.filter.PreOrder',
		'TMS.orders.view.PreOrderGrid'
	],
	
	//Config
	layout:'border',
	height: 500,
	title:'Quotes',
	
	collapsible:true,
	titleCollapse:true,
	extraFilters:{},
	gridConfig: {},
	
	constructor: function(){
		this.gridConfig = {};
		return this.callParent(arguments);
	},
	
	initComponent: function(){
		this.items = this.items || [];
		this.init();
		this.callParent(arguments);
	},
	
	//Init Functions
	init: function() {
		this.initFilters();
		this.initGrid();
		this.initListeners();
	},
	
	initFilters: function() {
		this.filterPanel = Ext.create('TMS.orders.filter.PreOrder', {
			region:'east',
			width: 250,
			collapsible:true,
			collapsed:true,
			title:'Search',
			extraFilters: this.extraFilters
			//stateful: true,
			//stateId: 'tms-orders-filter-preorder'
		})
		this.items.push(this.filterPanel);
	},
	
	initGrid: function() {
		this.gridPanel = Ext.create('TMS.orders.view.PreOrderGrid', Ext.apply({
			region:'center',
			//stateful: true,
			//stateId: 'tms-orders-view-preordergrid',
			filter: this.filterPanel
		}, this.gridConfig));
		this.items.push(this.gridPanel);
		
		//Register the quicksearch
		this.filterPanel.registerFilter(this.gridPanel.quickSearch);
	},
	
	initListeners: function() {
		this.gridPanel.on('filter', function(grid, field){
			this.filterPanel.filter();
		}, this);

		if (this.collapsed) {
			this.collapsed = false;
			this.on('afterrender', function() {
				this.collapse();
			}, this);
		}
		
		this.on('expand', function() {
			this.gridPanel.doLayout();
			this.scrollIntoView();
		}, this);
	}
});
Ext.define('TMS.orders.view.PreOrderGrid', {
	extend: 'TMS.grid.Grid',
	
	//Config
	processingPage: '/at-ajax/modules/order/pre-order/get',
	viewConfig: {
		stripeRows: true
	},
	
	initComponent: function(){
		this.dockedItems = this.dockedItems || [];
		this.init();
		this.callParent(arguments);
	},
	
	//Init Functions
	init: function(){
		this.initToolbar();
		this.initSelectionModel();
		this.initColumns();
		this.initStore();
		this.initPager();
		this.initListeners();
	},
	
	initToolbar: function() {
		this.postMenu = Ext.create('Ext.menu.Menu', {
			showSeparator: false,
			items: [{
				text:'Road Runners',
				checked:true,
				value:1
			},{
				text:'Internet Truckstop',
				checked:true,
				value:4
			},{
				text:'GetLoaded',
				checked:true,
				value:7
			},{
				text:'Transcore',
				checked:true,
				value:8
			},{
				text:'Jaguar',
				checked:true,
				value:10
			}, '-', {
				scope:this,
				text:'Post',
				handler:this.doPost
			}]
		});
		
		this.quantityField = Ext.create('Ext.form.field.Text', {
			emptyText:'Quantity',
			fieldLabel:'Quantity',
			labelWidth:55,
			width:80,
			value:1,
			margin:4
		});
		this.convertToOrderMenu = Ext.create('Ext.menu.Menu', {
			showSeparator: false,
			items: [
				this.quantityField,
				'-', {
				scope:this,
				text:'Convert',
				handler:this.convertToOrder,
				icon:'/resources/silk_icons/lightning_add.png'
			}]
		});
		
		this.quickSearch = Ext.create('Ext.form.field.Text', {
			fieldLabel:'Quick Search',
			name: 'quickSearch'
		});
		this.quickSearch.on('change', function(field) {
			this.fireEvent('filter', this, field);
		}, this, {buffer:500});
		
		this.toolbar = Ext.create('Ext.toolbar.Toolbar', {
			dock:'top',
			items: [{
				scope:this,
				text:'Convert to Order',
				menu:this.convertToOrderMenu,
				icon:'/resources/silk_icons/lightning_add.png'
			},'-',{
				scope:this,
				text:'Post Selected Quotes',
				menu:this.postMenu
			}, '->', this.quickSearch]
		});
		this.dockedItems.push(this.toolbar);
	},
	
	getSelectedIds: function() {
		var selectedRecords = this.selModel.getSelection();
		var numRecords = selectedRecords.length;
		var ids = [];
		if (numRecords) {
			for (var i = 0; i < numRecords; i++) {
				ids.push(selectedRecords[i].data.pre_order_id);
			}
		}
		return ids;
	},
	
	getSelectedServiceIds: function() {
		var ids = [];
		
		var numItems = this.postMenu.items.items.length;
		for (var i = 0; i < numItems; i++) {
			var item = this.postMenu.items.items[i];
			if (item.checked) {
				ids.push(item.value);
			}
		}
		
		return ids;
	},
	
	doPost: function() {
		var preOrderIds = this.getSelectedIds();
		var postingServiceIds = this.getSelectedServiceIds();
		if (preOrderIds.length) {
			this.setLoading('Posting to services...')
			Ext.Ajax.request({
				scope:this,
				method:'post',
				url:'/at-ajax/modules/preorder/post/do-post',
				params:{
					preOrderIds:Ext.encode(preOrderIds),
					postingServiceIds:Ext.encode(postingServiceIds)
				},
				success: function(r) {
					this.setLoading(false);
					var response = Ext.decode(r.responseText);
					
				}
			});
		}
	},
	
	convertToOrder: function() {
		var preOrderIds = this.getSelectedIds();
		if (preOrderIds.length) {
			this.setLoading('Converting...');
			Ext.Ajax.request({
				scope:this,
				method:'post',
				url:'/at-ajax/modules/preorder/process/convert-to-order',
				params:{
					preOrderIds:Ext.encode(preOrderIds),
					quantity:this.quantityField.getValue()
				},
				success: function(r) {
					this.setLoading(false);
					var response = Ext.decode(r.responseText);
					location.href = '/orders';
				}
			});
		}
	},
	
	initSelectionModel: function() {
		this.selModel = Ext.create('Ext.selection.CheckboxModel');
	},
	
	initListeners: function(){
		this.on('afterrender', function(){
			this.store.load();
		}, this);
		
		this.on('itemdblclick', function(view, record){
			this.setLoading(true);
			location.href = Ext.String.format('?d=quotes&a=show&id={0}', record.get('pre_order_id'));
		}, this);
		
		this.store.on('load', function() {
			var buttons = Ext.select('.convert-button', true);
			for (var i = 0; i < buttons.elements.length; i++) {
				buttons.elements[i].on('click', function(e, el) {
					e.preventDefault();
					this.quantityField.setValue(1);
					setTimeout(Ext.Function.bind(this.convertToOrder, this), 200);
				}, this);
			}
		}, this)
	},
	
	initPager: function(){
		this.pager = new Ext.toolbar.Paging({
			store: this.store,
			displayInfo: true
		});
		this.tbar = this.pager;
	},
	
	initColumns: function(){
		this.columns = [{
			header: 'Quote #',
			dataIndex: 'pre_order_id',
			width: 75,
			xtype:'templatecolumn',
			tpl:'<a href="?d=quotes&a=show&id={pre_order_id}">' +
					'{pre_order_id}' +
				'</a>'
		},{
			header: 'Customer',
			dataIndex: 'customer_name',
			flex: 1,
			xtype:'templatecolumn',
			tpl:'<a href="/customers/?d=customers&a=view&id={customer_id}">' +
					'{customer_name}' +
				'</a>'
		},{
			header: 'Origin',
			dataIndex: 'origin',
			flex: 2,
			sortable: false
		},{
			header: 'Destination',
			dataIndex: 'destination',
			flex: 2,
			sortable: false
		},{
			header: 'Owner',
			dataIndex: 'broker_name',
			flex: 1,
			xtype:'templatecolumn',
			tpl:'<a href="/contacts/?d=contacts&a=view&id={contact_id}">' +
					'{broker_name}' +
				'</a>'
		},{
			header: 'Charge',
			dataIndex: 'total_charge',
			renderer: Ext.util.Format.usMoney
		},{
			header:'Expiration Date',
			dataIndex:'expiration_date',
			flex:1
		},{
			header:'',
			dataIndex:'',
			xtype:'templatecolumn',
			width:100,
			tpl:'<div class="button" style="width:60px;">' +
					'<a href="#" class="convert-button" id="convert-{pre_order_id}">' +
						'Convert' +
					'</a>' +
				'</div>'
		}];
	},
	
	initStore: function(){
		this.store = new Ext.data.Store({
			fields: [
				'pre_order_id',
				'customer_id',
				'bill_to_id',
				'ordered_by_id',
				'status_id',
				'broker_id',
				'charge_id',
				'total_charge',
				'contact_id',
				'broker_name',
				'customer_name',
				'status_name',
				'origin',
				'origin_stop_id',
				'destination',
				'destination_stop_id',
				'expiration_date'
			],
			remoteSort: true,
			pageSize: 25,
			proxy: {
				type: 'ajax',
				url : this.processingPage,
				reader: {
					type: 'json',
					root: 'records',
					totalProperty: 'total'
				}
			}
		});
	}
});
Ext.define('TMS.panel.plugin.AutoHeight', {

	// private
    init: function(panel) {
        //Sizing Listeners
		this.panel = panel;
		this.panel.on('afterrender', function(){
			this.panel.setHeight(Ext.Element.getViewportHeight() - this.panel.getEl().getY() - 10);
			this.panel.doLayout();
		}, this);
		
		Ext.EventManager.onWindowResize(function(){
			this.panel.setHeight(Ext.Element.getViewportHeight() - this.panel.getEl().getY() - 10);
			this.panel.doLayout();
		}, this);
    }
});
Ext.define('TMS.panel.plugin.FullScreen', {
	extend: 'Ext.util.Observable',
	
	// private
    init: function(panel) {
		this.panel = panel;
    },

	maximize: function(panel){
		this.panel = panel;
		this.lastOwner = panel.ownerCt;
		this.lastIndex = 0;
		if(this.lastOwner != null && this.lastOwner.items != null){
			Ext.each(this.lastOwner.items.items, function(item, index){
				if(item == this.panel){
					this.lastIndex = index;
				}
			}, this);
		}
		if(this.window == null){
			this.window = Ext.create('Ext.window.Window', {
				scope: this,
				layout: 'fit',
				baseCls: 'x-panel',
				frame: false,
				closeAction: 'hide',
				closable: false,
				draggable: false,
				resizable: false,
				width: Ext.Element.getViewportWidth(),
				height: Ext.Element.getViewportHeight()
			});
			
			this.window.on('show', function(){
				this.window.setWidth(Ext.Element.getViewportWidth());
				this.window.setHeight(Ext.Element.getViewportHeight());
				this.window.center();
				this.window.doLayout();
			}, this);
			
			Ext.EventManager.onWindowResize(function(){
				this.window.setWidth(Ext.Element.getViewportWidth());
				this.window.setHeight(Ext.Element.getViewportHeight());
				this.window.center();
				this.window.doLayout();
			}, this);
		}
		this.window.add(this.panel);
		this.window.show();
		this.fireEvent('maximize', this, this.panel, this.window);
	},
	
	minimize: function(){
		this.window.hide();
		this.window.remove(this.panel, false);
		if(this.lastOwner != null){
			this.lastOwner.insert(this.lastIndex, this.panel);
		}
		this.panel.doLayout();
		this.fireEvent('maximize', this, this.panel);
	}
});
Ext.define('TMS.portal.Column', {
    extend: 'Ext.container.Container',
    alias: 'widget.portalcolumn',
	requires:[
		'TMS.portal.Portlet'
	],
	
    layout: {
        type: 'anchor'
    },
    defaultType: 'portlet',
    cls: 'x-portal-column'
    //
    // This is a class so that it could be easily extended
    // if necessary to provide additional behavior.
    //
});
Ext.define('TMS.portal.DropZone', {
    extend: 'Ext.dd.DropTarget',

    constructor: function(portal, cfg) {
        this.portal = portal;
        Ext.dd.ScrollManager.register(portal.body);
        //TMS.portal.DropZone.superclass.constructor.call(this, portal.body, cfg);
		this.callParent([portal.body, cfg]);
        portal.body.ddScrollConfig = this.ddScrollConfig;
    },

    ddScrollConfig: {
        vthresh: 50,
        hthresh: -1,
        animate: true,
        increment: 200
    },

    createEvent: function(dd, e, data, col, c, pos) {
        return {
            portal: this.portal,
            panel: data.panel,
            columnIndex: col,
            column: c,
            position: pos,
            data: data,
            source: dd,
            rawEvent: e,
            status: this.dropAllowed
        };
    },

    notifyOver: function(dd, e, data) {
        var xy = e.getXY(),
            portal = this.portal,
            proxy = dd.proxy;

        // case column widths
        if (!this.grid) {
            this.grid = this.getGrid();
        }

        // handle case scroll where scrollbars appear during drag
        var cw = portal.body.dom.clientWidth;
        if (!this.lastCW) {
            // set initial client width
            this.lastCW = cw;
        } else if (this.lastCW != cw) {
            // client width has changed, so refresh layout & grid calcs
            this.lastCW = cw;
            //portal.doLayout();
            this.grid = this.getGrid();
        }

        // determine column
        var colIndex = 0,
            colRight = 0,
            cols = this.grid.columnX,
            len = cols.length,
            cmatch = false;

        for (len; colIndex < len; colIndex++) {
            colRight = cols[colIndex].x + cols[colIndex].w;
            if (xy[0] < colRight) {
                cmatch = true;
                break;
            }
        }
        // no match, fix last index
        if (!cmatch) {
            colIndex--;
        }

        // find insert position
        var overPortlet, pos = 0,
            h = 0,
            match = false,
            overColumn = portal.items.getAt(colIndex),
            portlets = overColumn.items.items,
            overSelf = false;

        len = portlets.length;

        for (len; pos < len; pos++) {
            overPortlet = portlets[pos];
            h = overPortlet.el.getHeight();
            if (h === 0) {
                overSelf = true;
            } else if ((overPortlet.el.getY() + (h / 2)) > xy[1]) {
                match = true;
                break;
            }
        }

        pos = (match && overPortlet ? pos : overColumn.items.getCount()) + (overSelf ? -1 : 0);
        var overEvent = this.createEvent(dd, e, data, colIndex, overColumn, pos);

        if (portal.fireEvent('validatedrop', overEvent) !== false && portal.fireEvent('beforedragover', overEvent) !== false) {

            // make sure proxy width is fluid in different width columns
            proxy.getProxy().setWidth('auto');

            if (overPortlet) {
                proxy.moveProxy(overPortlet.el.dom.parentNode, match ? overPortlet.el.dom : null);
            } else {
                proxy.moveProxy(overColumn.el.dom, null);
            }

            this.lastPos = {
                c: overColumn,
                col: colIndex,
                p: overSelf || (match && overPortlet) ? pos : false
            };
            this.scrollPos = portal.body.getScroll();

            portal.fireEvent('dragover', overEvent);
            return overEvent.status;
        } else {
            return overEvent.status;
        }

    },

    notifyOut: function() {
        delete this.grid;
    },

    notifyDrop: function(dd, e, data) {
        delete this.grid;
        if (!this.lastPos) {
            return;
        }
        var c = this.lastPos.c,
            col = this.lastPos.col,
            pos = this.lastPos.p,
            panel = dd.panel,
            dropEvent = this.createEvent(dd, e, data, col, c, pos !== false ? pos : c.items.getCount());

        if (this.portal.fireEvent('validatedrop', dropEvent) !== false && this.portal.fireEvent('beforedrop', dropEvent) !== false) {

            // make sure panel is visible prior to inserting so that the layout doesn't ignore it
            panel.el.dom.style.display = '';

            if (pos !== false) {
                c.insert(pos, panel);
            } else {
                c.add(panel);
            }

            dd.proxy.hide();
            this.portal.fireEvent('drop', dropEvent);

            // scroll position is lost on drop, fix it
            var st = this.scrollPos.top;
            if (st) {
                var d = this.portal.body.dom;
                setTimeout(function() {
                    d.scrollTop = st;
                },
                10);
            }

        }
        delete this.lastPos;
        return true;
    },

    // internal cache of body and column coords
    getGrid: function() {
        var box = this.portal.body.getBox();
        box.columnX = [];
        this.portal.items.each(function(c) {
            box.columnX.push({
                x: c.el.getX(),
                w: c.el.getWidth()
            });
        });
        return box;
    },

    // unregister the dropzone from ScrollManager
    unreg: function() {
        Ext.dd.ScrollManager.unregister(this.portal.body);
        TMS.portal.DropZone.superclass.unreg.call(this);
    }
});

Ext.define('TMS.portal.Panel', {
    extend: 'Ext.panel.Panel',
    alias: 'widget.portalpanel',
	requires:[
		'TMS.portal.DropZone',
		'TMS.portal.Column',
	],
	
    cls: 'x-portal',
    bodyCls: 'x-portal-body',
    defaultType: 'portalcolumn',
    componentLayout: 'body',
    autoScroll: true,

    initComponent : function() {
        var me = this;

        // Implement a Container beforeLayout call from the layout to this Container
        this.layout = {
            type : 'column'
        };
        this.callParent();

        this.addEvents({
            validatedrop: true,
            beforedragover: true,
            dragover: true,
            beforedrop: true,
            drop: true
        });
        this.on('drop', this.doLayout, this);
    },

    // Set columnWidth, and set first and last column classes to allow exact CSS targeting.
    beforeLayout: function() {
        var items = this.layout.getLayoutItems(),
            len = items.length,
            i = 0,
            item;

        for (; i < len; i++) {
            item = items[i];
            item.columnWidth = 1 / len;
            item.removeCls(['x-portal-column-first', 'x-portal-column-last']);
        }
        items[0].addCls('x-portal-column-first');
        items[len - 1].addCls('x-portal-column-last');
        return this.callParent(arguments);
    },

    // private
    initEvents : function(){
        this.callParent();
        this.dd = Ext.create('TMS.portal.DropZone', this, this.dropConfig);
    },

    // private
    beforeDestroy : function() {
        if (this.dd) {
            this.dd.unreg();
        }
        TMS.portal.Panel.superclass.beforeDestroy.call(this);
    }
});

Ext.define('TMS.portal.Portlet', {
    extend: 'Ext.panel.Panel',
    alias: 'widget.portlet',
    layout: 'fit',
    anchor: '100%',
	margin: 5,
    //frame: true,
    //closable: true,
    //collapsible: true,
    //animCollapse: true,
    draggable: true,
    cls: 'x-portlet',

    // Override Panel's default doClose to provide a custom fade out effect
    // when a portlet is removed from the portal
    doClose: function() {
        this.el.animate({
            opacity: 0,
            callback: function(){
                this.fireEvent('close', this);
                this[this.closeAction]();
            },
            scope: this
        });
    }
});
Ext.define('TMS.preorders.forms.sections.Charge', {
	extend:'TMS.orders.forms.sections.Charge',
	
	processingPage:'/at-ajax/modules/preorder/process/',
	loadByKey:'pre_order_id',
	pre_order_id:0
	
});
Ext.define('TMS.preorders.forms.sections.CustomerInformation', {
	extend:'TMS.orders.forms.sections.CustomerInformation',
	
	loadByKey:'pre_order_id',
	pre_order_id:0,
	
	processingPage:'/at-ajax/modules/preorder/process/'
	
});
Ext.define('TMS.preorders.forms.sections.Expiration', {
	extend:'TMS.form.Abstract',
	
	//Config
	title:'Quote Expiration',
	baseTitle:'Quote Expiration',
	bodyStyle:{
		padding:'8px'
	},
	processingPage:'/at-ajax/modules/order/expiration/',
	url:'/at-ajax/modules/order/expiration/',
	loadByKey:'pre_order_id',
	pre_order_id:0,
	autoSave: false,
	
	initComponent: function(){
		this.baseTitle = this.title;
		this.items = [];
		this.init();
		this.callParent(arguments);
		
	},
	
	init: function() {
		this.initCreatedAt();
		this.initExpiration();
		this.initListeners();
		this.loadData(this[this.loadByKey]);
	},
	
	initCreatedAt: function(){
		this.createdAt = Ext.create('Ext.form.Display', {
			fieldLabel: 'Created',
			name: 'created_at',
			value:'Now'
		});
		this.items.push(this.createdAt);
	},
	
	initExpiration: function() {
		this.expiration = Ext.create('Ext.form.Date', {
			name: 'expiration_date',
			fieldLabel: 'Expires',
			value: Ext.Date.format(Ext.Date.add(new Date(), Ext.Date.DAY, 60), 'm/d/Y')
		});
		this.items.push(this.expiration);
	},
	
	initListeners: function() {
		
	},
	
	loadData: function(loadByValue) {
		this[this.loadByKey] = loadByValue;
		var params = {};
		params[this.loadByKey] = this[this.loadByKey];
		if (this[this.loadByKey] > 0) {
			this.setLoading();
			Ext.Ajax.request({
				scope:this,
				method:'post',
				url:this.processingPage + 'get',
				params:params,
				success: function(r) {
					this.setLoading(false);
					var response = Ext.decode(r.responseText);
					this.record = response.record;
					this.setData(response.record);
				}
			});
		}
	},
	
	setData: function(data) {
		var dCreated = new Date(data.createdAt);
		this.createdAt.setValue(data.createdAt);
		this.expiration.setValue(data.expiration);
	}
	
});
Ext.define('TMS.preorders.forms.sections.OrderDetails', {
	extend:'TMS.orders.forms.sections.OrderDetails',
	
	loadByKey:'pre_order_id',
	pre_order_id:0,
	
	processingPage:'/at-ajax/modules/preorder/process/'
	
});
Ext.define('TMS.preorders.forms.PreOrder', {
	extend:'TMS.form.Navigation',
	
	//Requires
	requires:[
		'TMS.preorders.forms.sections.CustomerInformation',
		'TMS.preorders.forms.sections.Expiration',
		'TMS.orders.forms.sections.Stops',
		'TMS.preorders.forms.sections.OrderDetails',
		'TMS.contacts.forms.sections.ModesEquipment',
		'TMS.preorders.forms.sections.Charge'
	],
	
	//Config
	title: 'Quote',
	url: '/at-ajax/modules/preorder/process/save',
	deferredRender: true,
	preOrderId: 0,
	
	initComponent: function(){
		this.items = this.items || [];
		this.dockedItems = this.dockedItems || [];
		this.preOrderId = parseInt(this.preOrderId);
		this.init();
		this.callParent(arguments);
	},
	
	init: function() {
		this.initTitle();
		this.initHidden();
		this.initButtons();
		this.initCustomerInformation();
		this.initQuoteExpiration();
		this.initStops();
		this.initOrderDetails();
		this.initModesEquipment();
		this.initCharges();
	},
	
	initTitle: function(){
		this.baseTitle = this.title;
		if(this.preOrderId){
			this.title = 'Editing ' + this.baseTitle + ' - ' + this.preOrderId;
		}
		else{
			this.title = 'New ' + this.baseTitle;
		}
	},
	
	initHidden: function(){
		
	},
	
	initButtons: function(){
		this.buttons = [{
			scope: this,
			text: 'Save and Convert',
			icon: '/resources/icons/save-16.png',
			cls: 'submit',
			handler: function(){
				this.setParam('doConvert', 1);
				this.submit();
			}
		},{
			scope: this,
			text: 'Save',
			icon: '/resources/icons/save-16.png',
			cls: 'submit',
			handler: function() {
				this.submit();
			}
		}];
	},
	
	initCustomerInformation: function(){
		this.customerInformation = Ext.create('TMS.preorders.forms.sections.CustomerInformation', {
			pre_order_id: this.preOrderId,
			loadByKey:'pre_order_id'
		});
		this.items.push(this.customerInformation);
		
		this.items.push({
			xtype: 'hidden',
			name: 'pre_order_id',
			value: this.preOrderId
		});
	},
	
	initQuoteExpiration: function(){
		this.quoteExpiration = Ext.create('TMS.preorders.forms.sections.Expiration', {
			pre_order_id: this.preOrderId
		});
		this.items.push(this.quoteExpiration);
	},
	
	initStops: function(){
		this.stops = Ext.create('TMS.orders.forms.sections.Stops', {
			pre_order_id: this.preOrderId,
			type:'preorder'
		});
		this.items.push(this.stops);
		
		this.stops.on('addstop', function(stops, stop){
			this.bindForm(stop);
		}, this);
		
		//Before submit listener
		this.on('beforesubmit', function(){
			if(this.stops.rendered){
				this.setParam('stops', Ext.encode(this.stops.getValues()));
			}
		}, this);
	},
	
	initOrderDetails: function(){
		this.orderDetails = Ext.create('TMS.preorders.forms.sections.OrderDetails', {
			pre_order_id: this.preOrderId
		});
		this.items.push(this.orderDetails);
	},
	
	initModesEquipment: function(){
		this.modesEquipment = Ext.create('TMS.contacts.forms.sections.ModesEquipment', {
		});
		this.items.push(this.modesEquipment);
		
		this.customerInformation.contactSelector.on('change', function(field, value) {
			if (isNaN(value)) {
				return;
			}
			else {
				this.modesEquipment.loadContact(value);
			}
		}, this);
	},
	
	initCharges: function(){
		this.charges = Ext.create('TMS.preorders.forms.sections.Charge', {
			pre_order_id: this.preOrderId,
			title:'Charges'
		});
		this.items.push(this.charges);
		
		//Before submit listener
		this.on('beforesubmit', function(){
			if(this.charges.rendered){
				this.setParam('charges', Ext.encode(this.charges.getValues()));
			}
		}, this);
	}
});
Ext.define('TMS.task.filter.Task', {
	extend: 'TMS.filter.Abstract',
	processingPage: '/at-ajax/modules/task/grid/',
	
	//Requires
	requires:[
		'Ext.ux.form.field.RealComboBox'
	],
	
	init: function(){
		this.initTaskTypes();
		this.initTaskOwners();
		this.initCreatedBy();
		this.initAssignedTo();
		this.initDueDateOn();
		this.initDueDateFrom();
		this.initDueDateTo();
	},
	
	initTaskTypes: function() {
		this.typeStore = Ext.create('Ext.data.Store', {
			fields: [
				'task_type_id',
				'task_name'
			],
			proxy: {
				type: 'ajax',
				url: this.processingPage + 'get-task-type-list',
				reader: {
					type: 'json',
					root: 'records'
				}
			}
		});
		this.typeStore.load();
		
		this.items.push({
			xtype:'realcombobox',
			queryMode:'local',
			name: 'status',
			displayField:'task_name',
			valueField:'task_type_id',
			fieldLabel: 'Task Type',
			store:this.typeStore
		});
	},
	
	initTaskOwners: function() {
		var data = {
			data:[{
				'value':'all',
				'display':'All'
			},{
				'value':'unclaimed',
				'display':'Unclaimed'
			},{
				'value':'me',
				'display':'Me'
			},{
				'value':'others',
				'display':'Others'
			}]
		};
		this.taskOwnerStore = Ext.create('Ext.data.Store', {
			autoLoad: true,
			fields:['value', 'display'],
			data:data,
			proxy: {
				type: 'memory',
				reader: {
					type: 'json',
					root: 'data'
				}
			}
		});
		this.items.push({
			xtype:'realcombobox',
			queryMode:'local',
			name: 'taskOwner',
			displayField:'display',
			valueField:'value',
			fieldLabel: 'Task Owners',
			store:this.taskOwnerStore
		});
	},
	
	initCreatedBy: function(){
		this.items.push({
			name: 'created_by',
			fieldLabel: 'Created By'
		});
	},
	
	initAssignedTo: function() {
		this.items.push({
			name: 'assigned_to',
			fieldLabel: 'Assigned To'
		});
	},
	
	initDueDateOn: function() {
		this.items.push({
			xtype:'datefield',
			name:'dueDateOn',
			fieldLabel:'Due Date On'
		});
	},
	
	initDueDateFrom: function() {
		this.items.push({
			xtype:'datefield',
			name:'dueDateFrom',
			fieldLabel:'Due Date From'
		});
	},
	
	initDueDateTo: function() {
		this.items.push({
			xtype:'datefield',
			name:'dueDateTo',
			fieldLabel:'Due Date To'
		});
	}
	
});
Ext.define('TMS.task.forms.sections.Notification', {
	extend:'TMS.ActionWindow',
	
	//Config
	title:'Notification',
	processingPage:'/at-ajax/modules/task/process/',
	widthPercent: .9,
	heightPercent: .9,
	comment_id:0,
	bodyPadding:10,
	
	init: function() {
		if (this.comment_id) {
			this.loadData(this.comment_id);
		}
		this.initButtons();
		this.initListeners();
	},
	
	initButtons: function() {
		this.approveButton = Ext.create('Ext.button.Button', {
			scope:this,
			text:'Mark as Complete',
			handler:this.complete,
			scale:'medium',
			icon: '/resources/icons/check-24.gif'
		});
		this.addTopButton([
			this.approveButton
		]);
	},
	
	complete: function() {
		this.setLoading();
		Ext.Ajax.request({
			scope:this,
			method:'post',
			url:this.processingPage + 'complete-task',
			params:{
				taskId:this.task_id
			},
			success: function(r) {
				this.setLoading(false);
				var response = Ext.decode(r.responseText);
				this.fireEvent('taskcomplete');
				this.close();
			}
		});
	},
	
	initListeners: function() {
		
	},
	
	loadData: function(comment_id) {
		this.comment_id = comment_id || this.comment_id;
		Ext.Ajax.request({
			scope:this,
			method:'post',
			url:this.processingPage + 'get-comment',
			params:{
				comment_id:this.comment_id
			},
			success: function(r) {
				var response = Ext.decode(r.responseText);
				if (response.success) {
					this.update(response.comment);
				}
				else {
					this.update(response.errorStr);
				}
			}
		});
	}
	
});
Ext.define('TMS.task.view.FilteredGrid', {
	extend: 'Ext.panel.Panel',
	requires:[
		'TMS.task.filter.Task',
		'TMS.task.view.Grid'
	],
	
	layout:'border',
	height: 500,
	title: 'Tasks',
	
	collapsible:true,
	titleCollapse:true,
	extraFilters:{},
	
	initComponent: function(){
		this.items = this.items || [];
		this.init();
		this.callParent(arguments);
	},
	
	//Init Functions
	init: function() {
		this.initFilters();
		this.initGrid();
		this.initListeners();
	},
	
	initFilters: function() {
		this.filterPanel = Ext.create('TMS.task.filter.Task', {
			region:'east',
			width: 250,
			collapsible:true,
			collapsed:true,
			titleCollapse:true,
			title:'Search',
			extraFilters: this.extraFilters 
		});
		this.items.push(this.filterPanel);
	},
	
	initGrid: function() {
		this.gridPanel = Ext.create('TMS.task.view.Grid', {
			region:'center',
			filter: this.filterPanel
		});
		this.items.push(this.gridPanel);
	},
	
	initListeners: function() {
	
	}
	
});
Ext.define('TMS.task.view.Grid', {
	extend: 'TMS.grid.Grid',
	
	//Requires
	requires:[
		'TMS.TimeDifference'
	],
	
	//Config
	processingPage: '/at-ajax/modules/task/grid/',
	timeDifference:false,
	
	initComponent: function() {
		this.init();
		this.callParent(arguments);
	},
	
	//Init Functions
	init: function() {
		this.initColumns();
		this.initStore();
		this.initPager();
		this.initListeners();
	},
	
	initColumns: function() {
		this.columns = [{
			header: 'Description',
			dataIndex: 'task_type_id',
			flex: 4,
			renderer: function(value, a, record) {
				var str = '';
				if (record.data.user_id == record.data.myId || !record.data.claimable) {
					str = '<a class="task-link" href="' + record.data.taskUrl + '">' + record.data.taskDisplay + '</a>';
				}
				else {
					str = record.data.taskDisplay;
				}
				return str;
			}
		},{
			header: 'Created By',
			dataIndex: 'created_by',
			flex: 1,
			renderer: function(value, a, record) {
				if (record.data.user_id == record.data.user_id2) {
					return 'TMS';
				}
				else {
					
				}
				return record.data.created_by;
			}
		},{
			header: 'Assigned To',
			dataIndex: 'assigned_to',
			flex: 1,
			renderer: function(value, a, record) {
				if (record.data.employee_id == '0' && record.data.role_id && record.data.canClaim) {
					var str = '<div class="rounded5 button box-right">' +
							'<a href="#" class="claim-task-button" id="claim-task-' + record.data.task_id + '">Claim Task</a>' +
						'</div>';
					return str;
				}
				else if (record.data.employee_id == '0' && record.data.role_id) {
					return record.data.role_name;
				}
				return record.data.assigned_to;
			}
		},{
			header:'Due',
			dataIndex:'due_at',
			flex: 1
		},{
			header:'Duration',
			dataIndex:'created_at',
			flex: 1,
			xtype:'templatecolumn',
			tpl:'<span class="time-difference x-hidden">{created_at}</span>'
		}];
	},
	
	initStore: function(){
		this.store = new Ext.data.Store({
			fields: [
				'task_id',
				'role_id',
				'employee_id',
				'taskDisplay',
				'taskUrl',
				'created_by',
				'assigned_to',
				'myId',
				'user_id',
				'user_id2',
				'due',
				'duration',
				'due_at',
				'created_at',
				'canClaim',
				'role_name',
				'task_type_id',
				'claimable'
			],
			remoteSort: true,
			pageSize: 25,
			proxy: {
				type: 'ajax',
				url : this.processingPage + 'get-records',
				reader: {
					type: 'json',
					root: 'records',
					totalProperty: 'total'
				}
			}
		});
	},
	
	initPager: function(){
		this.pager = new Ext.toolbar.Paging({
			store: this.store,
			displayInfo: true
		});
		this.tbar = this.pager;
	},
	
	initListeners: function() {
		this.on('afterrender', function(){
			this.store.loadPage(this.store.currentPage);
		}, this);
		
		this.store.on('load', function() {
			if (this.timeDifference) {
				this.timeDifference.remove();
			}
			this.timeDifference = Ext.create('TMS.TimeDifference');
			
			// look for claim buttons
			var claimButtons = Ext.select('a.claim-task-button', true);
			var numClaimButtons = claimButtons.elements.length;
			for (var i = 0; i < numClaimButtons; i++) {
				claimButtons.elements[i].on('click', function(e, el) {
					var parts = el.id.split('-');
					var taskId = parts[parts.length-1];
					this.setLoading(true);
					Ext.Ajax.request({
						scope:this,
						method:'post',
						url:'/at-ajax/modules/task/process/claim-task',
						params:{
							taskId:taskId
						},
						success: function(r) {
							this.setLoading(false);
							var response = Ext.decode(r.responseText);
							this.store.load();
						}
					});
				}, this);
			}
			
			// look for tasks that have an action window
			var links = Ext.select('a.task-link', true);
			var numLinks = links.elements.length;
			for (var i = 0; i < numLinks; i++) {
				if (links.elements[i].dom.href.match(/#action/)) {
					// set up click event to call a function that will know what class to create to pass this data to
					var parts = links.elements[i].dom.href.split('#')[1].split('-');
					var taskId = parts[1];
					
					links.elements[i].on('click', function(e, el, options) {
						// look up details for this task
						Ext.Ajax.request({
							scope:this,
							method:'post',
							url:'/at-ajax/modules/task/process/get-details',
							params:{
								taskId:options.taskId
							},
							success: function(r) {
								var response = Ext.decode(r.responseText);
								if (response.cls) {
									var cls = Ext.create(response.cls, response.details);
									cls.on('taskcomplete', function() {
										this.store.load();
									}, this);
								}
							}
						});
					}, this, {taskId:taskId});
				}
			}
		}, this);
	}
	
});
Ext.define('TMS.task.Notifier', {
	extend:'Ext.util.Observable',
	singleton: true,
	config: {
		
	},
	defaultParams:{
		title:'',
		content:'',
		icon:'/resources/img/thumb_icon.png',
		url:false,
		timeout:false
	},
	enabled:false,
	
	constructor: function(config) {
        if (window.webkitNotifications) {
			this.enabled = true;
			this.requestPermission();
		}
		
        return this;
    },
	
	show: function(params) {
		var settings = {};
		Ext.apply(settings, this.defaultParams);
		Ext.apply(settings, params);
		
		if (window.webkitNotifications != null && window.webkitNotifications.checkPermission() == 0) {
			var notification = webkitNotifications.createNotification(settings.icon, settings.title, settings.content);

			if (settings.url) {
				notification.onclick = function() {
					notification.cancel();
					location.href = settings.url;
				}
			}

			if (settings.timeout) {
				setTimeout(Ext.Function.bind(function() {
					this.cancel();
				}, notification), settings.timeout);
			}
			notification.show();
			return notification;
		}
		else{
			TMS.Application.showMessage(settings);
		}
	},
	
	requestPermission: function() {
		if (window.webkitNotifications.checkPermission() != 0) {
			if (!Ext.util.Cookies.get('tmsNotifications')) {
				// Create text to click
				Ext.EventManager.on(window, 'load', function(){
					this.message = Ext.get(Ext.core.DomHelper.insertFirst(Ext.get('content'), {
						tag: 'div',
						id: 'notify-request',
						html: 'Click here to enable browser notifications for TMS',
						style:{
							display: 'none'
						}
					}));
					this.message.slideIn();
					this.message.on('click', function() {
						Ext.util.Cookies.set('tmsNotifications');
						window.webkitNotifications.requestPermission();
						this.message.slideOut('t', {
							callback: function(){
								this.message.remove();
							}
						});
					}, this);
					/*
					this.message = Ext.get(document.createElement('p'));
					this.message.dom.id = 'notify-request';
					this.message.update('Click here to enable browser notifications for TMS');
					Ext.get('contentWrap').insertFirst(this.message);
					*/
				});
			}
		}
	}
	
});
Ext.define('TMS.task.TaskManager', {
	extend:'Ext.util.Observable',
	processingPage:'/at-ajax/modules/task/process/',
	
	config: {
		checkIntervalWait:60000
	},
	
	constructor: function(config) {
		this.initConfig(config);
		this.initCheckInterval();
        return this;
    },
	
	initCheckInterval: function() {
		this.checkInterval = setInterval(Ext.Function.bind(this.checkNewNotifications, this), this.checkIntervalWait);
	},
	
	checkNewNotifications: function() {
		Ext.Ajax.request({
			scope:this,
			method:'post',
			url:this.processingPage + 'check-new',
			success: function(r) {
				var response = Ext.decode(r.responseText);
				if (response.newTasks) {
					TMS.task.NotifierInstance.show({
						title:response.title,
						content:response.content,
						url:response.url,
						icon:response.icon
					});
				}
			}
		});
	}
	
});
Ext.define('TMS.user.lookup.User', {
	extend: 'Ext.ux.form.field.RealComboBox',
	
	//Config
	processingPage: '/at-ajax/modules/user/lookup/',
	
	displayField: 'name',
	valueField: 'user_id',
	emptyText: 'Search users by name...',
	typeAhead: false,
	hideTrigger:true,
	anchor: '100%',
	pageSize: 10,
	minChars: 0,
	listConfig: {
		loadingText: 'Searching...',
		emptyText: 'No users found.'
	},
	store:false,
	
	initComponent: function(){
		this.init();
		this.callParent(arguments);
	},
	
	//Init Functions
	init: function(){
		this.initStore();
	},
	
	initStore: function(){
		this.store = new Ext.data.Store({
			fields: [
				'user_id',
				'name'
			],
			remoteSort: true,
			pageSize: 10,
			proxy: {
				type: 'ajax',
				url : this.processingPage + 'get-user-list',
				reader: {
					type: 'json',
					root: 'records',
					totalProperty: 'total'
				}
			}
		});
	}
});
            
Ext.define('TMS.user.model.Branches', {
    extend: 'Ext.data.Model',
	idProperty: 'branch_id',
	
	//Fields
    fields: [{
		name: 'branch_id',
		type: 'int'
	},{
		name: 'branch_name',
		type: 'string'
	}],

	//Proxy
	proxy: {
		type: 'ajax',
		api: {
			read: '/at-ajax/modules/user/branches/read',
			create: '/at-ajax/modules/user/branches/create',
			update: '/at-ajax/modules/user/branches/update',
			destroy: '/at-ajax/modules/user/branches/destroy'
		},
		reader: {
			idProperty: 'branch_id',
			type: 'json',
			root: 'records',
			totalProperty: 'total'
		},
		writer: {
			type: 'json',
			allowSingle: false,
			writeAllFields: false,
			root: 'records',
			encode: true
		}
	}
});
