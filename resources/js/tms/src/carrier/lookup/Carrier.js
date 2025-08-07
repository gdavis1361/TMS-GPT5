Ext.define('TMS.carrier.lookup.Carrier', {
	extend: 'Ext.ux.form.field.RealComboBox',
	
	//Config
	processingPage: '/at-ajax/modules/carrier/lookup/carrier',
	displayField: 'carrier_name',
	valueField: 'carrier_id',
	emptyText: 'Search by name or mc number...',
	cls: 'carrier-lookup',
	typeAhead: false,
	hideTrigger:true,
	anchor: '100%',
	pageSize: 10,
	minChars: 0,
	listConfig: {
		loadingText: 'Searching...',
		cls: 'carrier-lookup-list',
		emptyText: 'No matching carriers found.',

		// Custom rendering template for each item
		getInnerTpl: function() {
			return '<div class="carrier-name">{carrier_name}</div>' +
					'<div class="carrier-number">{carrier_mc_no}</div>';
		}
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
				'carrier_id',
				'carrier_name',
				'carrier_mc_no'
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
				}
			}
		});
	}
});
            