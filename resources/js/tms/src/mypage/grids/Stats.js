Ext.define('TMS.mypage.grids.Stats', {
	extend: 'Ext.grid.Panel',
	processingPages: {
		individual: '/at-ajax/modules/stats/leaderboard/individual',
		team: '/at-ajax/modules/stats/leaderboard/team',
		branch: '/at-ajax/modules/stats/leaderboard/branch'
	},
	
	//Config
	initComponent: function(){
		this.init();
		this.callParent(arguments);
	},
	
	//Init Functions
	init: function(){
		this.initColumns();
		this.initStore();
		this.initPager();
	},
	
	initPager: function(){
		//Tbar
		this.tbar = new Ext.toolbar.Paging({
			store: this.store,
			displayInfo: true
	   });
	},
	
	initColumns: function(){
		this.columns = [{
			header: 'Rank',
			dataIndex: 'rank',
			width: 50
		},{
			dataIndex: 'image',
			width: 50,
			renderer: function(value, options, record){
				return '<img src="' + value + '" width="30" />';
			}
		},{
			header: 'Name',
			dataIndex: 'name',
			flex: 1,
			renderer: function(value, options, record){
				if(record.get('url').length){
					return Ext.String.format(
						'<a href="{0}">{1}</a>',
						record.get('url'),
						value
					);
				}
				else{
					return value;
				}
			}
		},{
			header: 'Value',
			dataIndex: 'value'
		}];
	},
	
	initStore: function(){
		this.store = new Ext.data.Store({
			fields: [
				'name',
				'url',
				'image',
				'value',
				'rank'
			],
			remoteSort: true,
			remoteFilter: true
		});
		
		this.setProxy(this.processingPages.individual);
		
		this.on('afterrender', function(){
			this.store.load();
		}, this);
		
	},
	
	setProxy: function(url){
		this.store.setProxy({
			type: 'ajax',
			url : url,
			pageSize: 50,
			reader: {
				type: 'json',
				root: 'records'
			}
		});
	}
	
});