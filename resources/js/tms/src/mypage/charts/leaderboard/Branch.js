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