Ext.define('TMS.customer.forms.sections.CustomerDuplicates', {
	extend:'Ext.panel.Panel',
	requires:[
		'TMS.customer.lookup.Customer',
		'TMS.customer.view.DuplicatesGrid'
	],
	
	//Config
	customer_id: 0,
	processingPage:'/at-ajax/modules/customer/process/',
	title:'Duplicate Customers',
	baseTitle:'Duplicate Customers',
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
		this.initGrid();
		this.initCustomerSearch();
		this.initListeners();
	},
	
	initCustomerSearch: function(){
		this.searchBox = Ext.create('TMS.customer.lookup.Customer', {
			flex: 5
		});
		this.search = Ext.create('Ext.form.FieldContainer', {
			layout: 'hbox',
			items: [
				this.searchBox,{
				flex: 1,
				xtype: 'button',
				scope: this,
				text: 'Add',
				handler: function() {
					this.saveDuplicate();
				}
			}]
		});
		//this.items.push(this.search);
	},
	
	initGrid: function() {
		this.grid = Ext.create('TMS.customer.view.DuplicatesGrid', {
			customer_id: this.customer_id
		});
		this.items.push(this.grid);
	},
	
	initListeners: function() {
		if (this.collapsed) {
			this.collapsed = false;
			this.on('afterrender', function() {
				this.collapse();
			}, this);
		}
		this.on('expand', function() {
			this.grid.doLayout();
			this.scrollIntoView();
		}, this);
	},
	
	save: function() {
	},
	
	load: function(carrier_id) {
	},
	
	saveDuplicate: function() {
		this.setLoading(true);
		Ext.Ajax.request({
			scope: this,
			url: this.processingPage + 'add-duplicate',
			params: {
				customer_id: this.customer_id,
				duplicate_id: this.searchBox.getValue()
			},
			success: function(response){
				this.grid.store.load();
				this.searchBox.store.load();
				console.log(response);
				this.searchBox.setValue('');
				this.setLoading(false);
			}
		});
	}
});