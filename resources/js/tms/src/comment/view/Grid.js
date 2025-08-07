Ext.define('TMS.comment.view.Grid', {
	extend: 'Ext.grid.Panel',
	
	requires:[
		'Ext.ux.RowExpander'
	],
	
	processingPage: '/at-ajax/modules/comment/process/',
	viewConfig: {
		stripeRows: true
	},
	features: [{
		ftype: 'rowbody',
		getAdditionalData: function(data, idx, record, orig) {
			var headerCt = this.view.headerCt,
				colspan  = headerCt.getColumnCount();

			return {
				rowBody: record.get('comment'),
				rowBodyCls: this.rowBodyCls,
				rowBodyColspan: colspan
			};
		}
	}],
	disableSelection: true,
	
	field_value:0,
	type: 'contact',
	
	initComponent: function(){
		this.init();
		this.callParent(arguments);
	},
	
	init: function(){
		this.initColumns();
		this.initStore();
		this.initPager();
		this.initListeners();
	},
	
	initColumns: function(){
		this.columns = [{
			header: 'Comment About',
			dataIndex: 'field_display',
			width: 100,
			xtype:'templatecolumn',
			tpl:'{field_display}'
		},{
			header:'Created By',
			dataIndex: 'created_by_first_name',
			width: 100,
			xtype:'templatecolumn',
			tpl:'{created_by_first_name} {created_by_last_name}'
		},{
			header:'Created At',
			dataIndex:'created_at'
		},{
			header:'Type',
			dataIndex:'comment_type_name'
		},{
			header:'Comment',
			dataIndex:'comment',
			flex:1,
			sortable:false
		}];
	},
	
	initStore: function(){
		this.store = new Ext.data.Store({
			fields: [
				'comment_id',
				'comment',
				
				'field_value',
				'field_display',
				
				'created_by_id',
				'created_by_first_name',
				'created_by_last_name',
				
				'created_at',
				'updated_at',
				'comment_type_id',
				
				'comment_type_name'
			],
			remoteSort: true,
			pageSize: 10,
			proxy: {
				type: 'ajax',
				url : this.processingPage + 'get-grid-records',
				reader: {
					type: 'json',
					root: 'records',
					totalProperty: 'total'
				},
				extraParams:{
					field_value:this.field_value,
					type:this.type
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
		
		this.store.on('load', function(store, records) {
			return;
			var nodes = this.getView().getNodes();
			Ext.each(nodes, function(node){
				Ext.create('Ext.tip.ToolTip', {
					scope: this,
					target: node,
					anchor: 'top',
					autoHide: true,
					html: this.getView().getRecord(node).get('comment'),
					listeners: {
						'beforeshow': Ext.bind(function(){
							
						}, this)
					}
				});
			}, this);
		}, this);
	}
	
});