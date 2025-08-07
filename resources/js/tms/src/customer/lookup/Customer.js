Ext.define('TMS.customer.lookup.Customer', {
	extend: 'Ext.ux.form.field.RealComboBox',
	
	//Config
	lastQueryValue: '',
	processingPage: '/at-ajax/modules/customer/lookup/customer',
	displayField: 'customer_name',
	valueField: 'customer_id',
	emptyText: 'Search by name...',
	cls: 'customer-lookup',
	typeAhead: false,
	hideTrigger:true,
	anchor: '100%',
	pageSize: 10,
	minChars: 0,
	width: 250,
	listConfig: {
		loadingText: 'Searching...',
		cls: 'customer-lookup-list',
		emptyText: 'No matching customers found.',

		// Custom rendering template for each item
		getInnerTpl: function() {
			return '<div class="customer-name">{customer_name}</div>';
		}
	},
	proxyParams:{},
	
	initComponent: function(){
		this.init();
		this.callParent(arguments);
	},
	
	//Init Functions
	init: function(){
		this.initStore();
		this.initListeners();
	},
	
	initListeners: function(){
	},
	
	initStore: function(){
		this.store = new Ext.data.Store({
			fields: [
				'customer_id',
				'customer_name'
			],
			remoteSort: true,
			pageSize: 10,
			proxy: {
				type: 'ajax',
				url : this.processingPage,
				extraParams:this.proxyParams,
				reader: {
					type: 'json',
					root: 'records',
					totalProperty: 'total'
				}
			}
		});
	}
});
            