Ext.define('TMS.orders.view.Grid', {
	extend: 'TMS.grid.Grid',
	
	//Requires
	requires:[
		'TMS.orders.forms.sections.Carrier',
		'TMS.form.plugin.StatusBar',
		'TMS.ActionWindow'
	],
	
	//Config
	processingPage: '/at-ajax/modules/order/order/',
	toolsProcessingPage: '/at-ajax/modules/tools/status-types/list',
	viewConfig: {
		stripeRows: true
	},
	
	initComponent: function() {
		this.dockedItems = this.dockedItems || [];
		this.init();
		this.callParent(arguments);
	},
	
	//Init Functions
	init: function() {
		this.initToolbar();
		this.initColumns();
		this.initStore();
		this.initPager();
		this.initListeners();
	},
	
	initToolbar: function() {
		this.quickSearch = Ext.create('Ext.form.field.Text', {
			fieldLabel:'Quick Search',
			name: 'quickSearch'
		});
		this.quickSearch.on('change', function(field) {
			this.fireEvent('filter', this, field);
		}, this, {buffer:500});
		
		this.toolbar = Ext.create('Ext.toolbar.Toolbar', {
			dock:'top',
			items: [
				'->',
				this.quickSearch
			]
		});
		this.dockedItems.push(this.toolbar);
	},
	
	initColumns: function() {
		this.columns = [{
			header: 'Order #',
			dataIndex: 'order_id',
			width: 85,
			renderer: function(value, options, record) {
				var str = '<a href="/orders/?d=orders&a=show&id='+record.get('order_id')+'">'+record.get('order_display')+'</a>';
				if (record.get('detail_value') == this.quickSearch.getValue()) {
					str += '<p>' + record.get('detail_type_name') + '</p>'
				}
				return str;
			}
		},{
			header: 'Status',
			dataIndex: 'status_id',
			width:80,
			renderer: function(value, options, record) {
				return record.get('status_name')
			}
		},{
			header: 'Customer',
			dataIndex: 'customer_name',
			flex: 1,
			xtype:'templatecolumn',
			tpl:'<a href="/customers/?d=customers&a=view&id={customer_id}">' +
					'{customer_name}' +
				'</a>'
		},{
			header:'Ordered By',
			dataIndex:'ordered_by_name',
			xtype:'templatecolumn',
			tpl:'<a href="/contacts/?d=contacts&a=view&id={ordered_by_id}">' + 
					'{ordered_by_name}' +
				'</a>',
			hidden:true
		},{
			header:'Bill To',
			dataIndex:'bill_to_name',
			xtype:'templatecolumn',
			tpl:'<a href="/customers/?d=customers&a=view&id={bill_to_id}">' + 
					'{bill_to_name}' +
				'</a>',
			hidden:true
		},{
			header: 'Origin',
			dataIndex: 'origin',
			sortable: false,
			flex: 1
		},{
			header: 'Destination',
			dataIndex: 'destination',
			sortable: false,
			flex: 1
		},{
			header: 'Owner',
			dataIndex: 'broker_name',
			xtype:'templatecolumn',
			tpl:'<a href="/contacts/?d=contacts&a=view&id={contact_id}">' +
					'{broker_name}' +
				'</a>'
		},{
			header: 'Charge',
			dataIndex: 'total_charge',
			renderer: Ext.util.Format.usMoney
		},{
			header: 'Margin',
			dataIndex: 'total_profit_pct',
			renderer: function(value, metaData, record){
				var display = '';
				var color = 'green';
				var percent = 0;
				var percentDisplay = 'n/a';
				var revenue = record.data.total_charge - record.data.total_cost;
				if (record.data.total_charge && record.data.total_charge > 0) {
					percent = revenue / record.data.total_charge;
					percent *= 100;
					percent = percent.toFixed(2);
					percentDisplay = percent + '%';
				}
				if (revenue <= 0) {
					color = 'red';
				}
				
				display += ' <span style="color:' + color + ';"> $';
				display += revenue;
				display += '<br />' + percentDisplay;
				display += '</span>';
				
				return display;
				
				if (value) {
					return value + "%";
				}
				else {
					return 'n/a';
				}
			}
		},{
			header: 'Carrier',
			dataIndex: 'carrier_name',
			flex: 1,
			sortable:false,
			renderer: function(value, metaData, record, rowIndex, colIndex, store, view) {
				if(!parseInt(record.get('carrier_id')) && parseInt(record.get('origin_stop_id')) && parseInt(record.get('destination_stop_id'))){
					return Ext.String.format(
						'<div class="button">' +
							'<a href="#{0}" class="carrier_search_tool">' +
								'<img src="/resources/silk_icons/lorry_go.png" alt="Find Carrier" title="Find Carrier" />' +
								'Find Carrier' +
							'</a>' +
						'</div>',
						record.get('order_id')
					);
				}
				else if (value) {
					return Ext.String.format(
						'<a href="/carriers/?d=carriers&action=view&id={0}">' +
							'{1}' +
						'</a>',
						record.get('carrier_id'),
						record.get('carrier_name')
					);
				}
				else {
					return '';
				}
			}
		}];
	},
	
	initStore: function(){
		this.store = new Ext.data.Store({
			fields: [
				'order_id',
				'order_display',
				'customer_id',
				'customer_name',
				'ordered_by_id',
				'ordered_by_name',
				
				'bill_to_id',
				'bill_to_name',
				
				'status_id',
				'contact_id',
				'charge_id',
				
				'total_charge',
				
				'total_cost',
				'fuel_cost',
				'linehaul_cost',
				'accessorial_cost',
				
				'total_profit',
				'total_profit_pct',
				'broker_name',
				'status_name',
				'origin',
				'origin_stop_id',
				'destination',
				'destination_stop_id',
				'carrier_id',
				'carrier_name',
				
				'detail_type_id',
				'detail_type_name',
				'detail_value'
			],
			remoteSort: true,
			pageSize: 25,
			proxy: {
				type: 'ajax',
				url : this.processingPage + 'get',
				reader: {
					type: 'json',
					root: 'records',
					totalProperty: 'total'
				}
			}
		});
	},
	
	initPager: function(){
		this.pager = new Ext.toolbar.Paging({
			store: this.store,
			displayInfo: true
		});
		this.tbar = this.pager;
	},
	
	initListeners: function() {
		this.on('afterrender', function(){
			this.store.load();
		}, this);
		
		this.on('itemdblclick', function(view, record){
			this.setLoading(true);
			location.href = Ext.String.format('?d=orders&a=show&id={0}', record.get('order_id'));
		}, this);
		
		this.on('afterrender', function() {
			this.getView().on('cellcontextmenu', function(view, cell, cellIndex, record, row, rowIndex, event) {
                var column = view.getHeaderByCell(cell);
                var position = view.getPositionByEvent(event);
                var columnIndex = position.column;
                var dataIndex = column.dataIndex;
                event.preventDefault();
				
				if(dataIndex == "status_id"){
					if(this.statusMenu == null){
						this.statusMenu = new Ext.menu.Menu({
							scope: this,
							items:[{
								text: 'Loading...',
								icon: '/resources/js/extjs/resources/themes/images/gray/grid/loading.gif'
							}]
						});
						Ext.Ajax.request({
							scope: this,
							url: this.toolsProcessingPage,
							event: event,
							record: record,
							success: function(r, request){
								var response = Ext.JSON.decode(r.responseText);
								if(response.success && response.records != null){
									this.statusMenu.removeAll();
									Ext.each(response.records, function(record){
										var menuItem = new Ext.menu.Item({
											scope: this,
											text: record.status_name,
											record: record,
											handler: function(item){
												this.updateStatus(this.statusMenu.record.get('order_id'), item.record.status_id);
											}
										});
										this.statusMenu.add(menuItem);
									}, this);
									this.statusMenu.doComponentLayout();
								}
							}
						});
					}
					this.statusMenu.record = record;
					this.statusMenu.showAt(event.getXY());
				}
            }, this);  
		}, this);
		
		this.store.on('load', function() {
			// set the click handler for the find carrier buttons
			var buttons = Ext.select('.carrier_search_tool', true);
			var numButtons = buttons.elements.length;
			for (var i = 0; i < numButtons; i++) {
				buttons.elements[i].on('click', function(e, el) {
					e.preventDefault();
					var orderId = el.href.split('#')[1];
					var carrierSearch = Ext.create('TMS.orders.forms.sections.Carrier', {
						order_id: orderId,
						plugins: [Ext.create('TMS.form.plugin.StatusBar')]
					});
					var actionWindow = Ext.create('TMS.ActionWindow', {
						title:'Find A Carrier',
						layout: 'fit',
						sizePercent: 0.9,
						items:[
							carrierSearch
						],
						bottomItems: [{
							text: 'Save',
							scale: 'medium',
							icon: '/resources/icons/save-24.png',
							handler: function(){
								carrierSearch.submit();
							}
						}]
					})
					actionWindow.on('close', function() {
						this.store.load();
					}, this);
				}, this);
			}
		}, this);
	},
	
	initFilters: function(){
		this.filterPanel.add(new Ext.form.field.Text({fieldLabel: 'Name'}));
	},
	
	updateStatus: function(orderId, statusId) {
		Ext.Ajax.request({
			scope: this,
			url: this.processingPage + 'update-status',
			params:{
				order_id: orderId,
				status_id: statusId
			},
			success: function(r, request){
				var response = Ext.JSON.decode(r.responseText);
				this.store.load();
			}
		});
	}
	
});