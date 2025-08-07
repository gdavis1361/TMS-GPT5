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