Ext.define('TMS.orders.forms.sections.Accessorials', {
	extend:'Ext.form.Panel',
	
	//Requires
	requires:[
		'Ext.ux.form.field.RealComboBox',
		'TMS.orders.forms.sections.Accessorial'
	],
	
	//Config
	autoScroll: true,
	title:'Accessorials',
	baseTitle:'Accessorials',
	processingPage:'/at-ajax/modules/order/accessorial/',
	order_id:0,
	autoSave:false,
	
	initComponent: function(){
		this.items = this.items || [];
		this.dockedItems = this.dockedItems || [];
		this.init();
		this.callParent(arguments);
	},
	
	init: function() {
		this.initToolbar();
		this.initStore();
		this.initListeners();
	},
	
	initToolbar: function() {
		this.toolbar = new Ext.toolbar.Toolbar({
			scope: this,
			dock:'top',
			items:[{
				scope: this,
				text: 'Add Accessorial',
				icon: '/resources/icons/add-16.png',
				handler: this.addAccessorial
			},{
				scope: this,
				text: 'Collapse All',
				handler: this.collapseAll
			},{
				scope: this,
				text: 'Expand All',
				handler: this.expandAll
			}]
		});
		this.dockedItems.push(this.toolbar);
	},
	
	initStore: function() {
		this.store = Ext.create('Ext.data.Store', {
			fields: [
				'AccCodeID',
				'AccCode',
				'AccCodeDesc'
			],
			proxy: {
				type: 'ajax',
				url: this.processingPage + 'get-accessorial-list',
				reader: {
					type: 'json',
					root: 'records'
				}
			}
		});
		this.store.load();
	},
	
	initListeners: function() {
		
	},
	
	addAccessorial: function(data) {
		if (data) {
			if (data.length) {
				for (var i = 0; i < data.length; i++) {
					this.addAccessorial(data[i]);
				}
				return;
			}
		}
		
		var accessorial = Ext.create('TMS.orders.forms.sections.Accessorial', {
			store:this.store,
			data:data,
			collapsible: true,
			titleCollapse: true
		});
		accessorial.on('updatetotal', this.updateTitle, this);
		accessorial.on('destroy', this.updateTitle, this);
		this.add(accessorial);
	},
	
	updateTitle: function() {
		this.setTitle(this.baseTitle + ' $' + this.getTotal());
		this.fireEvent('updatetotal');
	},
	
	getTotal: function() {
		var items = this.items.items;
		var numItems = items.length;
		var total = 0;
		for (var i = 0; i < numItems; i++) {
			total += items[i].getTotal();
		}
		total = total.toFixed(2);
		return parseFloat(total);
	},
	
	collapseAll: function() {
		var items = this.items.items;
		var numItems = items.length;
		for (var i = 0; i < numItems; i++) {
			items[i].collapse();
		}
	},
	
	expandAll: function() {
		var items = this.items.items;
		var numItems = items.length;
		for (var i = 0; i < numItems; i++) {
			items[i].expand();
		}
	},
	
	getValues: function() {
		var items = this.items.items;
		var numItems = items.length;
		var values = [];
		for (var i = 0; i < numItems; i++) {
			values.push(items[i].getValues());
		}
		return values;
	}
	
});