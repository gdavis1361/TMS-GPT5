Ext.ns('TMS.contacts.lookup.ContactTypes');
TMS.contacts.lookup.ContactTypes = {
	Contact: 'contact',
    Customer: 'customer',
    Carrier: 'carrier'
};

Ext.define('TMS.contacts.lookup.Contact', {
	extend: 'Ext.ux.form.field.RealComboBox',
	
	//Config
	type: TMS.contacts.lookup.ContactTypes.Contact,
	processingPage: '/at-ajax/modules/contact/lookup/contact',
	displayField: 'name',
	valueField: 'contact_id',
	emptyText: 'Search for contact...',
	typeAhead: false,
	hideTrigger:true,
	anchor: '100%',
	pageSize: 10,
	minChars: 0,
	listConfig: {
		loadingText: 'Searching...',
		emptyText: 'No matching contacts found.',

		// Custom rendering template for each item
		getInnerTpl: function() {
			return '{name}';
		}
	},
	params: {},
	
	constructor: function(){
		this.params = {};
		this.callParent(arguments);
	},
	
	initComponent: function(){
		this.init();
		this.callParent(arguments);
	},
	
	//Init Functions
	init: function(){
		this.initStore();
	},
	
	initStore: function(){
		this.store = new Ext.data.Store({
			fields: [
				'contact_id',
				'first_name',
				'last_name',
				'name',
				'location_id'
			],
			remoteSort: true,
			pageSize: 10,
			proxy: {
				type: 'ajax',
				url : this.processingPage,
				reader: {
					type: 'json',
					root: 'records',
					totalProperty: 'total'
				},
				extraParams: Ext.apply(this.params, {
					type: this.type
				})
			}
		});
	},
	
	setParam: function(param, value){
		this.store.proxy.extraParams[param] = value;
	}
});
            