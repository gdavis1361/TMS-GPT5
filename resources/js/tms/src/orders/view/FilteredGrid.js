Ext.define('TMS.orders.view.FilteredGrid', {
	extend: 'Ext.panel.Panel',
	requires:[
		'TMS.orders.filter.Order',
		'TMS.orders.view.Grid'
	],
	
	layout:'border',
	height: 500,
	title:'Orders',
	
	extraFilters:{},
	gridConfig: {},
	
	constructor: function(){
		this.extraFilters = {};
		this.gridConfig = {};
		return this.callParent(arguments);
	},
	
	initComponent: function(){
		this.items = this.items || [];
		this.init();
		this.callParent(arguments);
	},
	
	//Init Functions
	init: function() {
		this.initFilters();
		this.initGrid();
		this.initListeners();
	},
	
	initFilters: function() {
		this.filterPanel = Ext.create('TMS.orders.filter.Order', {
			region:'east',
			title:'Search',
			width: 250,
			collapsible: true,
			collapsed: true,
			extraFilters: this.extraFilters
		});
		this.items.push(this.filterPanel);
	},
	
	initGrid: function() {
		this.gridPanel = Ext.create('TMS.orders.view.Grid', Ext.apply({
			height: 500,
			region:'center',
			filter: this.filterPanel
		}, this.gridConfig));
		this.items.push(this.gridPanel);
		
		this.gridPanel.store.on('load', function(){
			
		}, this);
		
		//Register the quicksearch
		this.filterPanel.registerFilter(this.gridPanel.quickSearch);
	},
	
	initListeners: function() {
		this.gridPanel.on('filter', function(grid, field){
			this.filterPanel.filter();
		}, this);
	}
	
});