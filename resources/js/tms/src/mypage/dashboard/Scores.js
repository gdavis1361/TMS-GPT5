Ext.define('TMS.mypage.dashboard.Scores', {
	extend: 'Ext.panel.Panel',
	
	//Requires
	requires:[
		'Ext.ux.Spinner',
		'TMS.league.model.Week',
		'TMS.league.view.Week',
		'TMS.league.store.Team',
		'TMS.league.view.Game',
		'TMS.ActionWindow'
	],
	
	//Config
	layout: 'border',
	
	//Init Functions
	initComponent: function(){
		this.init();
		this.callParent(arguments);
	},
	
	init: function(){
		this.items = [];
		
		//Layout Containers
		this.initLeft();
		this.initCenter();
		
		//week
		//this.initWeekPanel();
		this.initWeekView();
		
		//Game
		this.initGameFilter();
		this.initGamePanel();
		this.initGameView();
		this.initGameDetails();
	},
	
	initLeft: function(){
		this.left = new Ext.panel.Panel({
			scope: this,
			region: 'west',
			width: 200,
			autoScroll: true
		});
		this.items.push(this.left);
	},
	
	initCenter: function(){
		this.center = new Ext.panel.Panel({
			scope: this,
			region: 'center',
			layout: 'fit',
			border: false
		});
		this.items.push(this.center);
	},
	
	initWeekView: function(){
		this.weekView = Ext.create('TMS.league.view.Week', {
			scope: this,
			store: new Ext.data.Store({
				model: 'TMS.league.model.Week'
			})
		});
		this.left.add(this.weekView);
		
		//Load the store after render
		this.on('afterrender', function(){
			this.weekView.store.load({
				params:{
					active: true
				}
			});
		}, this);
		
		//Listeners
		this.weekView.store.on('load', function(){
			this.left.doLayout();
		}, this);
		
		this.weekView.on('refresh', function(view, options){
			var nodes = this.weekView.getNodes();
			Ext.each(nodes, function(node){
				var record = this.weekView.getRecord(node);
				if(record.isActive()){
					this.weekView.select(record);
				}
			}, this);
		}, this);
	},
	
	initGameFilter: function(){
		
		//Team Combo
		this.teamCombo = new Ext.form.field.ComboBox({
			fieldLabel: 'Team',
			store: Ext.create('TMS.league.store.Team',{
				autoSync: false
			}),
			labelWidth: 60,
			queryMode: 'local',
			displayField: 'team_name',
			valueField: 'league_team_id'
		});
		
		this.teamCombo.store.on('load', function(){
			this.teamCombo.store.insert(0, {
				team_name: 'All Teams...',
				league_team_id: 0
			});
		}, this);
		
		this.teamCombo.on('select', function(combo, records, options){
			if(!records.length){
				return;
			}
			var record = records[0];
			if(record.get('league_team_id')){
				this.gameView.store.filter('team_id', record.get('league_team_id'));
			}
			else{
				Ext.each(this.gameView.store.filters.items, function(filter){
					if(filter.property == "team_id"){
						this.gameView.store.filters.remove(filter);
					}
				}, this);
				this.gameView.store.load();
			}
		}, this);
		
		//Branch Combo
		/*
		this.branchCombo = new Ext.form.field.ComboBox({
			fieldLabel: 'Branch',
			store: Ext.create('Ext.data.Store',{
				model: 'TMS.user.model.Branches',
				autoLoad: true
			}),
			labelWidth: 60,
			queryMode: 'local',
			displayField: 'branch_name',
			valueField: 'branch_id'
		});
		
		this.branchCombo.store.on('load', function(){
			this.branchCombo.store.insert(0, {
				branch_name: 'All Branches...',
				branch_id: 0
			});
		}, this);
		
		this.branchCombo.on('select', function(combo, records, options){
			if(!records.length){
				return;
			}
			var record = records[0];
			if(record.get('branch_id')){
				this.gameView.store.filter('branch_id', record.get('branch_id'));
			}
			else{
				this.gameView.store.clearFilter();
			}
		}, this);
		*/
		
		
		//Create the game filter toolbar to hold all the filters
		this.gameFilter = new Ext.toolbar.Toolbar({
			scope: this,
			items:[this.teamCombo]
		});
	},
	
	initGamePanel: function(){
		this.gamePanel = new Ext.panel.Panel({
			scope: this,
			layout: 'fit',
			height: 350,
			autoScroll: true,
			tbar: this.gameFilter
		});
		this.center.add(this.gamePanel);
	},
	
	initGameView: function(){
		this.gameView = Ext.create('TMS.league.view.Game', {
			store: new Ext.data.Store({
				model: 'TMS.league.model.Game',
				remoteFilter: true
			})
		});
		this.gamePanel.add(this.gameView);
		
		//listen for a week selection change
		this.weekView.on('selectionchange', function(view, records, options){
			if(!records.length){
				return;
			}
			
			var record = records[0];
			this.gameView.store.filter('week_id', record.get('week_id'));
		}, this);
	},
	
	initGameDetails: function(){
		this.gameDetailsTemplate = new Ext.XTemplate(
			'<div class="league-game-details">',
				'<div class="league-game-details-header">',
					'<div class="team-header home-team-header">',
						'<div class="image">',
							'<img src="{home_team.team_pic}" />',
						'</div>',
						'<div class="name">',
							'{home_team.team_name} <span class="record">({home_team.record.wins} - {home_team.record.losses})</span>',
						'</div>',
						'<div class="score">',
							'{home_score}',
						'</div>',
						'<div class="clear"></div>',
					'</div>',
					'<div class="team-header away-team-header">',
						'<div class="image">',
							'<img src="{away_team.team_pic}" />',
						'</div>',
						'<div class="name">',
							'{away_team.team_name} <span class="record">({away_team.record.wins} - {away_team.record.losses})</span>',
						'</div>',
						'<div class="score">',
							'{away_score}',
						'</div>',
						'<div class="clear"></div>',
					'</div>',
					'<div class="clear"></div>',
				'</div>',
				'<div class="league-game-details-body">',
					'<div class="home-team">',
						'<table width="100%">',
							'<thead>',
								'<tr>',
									'<th>',
										'{home_team.team_name}',
									'</th>',
									'<tpl for="dates">',
										'<th>{[this.renderDate(values.date)]}</th>',
									'</tpl>',
									'<th>',
										'Score',
									'</th>',
								'</tr>',
							'</thead>',
							'<tbody>',
								'<tpl for="home_team.members">',
									'<tr>',
										'<td class="member-name">',
											'<a href="/mypage?id={user_id}">{first_name} {last_name}</a>',
										'</td>',
										'<tpl for="stats">',
											'<td class="{[this.createDateClass(values.date)]}">',
												'{value}',
											'</td>',
										'</tpl>',
										'<td>',
											'{[this.computeAverage(values.stats)]}',
										'</td>',
									'</tr>',
								'</tpl>',
							'</tbody>',
						'</table>',
						'<div class="clear"></div>',
					'</div>',
					'<div class="away-team">',
						'<table width="100%">',
							'<thead>',
								'<tr>',
									'<th>',
										'{away_team.team_name}',
									'</th>',
									'<tpl for="dates">',
										'<th>{[this.renderDate(values.date)]}</th>',
									'</tpl>',
									'<th>',
										'Score',
									'</th>',
								'</tr>',
							'</thead>',
							'<tbody>',
								'<tpl for="away_team.members">',
									'<tr>',
										'<td class="member-name">',
											'<a href="/mypage?id={user_id}">{first_name} {last_name}</a>',
										'</td>',
										'<tpl for="stats">',
											'<td class="{[this.createDateClass(values.date)]}">',
												'{value}',
											'</td>',
										'</tpl>',
										'<td>',
											'{[this.computeAverage(values.stats)]}',
										'</td>',
									'</tr>',
								'</tpl>',
							'</tbody>',
						'</table>',
						'<div class="clear"></div>',
					'</div>',
				'</div>',
			'</div>',
			{
				renderDate: Ext.util.Format.dateRenderer('M jS'),
				createDateClass: function(date){
					return 'league-game-details-date-' + Ext.Date.format(new Date(date), 'n-j-y');
				},
				computeAverage: function(records){
					var total = 0;
					var count = 0;
					var today = new Date();
					Ext.each(records, function(record){
						//Dont compute dates greater than today
						var date = new Date(record.date);
						var value = parseInt(record.value);
						if(date <= today && value){
							total += value;
							count++;
						}
					}, this);
					if(count){
						return Math.ceil(total / count);
					}
					return 0;
				}
			}
		);
		this.gameContainer = new Ext.panel.Panel({
			scope: this,
			border: false,
			html: '',
			autoScroll: true
		});
		
		this.gameWindow = Ext.create('TMS.ActionWindow', {
			scope: this,
			autoShow: false,
			layout: 'fit',
			title: 'Game Details',
			frame: false,
			items: [this.gameContainer],
			closeAction: 'hide',
			modal: true,
			resizable: false
		});
		this.gameWindow.on('beforeshow', function(){
			this.gameWindow.setWidth(Ext.Element.getViewportWidth() * .7);
			this.gameWindow.setHeight(Ext.Element.getViewportHeight() * .7);
		}, this);

		//Listeners
		this.gameView.on('selectionchange', function(view, records, options){
			if(!records.length){
				return;
			}
			
			//Get the record
			var record = records[0];
			
			//show spinner
			var opts = {
				lines: 10, // The number of lines to draw
				length: 0, // The length of each line
				width: 5, // The line thickness
				radius: 10, // The radius of the inner circle
				color: '#fff', // #rbg or #rrggbb
				speed: 1, // Rounds per second
				trail: 100, // Afterglow percentage
				shadow: true // Whether to render a shadow
			};
			var spinner = new Spinner(opts).spin(this.gameView.getNode(record));
			
			Ext.Ajax.request({
				scope: this,
				url: '/at-ajax/modules/league/game/details',
				params: {
					game_id: record.get('game_id')
				},
				success: function(r){
					var response = Ext.decode(r.responseText);
					this.gameContainer.update(this.gameDetailsTemplate.apply(response.record), false, Ext.bind(function(){
						return;
						//Transform into grids
						var tables = this.gameContainer.getEl().select('table').elements;
						Ext.each(tables, function(table){
							table = Ext.get(table);
							var grid = Ext.create('Ext.ux.grid.TransformGrid', table.dom.id, {
								stripeRows: true,
								height: table.getHeight()
							});
							grid.render();
						}, this);
					}, this));
					this.gameWindow.show();
					spinner.stop();
					
					//Add class to todays date
					var selector = '.' + this.gameDetailsTemplate.createDateClass(new Date(), 'n/j/Y');
					this.gameContainer.getEl().select(selector).each(function(el){
						el.addCls('active-date');
					}, this);
				}
			});
		}, this);
	}
});