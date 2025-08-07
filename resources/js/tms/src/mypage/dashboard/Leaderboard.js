Ext.define('TMS.mypage.dashboard.Leaderboard', {
	extend: 'Ext.panel.Panel',
	
	requires:[
		'TMS.mypage.Util',
		'TMS.mypage.filter.Filter',
		'TMS.mypage.grids.Stats'
	],
	
	//Config
	border: false,
	defaults: {
		cls: 'mypage-leaderboard'
	},
	chartHeight: 200,
	
	//Stat Types
	statTypes: [],
	
	//Init Functions
	initComponent: function(){
		this.init();
		this.callParent(arguments);
	},
	
	init: function(){
		this.items = [];
		
		//Filter
		this.initFilter();
		
		//Init the containers
		this.initLeaderPanel();
		this.initWestPanel();
		this.initCenterPanel();
		
		//Leaderboard charts
		this.initInfoTemplate();
		this.initIndividualChart();
		this.initTeamChart();
		this.initBranchChart();
		
		//Stats Grid
		this.initStatsGrid();
	},
	
	initLeaderPanel: function(){
		this.leaderPanel = new Ext.panel.Panel({
			scope: this,
			height: 300,
			layout: 'border',
			border: false,
			unstyled: true
		});
		this.items.push(this.leaderPanel);
	},
	
	initWestPanel: function(){
		this.westPanel = new Ext.panel.Panel({
			scope: this,
			region: 'west',
			width: 200,
			margin: '2',
			border: false,
			unstyled: true,
			layout: {
				type:'vbox',
				align:'stretch'
			}
		});
		this.leaderPanel.add(this.westPanel);
	},
	
	initCenterPanel: function(){
		this.centerPanel = new Ext.panel.Panel({
			scope: this,
			region: 'center',
			border: false,
			margin: '2',
			layout: {
				type: 'card',
				deferredRender: true
			},
			activeItem: false
		});
		this.on('afterrender', function(){
			this.westPanel.child('button').toggle(true);
		}, this);
		this.leaderPanel.add(this.centerPanel);
	},
	
	initFilter: function(){
		this.filterPanel = Ext.create('TMS.mypage.filter.Filter', {
			scope: this,
			border: false,
			unstyled: true
		});
		this.items.push(this.filterPanel);
	},
	
	initInfoTemplate: function(){
		this.infoTemplate = new Ext.XTemplate(
			'<div class="image">',
				'<img src="{image}" />',
				'<div class="name">',
					'{name}',
				'</div>',
			'</div>'
		);
	},
	
	initIndividualChart: function(){
		this.createLeaderboard({
			type: 'individual',
			title: 'Individual Leaders',
			chartClass: 'TMS.mypage.charts.leaderboard.Individual',
			icon: '/resources/icons/user-black-32.png'
		});
	},
	
	initTeamChart: function(){
		this.createLeaderboard({
			type: 'team',
			title: 'Team Leaders',
			chartClass: 'TMS.mypage.charts.leaderboard.Team',
			icon: '/resources/icons/group-black-32.png'
		});
	},
	
	initBranchChart: function(){
		this.createLeaderboard({
			type: 'branch',
			title: 'Branch Leaders',
			chartClass: 'TMS.mypage.charts.leaderboard.Branch',
			icon: '/resources/icons/group-black-32.png'
		});
	},
	
	initStatsGrid: function(){
		this.statsGrid = Ext.create('TMS.mypage.grids.Stats', {
			scope: this,
			title: 'Complete Leaders',
			margin: '10 0 0 0'
		});
		this.items.push(this.statsGrid);
		
		this.on('statchange', function(type){
			this.statsGrid.store.proxy.extraParams.type = type;
			this.statsGrid.store.loadPage(1);
		}, this);
		
		this.on('typechange', function(type){
			this.statsGrid.setProxy(this.statsGrid.processingPages[type]);
			this.statsGrid.store.loadPage(1);
		}, this);
		
		this.filterPanel.on('filter', function(panel, filter){
			Ext.apply(this.statsGrid.store.proxy.extraParams, filter);
			this.statsGrid.store.loadPage(1);
		}, this);
	},
	
	createLeaderboard: function(userConfig){
		//Create the default config
		var defaultConfig = {
			icon: ''
		};
		var config = {};
		Ext.apply(config, userConfig, defaultConfig);
		
		//Build the item string we will be creating
		var chart = config.type + 'Chart';
		var chartPanel = config.type + 'ChartPanel';
		var infoPanel = config.type + 'InfoPanel';
		var panel = config.type + 'Panel';
		var button = config.type + 'Button';
		
		//Create the chart
		this[chart] = Ext.create(config.chartClass, {
			height: this.chartHeight
		});
		
		//Tell the charts store to load after render
		this[chart].on('afterrender', function(){
			this[chart].store.load({
				params:{
					start: 0,
					limit: 5
				}
			});
		}, this);
		
		this[chart].on('itemclick', function(item){
			//Update the info template
			var record = item.storeItem;
			this[config.type + 'InfoPanel'].update(this.infoTemplate.apply({
				image: record.get('image'),
				name: record.get('name') + " (" + record.get('value') + ")"
			}));
		}, this);
		
		//Update the info panel after this charts store loads
		this[chart].store.on('load', function(store, records){
			if(records.length){
				//get the last record
				var record = records[records.length-1];
				
				//Update the info template
				this[config.type + 'InfoPanel'].update(this.infoTemplate.apply({
					image: record.get('image'),
					name: record.get('name') + " (" + record.get('value') + ")"
				}));
			}
		}, this);
		
		//Create the charts panel
		this[chartPanel] = new Ext.panel.Panel({
			columnWidth: 1,
			border: false
		});
		
		this[chartPanel].on('afterrender', function(){
			this[chart].setWidth(this[chartPanel].getWidth());
			this[chartPanel].add(this[chart]);
			this[chartPanel].doLayout();
		}, this);
		
		//Create the info panel
		this[infoPanel] = new Ext.panel.Panel({
			width: 200,
			height: this.chartHeight,
			border: false,
			autoHeight: true,
			html: '&nbsp;'
		});
		
		//Create the container panel
		this[panel] = new Ext.panel.Panel(Ext.apply({
			//Config
			title: config.title,
			layout: 'column',
			autoHeight: true,
			
			//Items
			items: [this[infoPanel], this[chartPanel]]

//			tbar: new Ext.toolbar.Paging({
//				store: this[chart].store,
//				displayInfo: true,
//				displayMsg: 'Rankings: {0} - {1}'
//		   })
		}, this.defaults));
		
		//Add a button/menu to the header
		this[panel].on('afterrender', function(panel, options){
			this.createStatTypeMenu(options.panel, options.chart);
		}, this, { panel: this[panel], chart: this[chart]});
		
		//Create some store listeners
		this[chart].store.on('beforeload', function(store, operation, options){
			options.panel.setLoading(true);
		}, this, { panel: this[panel] });
		
		this[chart].store.on('load', function(store, records, successful, options){
			options.panel.setLoading(false);
		}, this, { panel: this[panel] });
		
		//listen for filter change
		this.filterPanel.on('filter', function(panel, filter, options){
			Ext.apply(options.chart.store.proxy.extraParams, filter);
			if(options.chart.rendered && this.centerPanel.getLayout().getActiveItem() == options.container){
				options.chart.store.load();
			}
		}, this, {chart: this[chart], container:this[panel]});
		
		
		//Add the container panel to the center panel
		this.centerPanel.add(this[panel]);
		
		//Create the button
		this[button] = new Ext.button.Button({
			scope: this,
			text: config.title,
			panel: this[panel],
			cls: 'leaderboard-button',
			icon: config.icon,
			type: config.type,
			scale: 'large',
			margin: '5',
			flex: 1,
			enableToggle: true,
			toggleGroup: 'tms-stats-leaderboard'
		});
		this[button].on('toggle', function(button, pressed, options){
			if(pressed){
				this.centerPanel.getLayout().setActiveItem(button.panel);
				this.fireEvent('typechange', button.type);
			}
		}, this);
		this.westPanel.add(this[button]);
	},
	
	createStatTypeMenu: function(panel, chart){
		if(panel.header == null){
			return false;
		}
		
		//Create the menu
		var menu = new Ext.menu.Menu();
		
		//create the menu button
		var menuButton = new Ext.button.Button({
			text: 'Stat Type (Points)',
			icon: '/resources/icons/bar-chart-16.png',
			menu: menu
		});
		
		//Create the menu items
		Ext.each(TMS.mypage.Util.getStatTypes(), function(type){
			var menuItem = new Ext.menu.Item({
				scope: this,
				text: type.title,
				chart: chart,
				panel: panel,
				type: type,
				parentMenu: menu,
				parentMenuButton: menuButton,
				handler: function(button){
					//Set the parent text
					button.parentMenuButton.setText('Stat Type (' + button.text + ')');
					button.panel.doComponentLayout();
					
					//Set the stores proxy to load this stat type
					button.chart.store.proxy.extraParams.type = button.type.field;
					button.chart.store.loadPage(1);
					
					//Fire event
					this.fireEvent('statchange', button.type.field);
				}
			});
			menu.add(menuItem);
		}, this);
		
		panel.header.add(menuButton);
		panel.header.doComponentLayout();
	}
});