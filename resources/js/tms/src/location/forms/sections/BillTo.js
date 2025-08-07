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