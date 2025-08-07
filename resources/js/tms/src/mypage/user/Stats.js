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