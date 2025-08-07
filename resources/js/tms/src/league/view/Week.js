Ext.define('TMS.league.view.Week', {
	extend:'Ext.view.View',
	
	//Config
	autoScroll: true,
	multiSelect: false,
	trackOver: true,
	deferEmptyText:false,
	overItemCls: 'league-week-over',
	itemSelector: '.league-week',
	emptyText: 'No weeks...',
	
	//Inits
	initComponent: function(){
		this.items = [];
		this.dockedItems = [];
		this.init();
		return this.callParent(arguments);
	},
	
	init: function(){
		this.initTemplate();
	},
	
	initTemplate: function(){
		this.tpl = new Ext.XTemplate(
			'<tpl for=".">',
				'<div class="league-week">',
					'<div class="title">{title}</div>',
					'<div class="date">{[this.renderDate(values.start_date)]} - {[this.renderDate(values.end_date)]}</div>',
				'</div>',
			'</tpl>',
			{
				renderDate: Ext.util.Format.dateRenderer('M j, Y')
			}
		);
	}
});