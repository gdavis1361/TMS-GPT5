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