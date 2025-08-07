Ext.define('TMS.calendar.view.Full', {
	extend: 'Ext.container.Viewport',
	requires:[
		'TMS.calendar.Calendar'
	],
	
	//Config
	layout: 'border',
	renderTo: Ext.getBody(),
	
	//Init Functions
	initComponent: function(){
		Ext.get('content').remove(true);
		this.items = [];
		this.init();
		this.callParent(arguments);
	},
	
	init: function(){
		this.initNorthPanel();
		this.initCenterPanel();
		this.initCalendar();
		this.initWestPanel();
	},
	
	initNorthPanel: function(){
		this.northPanel = new Ext.panel.Panel({
			scope: this,
			region: 'north',
			contentEl: 'header',
			height: Ext.get('header').getHeight()
		});
		this.items.push(this.northPanel);
	},
	
	initCenterPanel: function(){
		this.centerPanel = new Ext.panel.Panel({
			region: 'center',
			layout: 'fit'
		});
		this.items.push(this.centerPanel);
	},
	
	initWestPanel: function(){
		this.westPanel = new Ext.panel.Panel({
			scope: this,
			region: 'west',
			width: 176,
			border: false,
			layout: 'vbox',
			items: [{
				xtype: 'datepicker',
				listeners: {
					scope: this,
					'select': {
						fn: function(dp, dt){
							this.calendar.setStartDate(dt);
						},
						scope: this
					}
				}
			},{
				scope: this,
				xtype: 'extensible.calendarlist',
				store: this.calendar.calendarStore,
				collapsible: false,
				border: false,
				flex: 1,
				width: 175
			}]
		});
		this.items.push(this.westPanel);
	},
	
	initCalendar: function(){
		this.calendar = Ext.create('TMS.calendar.Calendar');
		this.centerPanel.add(this.calendar);
	}
});

