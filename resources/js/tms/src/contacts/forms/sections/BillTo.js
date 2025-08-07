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