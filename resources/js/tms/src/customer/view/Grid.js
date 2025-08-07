Ext.define('TMS.customer.view.Grid', {
	extend: 'Ext.grid.Panel',
	
	//Config
	processingPage: '/at-ajax/modules/customer/process/get-grid-records',
	viewConfig: {
		stripeRows: true
	},
	
	initComponent: function(){
		this.init();
		this.callParent(arguments);
	},
	
	//Init Functions
	init: function(){
		this.initColumns();
		this.initStore();
		this.initPager();
		this.initListeners();
	},
	
	initColumns: function(){
		this.columns = [{
			header: 'Name',
			dataIndex: 'customer_name',
			flex: 5,
			renderer: function(value, options, record){
				return Ext.String.format(
					'<a href="/customers/?d=customers&a=view&id={0}">{1}</a>',
					record.get('customer_id'),
					value
				);
			}
		},{
			header: 'Locations',
			flex: 1,
			dataIndex: 'location_count'
		}];
	},
	
	initStore: function(){
		this.store = new Ext.data.Store({
			fields: [
				'customer_id',
				'customer_name',
				'location_count'
			],
			remoteSort: true,
			pageSize: 20,
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
	},
	
	initPager: function(){
		this.pager = new Ext.toolbar.Paging({
			store: this.store,
			displayInfo: true
		});
		this.tbar = this.pager;
	},
	
	initListeners: function(){
		this.on('afterrender', function(){
			this.store.load();
		}, this);
		
		this.on('itemdblclick', function(view, record){
			this.setLoading(true);
			location.href = Ext.String.format('/customers/?d=customers&a=view&id={0}', record.get('customer_id'));
		}, this);
	},
	
	initFilters: function(){
		this.filterPanel.add(new Ext.form.field.Text({ fieldLabel: 'Name'}));
	}
	
});