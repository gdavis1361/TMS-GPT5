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

