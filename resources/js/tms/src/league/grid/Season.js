Ext.define('TMS.league.grid.Season', {
	extend: 'TMS.grid.Grid',
	
	//Requires
	requires:[
		'TMS.league.store.Season'
	],
	
	initComponent: function() {
		this.dockedItems = this.dockedItems || [];
		this.plugins = this.plugins || [];
		this.init();
		this.callParent(arguments);
	},
	
	//Init Functions
	init: function() {
		this.initEditing();
		this.initToolbar();
		this.initColumns();
		this.initStore();
		this.initPager();
	},
	
	initEditing: function(){
		this.editing = Ext.create('Ext.grid.plugin.CellEditing');
		this.plugins.push(this.editing);
	},
	
	initToolbar: function(){
		this.toolbar = new Ext.panel.Panel();
		this.tbar = this.toolbar;
	},
	
	initColumns: function() {
		this.columns = [{
			xtype:'actioncolumn', 
            width:50,
            items: [{
				scope: this,
                icon: '/resources/icons/edit-16.png',
                tooltip: 'Edit',
                handler: function(grid, rowIndex, colIndex) {
                    var record = grid.getStore().getAt(rowIndex);
					this.fireEvent('editaction', this, record);
                }
            },{
				scope: this,
                icon: '/resources/icons/delete-16.png',
                tooltip: 'Delete',
                handler: function(grid, rowIndex, colIndex) {
                    var record = grid.getStore().getAt(rowIndex);
					this.deleteRecord(record);
                }                
            }]
		},{
			header: 'Title',
			dataIndex: 'title',
			flex: 1,
			field: {
				type: 'textfield'
			}
		},{
			header: 'Start Date',
			dataIndex: 'start_date',
			flex: 1
		},{
			header: 'End Date',
			dataIndex: 'end_date',
			flex: 1
		}];
	},
	
	initStore: function(){
		if(this.store != null){
			return false;
		}
		this.store = Ext.create('TMS.league.store.Season');
	},
	
	initPager: function(){
		this.pager = new Ext.toolbar.Paging({
			store: this.store,
			displayInfo: true
		});
		this.toolbar.add(this.pager);
	},
	deleteRecord: function(record){
		this.fireEvent('delete', this, record);
		this.store.remove(record);
		record.destroy();
	}
});