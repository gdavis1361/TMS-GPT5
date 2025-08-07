Ext.define('TMS.orders.view.PreOrderFilteredGrid', {
	extend: 'Ext.panel.Panel',
	
	//Requires
	requires:[
		'TMS.orders.filter.PreOrder',
		'TMS.orders.view.PreOrderGrid'
	],
	
	//Config
	layout:'border',
	height: 500,
	title:'Quotes',
	
	collapsible:true,
	titleCollapse:true,
	extraFilters:{},
	gridConfig: {},
	
	constructor: function(){
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
		this.filterPanel = Ext.create('TMS.orders.filter.PreOrder', {
			region:'east',
			width: 250,
			collapsible:true,
			collapsed:true,
			title:'Search',
			extraFilters: this.extraFilters
			//stateful: true,
			//stateId: 'tms-orders-filter-preorder'
		})
		this.items.push(this.filterPanel);
	},
	
	initGrid: function() {
		this.gridPanel = Ext.create('TMS.orders.view.PreOrderGrid', Ext.apply({
			region:'center',
			//stateful: true,
			//stateId: 'tms-orders-view-preordergrid',
			filter: this.filterPanel
		}, this.gridConfig));
		this.items.push(this.gridPanel);
		
		//Register the quicksearch
		this.filterPanel.registerFilter(this.gridPanel.quickSearch);
	},
	
	initListeners: function() {
		this.gridPanel.on('filter', function(grid, field){
			this.filterPanel.filter();
		}, this);

		if (this.collapsed) {
			this.collapsed = false;
			this.on('afterrender', function() {
				this.collapse();
			}, this);
		}
		
		this.on('expand', function() {
			this.gridPanel.doLayout();
			this.scrollIntoView();
		}, this);
	}
});