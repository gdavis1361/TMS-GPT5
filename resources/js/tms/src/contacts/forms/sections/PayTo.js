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