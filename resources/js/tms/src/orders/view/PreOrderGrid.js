Ext.define('TMS.orders.view.PreOrderGrid', {
	extend: 'TMS.grid.Grid',
	
	//Config
	processingPage: '/at-ajax/modules/order/pre-order/get',
	viewConfig: {
		stripeRows: true
	},
	
	initComponent: function(){
		this.dockedItems = this.dockedItems || [];
		this.init();
		this.callParent(arguments);
	},
	
	//Init Functions
	init: function(){
		this.initToolbar();
		this.initSelectionModel();
		this.initColumns();
		this.initStore();
		this.initPager();
		this.initListeners();
	},
	
	initToolbar: function() {
		this.postMenu = Ext.create('Ext.menu.Menu', {
			showSeparator: false,
			items: [{
				text:'Road Runners',
				checked:true,
				value:1
			},{
				text:'Internet Truckstop',
				checked:true,
				value:4
			},{
				text:'GetLoaded',
				checked:true,
				value:7
			},{
				text:'Transcore',
				checked:true,
				value:8
			},{
				text:'Jaguar',
				checked:true,
				value:10
			}, '-', {
				scope:this,
				text:'Post',
				handler:this.doPost
			}]
		});
		
		this.quantityField = Ext.create('Ext.form.field.Text', {
			emptyText:'Quantity',
			fieldLabel:'Quantity',
			labelWidth:55,
			width:80,
			value:1,
			margin:4
		});
		this.convertToOrderMenu = Ext.create('Ext.menu.Menu', {
			showSeparator: false,
			items: [
				this.quantityField,
				'-', {
				scope:this,
				text:'Convert',
				handler:this.convertToOrder,
				icon:'/resources/silk_icons/lightning_add.png'
			}]
		});
		
		this.quickSearch = Ext.create('Ext.form.field.Text', {
			fieldLabel:'Quick Search',
			name: 'quickSearch'
		});
		this.quickSearch.on('change', function(field) {
			this.fireEvent('filter', this, field);
		}, this, {buffer:500});
		
		this.toolbar = Ext.create('Ext.toolbar.Toolbar', {
			dock:'top',
			items: [{
				scope:this,
				text:'Convert to Order',
				menu:this.convertToOrderMenu,
				icon:'/resources/silk_icons/lightning_add.png'
			},'-',{
				scope:this,
				text:'Post Selected Quotes',
				menu:this.postMenu
			}, '->', this.quickSearch]
		});
		this.dockedItems.push(this.toolbar);
	},
	
	getSelectedIds: function() {
		var selectedRecords = this.selModel.getSelection();
		var numRecords = selectedRecords.length;
		var ids = [];
		if (numRecords) {
			for (var i = 0; i < numRecords; i++) {
				ids.push(selectedRecords[i].data.pre_order_id);
			}
		}
		return ids;
	},
	
	getSelectedServiceIds: function() {
		var ids = [];
		
		var numItems = this.postMenu.items.items.length;
		for (var i = 0; i < numItems; i++) {
			var item = this.postMenu.items.items[i];
			if (item.checked) {
				ids.push(item.value);
			}
		}
		
		return ids;
	},
	
	doPost: function() {
		var preOrderIds = this.getSelectedIds();
		var postingServiceIds = this.getSelectedServiceIds();
		if (preOrderIds.length) {
			this.setLoading('Posting to services...')
			Ext.Ajax.request({
				scope:this,
				method:'post',
				url:'/at-ajax/modules/preorder/post/do-post',
				params:{
					preOrderIds:Ext.encode(preOrderIds),
					postingServiceIds:Ext.encode(postingServiceIds)
				},
				success: function(r) {
					this.setLoading(false);
					var response = Ext.decode(r.responseText);
					
				}
			});
		}
	},
	
	convertToOrder: function() {
		var preOrderIds = this.getSelectedIds();
		if (preOrderIds.length) {
			this.setLoading('Converting...');
			Ext.Ajax.request({
				scope:this,
				method:'post',
				url:'/at-ajax/modules/preorder/process/convert-to-order',
				params:{
					preOrderIds:Ext.encode(preOrderIds),
					quantity:this.quantityField.getValue()
				},
				success: function(r) {
					this.setLoading(false);
					var response = Ext.decode(r.responseText);
					location.href = '/orders';
				}
			});
		}
	},
	
	initSelectionModel: function() {
		this.selModel = Ext.create('Ext.selection.CheckboxModel');
	},
	
	initListeners: function(){
		this.on('afterrender', function(){
			this.store.load();
		}, this);
		
		this.on('itemdblclick', function(view, record){
			this.setLoading(true);
			location.href = Ext.String.format('?d=quotes&a=show&id={0}', record.get('pre_order_id'));
		}, this);
		
		this.store.on('load', function() {
			var buttons = Ext.select('.convert-button', true);
			for (var i = 0; i < buttons.elements.length; i++) {
				buttons.elements[i].on('click', function(e, el) {
					e.preventDefault();
					this.quantityField.setValue(1);
					setTimeout(Ext.Function.bind(this.convertToOrder, this), 200);
				}, this);
			}
		}, this)
	},
	
	initPager: function(){
		this.pager = new Ext.toolbar.Paging({
			store: this.store,
			displayInfo: true
		});
		this.tbar = this.pager;
	},
	
	initColumns: function(){
		this.columns = [{
			header: 'Quote #',
			dataIndex: 'pre_order_id',
			width: 75,
			xtype:'templatecolumn',
			tpl:'<a href="?d=quotes&a=show&id={pre_order_id}">' +
					'{pre_order_id}' +
				'</a>'
		},{
			header: 'Customer',
			dataIndex: 'customer_name',
			flex: 1,
			xtype:'templatecolumn',
			tpl:'<a href="/customers/?d=customers&a=view&id={customer_id}">' +
					'{customer_name}' +
				'</a>'
		},{
			header: 'Origin',
			dataIndex: 'origin',
			flex: 2,
			sortable: false
		},{
			header: 'Destination',
			dataIndex: 'destination',
			flex: 2,
			sortable: false
		},{
			header: 'Owner',
			dataIndex: 'broker_name',
			flex: 1,
			xtype:'templatecolumn',
			tpl:'<a href="/contacts/?d=contacts&a=view&id={contact_id}">' +
					'{broker_name}' +
				'</a>'
		},{
			header: 'Charge',
			dataIndex: 'total_charge',
			renderer: Ext.util.Format.usMoney
		},{
			header:'Expiration Date',
			dataIndex:'expiration_date',
			flex:1
		},{
			header:'',
			dataIndex:'',
			xtype:'templatecolumn',
			width:100,
			tpl:'<div class="button" style="width:60px;">' +
					'<a href="#" class="convert-button" id="convert-{pre_order_id}">' +
						'Convert' +
					'</a>' +
				'</div>'
		}];
	},
	
	initStore: function(){
		this.store = new Ext.data.Store({
			fields: [
				'pre_order_id',
				'customer_id',
				'bill_to_id',
				'ordered_by_id',
				'status_id',
				'broker_id',
				'charge_id',
				'total_charge',
				'contact_id',
				'broker_name',
				'customer_name',
				'status_name',
				'origin',
				'origin_stop_id',
				'destination',
				'destination_stop_id',
				'expiration_date'
			],
			remoteSort: true,
			pageSize: 25,
			proxy: {
				type: 'ajax',
				url : this.processingPage,
				reader: {
					type: 'json',
					root: 'records',
					totalProperty: 'total'
				}
			}
		});
	}
});