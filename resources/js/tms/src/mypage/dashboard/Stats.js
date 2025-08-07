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
