Ext.define('TMS.orders.view.PostGrid', {
	extend: 'Ext.grid.Panel',
	
	//Config
	processingPage: '/at-ajax/modules/order/posting/get',
	viewConfig: {
		stripeRows: true
	},
	features: [{
		id: 'group',
		ftype: 'groupingsummary',
		groupHeaderTpl: 'Quote #: {name}',
		hideGroupedHeader: true,
		showSummaryRow: false,
		remoteRoot: 'summaryData'
	}],
	
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
	
	initListeners: function(){
		this.on('afterrender', function(){
			this.store.load();
		}, this);
		
		this.on('itemdblclick', function(view, record){
			this.setLoading(true);
			location.href = Ext.String.format('?d=quotes&a=show&id={0}', record.get('pre_order_id'));
		}, this);
	},
	
	initPager: function(){
		this.pager = new Ext.toolbar.Paging({
			store: this.store,
			displayInfo: true
		});
		this.tbar = this.pager;
	},
	
	initColumns: function(){
		this.columns = [{
			header: 'Pre Order',
			dataIndex: 'pre_order_id',
			flex: 1
		},{
			header: 'Service',
			dataIndex: 'posting_service_name',
			flex: 1,
			renderer: function(value, options, record){
				return Ext.String.format(
					'<a href="{0}" target="_blank">{1}</a>',
					record.get('url'),
					value
				);
			}
		},{
			header: 'Date',
			dataIndex: 'posting_created_at',
			flex: 1
		},{
			//?d=posts&a=cancel&id=17
			xtype:'templatecolumn',
			tpl:'<div class="button" style="width: 75px;">' +
				'<a href="?d=posts&a=cancel&id={pre_order_id}">' +
					'<img src="/resources/silk_icons/cross.png" /> ' +
							'Cancel' +
						'</a>' +
				'</div>'
		}];
	},
	
	initStore: function(){
		this.store = new Ext.data.Store({
			fields: [
				'pre_order_id',
				'posting_created_at',
				'posting_service_name',
				'url',
			],
			remoteSort: true,
			pageSize: 50,
			groupField: 'pre_order_id',
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