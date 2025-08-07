Ext.define('TMS.contacts.view.FilteredGrid', {
	extend: 'Ext.panel.Panel',
	requires:[
		'TMS.contacts.filter.Contact',
		'TMS.contacts.view.Grid'
	],
	
	layout:'border',
	height:500,
	title:'Contacts',
	
	initComponent: function(){
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
		this.filter = Ext.create('TMS.contacts.filter.Contact', {
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
		this.grid = Ext.create('TMS.contacts.view.Grid', {
			region: 'center',
			filter: this.filter
		});
		this.items.push(this.grid);
	}
	
});