Ext.define('TMS.league.form.Game', {
	extend:'Ext.form.Panel',
	requires:[
		'TMS.league.store.Team',
		'TMS.league.model.Game'
	],
	
	//Config
	bodyPadding: 10,
	showFooter: true,
	
	initComponent: function(){
		this.items = this.items || [];
		this.dockedItems = this.dockedItems || [];
		this.init();
		this.callParent(arguments);
	},
	
	init: function() {
		this.initStore();
		this.initHomeTeam();
		this.initAwayTeam();
		this.initHidden();
		this.initFooter();
	},
	
	initStore: function(){
		this.store = Ext.create('TMS.league.store.Team');
	},
	
	initHomeTeam: function(){
		this.homeTeam = new Ext.form.ComboBox({
			name: 'home_team_id',
			fieldLabel: 'Home Team',
			store: this.store,
			queryMode: 'local',
			displayField: 'team_name',
			valueField: 'league_team_id'
		});
		this.store.on('load', function(){
			this.homeTeam.setValue(this.homeTeam.getValue());
		}, this);
		this.items.push(this.homeTeam);
	},
	
	initAwayTeam: function(){
		this.awayTeam = new Ext.form.ComboBox({
			name: 'away_team_id',
			fieldLabel: 'Away Team',
			store: this.store,
			queryMode: 'local',
			displayField: 'team_name',
			valueField: 'league_team_id'
		});
		this.store.on('load', function(){
			this.awayTeam.setValue(this.awayTeam.getValue());
		}, this);
		this.items.push(this.awayTeam);
	},
	
	initHidden: function() {
		this.gameId = Ext.create('Ext.form.field.Hidden', {
			name: 'game_id'
		});
		this.items.push(this.gameId);
	},
	
	initFooter: function(){
		if(!this.showFooter){
			return false;
		}
		
		this.footer = new Ext.toolbar.Toolbar({
			dock: 'bottom',
			ui: 'footer',
			items: ['->', {
				scope: this,
				itemId: 'save',
				text: 'Save',
				formBind: true,
				handler: this.save
			}]
		});
		this.dockedItems.push(this.footer);
	},
	
	save: function(){
        var form = this.getForm();
		var record = form.getRecord();

		//If form is invalid return
		if(!form.isValid()){
			return;
		}
		
		//If there is not a record fire the create event, else update the record and fire the update event
        if (!record) {
			record = Ext.create('TMS.league.model.Game', form.getValues());
			this.setLoading('Saving...');
			record.save({
				scope: this,
				callback: function(records){
					this.setLoading(false);
					this.fireEvent('create', this, records);
				}
			});
        }
        else{
			this.setLoading('Saving...');
            form.updateRecord(record);
			record.save({
				scope: this,
				callback: function(records){
					this.setLoading(false);
					this.fireEvent('update', this, records);
				}
			});
        }
    },
	
	cancel: function(){
		this.fireEvent('cancel', this);
	}
});
Ext.define('TMS.league.form.Season', {
	extend:'Ext.form.Panel',
	
	//Requires
	requires:[
		'TMS.league.model.Season'
	],
	
	//Config
	bodyPadding: 10,
	showFooter: true,
	
	initComponent: function(){
		this.items = this.items || [];
		this.dockedItems = this.dockedItems || [];
		this.init();
		this.callParent(arguments);
	},
	
	init: function() {
		this.initTitle();
		this.initStartDate();
		this.initEndDate();
		this.initHidden();
		this.initFooter();
	},
	
	initTitle: function() {
		this.titleField = new Ext.form.field.Text({
			scope: this,
			name: 'title',
			fieldLabel: 'Title',
			allowBlank: false
		});
		this.items.push(this.titleField);
	},
	
	initStartDate: function(){
		this.startDate = new Ext.form.field.Date({
			scope: this,
			name: 'start_date',
			fieldLabel: 'Start Date',
			allowBlank: false
		});
		this.items.push(this.startDate);
	},
	
	initEndDate: function(){
		this.endDate = new Ext.form.field.Date({
			scope: this,
			name: 'end_date',
			fieldLabel: 'End Date',
			allowBlank: false
		});
		this.items.push(this.endDate);
	},
	
	initHidden: function() {
		this.seasonId = Ext.create('Ext.form.field.Hidden', {
			name:'season_id'
		});
		this.items.push(this.seasonId);
	},
	
	initFooter: function(){
		if(!this.showFooter){
			return false;
		}
		
		this.footer = new Ext.toolbar.Toolbar({
			dock: 'bottom',
			ui: 'footer',
			items: ['->', {
				scope: this,
				itemId: 'save',
				text: 'Save',
				formBind: true,
				handler: this.save
			},{
				text: 'Cancel',
				scope: this,
				handler: this.cancel
			}]
		});
		this.dockedItems.push(this.footer);
	},
	
	save: function(){
        var form = this.getForm();
		var record = form.getRecord();

		//If form is invalid return
		if(!form.isValid()){
			return;
		}
		
		//If there is not a record fire the create event, else update the record and fire the update event
        if (!record) {
			record = Ext.create('TMS.league.model.Season', form.getValues());
			this.setLoading('Saving...');
			record.save({
				scope: this,
				callback: function(records){
					this.setLoading(false);
					this.fireEvent('create', this, records);
				}
			});
        }
        else{
            form.updateRecord(record);
			this.fireEvent('update', this, record);
        }
    },
	
	cancel: function(){
		this.fireEvent('cancel', this);
	}
});
Ext.define('TMS.league.form.Week', {
	extend:'Ext.form.Panel',
	
	//Config
	bodyPadding: 10,
	showFooter: true,
	
	initComponent: function(){
		this.items = this.items || [];
		this.dockedItems = this.dockedItems || [];
		this.init();
		this.callParent(arguments);
	},
	
	init: function() {
		this.initTitle();
		this.initStartDate();
		this.initEndDate();
		this.initHidden();
		this.initFooter();
	},
	
	initTitle: function() {
		this.titleField = new Ext.form.field.Text({
			scope: this,
			name: 'title',
			fieldLabel: 'Title',
			allowBlank: false
		});
		this.items.push(this.titleField);
	},
	
	initStartDate: function(){
		this.startDate = new Ext.form.field.Date({
			scope: this,
			name: 'start_date',
			fieldLabel: 'Start Date',
			allowBlank: false
		});
		this.items.push(this.startDate);
	},
	
	initEndDate: function(){
		this.endDate = new Ext.form.field.Date({
			scope: this,
			name: 'end_date',
			fieldLabel: 'End Date',
			allowBlank: false
		});
		this.items.push(this.endDate);
	},
	
	initHidden: function() {
		this.weekId = Ext.create('Ext.form.field.Hidden', {
			name:'week_id'
		});
		this.items.push(this.weekId);
	},
	
	initFooter: function(){
		if(!this.showFooter){
			return false;
		}
		
		this.footer = new Ext.toolbar.Toolbar({
			dock: 'bottom',
			ui: 'footer',
			items: ['->', {
				scope: this,
				itemId: 'save',
				text: 'Save',
				formBind: true,
				handler: this.save
			}]
		});
		this.dockedItems.push(this.footer);
	},
	
	save: function(){
        var form = this.getForm();
		var record = form.getRecord();

		//If form is invalid return
		if(!form.isValid()){
			return;
		}
		
		//If there is not a record fire the create event, else update the record and fire the update event
        if (!record) {
            this.fireEvent('create', this, form.getValues());
        }
        else{
            form.updateRecord(record);
			this.fireEvent('update', this, record);
        }
    },
	
	cancel: function(){
		this.fireEvent('cancel', this);
	}
});
Ext.define('TMS.league.grid.Season', {
	extend: 'TMS.grid.Grid',
	
	//Requires
	requires:[
		'TMS.league.store.Season'
	],
	
	initComponent: function() {
		this.dockedItems = this.dockedItems || [];
		this.plugins = this.plugins || [];
		this.init();
		this.callParent(arguments);
	},
	
	//Init Functions
	init: function() {
		this.initEditing();
		this.initToolbar();
		this.initColumns();
		this.initStore();
		this.initPager();
	},
	
	initEditing: function(){
		this.editing = Ext.create('Ext.grid.plugin.CellEditing');
		this.plugins.push(this.editing);
	},
	
	initToolbar: function(){
		this.toolbar = new Ext.panel.Panel();
		this.tbar = this.toolbar;
	},
	
	initColumns: function() {
		this.columns = [{
			xtype:'actioncolumn', 
            width:50,
            items: [{
				scope: this,
                icon: '/resources/icons/edit-16.png',
                tooltip: 'Edit',
                handler: function(grid, rowIndex, colIndex) {
                    var record = grid.getStore().getAt(rowIndex);
					this.fireEvent('editaction', this, record);
                }
            },{
				scope: this,
                icon: '/resources/icons/delete-16.png',
                tooltip: 'Delete',
                handler: function(grid, rowIndex, colIndex) {
                    var record = grid.getStore().getAt(rowIndex);
					this.deleteRecord(record);
                }                
            }]
		},{
			header: 'Title',
			dataIndex: 'title',
			flex: 1,
			field: {
				type: 'textfield'
			}
		},{
			header: 'Start Date',
			dataIndex: 'start_date',
			flex: 1
		},{
			header: 'End Date',
			dataIndex: 'end_date',
			flex: 1
		}];
	},
	
	initStore: function(){
		if(this.store != null){
			return false;
		}
		this.store = Ext.create('TMS.league.store.Season');
	},
	
	initPager: function(){
		this.pager = new Ext.toolbar.Paging({
			store: this.store,
			displayInfo: true
		});
		this.toolbar.add(this.pager);
	},
	deleteRecord: function(record){
		this.fireEvent('delete', this, record);
		this.store.remove(record);
		record.destroy();
	}
});
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
Ext.define('TMS.league.model.Game', {
    extend: 'Ext.data.Model',
	idProperty: 'game_id',
	
	//Fields
    fields: [{
		name: 'game_id',
		type: 'int'
	},{
		name: 'week_id',
		type: 'int'
	},{
		name: 'home_team_id',
		type: 'int'
	},{
		name: 'away_team_id',
		type: 'int'
	},{
		name: 'winning_team_id',
		type: 'int'
	},{
		name: 'losing_team_id',
		type: 'int'
	},{
		name: 'home_team_name',
		type: 'string'
	},{
		name: 'away_team_name',
		type: 'string'
	},{
		name: 'home_team_pic',
		type: 'string'
	},{
		name: 'away_team_pic',
		type: 'string'
	},{
		name: 'home_team_record'
	},{
		name: 'away_team_record'
	},{
		name: 'home_score',
		type: 'int'
	},{
		name: 'away_score',
		type: 'int'
	}],

	//Proxy
	proxy: {
		type: 'ajax',
		api: {
			read: '/at-ajax/modules/league/game/read',
			create: '/at-ajax/modules/league/game/create',
			update: '/at-ajax/modules/league/game/update',
			destroy: '/at-ajax/modules/league/game/destroy'
		},
		reader: {
			idProperty: 'game_id',
			type: 'json',
			root: 'records',
			totalProperty: 'total'
		},
		writer: {
			type: 'json',
			allowSingle: false,
			writeAllFields: false,
			root: 'records',
			encode: true
		}
	}
	//Relations
	/*
	belongsTo:[{
		model: 'TMS.league.model.Week',
		primaryKey: 'game_id',
		associationKey: 'week_id',
		foreignKey: 'week_id',
		getterName: 'getWeek',
		setterName: 'setWeek'
	}]
	*/
});
Ext.define('TMS.league.model.Season', {
    extend: 'Ext.data.Model',
	idProperty: 'season_id',
	
	//Requires
	requires:[
		'TMS.league.model.Week'
	],
	
	//Fields
    fields: [{
		name: 'season_id',
		type: 'int'
	},{
		name: 'title',
		type: 'string'
	},{
		name: 'start_date',
		type: 'date'
		
	},{
		name: 'end_date',
		type: 'date'
	}],
	
	//Proxy
	proxy: {
		type: 'ajax',
		api: {
			read: '/at-ajax/modules/league/season/read',
			create: '/at-ajax/modules/league/season/create',
			update: '/at-ajax/modules/league/season/update',
			destroy: '/at-ajax/modules/league/season/destroy'
		},
		reader: {
			idProperty: 'season_id',
			type: 'json',
			root: 'records',
			totalProperty: 'total'
		},
		writer: {
			type: 'json',
			allowSingle: false,
			writeAllFields: false,
			root: 'records',
			encode: true
		}
	},

	//Relations
	hasMany: {
		model: 'TMS.league.model.Week',
		name: 'weeks',
		primaryKey: 'season_id',
		associationKey: 'season_id',
		foreignKey: 'season_id'
	}
});
Ext.define('TMS.league.model.Team', {
    extend: 'Ext.data.Model',
	idProperty: 'league_team_id',
	
	//Requires
	requires:[
		'TMS.league.model.Game'
	],
	
	//Fields
    fields: [{
		name: 'league_team_id',
		type: 'int'
	},{
		name: 'team_name',
		type: 'string'
	},{
		name: 'team_pic',
		type: 'string'
	},{
		name: 'team_music',
		type: 'string'

	},{
		name: 'team_video',
		type: 'string'
	},{
		name: 'captain_id',
		type: 'int'
	}],

	//Proxy
	proxy: {
		type: 'ajax',
		startParam: undefined,
		limitParam: undefined,
		api: {
			read: '/at-ajax/modules/league/team/read',
			create: '/at-ajax/modules/league/team/create',
			update: '/at-ajax/modules/league/team/update',
			destroy: '/at-ajax/modules/league/team/destroy'
		},
		reader: {
			idProperty: 'league_team_id',
			type: 'json',
			root: 'records',
			totalProperty: 'total'
		},
		writer: {
			type: 'json',
			allowSingle: false,
			writeAllFields: false,
			root: 'records',
			encode: true
		}
	}
});
Ext.define('TMS.league.model.Week', {
    extend: 'Ext.data.Model',
	idProperty: 'week_id',
	
	//Requires
	requires:[
		'TMS.league.model.Game'
	],
	
	//Fields
    fields: [{
		name: 'week_id',
		type: 'int'
	},{
		name: 'season_id',
		type: 'int'
	},{
		name: 'title',
		type: 'string'
	},{
		name: 'start_date',
		type: 'date'

	},{
		name: 'end_date',
		type: 'date'
	}],

	//Proxy
	proxy: {
		type: 'ajax',
		startParam: undefined,
		limitParam: undefined,
		api: {
			read: '/at-ajax/modules/league/week/read',
			create: '/at-ajax/modules/league/week/create',
			update: '/at-ajax/modules/league/week/update',
			destroy: '/at-ajax/modules/league/week/destroy'
		},
		reader: {
			idProperty: 'week_id',
			type: 'json',
			root: 'records',
			totalProperty: 'total'
		},
		writer: {
			type: 'json',
			allowSingle: false,
			writeAllFields: false,
			root: 'records',
			encode: true
		}
	},
	
	//Relations
	hasMany: [{
		model: 'TMS.league.model.Game',
		name: 'games',
		primaryKey: 'week_id',
		associationKey: 'week_id',
		foreignKey: 'week_id'
	}],
	belongsTo: 'TMS.league.model.Season',
	
	//Functions
	isActive: function(){
		var today = new Date();
		var startDate = new Date(this.get('start_date'));
		var endDate = new Date(this.get('end_date'));
		
		if(today >= startDate && today <= endDate){
			return true;
		}
		else{
			return false;
		}
	}
});
Ext.define('TMS.league.store.Season', {
	extend: 'Ext.data.Store',
	requires:[
		'TMS.league.model.Season'
	],
	model: 'TMS.league.model.Season',
	autoLoad: true,
    autoSync: true,
	remoteSort: true,
	pageSize: 10
});
Ext.define('TMS.league.store.Team', {
	extend: 'Ext.data.Store',
	requires:[
		'TMS.league.model.Team'
	],
	model: 'TMS.league.model.Team',
	autoLoad: true,
    autoSync: true,
	remoteSort: true
});
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
Ext.define('TMS.league.view.League', {
	extend:'Ext.panel.Panel',

	//Requires
	requires:[
		'TMS.league.store.Season',
		'TMS.league.grid.Season',
		'TMS.league.form.Season',
		'TMS.league.view.Schedule'
	],
	
	//Config
	layout: 'border',

	initComponent: function(){
		this.items = this.items || [];
		this.dockedItems = this.dockedItems || [];
		this.init();
		this.callParent(arguments);
	},
	
	init: function() {
		//Init Layout
		this.initCenter();
		this.initTabPanel();
		
		//Init Season Components
		this.initSeasonStore();
		this.initSeasonGrid();
		this.initSeasonForm();
		
		//Init schedule components
		this.initSchedule();
	},
	
	initCenter: function(){
		this.center = new Ext.panel.Panel({
			scope: this,
			region: 'center',
			layout: 'card'
		});
		this.items.push(this.center);
	}, 
	
	initTabPanel: function(){
		this.tabPanel = new Ext.tab.Panel({
			scope: this,
			activeTab: 0
		});
		this.center.add(this.tabPanel);
	},
	
	initSeasonStore: function(){
		this.seasonStore = Ext.create('TMS.league.store.Season');
	},
	
	initSeasonGrid: function(){
		this.seasonGrid = Ext.create('TMS.league.grid.Season', {
			scope: this,
			store: this.seasonStore
		});
		this.center.add(this.seasonGrid);
		this.setActiveItem(this.seasonGrid);
		
		//Add toolbar
		this.seasonGrid.toolbar.add(0, new Ext.toolbar.Toolbar({
			scope: this,
			items:[{
				scope: this,
				text: 'Add',
				handler: function(){
					this.setActiveItem(this.tabPanel);
					this.tabPanel.setActiveTab(this.seasonForm);
				}
			}]
		}));
		
		this.seasonGrid.on('editaction', function(grid, record){
			this.editSeason(record);
		}, this);
	},
	
	initSeasonForm: function(){
		this.seasonForm = Ext.create('TMS.league.form.Season', {
			scope: this,
			title: 'Details'
		});
		this.tabPanel.add(this.seasonForm);
		
		//Form listeners
		this.seasonForm.on('create', this.addSeason, this);
		this.seasonForm.on('update', this.updateSeason, this);
	},
	
	initSchedule: function(){
		this.schedule = Ext.create('TMS.league.view.Schedule', {
			scope: this,
			title: 'Schedule',
			disabled: true
		});
		this.tabPanel.add(this.schedule);
	},
	
	setActiveItem: function(item){
		if(this.center.rendered){
			this.center.getLayout().setActiveItem(item);
		}
		else{
			this.center.activeItem = item;
		}
	},
	
	getActiveItem: function(item){
		return this.center.getLayout().getActiveItem();
	},
	
	addSeason: function(form, records){
		this.seasonStore.add(records);
		this.setActiveItem(this.seasonGrid);
	},
	
	updateSeason: function(form, record){
		
	},
	
	editSeason: function(record){
		//Set the season form to active
		this.seasonForm.loadRecord(record);
		this.setActiveItem(this.tabPanel);
		this.tabPanel.setActiveTab(this.seasonForm);
		
		//Load the schedule
		this.loadSchedule(record);
	},
	
	loadSchedule: function(record){
		this.schedule.enable();
		this.schedule.loadSeason(record);
	},
	
	save: function(){
		//Save all forms
		this.seasonForm.save();
	}
});
Ext.define('TMS.league.view.Schedule', {
	extend:'Ext.panel.Panel',
	
	//Requires
	requires:[
		'TMS.league.view.Week',
		'TMS.league.view.Game',
		'TMS.league.form.Week',
		'TMS.league.form.Game'
	],
	
	//Config
	layout: 'border',

	//Inits
	initComponent: function(){
		this.items = [];
		this.dockedItems = [];
		this.init();
		return this.callParent(arguments);
	},
	
	init: function(){
		this.initCenter();
		this.initWest();
		this.initWeekView();
		this.initGameView();
	},
	
	initCenter: function(){
		this.center = new Ext.panel.Panel({
			scope: this,
			title: 'Games',
			region: 'center',
			layout: 'fit'
		});
		this.items.push(this.center);
	},
	
	initWest: function(){
		this.west = new Ext.panel.Panel({
			scope: this,
			title: 'Weeks',
			region: 'west',
			width: 250,
			autoScroll: true
		});
		this.items.push(this.west);
	},
	
	initWeekView: function(){
		this.weekView = Ext.create('TMS.league.view.Week', {
			scope: this
		});
		this.west.add(this.weekView);
		
		//Listeners
		this.weekView.on('selectionchange', function(view, records, options ){
			if(!records.length){
				return;
			}
			var record = records[0];
			this.gameView.bindStore(record.games());
			record.games().load();
		}, this);
		
		this.weekView.on('itemcontextmenu', function(view, record, item, index, event, options){
			event.preventDefault();
			event.stopPropagation();
			event.stopEvent();
			var menu = new Ext.menu.Menu({
				scope: this,
				items: [{
					scope: this,
					text: 'Edit',
					record: record,
					handler: function(item){
						this.editWeek(item.record);
					}
				}]
			});
			menu.showAt(event.getXY());
		}, this);
	},
	
	initGameView: function(){
		this.gameView = Ext.create('TMS.league.view.Game', {
			scope: this
		});
		this.center.add(this.gameView);
		
		this.gameView.on('itemcontextmenu', function(view, record, item, index, event, options){
			event.preventDefault();
			event.stopPropagation();
			event.stopEvent();
			var menu = new Ext.menu.Menu({
				scope: this,
				items: [{
					scope: this,
					text: 'Edit',
					record: record,
					handler: function(item){
						this.editGame(item.record);
					}
				}]
			});
			menu.showAt(event.getXY());
		}, this);
	},
	
	loadSeason: function(record){
		this.weekView.bindStore(record.weeks());
		record.weeks().load();
	},
	
	editWeek: function(record){
		if(this.weekForm == null){
			this.weekForm = Ext.create('TMS.league.form.Week');
			this.weekWindow = new Ext.window.Window({
				scope: this,
				title: '',
				items: [this.weekForm],
				closeAction: 'hide',
				modal: true
			});
		}
		this.weekWindow.setTitle(record.get('title'));
		this.weekForm.loadRecord(record);
		this.weekWindow.show();
	},
	
	editGame: function(record){
		if(this.gameForm == null){
			this.gameForm = Ext.create('TMS.league.form.Game');
			this.gameWindow = new Ext.window.Window({
				scope: this,
				title: '',
				items: [this.gameForm],
				closeAction: 'hide',
				modal: true
			});
		}
		//this.weekWindow.setTitle(record.get('title'));
		this.gameForm.loadRecord(record);
		this.gameWindow.show();
	}
});
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
Ext.define('TMS.league.view.Week', {
	extend:'Ext.view.View',
	
	//Config
	autoScroll: true,
	multiSelect: false,
	trackOver: true,
	deferEmptyText:false,
	overItemCls: 'league-week-over',
	itemSelector: '.league-week',
	emptyText: 'No weeks...',
	
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
				'<div class="league-week">',
					'<div class="title">{title}</div>',
					'<div class="date">{[this.renderDate(values.start_date)]} - {[this.renderDate(values.end_date)]}</div>',
				'</div>',
			'</tpl>',
			{
				renderDate: Ext.util.Format.dateRenderer('M j, Y')
			}
		);
	}
});
