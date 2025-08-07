Ext.define('TMS.league.grid.Standings', {
	extend: 'TMS.grid.Grid',
	
	//Config
	processingPage: '/at-ajax/modules/league/season/standings',
	viewConfig: {
		stripeRows: true
	},
	
	initComponent: function() {
		this.dockedItems = this.dockedItems || [];
		this.plugins = this.plugins || [];
		this.init();
		this.callParent(arguments);
	},
	
	//Init Functions
	init: function() {
		this.initToolbar();
		this.initColumns();
		this.initStore();
	},
	
	initToolbar: function(){
		this.toolbar = new Ext.panel.Panel();
		this.tbar = this.toolbar;
	},
	
	initColumns: function() {
		this.columns = [{
			header: 'Rank',
			dataIndex: 'rank',
			width: 40
		},{
			dataIndex: 'team_pic',
			width: 75,
			renderer: function(value){
				return '<img src="' + value + '" width="50" />';
			}
		},{
			header: 'Team',
			dataIndex: 'team_name',
			flex: 1,
			renderer: function(value, options, record){
				return Ext.String.format(
					'<a href="/mypage/?section=teams&id={0}">{1}</a>',
					record.get('league_team_id'),
					value
				);
			}
		},{
			header: 'W',
			dataIndex: 'wins',
			width: 40,
			renderer: function(value){
				return '<span style="color: green">' + value + '</span>';
			}
		},{
			header: 'L',
			dataIndex: 'losses',
			width: 40,
			renderer: function(value){
				return '<span style="color: red">' + value + '</span>';
			}
		},{
			header: 'Points',
			dataIndex: 'points'
		}];
	},
	
	initStore: function(){
		this.store = new Ext.data.Store({
			fields: [
				'league_team_id',
				'team_name',
				'team_pic',
				'wins',
				'losses',
				'rank',
				'points'
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
		
		this.on('afterrender', function(){
			this.store.load();
		}, this);
	}
});