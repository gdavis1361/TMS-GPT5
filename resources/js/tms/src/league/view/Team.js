Ext.define('TMS.league.view.Team', {
	extend:'Ext.view.View',
	
	//Requires
	requires:[
		'TMS.league.store.Team'
	],
	
	//Config
	autoScroll: true,
	multiSelect: false,
	trackOver: true,
	deferEmptyText:false,
	overItemCls: 'league-team-over',
	itemSelector: '.league-team',
	emptyText: 'No teams...',
	
	//Inits
	initComponent: function(){
		this.items = [];
		this.dockedItems = [];
		this.init();
		return this.callParent(arguments);
	},
	
	init: function(){
		this.initTemplate();
		this.initStore();
	},
	
	initTemplate: function(){
		this.tpl = new Ext.XTemplate(
			'<tpl for=".">',
				'<div class="league-team">',
					'<div class="image"><img src="{team_pic}" /></div>',
					'<div class="name">{team_name}</div>',
				'</div>',
			'</tpl>'
		);
	},
	
	initStore: function(){
		if(this.store){
			return;
		}
		this.store = Ext.create('TMS.league.store.Team');
	}
});