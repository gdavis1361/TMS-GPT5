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