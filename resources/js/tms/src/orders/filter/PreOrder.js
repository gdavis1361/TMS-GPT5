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