Ext.define('TMS.carrier.view.Grid', {
	extend: 'TMS.grid.Grid',
	
	//Config
	processingPage: '/at-ajax/modules/carrier/lookup/carrier',
	viewConfig: {
		stripeRows: true
	},
	autoLoadStore: true,
	
	initComponent: function(){
		this.dockedItems = this.dockedItems || [];
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
	
	initPager: function(){
		this.pager = new Ext.toolbar.Paging({
			store: this.store,
			displayInfo: true,
			dock:'top'
		});
		this.dockedItems.push(this.pager);
	},
	
	initListeners: function(){
		this.on('afterrender', function(){
			if(this.autoLoadStore){
				this.store.load();
			}
		}, this);
	},
	
	initColumns: function(){
		this.columns = [{
			header: 'Name',
			dataIndex: 'carrier_name',
			flex: 2,
			renderer: function(value, options, record){
				return Ext.String.format(
					'<a href="/carriers/?d=carriers&action=view&id={0}">{1}</a>',
					record.get('carrier_id'),
					value
				);
			}
		},{
			header: 'MC#',
			dataIndex: 'carrier_mc_no',
			flex: 1
		},{
			header: 'SCAC',
			dataIndex: 'carrier_scac',
			flex: 1
		},{
			header: 'City',
			dataIndex: 'location_city',
			flex: 1
		},{
			header: 'State',
			dataIndex: 'location_state',
			flex: 1
		},{
			header: 'Zip',
			dataIndex: 'location_zip',
			flex: 1
		}];
	},
	
	initStore: function(){
		this.store = new Ext.data.Store({
			fields: [
				'carrier_id',
				'carrier_scac',
				'carrier_name',
				'carrier_mc_no',
				'location_city',
				'location_state',
				'location_zip'
			],
			remoteSort: true,
			autoLoad: false,
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
	}
});