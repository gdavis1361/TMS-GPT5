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