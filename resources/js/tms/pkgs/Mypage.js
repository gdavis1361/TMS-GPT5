Ext.define('TMS.mypage.charts.leaderboard.Branch', {
	extend: 'Ext.chart.Chart',
	
	requires:[
		'TMS.mypage.charts.Theme'
	],
	
	//Config
	processingPage: '/at-ajax/modules/stats/leaderboard/branch',
	animate: true,
	shadow: true,
	theme: 'TMS',
	axes: [{
		type: 'Numeric',
		position: 'bottom',
		fields: ['value'],
		grid: true,
		minimum: 0
	}, {
		type: 'Category',
		position: 'left',
		fields: ['name']
	}],
	series: [{
		type: 'bar',
		axis: 'bottom',
		highlight: true,
		label: {
			display: 'insideEnd',
			field: 'value',
			renderer: Ext.util.Format.numberRenderer('0'),
			orientation: 'horizontal',
			color: '#333',
			'text-anchor': 'middle'
		},
		xField: 'name',
		yField: ['value']
	}],
	
	//Inits
	initComponent: function(){
		this.init();
		this.callParent(arguments);
	},
	
	init: function(){
		this.initStore();
	},
	
	initStore: function(){
		this.store = new Ext.data.Store({
			fields: [
				'name',
				'value',
				'image'
			],
			proxy: {
				type: 'ajax',
				url : this.processingPage,
				reader: {
					type: 'json',
					root: 'records'
				},
				extraParams:{
					reverse: true
				}
			}
		});
	}
	
});
Ext.define('TMS.mypage.charts.leaderboard.Individual', {
	extend: 'Ext.chart.Chart',

	requires:[
		'TMS.mypage.charts.Theme'
	],
	
	//Config
	processingPage: '/at-ajax/modules/stats/leaderboard/individual',
	animate: true,
	shadow: true,
	theme: 'TMS',
	axes: [{
		type: 'Numeric',
		position: 'bottom',
		fields: ['value'],
		grid: true,
		minimum: 0
	}, {
		type: 'Category',
		position: 'left',
		fields: ['name']
	}],
	series: [{
		type: 'bar',
		axis: 'bottom',
		highlight: true,
		label: {
			display: 'insideEnd',
			field: 'value',
			orientation: 'horizontal',
			color: '#333',
			'text-anchor': 'middle'
		},
		xField: 'name',
		yField: ['value'],
		tips:{
			renderer: function(storeItem, item) {
				this.update(Ext.String.format(
					"<div class=\"tip-title\">{0}</div>" + 
					"<div class=\"tip-text\"><b>Value:</b> {1}</div>",
					storeItem.get('name'),
					storeItem.get('value')
				));
			}
		}
	}],
	
	//Inits
	initComponent: function(){
		this.init();
		this.callParent(arguments);
	},
	
	init: function(){
		this.initListeners();
		this.initStore();
	},
	
	initListeners: function(){
		this.on('afterrender', function(){
			var series = this.series.get(0);
			series.on('itemmouseup', function(item) {
				 this.fireEvent('itemclick', item);
			}, this);
		}, this);
	},
	
	initStore: function(){
		this.store = new Ext.data.Store({
			fields: [
				'name',
				'value',
				'image'
			],
			autoLoad: false,
			pageSize: 5,
			proxy: {
				type: 'ajax',
				url : this.processingPage,
				reader: {
					type: 'json',
					root: 'records',
					totalProperty: 'total'
				},
				extraParams:{
					reverse: true
				}
			}
		});
	}
	
});
Ext.define('TMS.mypage.charts.leaderboard.Team', {
	extend: 'Ext.chart.Chart',
	
	requires:[
		'TMS.mypage.charts.Theme'
	],
	
	//Config
	processingPage: '/at-ajax/modules/stats/leaderboard/team',
	animate: true,
	shadow: true,
	theme: "TMS",
	axes: [{
		type: 'Numeric',
		position: 'bottom',
		fields: ['value'],
		grid: true,
		minimum: 0
	}, {
		type: 'Category',
		position: 'left',
		fields: ['name']
	}],
	series: [{
		type: 'bar',
		axis: 'bottom',
		highlight: true,
		color: '#FFFFFF',
		label: {
			display: 'insideEnd',
			field: 'value',
			renderer: Ext.util.Format.numberRenderer('0'),
			orientation: 'horizontal',
			color: '#333',
			'text-anchor': 'middle'
		},
		xField: 'name',
		yField: ['value'],
		tips:{
			renderer: function(storeItem, item) {
				this.update(Ext.String.format(
					"<div class=\"tip-title\">{0}</div>" + 
					"<div class=\"tip-text\"><b>Value:</b> {1}</div>",
					storeItem.get('name'),
					storeItem.get('value')
				));
			}
		}
	}],
	
	//Inits
	initComponent: function(){
		this.init();
		this.callParent(arguments);
	},
	
	init: function(){
		this.initStore();
	},
	
	initStore: function(){
		this.store = new Ext.data.Store({
			fields: [
				'name',
				'value',
				'image'
			],
			pageSize: 5,
			proxy: {
				type: 'ajax',
				url : this.processingPage,
				reader: {
					type: 'json',
					root: 'records',
					totalProperty: 'total'
				},
				extraParams:{
					reverse: true
				}
			}
		});
	}
	
});
Ext.define('TMS.mypage.charts.Compare', {
	extend: 'Ext.chart.Chart',
	
	requires:[
		'TMS.mypage.charts.Theme'
	],
	
	//Config
	processingPage: '/at-ajax/modules/stats/user/compare',
	chartType: 'points',
	chartTypeTitle: 'Points',
	animate: true,
	shadow: true,
	theme: 'TMS',
	legend: {
		position: 'top'
	},
	axes: [{
		type: 'Numeric',
		position: 'left',
		fields: ['value', 'company', 'branch'],
		grid: true,
		minimum: 0
	}, {
		type: 'Category',
		position: 'bottom',
		fields: ['date']
	}],
	
	//Inits
	initComponent: function(){
		this.init();
		this.callParent(arguments);
	},
	
	init: function(){
		this.initChartSeries();
		this.initStore();
		this.initListeners();
	},
	
	initChartSeries: function(){
		this.series = [{
			title: "My Average",
			type: 'line',
			highlight: {
				size: 7,
				radius: 7
			},
			fill: true,
			smooth: true,
			axis: 'left',
			xField: 'date',
			yField: 'value',
			tips:{
				renderer: this.tipRender
			}
		},{
			title: "Company Average",
			type: 'line',
			highlight: {
				size: 7,
				radius: 7
			},
			axis: 'left',
			//fill: true,
			smooth: true,
			xField: 'date',
			yField: 'company',
			tips:{
				renderer: this.tipRender
			}
		},{
			id: 'average',
			title: "Branch Average",
			type: 'line',
			highlight: {
				size: 7,
				radius: 7
			},
			axis: 'left',
			//fill: true,
			smooth: true,
			xField: 'date',
			yField: 'branch',
			tips:{
				renderer: this.tipRender
			}
		}];
	},
	
	initListeners: function(){
		this.on('afterrender', function(){
			this.store.load();
		}, this);
	},
	
	initStore: function(){
		this.store = new Ext.data.Store({
			fields: [
				'date',
				'value',
				'company',
				'branch'
			],
			proxy: {
				type: 'ajax',
				url : this.processingPage,
				reader: {
					type: 'json',
					root: 'records'
				},
				extraParams:{
					type: this.chartType
				}
			}
		});
	},
	
	tipRender: function(storeItem, item){
		this.update(Ext.String.format(
			"<div class=\"tip-title\">{0}</div>" + 
			"<div class=\"tip-text\"><b>My Average:</b> {1}</div>" +
			"<div class=\"tip-text\"><b>Company Average:</b> {2}</div>" +
			"<div class=\"tip-text\"><b>Branch Average:</b> {3}</div>",
			storeItem.get('date'),
			storeItem.get('value'),
			storeItem.get('company'),
			storeItem.get('branch')
		));
	}
});
Ext.define('TMS.mypage.charts.Stats', {
	extend: 'Ext.chart.Chart',
	
	requires:[
		'TMS.mypage.charts.Theme'
	],
	
	//Config
	processingPage: '/at-ajax/modules/stats/user/stats',
	animate: true,
	shadow: true,
	theme: 'TMS',
	axes: [{
		type: 'Numeric',
		position: 'left',
		fields: ['value'],
		grid: true,
		minimum: 0,
		label:{
			renderer: Ext.util.Format.numberRenderer('0')
		}
	}, {
		type: 'Category',
		position: 'bottom',
		fields: ['date'],
		label: {
			font: '11px Arial'
		}
	}],
	series: [{
		type: 'line',
		fill: true,
		smooth: true,
		axis: 'left',
		xField: 'date',
		yField: 'value',
		highlight: true,
		tips:{
			renderer: function(storeItem, item) {
				this.update(Ext.String.format(
					"<div class=\"tip-title\">{0}</div>" + 
					"<div class=\"tip-text\"><b>{1}:</b> {2}</div>",
					storeItem.get('date'),
					storeItem.get('type'),
					storeItem.get('value')
				));
			}
		}
	}],
	
	//Inits
	initComponent: function(){
		this.init();
		this.callParent(arguments);
	},
	
	init: function(){
		//this.initAutoUpdate();
		this.initStore();
	},
	
	initAutoUpdate: function(){
		this.on('afterrender', function(){
			setInterval(Ext.bind(function(){
				this.store.load();
			}, this), 15000);
		}, this);
	},
	
	initStore: function(){
		this.store = new Ext.data.Store({
			fields: [
				'date',
				'value',
				'type',
				'group'
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
		
		this.store.on('load', function(store, records){
			if(!records.length){
				/*
				this.getEl().mask(
					'<div class="no-data"><div class="image"><img src="/resources/icons/info-32.png" /></div><div class="message">This graph takes a minimum of two days of data to populate correctly. Unfortunatly, you do not have enough data in the system for this graph to display. Please check back soon when you have more data in the system.</div><div class="clear"></div></div>'
				);
				*/
			}
		}, this);
	}
});
Ext.define('TMS.mypage.charts.Theme', {});
Ext.define('Ext.chart.theme.TMS', {
	extend: 'Ext.chart.theme.Base',
	constructor: function(config) {
        Ext.chart.theme.call(this, config, {
			baseColor: "#001B7C",
            background: false,
            axis: {
                stroke: '#444',
                'stroke-width': 1
            },
            axisLabelTop: {
                fill: '#444',
                font: '12px Arial, Helvetica, sans-serif',
                spacing: 2,
                padding: 5,
                renderer: function(v) { return v; }
            },
            axisLabelRight: {
                fill: '#444',
                font: '12px Arial, Helvetica, sans-serif',
                spacing: 2,
                padding: 5,
                renderer: function(v) { return v; }
            },
            axisLabelBottom: {
                fill: '#444',
                font: '12px Arial, Helvetica, sans-serif',
                spacing: 2,
                padding: 5,
                renderer: function(v) { return v; }
            },
            axisLabelLeft: {
                fill: '#444',
                font: '12px Arial, Helvetica, sans-serif',
                spacing: 2,
                padding: 5,
                renderer: function(v) { return v; }
            },
            axisTitleTop: {
                font: 'bold 18px Arial',
                fill: '#444'
            },
            axisTitleRight: {
                font: 'bold 18px Arial',
                fill: '#444',
                rotate: {
                    x:0, y:0,
                    degrees: 270
                }
            },
            axisTitleBottom: {
                font: 'bold 18px Arial',
                fill: '#444'
            },
            axisTitleLeft: {
                font: 'bold 18px Arial',
                fill: '#444',
                rotate: {
                    x:0, y:0,
                    degrees: 270
                }
            },
            series: {
                'stroke-width': 0
            },
            seriesLabel: {
                font: 'bold 12px Arial',
                fill: '#fff'
            },
            marker: {
                stroke: '#555',
                fill: '#000',
                radius: 3,
                size: 3
            },
            colors: ["#001B7C", "#E12210", "#F28900"],
            seriesThemes: [{
                fill: "#001B7C"
            }, {
                fill: "#E12210"
            }, {
                fill: "#F28900"
            }, {
                fill: "#ff8809"
            }, {
                fill: "#ffd13e"
            }, {
                fill: "#a61187"
            }, {
                fill: "#24ad9a"
            }, {
                fill: "#7c7474"
            }, {
                fill: "#a66111"
            }],
            markerThemes: [{
                fill: "#001B7C",
                type: 'circle' 
            }, {
                fill: "#E12210",
                type: 'cross'
            }, {
                fill: "#F28900",
                type: 'plus'
            }]
        });
    }
	
});

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
Ext.define('TMS.mypage.dashboard.Stats', {
	extend: 'Ext.panel.Panel',
	
	//Requires
	requires:[
		'Ext.ux.form.field.RealComboBox',
		'TMS.mypage.Util',
		'TMS.mypage.filter.Filter',
		'TMS.mypage.user.Info',
		'TMS.mypage.charts.Compare',
		'TMS.mypage.user.Overview'
	],
	
	//Config
	userProcessingPage: '/at-ajax/modules/stats/user/',
	charts: {},
	filter: {},
	layout: 'column',
	
	//Init Functions
	initComponent: function(){
		this.init();
		this.callParent(arguments);
	},
	
	init: function(){
		this.items = [];
		
		//Init the containers
		this.initLeft();
		this.initCenter();
		
		this.initFilter();
		this.initUserSelect();
		this.initUserInfo();
		this.initChartPanel();
		this.initTypeMenu();
		this.initCompareCharts();
		this.initUserOverview();
	},
	
	initLeft: function(){
		this.left = new Ext.panel.Panel({
			scope: this,
			width: 210,
			border: false,
			unstyled: true,
			margin: '0 10 0 0'
		});
		this.items.push(this.left);
	},
	
	initCenter: function(){
		this.center = new Ext.panel.Panel({
			scope: this,
			columnWidth: 1,
			border: true,
			unstyled: true
		});
		this.items.push(this.center);
	},
	
	initFilter: function(){
		this.filterPanel = Ext.create('TMS.mypage.filter.Filter', {
			scope: this,
			border: false,
			unstyled: true
		});
		this.center.add(this.filterPanel);
	},
	
	initUserSelect: function(){
		var params = this.getParams();
		
		this.userStore = new Ext.data.Store({
			fields: [
				'id',
				'name',
				'image'
			],
			proxy: {
				type: 'ajax',
				url : this.userProcessingPage + 'list',
				reader: {
					type: 'json',
					root: 'records'
				}
			}
		});
		
		this.userSelect = new Ext.ux.form.field.RealComboBox({
			displayField: 'name',
			fieldLabel: 'User',
			labelWidth: 50,
			emptyText: 'Search by name...',
			typeAhead: false,
			pageSize: 10,
			minChars: 0,
			listConfig: {
				loadingText: 'Searching...',
				emptyText: 'No users were found.',
				getInnerTpl: function() {
					return	'<div class="mypage-user-list-item">' +
								'<div class="image"><img src="{image}" /></div>' +
								'<div class="name">{name}</div>' +
								'<div class="clear"></div>' +
							'</div>';
				}
			},
			store: this.userStore
		});
		
		if(params.id != null){
			this.userSelect.loadFromStore({
				userId: params.id
			}, false);
		}
		
		this.userSelect.on('select', function(field, records, options){
			if(!records.length){
				return false;
			}
			var record = records[0];
			this.filterPanel.updateFilter({
				userId: record.get('id')
			});
		}, this);
		
		this.filterPanel.insert(0, this.userSelect);
	},
	
	initUserInfo: function(){
		this.userInfo = Ext.create('TMS.mypage.user.Info');
		this.left.add(this.userInfo);
		
		var getParams = this.getParams();
		var params = {};
		if(getParams.id != null){
			params.userId = getParams.id;
		}
		
		this.userInfo.on('afterrender', function(){
			Ext.Ajax.request({
				scope: this,
				url: this.userProcessingPage + 'info',
				params: params,
				success: function(r){
					var response = Ext.decode(r.responseText);
					this.userInfo.update(response.record);
				}
			});
		}, this);
		
		this.filterPanel.on('filter', function(panel, filter, options){
			Ext.Ajax.request({
				scope: this,
				url: this.userProcessingPage + 'info',
				params: filter,
				success: function(r){
					var response = Ext.decode(r.responseText);
					this.userInfo.update(response.record);
				}
			});
		}, this);
	},
	
	initChartPanel: function(){
		this.chartPanel = new Ext.panel.Panel({
			height: 300,
			title: 'Points',
			layout: {
				type: 'card',
				deferredRender: true
			}
		});
		this.center.add(this.chartPanel);
		
		this.chartPanel.on('afterrender', function(){
			var chart = this.initChartType({
				title: 'Points',
				field: 'points'
			});
			this.chartPanel.getLayout().setActiveItem(0);
			chart.store.load();
		}, this);
	},
	
	initTypeMenu: function(){
		this.typeMenu = new Ext.menu.Menu();
		
		this.chartPanel.on('afterrender', function(){
			if(this.chartPanel.header == null){
				return false;
			}

			//create the menu button
			this.typeButton = new Ext.button.Button({
				text: 'Stat Type (Points)',
				icon: '/resources/icons/bar-chart-16.png',
				menu: this.typeMenu
			});

			this.chartPanel.header.add(this.typeButton);
			this.chartPanel.header.doComponentLayout();
		}, this);
	},
	
	initCompareCharts: function(){
		Ext.each(TMS.mypage.Util.getStatTypes(), function(type){
			//Add a menu item
			this.typeMenu.add({
				scope: this,
				text: type.title,
				type: type,
				icon: '/resources/icons/bar-chart-32.png',
				handler: function(button){
					if(this.charts[button.type.field] == null){
						this.initChartType(button.type);
					}
					this.chartPanel.getLayout().setActiveItem(this.charts[button.type.field]);
					
					//Update the type button
					this.typeButton.setText('Stat Type (' + button.type.title + ')');
					this.chartPanel.header.doLayout();
					
					//Update the chart panel title
					this.chartPanel.setTitle(button.type.title);
				}
			});
		}, this);
	},
	
	initChartType: function(type){
		
		//Create the chart
		var chart = Ext.create('TMS.mypage.charts.Compare', {
			chartType: type.field,
			chartTypeTitle: type.title,
			width: this.chartPanel.getWidth(),
			height: this.chartPanel.getHeight()
		});
		
		//Add the filters
		var params = this.getParams();
		if(params.id != null){
			chart.store.proxy.extraParams.userId = params.id;
		}
		
		//listen for filter change
		this.filterPanel.on('filter', function(panel, filter, options){
			Ext.apply(options.chart.store.proxy.extraParams, filter);
			if(options.chart.rendered && this.chartPanel.getLayout().getActiveItem() == options.chart.ownerCt){
				options.chart.store.load();
			}
		}, this, {chart: chart});
		
		//Create the chart panel
		var chartPanel = new Ext.panel.Panel({
			scope: this,
			border: false,
			unstyled: true,
			chart: chart,
			bodyPadding: 10
		});
		
		chartPanel.on('afterrender', function(panel){
			panel.chart.setWidth(panel.getWidth() - 20);
			panel.chart.setHeight(this.chartPanel.getHeight() - 50);
			panel.add(panel.chart);
			panel.doComponentLayout();
			panel.chart.store.load();
		}, this, {single: true});
		
		this.charts[type.field] = chartPanel;
		this.chartPanel.add(chartPanel);
		return chart;
	},
	
	initUserOverview: function(){
		this.userOverviewPanel = new Ext.panel.Panel({
			scope: this,
			border: false,
			margin: '10 0 0 0'
		});
		this.center.add(this.userOverviewPanel);
		
		this.userOverview = Ext.create('TMS.mypage.user.Overview');
		this.userOverviewPanel.add(this.userOverview);
		
		//Add the filters
		var params = this.getParams();
		if(params.id != null){
			this.userOverview.store.proxy.extraParams.userId = params.id;
		}
		
		this.userOverview.store.on('load', function(){
			this.userOverviewPanel.doLayout();
		}, this);
		
		this.userOverview.on('afterrender', function(){
			this.userOverview.store.load();
		}, this);
		
		this.filterPanel.on('filter', function(panel, filter, options){
			Ext.apply(this.userOverview.store.proxy.extraParams, filter);
			this.userOverview.store.load();
		}, this);
	},
	
	getParams: function(){
		var parts = location.href.split('?');
		var params = {};
		if(parts.length > 1){
			params = Ext.Object.fromQueryString(parts[1]);
		}
		return params;
	}
});

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
Ext.define('TMS.mypage.filter.Filter', {
	extend: 'Ext.panel.Panel',
	
	//Config
	layout: 'hbox',
	defaults:{
		margin: 2,
		flex: 1
	},
	filter: {},
	
	initComponent: function(){
		this.items = [];
		this.filter = {};
		this.init();
		this.callParent(arguments);
	},
	
	//Init Functions
	init: function(){
		this.initStartDate();
		this.initStopDate();
	},
	
	initStartDate: function(){
		//Create the start date field
		this.startDate = new Ext.form.field.Date({
			fieldLabel: 'Start Date',
			labelWidth: 70,
			emptyText: 'Select start date...'
		});
		
		//Listen for when the date is changed
		this.startDate.on('select', function(field, value){
			//If the stop date value is null set it to one week ahead
			if(this.stopDate.getValue() == null){
				var date = new Date(value);
				date.setDate(date.getDate() + 7);
				this.stopDate.setValue(Ext.Date.format(date, 'n/j/Y'));
			}
			//or if the start date is after the stop date
			else{
				var startDate = new Date(value);
				var stopDate = new Date(this.stopDate.getValue());
				if(startDate >= stopDate){
					startDate.setDate(startDate.getDate() + 7);
					this.stopDate.setValue(Ext.Date.format(startDate, 'n/j/Y'));
				}
			}
			
			//Update the filter
			this.updateFilter({
				startDate: this.startDate.getValue(),
				stopDate: this.stopDate.getValue()
			});
			
		}, this);
		
		this.items.push(this.startDate);
	},
	
	initStopDate: function(){
		//Create the stop date
		this.stopDate = new Ext.form.field.Date({
			fieldLabel: 'End Date',
			labelWidth: 70,
			emptyText: 'Select stop date...'
		});
		
		//Listen for when the date is changed
		this.stopDate.on('select', function(field, value){
			//Check to see if the start date is null
			if(this.startDate.getValue() == null){
				var date = new Date(value);
				date.setDate(date.getDate() - 7);
				this.startDate.setValue(Ext.Date.format(date, 'n/j/Y'));
			}
			//or if the stop date is before the start date
			else{
				var startDate = new Date(this.startDate.getValue());
				var stopDate = new Date(value);
				if(stopDate <= startDate){
					stopDate.setDate(stopDate.getDate() - 7);
					this.startDate.setValue(Ext.Date.format(stopDate, 'n/j/Y'));
				}
			}
			
			//Update the filter
			this.updateFilter({
				startDate: this.startDate.getValue(),
				stopDate: this.stopDate.getValue()
			});
			
		}, this);
		
		this.items.push(this.stopDate);
	},
	
	updateFilter: function(filter){
		Ext.apply(this.filter, filter);
		this.fireEvent('filter', this, this.filter);
	}
});
Ext.define('TMS.mypage.grids.Branch', {
	extend: 'Ext.grid.Panel',
	
	//Config
	processingPage: '/at-ajax/modules/stats/branch/grid',
	branchListPage: '/at-ajax/modules/stats/branch/list',
	
	initComponent: function(){
		this.init();
		this.callParent(arguments);
	},
	
	//Init Functions
	init: function(){
		this.initListeners();
		this.initTbar();
		this.initColumns();
		this.initStore();
		this.initFilters();
	},
	
	initListeners: function(){
		this.on('afterrender', function(){
			this.store.load();
		}, this);
	},
	
	initTbar: function(){
		//Tbar
		this.tbar = new Ext.toolbar.Toolbar({
			scope: this,
			items:[]
		});
	},
	
	initColumns: function(){
		this.columns = [{
			header: 'Name',
			dataIndex: 'name',
			flex: 1
		},{
			header: 'Value',
			dataIndex: 'value'
		}];
	},
	
	initStore: function(){
		this.store = new Ext.data.Store({
			fields: [
				'name',
				'value',
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
	},
	
	initFilters: function(){
		//Create the team filter
		this.branchStore = new Ext.data.Store({
			fields: [
				'id',
				'name',
			],
			proxy: {
				type: 'ajax',
				url : this.branchListPage,
				reader: {
					type: 'json',
					root: 'records'
				}
			}
		})
		this.branchSelect = new Ext.form.field.ComboBox({
			scope: this,
			fieldLabel: 'Branch',
			labelWidth: 50,
			store: this.branchStore,
			displayField: 'name',
			valueField: 'id'
		});
		this.branchSelect.on('select', function(field, records, options){
			var record = null;
			if(records.length){
				record = records[0];
				this.store.proxy.extraParams.branchId = record.get('id');
				this.store.load();
			}
		}, this);
		
		//Create the date filter
		this.dateFilter = new Ext.form.field.Date({
			scope: this,
			fieldLabel: 'Date',
			labelWidth: 50,
			emptyText: 'Select date...'
		});
		this.dateFilter.on('change', function(field, value){
			this.store.proxy.extraParams.date = value;
			this.store.load();
		}, this);
		
		
		//Create the refresh button
		this.refreshButton = new Ext.button.Button({
			scope: this,
			text: "Refresh",
			icon: '/resources/icons/refresh-24.png',
			handler: function(){
				this.store.load();
			}
		});
		
		//Add items to the toolbar
		this.tbar.add(this.branchSelect, this.dateFilter);
	}
	
});
Ext.define('TMS.mypage.grids.Stats', {
	extend: 'Ext.grid.Panel',
	processingPages: {
		individual: '/at-ajax/modules/stats/leaderboard/individual',
		team: '/at-ajax/modules/stats/leaderboard/team',
		branch: '/at-ajax/modules/stats/leaderboard/branch'
	},
	
	//Config
	initComponent: function(){
		this.init();
		this.callParent(arguments);
	},
	
	//Init Functions
	init: function(){
		this.initColumns();
		this.initStore();
		this.initPager();
	},
	
	initPager: function(){
		//Tbar
		this.tbar = new Ext.toolbar.Paging({
			store: this.store,
			displayInfo: true
	   });
	},
	
	initColumns: function(){
		this.columns = [{
			header: 'Rank',
			dataIndex: 'rank',
			width: 50
		},{
			dataIndex: 'image',
			width: 50,
			renderer: function(value, options, record){
				return '<img src="' + value + '" width="30" />';
			}
		},{
			header: 'Name',
			dataIndex: 'name',
			flex: 1,
			renderer: function(value, options, record){
				if(record.get('url').length){
					return Ext.String.format(
						'<a href="{0}">{1}</a>',
						record.get('url'),
						value
					);
				}
				else{
					return value;
				}
			}
		},{
			header: 'Value',
			dataIndex: 'value'
		}];
	},
	
	initStore: function(){
		this.store = new Ext.data.Store({
			fields: [
				'name',
				'url',
				'image',
				'value',
				'rank'
			],
			remoteSort: true,
			remoteFilter: true
		});
		
		this.setProxy(this.processingPages.individual);
		
		this.on('afterrender', function(){
			this.store.load();
		}, this);
		
	},
	
	setProxy: function(url){
		this.store.setProxy({
			type: 'ajax',
			url : url,
			pageSize: 50,
			reader: {
				type: 'json',
				root: 'records'
			}
		});
	}
	
});
Ext.define('TMS.mypage.grids.Team', {
	extend: 'Ext.grid.Panel',
	
	//Config
	processingPage: '/at-ajax/modules/stats/team/grid',
	teamListPage: '/at-ajax/modules/stats/team/list',
	
	initComponent: function(){
		this.init();
		this.callParent(arguments);
	},
	
	//Init Functions
	init: function(){
		this.initListeners();
		this.initTbar();
		this.initColumns();
		this.initStore();
		this.initFilters();
	},
	
	initListeners: function(){
		this.on('afterrender', function(){
			this.store.load();
		}, this);
	},
	
	initTbar: function(){
		//Tbar
		this.tbar = new Ext.toolbar.Toolbar({
			scope: this,
			items:[]
		});
	},
	
	initColumns: function(){
		this.columns = [{
			header: 'Name',
			dataIndex: 'name',
			flex: 1
		},{
			header: 'Value',
			dataIndex: 'value'
		}];
	},
	
	initStore: function(){
		this.store = new Ext.data.Store({
			fields: [
				'name',
				'value',
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
	},
	
	initFilters: function(){
		//Create the team filter
		this.teamStore = new Ext.data.Store({
			fields: [
				'id',
				'name',
			],
			proxy: {
				type: 'ajax',
				url : this.teamListPage,
				reader: {
					type: 'json',
					root: 'records'
				}
			}
		})
		this.teamSelect = new Ext.form.field.ComboBox({
			scope: this,
			fieldLabel: 'Team',
			labelWidth: 50,
			store: this.teamStore,
			displayField: 'name',
			valueField: 'id'
		});
		this.teamSelect.on('select', function(field, records, options){
			var record = null;
			if(records.length){
				record = records[0];
				this.store.proxy.extraParams.teamId = record.get('id');
				this.store.load();
			}
		}, this);
		
		//Create the date filter
		this.dateFilter = new Ext.form.field.Date({
			scope: this,
			fieldLabel: 'Date',
			labelWidth: 50,
			emptyText: 'Select date...'
		});
		this.dateFilter.on('change', function(field, value){
			this.store.proxy.extraParams.date = value;
			this.store.load();
		}, this);
		
		
		//Create the refresh button
		this.refreshButton = new Ext.button.Button({
			scope: this,
			text: "Refresh",
			icon: '/resources/icons/refresh-24.png',
			handler: function(){
				this.store.load();
			}
		});
		
		//Add items to the toolbar
		this.tbar.add(this.teamSelect, this.dateFilter);
	}
	
});
Ext.define('TMS.mypage.user.Grid', {
	extend: 'Ext.grid.Panel',
	
	//Config
	processingPage: '/at-ajax/modules/stats/user/grid',
	
	initComponent: function(){
		this.init();
		this.callParent(arguments);
	},
	
	//Init Functions
	init: function(){
		this.initListeners();
		this.initColumns();
		this.initStore();
	},
	
	initListeners: function(){
		this.on('afterrender', function(){
			this.store.load();
		}, this);
	},
	
	initColumns: function(){
		this.columns = [{
			header: 'Name',
			dataIndex: 'name',
			flex: 1
		},{
			header: 'Value',
			dataIndex: 'value'
		}];
	},
	
	initStore: function(){
		this.store = new Ext.data.Store({
			fields: [
				'name',
				'value'
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
	}
});
Ext.define('TMS.mypage.user.Info', {
	extend: 'Ext.container.Container',
	
	//Config
	border: false,
	unstyled: true,
	cls: 'mypage-user-info',
	height: 250,
	
	initComponent: function(){
		this.init();
		this.callParent(arguments);
	},
	
	//Init Functions
	init: function(){
		this.items = [];
		this.initInfoTemplate();
	},
	
	initInfoTemplate: function(){
		this.infoTemplate = new Ext.XTemplate(
			'<div class="name">',
				'{name} | {team_name}',
			'</div>',
			'<div class="branch">',
				'{branch_name}',
			'</div>',
			'<div class="image">',
				'<img src="{image}" />',
			'</div>',
			'<div class="points">',
				'<span class="points-text">Points: </span>{points}',
			'</div>',
			'<div class="rank">',
				'<span class="rank-text">Rank: </span>{[Ext.util.Inflector.ordinalize(values.rank)]} of {total} ({[this.getPercentile(values.rank, values.total)]})',
			'</div>',
			{
				getPercentile: function(rank, total){
					var percent = Math.floor((rank/total) * 100);
					var verb = "Top";
					if(percent > 50){
						verb = "Bottom";
						percent = 100 - percent;
						
						//Round Up
						if(percent > 10){
							percent = ((Math.ceil((percent/10))) * 10);
						}
					}
					else{
						//Round down
						if(percent > 10){
							percent = (Math.floor((percent/10))) * 10;
						}
					}
					
					//check for 0
					if(percent == 0){
						percent = 1;
					}
					
					return verb + " " + percent + "%";
				}
			}
		);
	},
	
	update: function(data){
		this.callParent([this.infoTemplate.apply(data)]);
	}
});
Ext.define('TMS.mypage.user.Margin', {
	extend: 'Ext.panel.Panel',
	
	//Config
	chartHeight: 300,
	autoHeight: true,
	
	initComponent: function(){
		this.init();
		this.callParent(arguments);
	},
	
	//Init Functions
	init: function(){
		this.initListeners();
		this.initTbar();
		this.initChart();
		this.initFilters();
	},
	
	initListeners: function(){
	},
	
	initTbar: function(){
		//Tbar
		this.tbar = new Ext.toolbar.Toolbar({
			scope: this,
			items:[]
		});
	},
	
	initFilters: function(){
		this.initView();
	},
	
	initView: function(){
		//Create the view menu
		this.viewMenu = new Ext.menu.Menu();
		
		//Loop through the series and add a disable/enable checkbox
		this.chart.on('afterrender', function(){
			Ext.each(this.chart.series.items, function(series){
				var menuItem = new Ext.menu.CheckItem({
					scope: this,
					text: series.title,
					checked: true,
					series: series,
					checkHandler: function(item, checked){
						if(checked){
							series.showAll();
						}
						else{
							series.hideAll();
						}
						this.chart.doComponentLayout();
					}
				});
				this.viewMenu.add(menuItem);
			}, this);
			this.viewMenu.doComponentLayout();
		}, this);
		
		//Create the view button
		this.viewButton = new Ext.button.Button({
			scope: this,
			text: "View",
			menu: this.viewMenu
		});
		this.tbar.add(this.viewButton);
	},
	
	initChart: function(){
		this.chart = new MyPage.charts.Margin({});
		this.on('afterrender', function(){
			this.chart.setWidth(this.getWidth());
			this.chart.setHeight(this.chartHeight);
			this.add(this.chart);
			this.doLayout();
			this.chart.store.load();
		}, this);
	}
	
});
Ext.define('TMS.mypage.user.Overview', {
	extend:'Ext.view.View',
	
	//Config
	processingPage: '/at-ajax/modules/stats/user/grid',
	multiSelect: false,
	trackOver: true,
	deferEmptyText:false,
	overItemCls: 'mypage-user-overview-item-over',
	itemSelector: '.mypage-user-overview-item',
	emptyText: 'No stats...',
	
	//Inits
	initComponent: function(){
		this.items = [];
		this.dockedItems = [];
		this.init();
		return this.callParent(arguments);
	},
	
	init: function(){
		this.initStore();
		this.initTemplate();
	},
	
	initStore: function(){
		this.store = new Ext.data.Store({
			fields: [
				'name',
				'value'
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
	},
	
	initTemplate: function(){
		this.tpl = new Ext.XTemplate(
			'<table class="mypage-user-overview-table">',
				'<tbody>',
					'<tpl for=".">',
						'<tr>',
							'<td class="name">',
								'{name}',
							'</td>',
							'<td class="value">',
								'{value}',
							'</td>',
						'</tr>',
					'</tpl>',
				'</tbody>',
			'</table>'
		);
	}
});
Ext.define('TMS.mypage.user.Stats', {
	extend: 'Ext.panel.Panel',
	
	//Requires
	requires:[
		'TMS.mypage.charts.Stats',
		'TMS.mypage.user.Overview'
	],
	
	//Config
	imageEl: false,
	chartHeight: 200,
	layout: 'column',
	bodyCls: 'header-info-panel',
	border: false,
	
	initComponent: function(){
		this.init();
		this.callParent(arguments);
	},
	
	//Init Functions
	init: function(){
		this.items = [];
		
		//Init Containers
		this.initLeftPanel();
		this.initCenterPanel();
		
		//Init Filter items
		this.initFilterPanel();
		this.initUserSelect();
		this.initDateFilters();
		
		//Init User info
		this.initInfoTemplate();
		
		//Init Chart Panels
		this.initChartToolbar();
		this.initChartStatTypes();
		this.initChartFilters();
		this.initChartPanel();
		this.initChart();
		
		//user info
		this.initImagePanel();
		this.initUserOverview();
	},
	
	initInfoTemplate: function(){
		this.infoTemplate = new Ext.XTemplate(
			'<div class="name">',
				'{name} | {team_name}',
			'</div>',
			'<div class="branch">',
				'{branch_name}',
			'</div>',
			'<div class="image">',
				'<img src="{image}" />',
			'</div>'
		);
	},
	
	initLeftPanel: function(){
		this.leftPanel = new Ext.panel.Panel({
			scope: this,
			unstyled: true,
			border: false,
			width: 210,
			margin: '0 10 0 0'
		});
		this.items.push(this.leftPanel);
	},
	
	initCenterPanel: function(){
		this.centerPanel = new Ext.panel.Panel({
			scope: this,
			unstyled: true,
			border: false,
			columnWidth: 1
		});
		this.items.push(this.centerPanel);
	},
	
	initFilterPanel: function(){
		this.filterPanel = new Ext.panel.Panel({
			scope: this,
			title: 'Filter',
			layout: 'hbox',
			collapsed: true,
			collapsible: true,
			titleCollapse: true,
			autoHeight: true,
			defaults:{
				margin: 2,
				flex: 1
			}
		});
		this.centerPanel.add(this.filterPanel);
	},
	
	initUserSelect: function(){
		var parts = location.href.split('?');
		var params = {};
		if(parts.length){
			params = Ext.Object.fromQueryString(parts[1]);
		}
		console.log(params);
		
		this.userStore = new Ext.data.Store({
			fields: [
				'id',
				'name',
				'image'
			],
			proxy: {
				type: 'ajax',
				url : this.userProcessingPage + 'list',
				reader: {
					type: 'json',
					root: 'records'
				}
			}
		});
		
		this.userSelect = new Ext.ux.form.field.RealComboBox({
			value: params.id,
			displayField: 'name',
			fieldLabel: 'User',
			labelWidth: 50,
			emptyText: 'Search by name...',
			typeAhead: false,
			pageSize: 10,
			minChars: 0,
			listConfig: {
				loadingText: 'Searching...',
				emptyText: 'No users were found.',
				getInnerTpl: function() {
					return	'<div class="mypage-user-list-item">' +
								'<div class="image"><img src="{image}" /></div>' +
								'<div class="name">{name}</div>' +
								'<div class="clear"></div>' +
							'</div>';
				}
			},
			store: this.userStore
		});
		
		this.userSelect.on('select', function(field, records, options){
			if(!records.length){
				return false;
			}
			var record = records[0];
			this.updateFilter({
				userId: record.get('id')
			});
		}, this);
		
		this.filterPanel.add(this.userSelect);
	},
	
	initDateFilters: function(){
		
		//Create the start date field
		this.startDate = new Ext.form.field.Date({
			fieldLabel: 'Start Date',
			labelWidth: 70,
			emptyText: 'Select start date...'
		});
		
		//Listen for when the date is changed
		this.startDate.on('select', function(field, value){
			//If the stop date value is null set it to one week ahead
			if(this.stopDate.getValue() == null){
				var date = new Date(value);
				date.setDate(date.getDate() + 7);
				this.stopDate.setValue(Ext.Date.format(date, 'n/j/Y'));
			}
			//or if the start date is after the stop date
			else{
				var startDate = new Date(value);
				var stopDate = new Date(this.stopDate.getValue());
				if(startDate >= stopDate){
					startDate.setDate(startDate.getDate() + 7);
					this.stopDate.setValue(Ext.Date.format(startDate, 'n/j/Y'));
				}
			}
			
			//Update the filter
			this.updateFilter({
				startDate: this.startDate.getValue(),
				stopDate: this.stopDate.getValue()
			});
			
		}, this);
		
		//Create the stop date
		this.stopDate = new Ext.form.field.Date({
			fieldLabel: 'End Date',
			labelWidth: 70,
			emptyText: 'Select stop date...'
		});
		
		//Listen for when the date is changed
		this.stopDate.on('select', function(field, value){
			//Check to see if the start date is null
			if(this.startDate.getValue() == null){
				var date = new Date(value);
				date.setDate(date.getDate() - 7);
				this.startDate.setValue(Ext.Date.format(date, 'n/j/Y'));
			}
			//or if the stop date is before the start date
			else{
				var startDate = new Date(this.startDate.getValue());
				var stopDate = new Date(value);
				if(stopDate <= startDate){
					stopDate.setDate(stopDate.getDate() - 7);
					this.startDate.setValue(Ext.Date.format(stopDate, 'n/j/Y'));
				}
			}
			
			//Update the filter
			this.updateFilter({
				startDate: this.startDate.getValue(),
				stopDate: this.stopDate.getValue()
			});
			
		}, this);
		
		
		//Add the dates to the toolbar
		this.filterPanel.add(
			this.startDate,
			this.stopDate
		);
	},
	
	initChartToolbar: function(){
		this.chartToolbar = new Ext.toolbar.Toolbar({
			scope: this,
			items: []
		});
	},
	
	initChartFilters: function(){
		this.refreshButton = new Ext.button.Button({
			scope: this,
			text: "Refresh",
			icon: "/resources/icons/refresh-16.png",
			handler: function(){
				this.chart.store.load();
			}
		});
		
		this.chartToolbar.add("->", this.refreshButton);
	},
	
	initChartStatTypes: function(){
		//Create the menu
		var menu = new Ext.menu.Menu({
			scope: this
		});
		
		//create the menu button
		var menuButton = new Ext.button.Button({
			scope: this,
			text: 'Stat Type (Points)',
			icon: '/resources/icons/bar-chart-16.png',
			menu: menu
		});
		
		//Create the menu items
		Ext.each(TMS.mypage.Util.getStatTypes(), function(type){
			var menuItem = new Ext.menu.Item({
				scope: this,
				text: type.title,
				chart: this.chart,
				panel: this,
				type: type,
				parentMenu: menu,
				parentMenuButton: menuButton,
				handler: function(button){
					//Set the parent text
					button.parentMenuButton.setText('Stat Type (' + button.text + ')');
					button.panel.doComponentLayout();
					
					//Set the stores proxy to load this stat type
					this.chart.store.proxy.extraParams.type = button.type.field;
					this.chart.store.proxy.extraParams.typeName = button.type.title;
					this.chart.store.loadPage(1);
				}
			});
			menu.add(menuItem);
		}, this);
		
		this.chartToolbar.add(menuButton);
	},
	
	initChartPanel: function(){
		this.chartPanel = new Ext.panel.Panel({
			layout: 'fit',
			height: 250,
			margin: '10 0 0 0',
			tbar: this.chartToolbar
		});
		this.centerPanel.add(this.chartPanel);
	},
	
	initChart: function(){
		this.chart = Ext.create('TMS.mypage.charts.Stats', {});
		this.chartPanel.on('afterrender', function(){
			this.chart.setWidth(this.chartPanel.getWidth());
			this.chart.setHeight(this.chartHeight);
			this.chartPanel.add(this.chart);
			this.doLayout();
			this.chart.store.load();
		}, this);
	},
	
	initImagePanel: function(){
		this.imagePanel = new Ext.container.Container({
			scope: this,
			cls: 'mypage-user-info',
			unstyled: true,
			border: false,
			autoHeight: true
		});
		
		this.chart.store.on('load', function(){
			this.imagePanel.update(this.infoTemplate.apply(this.chart.store.getProxy().getReader().rawData.user));
			this.leftPanel.doLayout();
		}, this);
		
		this.leftPanel.add(this.imagePanel);
	},
	
	initUserOverview: function(){
		this.userOverviewPanel = new Ext.panel.Panel({
			scope: this,
			border: false,
			margin: '10 0 0 0'
		});
		this.centerPanel.add(this.userOverviewPanel);
		
		this.userOverview = Ext.create('TMS.mypage.user.Overview');
		this.userOverviewPanel.add(this.userOverview);
		
		this.userOverview.store.on('load', function(){
			this.userOverviewPanel.doLayout();
		}, this);
		
		this.userOverview.on('afterrender', function(){
			this.userOverview.store.load();
		}, this);
	}
	
});
Ext.define('TMS.mypage.Util', {
	extend: 'Ext.util.Observable',
	singleton: true,
	statTypes: false,
	utilProcessingPage: '/at-ajax/modules/stats/util/',
	
	getStatTypes: function(){
		if(!this.statTypes){
			Ext.Ajax.request({
				scope: this,
				async: false,
				url: this.utilProcessingPage + 'stat-types',
				success: function(r){
					var response = Ext.JSON.decode(r.responseText);
					this.statTypes = response.records;
				}
			});
		}
		
		return this.statTypes;
	}
});
