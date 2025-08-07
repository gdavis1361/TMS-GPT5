Ext.define('TMS.league.view.Game', {
	extend:'Ext.view.View',
	
	//Config
	autoScroll: true,
	multiSelect: false,
	trackOver: true,
	deferEmptyText:false,
	overItemCls: 'league-game-over',
	itemSelector: '.league-game',
	emptyText: 'No games...',
	
	//Inits
	initComponent: function(){
		this.items = [];
		this.dockedItems = [];
		this.init();
		return this.callParent(arguments);
	},
	
	init: function(){
		this.initTemplate();
	},
	
	initTemplate: function(){
		this.tpl = new Ext.XTemplate(
			'<tpl for=".">',
				'<div class="league-game-container">',
					'<div class="league-game">',
						'<div class="team home-team">',
							'<div class="image"><img src="{home_team_pic}" /></div>',
							'<div class="name">{[this.getTeamName(values.home_team_name)]}</div>',
							'<div class="score">{home_score}</div>',
							'<div class="clear"></div>',
						'</div>',
						'<div class="team away-team">',
							'<div class="image"><img src="{away_team_pic}" /></div>',
							'<div class="name">{[this.getTeamName(values.away_team_name)]}</div>',
							'<div class="score">{away_score}</div>',
							'<div class="clear"></div>',
						'</div>',
						'<div class="game-footer">',
							'Click to view game details',
						'</div>',
					'</div>',
				'</div>',
			'</tpl>',
			'<div class="clear"></div>',
			{
				getTeamName: function(team){
					if(!team.length){
						return 'Bye';
					}
					return team;
				}
			}
		);
	}
});