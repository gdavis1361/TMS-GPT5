Ext.define('TMS.mypage.dashboard.Teams', {
	extend: 'Ext.panel.Panel',
	
	//Requires
	requires:[
		'TMS.league.view.Team'
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
		
		//Containers
		this.initLeft();
		this.initCenter();
		
		//Views
		this.initTeamView();
		this.initTeamDetails();
	},
	
	initLeft: function(){
		this.left = new Ext.panel.Panel({
			scope: this,
			region: 'west',
			width: 250,
			autoScroll: true
		});
		this.items.push(this.left);
	},
	
	initCenter: function(){
		this.center = new Ext.panel.Panel({
			scope: this,
			layout: 'fit',
			region: 'center',
			border: false
		});
		this.items.push(this.center);
	},
	
	initTeamView: function(){
		this.teamView = Ext.create('TMS.league.view.Team', {
			scope: this
		});
		this.left.add(this.teamView);
		
		//Listeners
		this.teamView.store.on('load', function(){
			this.left.doLayout();
		}, this);
		
		this.teamView.store.on('load', function(store, records){
			var parts = location.href.split('?');
			var record = records[0];
			if(parts.length){
				var params = Ext.Object.fromQueryString(parts[1]);
				if(params.id != null){
					record = this.teamView.store.getAt(this.teamView.store.find('league_team_id', params.id));
				}
			}
			
			//Select a record if not null
			if(record != null){
				this.teamView.select(record);
				this.teamView.getNode(record).scrollIntoView(this.left.body);
			}
		}, this, {single: true});
	},
	
	initTeamDetails: function(){
		this.teamDetailsTemplate = new Ext.XTemplate(
			'<div class="league-team-details">',
				'<div class="league-team-details-header">',
					'<div class="image"><img src="{team_pic}" /></div>',
					'<div class="name">{team_name}</div>',
					'<div class="record">{[this.computeRecord(values)]}</div>',
				'</div>',
				'<div class="sub-header">Schedule</div>',
				'<div class="schedule">',
					'<table width="100%">',
						'<thead>',
							'<tr>',
								'<th>',
									'Week',
								'</th>',
								'<th>',
									'Date',
								'</th>',
								'<th>',
									'Opponent',
								'</th>',
								'<th>',
									'Result',
								'</th>',
							'</tr>',
						'</thead>',
						'<tbody>',
							'<tpl for="schedule">',
								'<tr>',
									'<td>',
										'{title}',
									'</td>',
									'<td>',
										'{[this.renderGameDate(values.start_date)]} - {[this.renderGameDate(values.end_date)]}',
									'</td>',
									'<td>',
										'{[this.getOpponent(values, parent)]}',
									'</td>',
									'<td>',
										'{[this.getResult(values, parent)]}',
									'</td>',
								'</tr>',
							'</tpl>',
						'</tbody>',
					'</table>',
				'</div>',
				'<div class="sub-header" style="margin-top: 10px;">Roster</div>',
				'<div class="members">',
					'<table width="100%">',
						'<thead>',
							'<tr>',
								'<th>',
									'Rank',
								'</th>',
								'<th>',
									'Name',
								'</th>',
								'<th>',
									'Joined',
								'</th>',
							'</tr>',
						'</thead>',
						'<tbody>',
							'<tpl for="members">',
								'<tr>',
									'<td width="40">',
										'{rank}',
									'</td>',
									'<td>',
										'{first_name} {last_name}',
									'</td>',
									'<td>',
										'{[this.renderDate(values.created_at)]}',
									'</td>',
								'</tr>',
							'</tpl>',
						'</tbody>',
					'</table>',
				'</div>',
			'</div>',
			{
				renderGameDate: Ext.util.Format.dateRenderer('M jS'),
				renderDate: Ext.util.Format.dateRenderer('F j, Y'),
				getOpponent: function(values, parent){
					if(values.home_team_id != parent.league_team_id){
						return values.home_team_name;
					}
					else{
						return values.away_team_name;
					}
				},
				getResult: function(values, parent){
					var result = "";
					if(parseInt(values.winning_team_id)){
						if(values.winning_team_id == parent.league_team_id){
							result = '<span style="color: green">W</span>';
						}
						else{
							result = '<span style="color: red">L</span>';
						}
					}
					
					return Ext.String.format(
						"{0} ({1} - {2})",
						result,
						values.home_score,
						values.away_score
					);
				},
				computeRecord: function(values){
					//Loop through schedule and compute record
					var wins = 0;
					var losses = 0;
					
					Ext.each(values.schedule, function(game){
						if(game.winning_team_id == values.league_team_id){
							wins++;
						}
						if(game.losing_team_id == values.league_team_id){
							losses++;
						}
					});
					
					return Ext.String.format(
						"({0} - {1})",
						wins,
						losses
					);
				}
			}
		);
			
		this.teamDetails = new Ext.panel.Panel({
			scope: this,
			border: false,
			bodyPadding: 10,
			autoScroll: true
		});
		this.center.add(this.teamDetails);
		
		//Listeners
		this.teamView.on('selectionchange', function(view, records, options){
			if(!records.length){
				return;
			}
			
			var record = records[0];
			this.teamDetails.update('');
			this.teamDetails.setHeight(150);
			this.teamDetails.setLoading(true);
			Ext.Ajax.request({
				scope: this,
				url: '/at-ajax/modules/league/team/details',
				params: {
					league_team_id: record.get('league_team_id')
				},
				success: function(r){
					var response = Ext.decode(r.responseText);
					this.teamDetails.update(this.teamDetailsTemplate.apply(response.record), false, Ext.bind(function(){
						return;
						//Transform into grids
						var containers = this.teamDetails.getEl().select('.members').elements;
						Ext.each(containers, function(container){
							container = Ext.get(container);
							var table = container.down('table');
							var grid = Ext.create('Ext.ux.grid.TransformGrid', table.dom.id, {
								stripeRows: true
							});
							var panel = new Ext.panel.Panel({
								scope: this,
								items:[grid],
								renderTo: container
							});
						}, this);
					}, this));
					this.teamDetails.setHeight(null);
					this.teamDetails.setLoading(false);
				}
			});
		}, this);
	}
});