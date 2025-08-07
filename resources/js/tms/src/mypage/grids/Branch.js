Ext.define('TMS.mypage.grids.Branch', {
	extend: 'Ext.grid.Panel',
	
	//Config
	processingPage: '/at-ajax/modules/stats/branch/grid',
	branchListPage: '/at-ajax/modules/stats/branch/list',
	
	initComponent: function(){
		this.init();
		this.callParent(arguments);
	},
	
	//Init Functions
	init: function(){
		this.initListeners();
		this.initTbar();
		this.initColumns();
		this.initStore();
		this.initFilters();
	},
	
	initListeners: function(){
		this.on('afterrender', function(){
			this.store.load();
		}, this);
	},
	
	initTbar: function(){
		//Tbar
		this.tbar = new Ext.toolbar.Toolbar({
			scope: this,
			items:[]
		});
	},
	
	initColumns: function(){
		this.columns = [{
			header: 'Name',
			dataIndex: 'name',
			flex: 1
		},{
			header: 'Value',
			dataIndex: 'value'
		}];
	},
	
	initStore: function(){
		this.store = new Ext.data.Store({
			fields: [
				'name',
				'value',
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
	},
	
	initFilters: function(){
		//Create the team filter
		this.branchStore = new Ext.data.Store({
			fields: [
				'id',
				'name',
			],
			proxy: {
				type: 'ajax',
				url : this.branchListPage,
				reader: {
					type: 'json',
					root: 'records'
				}
			}
		})
		this.branchSelect = new Ext.form.field.ComboBox({
			scope: this,
			fieldLabel: 'Branch',
			labelWidth: 50,
			store: this.branchStore,
			displayField: 'name',
			valueField: 'id'
		});
		this.branchSelect.on('select', function(field, records, options){
			var record = null;
			if(records.length){
				record = records[0];
				this.store.proxy.extraParams.branchId = record.get('id');
				this.store.load();
			}
		}, this);
		
		//Create the date filter
		this.dateFilter = new Ext.form.field.Date({
			scope: this,
			fieldLabel: 'Date',
			labelWidth: 50,
			emptyText: 'Select date...'
		});
		this.dateFilter.on('change', function(field, value){
			this.store.proxy.extraParams.date = value;
			this.store.load();
		}, this);
		
		
		//Create the refresh button
		this.refreshButton = new Ext.button.Button({
			scope: this,
			text: "Refresh",
			icon: '/resources/icons/refresh-24.png',
			handler: function(){
				this.store.load();
			}
		});
		
		//Add items to the toolbar
		this.tbar.add(this.branchSelect, this.dateFilter);
	}
	
});