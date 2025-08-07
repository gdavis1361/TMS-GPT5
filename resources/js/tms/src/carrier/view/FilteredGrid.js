Ext.define('TMS.carrier.view.FilteredGrid', {
	extend: 'Ext.panel.Panel',
	requires:[
		'TMS.carrier.filter.Carrier',
		'TMS.carrier.view.Grid'
	],
	layout:'border',
	gridConfig: {},
	
	constructor: function(){
		this.gridConfig = {};
		return this.callParent(arguments);
	},
	
	initComponent: function(){
		this.dockedItems = this.dockedItems || [];
		this.items = this.items || [];
		this.init();
		this.callParent(arguments);
	},
	
	//Init Functions
	init: function() {
		this.initFilter();
		this.initGrid();
	},
	
	initFilter: function(){
		this.filter = Ext.create('TMS.carrier.filter.Carrier', {
			title: 'Search',
			region: 'east',
			width: 250,
			collapsible: true,
			collapsed: true,
			titleCollapse: true,
			split: true,
			floatable: false
		});
		this.items.push(this.filter);
	},
	
	initGrid: function() {
		this.grid = Ext.create('TMS.carrier.view.Grid', Ext.apply({
			region: 'center',
			filter: this.filter
		}, this.gridConfig));
		this.items.push(this.grid);
	}
	
});