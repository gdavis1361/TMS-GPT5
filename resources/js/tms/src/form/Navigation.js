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