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