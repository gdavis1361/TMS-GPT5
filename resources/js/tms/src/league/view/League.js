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