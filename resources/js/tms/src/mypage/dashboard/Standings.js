Ext.define('TMS.mypage.dashboard.Standings', {
	extend: 'Ext.panel.Panel',
	
	//Requires
	requires:[
		'TMS.league.store.Season',
		'TMS.league.grid.Standings'
	],
	
	//Config
	layout: 'fit',

	//Init Functions
	initComponent: function(){
		this.init();
		this.callParent(arguments);
	},
	
	init: function(){
		this.items = [];
		this.dockedItems = [];
		
		this.initToolbar();
		this.initSeasonCombo();
		this.initStandingsGrid();
	},
	
	initToolbar: function(){
		this.toolbar = new Ext.toolbar.Toolbar({
			scope: this,
			docked: 'top'
		});
		
		this.dockedItems.push(this.toolbar);
	},
	
	initSeasonCombo: function(){
		this.seasonCombo = Ext.create('Ext.form.ComboBox', {
			fieldLabel: 'Season',
			store: Ext.create('TMS.league.store.Season'),
			queryMode: 'local',
			displayField: 'title',
			valueField: 'season_id'
		});
		this.toolbar.add(this.seasonCombo);
		
		this.seasonCombo.on('select', function(field, records, options){
			if(!records.length){
				return;
			}
			
			var record = records[0];
			this.standingsGrid.store.load({
				params:{
					season_id: record.get('season_id')
				}
			});
		}, this);
	},
	
	initStandingsGrid: function(){
		this.standingsGrid = Ext.create('TMS.league.grid.Standings', {
			scope: this
		});
		this.items.push(this.standingsGrid);
	}
});