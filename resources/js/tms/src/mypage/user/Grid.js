Ext.define('TMS.mypage.user.Grid', {
	extend: 'Ext.grid.Panel',
	
	//Config
	processingPage: '/at-ajax/modules/stats/user/grid',
	
	initComponent: function(){
		this.init();
		this.callParent(arguments);
	},
	
	//Init Functions
	init: function(){
		this.initListeners();
		this.initColumns();
		this.initStore();
	},
	
	initListeners: function(){
		this.on('afterrender', function(){
			this.store.load();
		}, this);
	},
	
	initColumns: function(){
		this.columns = [{
			header: 'Name',
			dataIndex: 'name',
			flex: 1
		},{
			header: 'Value',
			dataIndex: 'value'
		}];
	},
	
	initStore: function(){
		this.store = new Ext.data.Store({
			fields: [
				'name',
				'value'
			],
			proxy: {
				type: 'ajax',
				url : this.processingPage,
				reader: {
					type: 'json',
					root: 'records'
				}
			}
		});
	}
});