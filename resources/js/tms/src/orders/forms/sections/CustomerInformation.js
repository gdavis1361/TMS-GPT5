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