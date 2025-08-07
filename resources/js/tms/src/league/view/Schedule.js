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