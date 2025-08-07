Ext.define('TMS.task.view.FilteredGrid', {
	extend: 'Ext.panel.Panel',
	requires:[
		'TMS.task.filter.Task',
		'TMS.task.view.Grid'
	],
	
	layout:'border',
	height: 500,
	title: 'Tasks',
	
	collapsible:true,
	titleCollapse:true,
	extraFilters:{},
	
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
		this.filterPanel = Ext.create('TMS.task.filter.Task', {
			region:'east',
			width: 250,
			collapsible:true,
			collapsed:true,
			titleCollapse:true,
			title:'Search',
			extraFilters: this.extraFilters 
		});
		this.items.push(this.filterPanel);
	},
	
	initGrid: function() {
		this.gridPanel = Ext.create('TMS.task.view.Grid', {
			region:'center',
			filter: this.filterPanel
		});
		this.items.push(this.gridPanel);
	},
	
	initListeners: function() {
	
	}
	
});