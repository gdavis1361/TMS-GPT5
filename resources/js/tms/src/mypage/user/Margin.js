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