Ext.define('TMS.orders.filter.Order', {
	extend: 'TMS.filter.Abstract',
	
	//Requires
	requires:[
		'Ext.ux.form.field.RealComboBox'
	],
	
	init: function(){
		this.initStatus();
		this.initCustomer();
//		this.initOrderedBy();
//		this.initBillTo();
		this.initOwner();
		this.initCarrier();
		this.initBOL();
		this.initPro();
		this.initCustomerReference();
//		this.initOrigin();
//		this.initDestination();
	},
	
	initStatus: function() {
		this.statusTypeStore = Ext.create('Ext.data.Store', {
			fields: [
				'status_id',
				'status_name'
			],
			proxy: {
				type: 'ajax',
				url: '/at-ajax/modules/tools/status-types/get-filter-list',
				reader: {
					type: 'json',
					root: 'records'
				}
			}
		});
		this.statusTypeStore.load();
		
		this.items.push({
			xtype:'realcombobox',
			queryMode:'local',
			name: 'status',
			displayField:'status_name',
			valueField:'status_id',
			fieldLabel: 'Status',
			store:this.statusTypeStore
		});
	},
	
	initCustomer: function(){
		this.items.push({
			name: 'company',
			fieldLabel: 'Customer'
		});
	},
	
	initOrderedBy: function() {
		this.items.push({
			name: 'ordered_by',
			fieldLabel: 'Ordered By'
		});
	},
	
	initBillTo: function(){
		this.items.push({
			name: 'bill_to',
			fieldLabel: 'Bill To'
		});
	},
	
	initOwner: function() {
		this.items.push({
			name: 'owner',
			fieldLabel: 'Owner'
		});
	},
	
	initCarrier: function() {
		this.items.push({
			name: 'carrier',
			fieldLabel: 'Carrier'
		});
	},
	
	initBOL: function() {
		this.items.push({
			name: 'bolNumber',
			fieldLabel: 'BOL #'
		});
	},
	
	initPro: function() {
		this.items.push({
			name: 'proNumber',
			fieldLabel: 'Pro #'
		});
	},
	
	initCustomerReference: function() {
		this.items.push({
			name: 'customerReference',
			fieldLabel: 'Customer Reference #'
		});
	},
	
	initOrigin: function() {
		this.items.push({
			name: 'origin',
			fieldLabel:' Origin'
		});
	},
	
	initDestination: function() {
		this.items.push({
			name: 'destination',
			fieldLabel:' Destination'
		});
	}
	
});
Ext.define('TMS.orders.filter.PreOrder', {
	extend: 'TMS.filter.Abstract',
	
	//Requires
	requires:[
		'Ext.ux.form.field.RealComboBox'
	],
	
	init: function(){
		this.initCustomer();
		this.initOwner();
//		this.initCarrier();
		this.initBOL();
		this.initPro();
		this.initCustomerReference();
	},
	
	initCustomer: function(){
		this.items.push({
			name: 'company',
			fieldLabel: 'Customer'
		});
	},
	
	initOwner: function() {
		this.items.push({
			name: 'owner',
			fieldLabel: 'Owner'
		});
	},
	
	initCarrier: function() {
		this.items.push({
			name: 'carrier',
			fieldLabel: 'Carrier'
		});
	},
	
	initBOL: function() {
		this.items.push({
			name: 'bolNumber',
			fieldLabel: 'BOL #'
		});
	},
	
	initPro: function() {
		this.items.push({
			name: 'proNumber',
			fieldLabel: 'Pro #'
		});
	},
	
	initCustomerReference: function() {
		this.items.push({
			name: 'customerReference',
			fieldLabel: 'Customer Reference #'
		});
	}
});
Ext.define('TMS.orders.forms.sections.Accessorial', {
	extend:'Ext.form.Panel',
	requires:[
		'Ext.ux.form.field.RealComboBox',
		'TMS.customer.lookup.Customer'
	],
	
	title:'New Accessorial',
	baseTitle:'New Accessorial',
	
	bodyStyle:{
		padding:'8px'
	},
	processingPage:'/at-ajax/modules/order/accessorial/',
	accessorial_id:0,
	margin:8,
	layout:'anchor',
	data:{},
	
	autoSave:false,
	
	initComponent: function(){
		this.items = this.items || [];
		this.dockedItems = this.dockedItems || [];
		this.tools = this.tools || [];
		this.init();
		this.callParent(arguments);
	},
	
	init: function() {
		this.initCustomTools();
		this.initSelector();
		this.initAmount();
		this.initQuantity();
		this.initCheckbox();
		this.initBillToSelector();
		this.initHidden();
		this.initListeners();
	},
	
	initCustomTools: function() {
		this.closeButton = Ext.create('Ext.panel.Tool', {
			scope: this,
			type:'close',
			tooltip: 'Remove',
			handler: function(event, toolEl, panel) {
				this.destroy();
			}
		});
		this.tools.push(this.closeButton);
	},
	
	initSelector: function() {
		this.typeSelector = Ext.create('Ext.ux.form.field.RealComboBox', {
			store:this.store,
			valueField:'AccCodeID',
			displayField:'AccCodeDesc',
			queryMode: 'local',
			hiddenName:'accessorial_id[]',
			fieldLabel:'Type'
		});
		this.items.push(this.typeSelector);
	},
	
	initAmount: function() {
		this.amount = Ext.create('Ext.form.field.Text', {
			fieldLabel:'Amount',
			name:'amount'
		})
		this.items.push(this.amount);
	},
	
	initQuantity: function() {
		this.quantity = Ext.create('Ext.form.field.Text', {
			fieldLabel:'Quantity',
			name:'quantity'
		})
		this.items.push(this.quantity);
	},
	
	initCheckbox: function() {
		this.billToCheckbox = Ext.create('Ext.form.field.Checkbox', {
			fieldLabel:'Bill separately',
			name:'billSeparately[]',
			hiddenName:'billSeparately[]'
		});
		this.items.push(this.billToCheckbox);
	},
	
	initBillToSelector: function() {
		this.billToSelector = Ext.create('TMS.customer.lookup.Customer', {
			fieldLabel:'Bill To',
			name: 'accessorial_bill_to_id',
			hiddenName: 'accessorial_bill_to_id',
			hidden:true,
			value:0
		});
		this.items.push(this.billToSelector);
	},
	
	initHidden: function() {
		this.accessorialId = Ext.create('Ext.form.field.Hidden', {
			name:'accessorialId',
			value:0
		});
		this.items.push(this.accessorialId);
	},
	
	initListeners: function() {
		this.typeSelector.on('select', function(combobox, value) {
			var rawValue = combobox.getRawValue();
			this.baseTitle = rawValue;
			this.updateTitle();
		}, this);
		
		this.amount.on('change', this.updateTotal, this);
		this.quantity.on('change', this.updateTotal, this);
		
		this.billToCheckbox.on('change', function(checkbox) {
			if (checkbox.checked) {
				this.billToSelector.show();
				this.billToSelector.setRawValue('');
				this.billToSelector.setValue(0);
			}
			else {
				this.billToSelector.hide();
			}
		}, this);
		
		this.on('afterrender', this.loadInitialData, this);
	},
	
	loadInitialData: function() {
		if (this.data.accessorial_type_id != null) {
			this.typeSelector.setValue(this.data.accessorial_type_id);
			this.typeSelector.setRawValue(this.data.accessorial_type_name);
			this.amount.setValue(this.data.accessorial_per_unit);
			this.quantity.setValue(this.data.accessorial_qty);
			if (!this.data.bill_to || this.data.bill_to_id == this.data.bill_to) {
				this.billToCheckbox.setValue(false);
			}
			else {
				this.billToCheckbox.setValue(true);
			}
			this.billToSelector.setValue(this.data.bill_to);
			this.billToSelector.setRawValue(this.data.bill_to_name);
			this.accessorialId.setValue(this.data.order_accessorial_id);
			this.updateTotal();
		}
	},
	
	updateTotal: function() {
		clearTimeout(this.updateTotalTimeout);
		this.updateTotalTimeout = setTimeout(Ext.bind(function(){
			this.updateTitle();
			this.fireEvent('updatetotal');
		}, this), 1000);
	},
	
	updateTitle: function() {
		if (this.rendered) {
			this.baseTitle = this.typeSelector.getRawValue();
		}
		else {
			this.baseTitle = this.data.accessorial_type_name;
		}
		
		this.setTitle(this.baseTitle + ' $' + this.getTotal());
	},
	
	getTotal: function() {
		var total = 0;
		
		if (this.rendered) {
			total = this.amount.getValue() * this.quantity.getValue();
		}
		else {
			total = this.data.accessorial_per_unit * this.data.accessorial_qty;
		}
		
		if (isNaN(total)) {
			total = 0;
		}
		total = total.toFixed(2);
		return parseFloat(total);
	},
	
	getValues: function() {
		var values = {
			accessorialId:this.accessorialId.getValue(),
			amount:this.amount.getValue(),
			quantity:this.quantity.getValue(),
			type:this.typeSelector.getValue(),
			billToId:this.billToSelector.getValue(),
			billToCheckbox:this.billToCheckbox.getValue()
		};
		return values;
	}
	
});
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
Ext.define('TMS.orders.forms.sections.Audit', {
	extend:'TMS.ActionWindow',
	
	//Requires
	requires:[
		'TMS.orders.forms.sections.OrderDetails',
		'TMS.documents.forms.sections.DocumentsRequired',
		'TMS.comment.forms.sections.Form',
		'TMS.documents.view.Grid',
		'TMS.comment.view.Grid'
	],
	
	//Config
	layout: 'border',
	title:'Audit Order',
	processingPage:'/at-ajax/modules/order/audit/',
	order_id:0,
	widthPercent: .9,
	heightPercent: .9,
	
	init: function() {
		this.initTitle();
		this.initOrderDetails();
		this.initDocumentsRequired();
		this.initColumns();
		this.initCenter();
		this.initDocuments();
		this.initComments();
		this.initHidden();
		
		this.initButtons();
		
		this.initListeners();
	},
	
	initTitle: function(){
		if(this.title == null || !this.title.length){
			return;
		}
		
		this.title += ' - #' + this.order_id;
	},
	
	initColumns: function() {
		this.columns = Ext.create('Ext.panel.Panel', {
			layout:{
				type: 'vbox',
				align: 'stretch'
			},
			region: 'west',
			width: 250,
			split: true,
			items:[
				this.orderDetails,
				this.documentsRequired
			],
			border:0,
			frame:false
		});
		this.items.push(this.columns);
	},
	
	initCenter: function() {
		this.centerPanel = Ext.create('Ext.panel.Panel', {
			layout:{
				type: 'vbox',
				align: 'stretch'
			},
			region: 'center',
			border:0,
			frame:false
		});
		this.items.push(this.centerPanel);
	},
	
	initOrderDetails: function() {
		this.orderDetails = Ext.create('TMS.orders.forms.sections.OrderDetails', {
			readOnly: true,
			order_id:this.order_id,
			flex:1,
			autoScroll: true
		})
	},
	
	initDocumentsRequired: function() {
		this.documentsRequired = Ext.create('TMS.documents.forms.sections.DocumentsRequired', {
			order_id:this.order_id,
			readOnly: true,
			flex:1,
			autoScroll: true
		});
	},
	
	initDocuments: function() {
		this.documentsPanel = Ext.create('TMS.documents.view.Grid', {
			title: 'Order Documents',
			extraParams:{
				order_id:this.order_id
			},
			flex:1
		});
		this.centerPanel.add(this.documentsPanel);
	},
	
	initComments: function() {
		this.commentsPanel = Ext.create('TMS.comment.view.Grid', {
			title: 'Order Comments',
			field_value: this.order_id,
			type:'order',
			flex:1
		});
		this.centerPanel.add(this.commentsPanel);
	},
	
	initHidden: function() {
		this.orderIdField = Ext.create('Ext.form.field.Hidden', {
			name:'orderId',
			value:0
		});
		this.items.push(this.orderIdField);
	},
	
	initButtons: function() {
		this.approveButton = Ext.create('Ext.button.Button', {
			scope:this,
			text:'Approve',
			handler:this.approve,
			scale:'medium',
			icon: '/resources/icons/check-24.gif'
		});
		this.denyButton = Ext.create('Ext.button.Button', {
			scope:this,
			text:'Deny',
			handler:this.deny,
			scale:'medium',
			icon: '/resources/icons/close-24.png'
		});
		this.addTopButton([
			this.approveButton,
			this.denyButton
		]);
	},
	
	approve: function() {
		this.setLoading();
		Ext.Ajax.request({
			scope:this,
			method:'post',
			url:this.processingPage + 'approve',
			params:{
				order_id:this.order_id
			},
			success: function(r) {
				this.setLoading(false);
				var response = Ext.decode(r.responseText);
				this.fireEvent('taskcomplete');
				this.close();
			}
		});
	},
	
	deny: function() {
		// Show a comment box that will be entered as an order comment
		this.formPanel = Ext.create('TMS.comment.forms.sections.Form', {
			field_value:this.order_id,
			commentType:'order'
		});
		
		this.formWindow = Ext.create('Ext.window.Window', {
			title:'Enter a reason',
			autoShow:true,
			modal:true,
			resizable:false,
			draggable:false,
			width:400,
			items:[
				this.formPanel
			]
		});
		
		this.formPanel.on('formsuccess', function() {
			this.formWindow.close();
			
			this.setLoading();
			
			Ext.Ajax.request({
				scope:this,
				method:'post',
				url:this.processingPage + 'deny',
				params:{
					order_id:this.order_id
				},
				success: function(r) {
					this.setLoading(false);
					var response = Ext.decode(r.responseText);
					this.fireEvent('taskcomplete');
					this.close();
				}
			});
		}, this);
		
	},
	
	initListeners: function() {
		this.orderDetails.on('dataload', function() {
			this.center();
		} , this);
		
		this.documentsRequired.on('dataload', function() {
			this.center();
		} , this);
		
	}
	
});
Ext.define('TMS.orders.forms.sections.AuditCorrection', {
	extend:'TMS.ActionWindow',
	
	//Requires
	requires:[
		'TMS.orders.forms.sections.OrderDetails',
		'TMS.documents.forms.sections.DocumentsRequired',
		'TMS.documents.view.Grid'
	],
	
	//Config
	layout: 'fit',
	title:'Fix Order Details',
	processingPage:'/at-ajax/modules/order/audit/',
	order_id:0,
	widthPercent: 0.9,
	heightPercent: 0.9,
	
	init: function() {
		//Layout items
		this.initTabPanel();
		this.initAuditPanel();
		this.initOrderPanel();
		this.initColumns();
		this.initCenterPanel();
		
		//Audit panels
		this.initOrderDetails();
		this.initDocumentsRequired();
		this.initDocuments();
		this.initComments();
		
		this.initButtons();
		this.initListeners();
	},
	
	initTabPanel: function(){
		this.tabPanel = new Ext.tab.Panel({
			scope: this,
			border: false,
			deferredRender: true
		});
		this.items.push(this.tabPanel);
		
		this.tabPanel.on('afterrender', function(){
			this.tabPanel.setActiveTab(0);
		}, this);
	},
	
	initAuditPanel: function(){
		this.auditPanel = new Ext.panel.Panel({
			title: 'Audit Order',
			border: false,
			layout: 'border'
		});
		this.tabPanel.add(this.auditPanel);
	},
	
	initColumns: function() {
		this.columns = Ext.create('Ext.panel.Panel', {
			layout:{
				type: 'vbox',
				align: 'stretch'
			},
			region: 'west',
			width: 250,
			split: true,
			border: false
		});
		this.auditPanel.add(this.columns);
	},
	
	initCenterPanel: function(){
		this.centerPanel = Ext.create('Ext.panel.Panel', {
			layout: {
				type: 'vbox',
				align: 'stretch'
			},
			region: 'center',
			border: false,
			frame:false
		});
		this.auditPanel.add(this.centerPanel);
	},
	
	initOrderPanel: function(){
		this.orderContainer = new Ext.panel.Panel({
			scope: this,
			layout: 'fit',
			title: 'Order',
			border: false
		});
		this.tabPanel.add(this.orderContainer);
		this.orderContainer.on('afterrender', function(){
			this.order = Ext.create('TMS.orders.forms.Order', {
				orderId: this.order_id
			});
			this.orderContainer.add(this.order);
		}, this);
	},
	
	initOrderDetails: function() {
		this.orderDetails = Ext.create('TMS.orders.forms.sections.OrderDetails', {
			order_id:this.order_id,
			readOnly: true,
			flex:1
		});
		this.columns.add(this.orderDetails);
	},
	
	initDocumentsRequired: function() {
		this.documentsRequired = Ext.create('TMS.documents.forms.sections.DocumentsRequired', {
			order_id:this.order_id,
			readOnly: true,
			flex:1
		});
		this.columns.add(this.documentsRequired);
	},
	
	initDocuments: function() {
		this.documentsPanel = Ext.create('TMS.documents.view.Grid', {
			extraParams:{
				order_id:this.order_id
			},
			flex: 1,
			title:'Documents'
		});
		this.centerPanel.add(this.documentsPanel);
	},
	
	initComments: function() {
		this.commentsPanel = Ext.create('TMS.comment.view.Grid', {
			title: 'Order Comments',
			field_value: this.order_id,
			type:'order',
			flex:1
		});
		this.centerPanel.add(this.commentsPanel);
	},
	
	initButtons: function() {
		this.approveButton = Ext.create('Ext.button.Button', {
			scope:this,
			text:'Mark as Corrected',
			handler:this.approve,
			scale:'medium',
			icon: '/resources/icons/check-24.gif'
		});
		this.addTopButton([
			this.approveButton
		]);
	},
	
	approve: function() {
		this.setLoading();
		Ext.Ajax.request({
			scope:this,
			method:'post',
			url:this.processingPage + 'fix-order-details',
			params:{
				order_id:this.order_id
			},
			success: function(r) {
				this.setLoading(false);
				var response = Ext.decode(r.responseText);
				this.fireEvent('taskcomplete');
				this.close();
			}
		});
	},
	
	initListeners: function() {
		this.orderDetails.on('dataload', function() {
			this.center();
		} , this);
		
		this.documentsRequired.on('dataload', function() {
			this.center();
		} , this);
		
	}
	
});
Ext.define('TMS.orders.forms.sections.Carrier', {
	extend:'TMS.form.Abstract',
	
	//Requires
	requires:[
		'Ext.ux.form.field.RealComboBox',
		'TMS.carrier.lookup.Carrier',
		'TMS.contacts.lookup.Contact',
		'TMS.carrier.view.RadiusGrid'
	],
	
	//Config
	originalValues: false,
	
	order_id: 0,
	url:'/at-ajax/modules/order/process/set-carrier',
	processingPage: '/at-ajax/modules/carrier/process/',
	autoSave:false,
	layout: {
		type: 'vbox',
		align: 'stretch'
	},
	border: false,

	//Config
	initComponent: function(){
		this.items = [];
		this.originalValues = false;
		this.init();
		this.callParent(arguments);
	},
	
	init: function(){
		//Containers
		this.initFieldContainer();
		this.initGrid();
		
		//Fields
		this.initCarrierSearch();
		this.initContactLookup();
		this.initUsedEquip();
		this.initListeners();
		this.loadData();
	},
	
	initFieldContainer: function(){
		this.fieldContainer = new Ext.panel.Panel({
			scope: this,
			layout: 'anchor',
			bodyPadding: 10
		});
		this.items.push(this.fieldContainer);
	},
	
	initGrid: function(){
		this.grid = Ext.create('TMS.carrier.view.RadiusGrid', {
			scope: this,
			title: 'Radius Search',
			order_id: this.order_id,
			flex: 1
		});
		this.items.push(this.grid);
		
		this.grid.grid.on('itemclick', function(grid, record){
			this.carrier_search.loadFromStore({
				carrier_id: record.get('carrier_id')
			});
		}, this);
	},
	
	initCarrierSearch: function() {
		this.carrier_search = Ext.create('TMS.carrier.lookup.Carrier', {
			fieldLabel: 'Carrier Search',
			name:'carrier_id',
			hiddenName:'carrier_id'
		});
		
		this.carrier_search.on('select', function(field, records){
			if (records.length){
				var d = records[0].data;
				
				this.contactLookup.setParam('carrier_id', d.carrier_id);
				this.contactLookup.setReadOnly(false);
				this.contactLookup.enable();
				this.contactLookup.store.load();
				this.contactLookup.setRawValue('');
				this.contactLookup.setValue(0);
				this.contactLookup.focus(true, 50);
			}
			else {
				this.contactLookup.setReadOnly(true);
				this.contactLookup.disable();
			}
		}, this);
		this.fieldContainer.add(this.carrier_search);
	},
	
	initContactLookup: function(){
		this.contactLookup = Ext.create('TMS.contacts.lookup.Contact', { 
			type: 'carrier', 
			fieldLabel: 'Select Carrier Contact',
			name:'carrier_contact_id'
		});
		this.fieldContainer.add(this.contactLookup);
	},
	
	initUsedEquip: function(){
		var data = [];
		/*
		var equipId = modesEquipment.equipmentAllowed.getValue() ;

		Ext.each(equipId, function(r){
			var record = modesEquipment.equipmentAllowed.store.getAt( modesEquipment.equipmentAllowed.store.find('CarrEquipId', r) );
			data.push([record.get('CarrEquipId'), record.get('CarrEquipDesc')]);
		});
		*/

		this.availableEquipStore = Ext.create('Ext.data.ArrayStore', {
			fields: ['id', 'name'],
			data: data
		});

		this.usedEquip = Ext.create('Ext.ux.form.field.RealComboBox', {
			fieldLabel: "Select Equipment",
			store: this.availableEquipStore,
			displayField: 'name',
			valueField: 'id',
			readOnly: (data.length > 1 ? false : true),
			editable: false,
			name: 'used_equipment_id',
			hiddenName: 'used_equipment_id'
		});
		this.fieldContainer.add(this.usedEquip);
	},
	
	makeNewStore: function(data) {
		this.availableEquipStore = Ext.create('Ext.data.ArrayStore', {
			fields: ['id', 'name'],
			data: data
		});
		this.usedEquip.store = this.availableEquipStore;
		this.availableEquipStore.load();
		
		if (data.length == 1) {
			this.usedEquip.setValue(data[0][0]);
		}
	},
	
	initListeners: function() {
		this.carrier_search.on('select', this.save, this);
		this.contactLookup.on('select', this.save, this);
		this.usedEquip.on('select', this.save, this);
		this.on('beforesubmit', function(){
			this.setParam('order_id', this.order_id);
		}, this);
	},
	
	loadData: function(){
		if (this.order_id){
			this.setLoading(true);
			Ext.Ajax.request({
				scope:this,
				method:'post',
				url:this.processingPage + 'get-order-info',
				params:{
					order_id:this.order_id
				},
				success: function(r) {
					this.setLoading(false);
					var response = Ext.decode(r.responseText);
					//var records = response.records;
					
					var data = [];
					
					Ext.each(response.equipment_list, function(d){
						var o = [d.equipment_id, d.name];
						data.push(o);
					});
					this.makeNewStore(data);
					this.carrier_search.setValue(response.carrier_id);
					this.carrier_search.setRawValue(response.carrier_name);
					
					this.contactLookup.setValue(response.contact_id)
					this.contactLookup.setRawValue(response.contact_name);
					this.contactLookup.setParam('carrier_id', response.carrier_id);
					if (response.carrier_id > 0){
						this.contactLookup.store.load();
						this.contactLookup.setReadOnly(false);
						this.contactLookup.enable();
					}else{
						this.contactLookup.setReadOnly(true);
						this.contactLookup.disable();
						//this.contactLookup.store.removeAll();
					}
					
					if (response.equipment_id)
						this.usedEquip.setValue(response.equipment_id)
				}
			});
		}
	},
	
	save: function() {
		var params = this.getValues();
		params.order_id = this.order_id
		if (this.autoSave && params.order_id) {
			this.submit();
		}
	}
});
Ext.define('TMS.orders.forms.sections.Charge', {
	extend:'TMS.form.Abstract',
	requires:[
		'TMS.orders.forms.sections.Accessorials'
	],
	
	//Config
	layout: 'fit',
	processingPage:'/at-ajax/modules/order/revenue/',
	itemized:true,
	loadByKey:'order_id',
	order_id:0,
	
	initComponent: function(){
		this.baseTitle = this.title;
		this.items = [];
		this.init();
		this.callParent(arguments);
		
	},
	
	init: function() {
		//Init layout componenents
		this.initTabPanel();
		this.initFieldContainer();
		this.initAccessorials();
		
		//Init fields
		this.initLinehaul();
		this.initFuel();
		
		//listenres
		this.initListeners();
		
		//Load the data
		this.loadData(this[this.loadByKey]);
	},
	
	initTabPanel: function(){
		this.tabPanel = new Ext.tab.Panel({
			scope: this,
			activeTab: 0
		});
		this.items.push(this.tabPanel);
		
		this.tabPanel.on('afterrender', function(){
			this.tabPanel.setActiveTab(0);
		}, this);
	},
	
	initFieldContainer: function(){
		this.fieldContainer = new Ext.panel.Panel({
			scope: this,
			title: 'Charges',
			bodyStyle:{
				padding:'8px'
			}
		});
		this.tabPanel.add(this.fieldContainer);
	},
	
	initLinehaul: function(){
		this.linehaul = Ext.create('Ext.form.Text', {
			fieldLabel: 'Linehaul',
			name: 'linehaul',
			value:'0'
		});
		this.fieldContainer.add(this.linehaul);
	},
	
	initFuel: function() {
		this.fuel = Ext.create('Ext.form.Text', {
			fieldLabel: 'Fuel',
			name: 'fuel',
			value:'0'
		});
		this.fieldContainer.add(this.fuel);
		
	},
	
	initAccessorials: function() {
		if (this.itemized) {
			this.accessorials = Ext.create('TMS.orders.forms.sections.Accessorials', {
				title: 'Accessorials'
			});
		}
		else {
			this.accessorials = Ext.create('Ext.form.Text', {
				fieldLabel: 'Accessorial Charge',
				name: 'accessorialCharge',
				value:'0'
			});
		}
		this.tabPanel.add(this.accessorials);
	},
	
	initListeners: function() {
		this.linehaul.on('change', this.updateTitle, this);
		this.fuel.on('change', this.updateTitle, this);
		
		if (this.itemized) {
			this.accessorials.on('updatetotal', this.updateTitle, this);
		}
		else {
			this.accessorials.on('change', this.updateTitle, this);
		}
	},
	
	updateTitle: function() {
		this.setTitle(this.baseTitle + ' $' + this.getTotal());
		this.fireEvent('updatetotal');
	},
	
	getTotal: function() {
		var total = 0;
		if (!isNaN(parseFloat(this.linehaul.getValue()))) {
			total += parseFloat(this.linehaul.getValue());
		}
		if (!isNaN(parseFloat(this.fuel.getValue()))) {
			total += parseFloat(this.fuel.getValue());
		}
		if (this.itemized) {
			total += this.accessorials.getTotal();
		}
		else {
			if (!isNaN(parseFloat(this.accessorials.getValue()))) {
				total += parseFloat(this.accessorials.getValue());
			}
		}
		total = total.toFixed(2);
		return parseFloat(total);
	},
	
	getValues: function() {
		var accessorialValue = 0;
		if (this.itemized) {
			accessorialValue = this.accessorials.getValues()
		}
		else {
			accessorialValue = this.accessorials.getValue();
		}
		var values = {
			linehaul:this.linehaul.getValue(),
			fuel:this.fuel.getValue(),
			accessorials:accessorialValue
		};
		return values;
	},
	
	loadData: function(loadByValue) {
		this[this.loadByKey] = loadByValue;
		var params = {};
		params[this.loadByKey] = this[this.loadByKey];
		if (this[this.loadByKey]) {
			this.setLoading();
			Ext.Ajax.request({
				scope:this,
				method:'post',
				url:this.processingPage + 'get-charge-information',
				params:params,
				success: function(r) {
					this.setLoading(false);
					var response = Ext.decode(r.responseText);
					this.record = response.record;
					this.setData();
				}
			});
		}
	},
	
	setData: function() {
		if(this.record.linehaul_charge != null){
			this.linehaul.setValue(this.record.linehaul_charge);
		}
		
		if(this.record.fuel_charge != null){
			this.fuel.setValue(this.record.fuel_charge);
		}
		
		if (this.record.accessorialCharges && this.record.accessorialCharges.length) {
			this.accessorials.addAccessorial(this.record.accessorialCharges);
			this.accessorials.collapseAll();
		}
	}
	
});
Ext.define('TMS.orders.forms.sections.Collected', {
	extend:'TMS.ActionWindow',
	title:'Collection Call',
	processingPage:'/at-ajax/modules/order/audit/',
	
	order_id:0,
	width:900,
	autoSize:false,
	
	init: function() {
		this.initHidden();
		this.initButtons();
		this.initListeners();
	},
	
	initHidden: function() {
		this.orderIdField = Ext.create('Ext.form.field.Hidden', {
			name:'orderId',
			value:0
		});
		this.items.push(this.orderIdField);
	},
	
	initButtons: function() {
		this.approveButton = Ext.create('Ext.button.Button', {
			scope:this,
			text:'Mark as Complete',
			handler:this.complete,
			scale:'medium'
		});
		this.viewButton = Ext.create('Ext.button.Button', {
			scope:this,
			text:'View Full Order',
			handler:this.viewOrder,
			scale:'medium'
		});
		this.addTopButton([
			this.approveButton,
			this.viewButton
		]);
	},
	
	complete: function() {
		this.setLoading();
		Ext.Ajax.request({
			scope:this,
			method:'post',
			url:this.processingPage + 'mark-as-collected',
			params:{
				order_id:this.order_id
			},
			success: function(r) {
				this.setLoading(false);
				var response = Ext.decode(r.responseText);
				this.fireEvent('taskcomplete');
				this.close();
			}
		});
	},
	
	viewOrder: function() {
		location.href = '/orders/?d=orders&a=show&id=' + this.order_id;
	},
	
	initListeners: function() {
		
	}
	
});
Ext.define('TMS.orders.forms.sections.CustomerInformation', {
	extend:'TMS.form.Abstract',
	
	requires:[
		'Ext.ux.form.field.RealComboBox',
		'TMS.customer.lookup.Customer',
		'TMS.contacts.lookup.Contact',
		'TMS.location.forms.sections.BillTo'
	],
	
	title:'Customer Information',
	baseTitle:'Customer Information',
	processingPage:'/at-ajax/modules/order/process/',
	url:'/at-ajax/modules/order/process/',
	loadByKey:'order_id',
	order_id:0,
	autoSave:false,
	bodyPadding:10,
	layout:'anchor',
	
	initComponent: function(){
		this.items = [];
		this.init();
		this.callParent(arguments);
	},
	
	init: function() {
		this.initCustomer();
		this.initContact();
		this.initBillTo();
		this.initListeners();
		this.loadData(this[this.loadByKey]);
	},
	
	initCustomer: function(){
		this.customerSelector = Ext.create('TMS.customer.lookup.Customer', {
			fieldLabel:'Customer',
			name:'customer_id',
			hiddenName: 'customer_id'
		});
		this.items.push(this.customerSelector);
	},
	
	initContact: function(){
		this.contactSelector = Ext.create('TMS.contacts.lookup.Contact', {
			fieldLabel:'Ordered By',
			name:'ordered_by_id',
			hiddenName:'ordered_by_id'
		});
		this.items.push(this.contactSelector);
	},
	
	initBillTo: function(){
		this.billToPanel = Ext.create('TMS.location.forms.sections.BillTo', {
			fieldLabel:'Bill To'
		});
		this.items.push(this.billToPanel);
	},
	initListeners: function() {
		this.customerSelector.on('select', function(field, records) {
			if(!records.length){
				this.contactSelector.disable();
				return false;
			}
			
			//Enable the contact selector
			this.contactSelector.enable();
			
			//Load all the hot contacts for this customer
			var record = records[0];
			this.contactSelector.setRawValue('');
			this.contactSelector.setValue(0);
			this.contactSelector.store.proxy.url = this.processingPage + 'get-customer-hot-contacts';
			this.contactSelector.store.proxy.extraParams.customer_id = record.get('customer_id');
			this.contactSelector.store.proxy.extraParams.status = 'hot';
			this.contactSelector.store.loadPage(1);
			this.contactSelector.focus(true, 50);
			this.contactSelector.expand();
			
			// Look up the bill to for this customer and set the bill to panel to the customer's bill to
			this.billToPanel.lookupCustomer(this.customerSelector.getValue());
			
			// Always select a new bill to when the customer changes
			// If this needs to only change when the bill to is blank, remove the "|| true""
//			if (!this.billToPanel.getValue() || true) {
//				this.billToPanel.loadFromStore({
//					customer_id:this.customerSelector.getValue()
//				});
//			}
			
		}, this);
		
		this.contactSelector.on('select', function(field, records) {
			// Look up the bill to for this contact and set the bill to panel to the contact's bill to
			this.billToPanel.lookupContact(this.contactSelector.getValue());
		}, this);
		
	},
	
	/**
	 * Loads a record based on either order_id, or pre_order_id
	 */
	loadData: function(loadByValue) {
		this[this.loadByKey] = parseInt(loadByValue);
		var params = {};
		params[this.loadByKey] = this[this.loadByKey];
		if (this[this.loadByKey]) {
			this.setLoading();
			Ext.Ajax.request({
				scope:this,
				method:'post',
				url:this.processingPage + 'get-customer-information',
				params:params,
				success: function(r) {
					this.setLoading(false);
					var response = Ext.decode(r.responseText);
					this.record = response.record;
					this.setData();
				}
			});
		}
	},
	
	setData: function() {
		var records;
		
		//Create a customer record
		if(this.record.customer_id){
			records = this.customerSelector.store.add({
				customer_id: this.record.customer_id,
				customer_name: this.record.customer_name
			});
			this.customerSelector.select(records[0]);
			this.billToPanel.filterByCustomer(this.record.customer_id);
		}
		
		//Create a contact record
		if(this.record.contact_id){
			records = this.contactSelector.store.add({
				contact_id: this.record.contact_id,
				name: this.record.contact_name
			});
			this.contactSelector.select(records[0]);
		}
		
		//Create the bill to record
		if(this.record.bill_to_location_id){
			this.billToPanel.setRecord(this.record);
		}
	},
	
	save: function() {
		if (this.autoSave && this[this.loadByKey]) {
			var params = {
				contact_id:this.contact_id,
				name:this.down('#name').getValue(),
				title:this.down('#title').getValue(),
				status_id:this.down('#status_id').getValue()
			};
			Ext.Ajax.request({
				scope:this,
				method:'post',
				url:this.processingPage + 'save-contact',
				params:params,
				success:function(r) {
					var response = Ext.decode(r.responseText);
					
				}
			});
		}
	}
	
});
Ext.define('TMS.orders.forms.sections.Details', {
	extend:'Ext.panel.Panel',
	requires:[
		'Ext.ux.form.field.RealComboBox'
	],
	
	//Config
	processingPage:'/at-ajax/modules/tools/detail-types/',
	
	initComponent: function(){
		this.items = [];
		this.init();
		this.callParent(arguments);
	},
	
	init: function() {
		this.initListeners();
		this.initStore();
		this.on('afterrender', function(){
			this.detailStore.on('load', function(){
				var newRow = this.createRow();
				this.add(newRow);
				this.selectFirst(newRow.down('realcombobox'));
			}, this, {single: true});
			this.detailStore.load();
		}, this);
	},
	
	initListeners: function() {
		this.on('add', this.itemAdded, this);
		this.on('remove', this.itemRemoved, this);
	},
	
	initStore: function() {
		this.detailStore = Ext.create('Ext.data.Store', {
			fields: [
				'detail_type_id',
				'detail_type_name',
			],
			proxy: {
				type: 'ajax',
				url: this.processingPage + 'list',
				reader: {
					type: 'json',
					root: 'records'
				}
			}
		});
	},
	
	selectFirst: function(combobox) {
		combobox.setValue(combobox.store.getAt(0).get('detail_type_id'));
	},
	
	getFirstUnusedIndex: function(combobox) {
		var indexToSelect = 0;
		
		// Loop through existing selections and store the currently used ids
		var existingIds = [];
		var items = this.items.items;
		for (var i = 0; i < items.length - 1; i++) {
			var subItem = items[i].items.items[0];
			var typeId = subItem.getValue();
			existingIds.push(typeId);
		}

		// Loop through records and find the first one that isnt in use
		var records = combobox.store.data.items;
		var numRecords = records.length;
		for (var i = 0; i < numRecords; i++) {
			if (existingIds.indexOf(records[i].data.detail_type_id) == -1) {
				indexToSelect = i;
				break;
			}
		}
		
		return indexToSelect;
	},
	
	selectFirstUnused: function(combobox) {
		if (combobox && combobox.store) {
			var record = combobox.store.getAt(this.getFirstUnusedIndex(combobox));
			combobox.setValue(record.get('detail_type_id'));
		}
	},
	
	setValues: function(records) {
		if(!records.length){
			return false;
		}
		if(!this.rendered){
			this.on('afterrender', function(panel, options){
				this.setValues(options.records);
			}, this, {records: records});
			return false;
		}
		
		//Set the values
		this.setLoading(true);
		this.removeAll();
		Ext.each(records, function(record){
			var row = this.createRow();
			this.add(row);
			var type = row.down('#detail_type_id');
			var value = row.down('#detail_value');
			var detailId = row.down('#detail_id');
			
			if(!type.isStoreLoaded){
				this.detailStore.on('load', function(store, records, bool, options){
					var type = options.type;
					var record = options.record;
					type.select(this.detailStore.getAt(this.detailStore.find('detail_type_id', record.detail_type_id)));
					
				}, this, {record: record, type: type});
			}
			else{
				type.select(this.detailStore.getAt(this.detailStore.find('detail_type_id', record.detail_type_id)));
			}
			value.setValue(record.detail_value);
			detailId.setValue(record.detail_id);
		}, this);
		this.setLoading(false);
	},
	
	getValues: function() {
		var ids = this.query('#detail_type_id');
		var values = this.query('#detail_value');
		var detailIds = this.query('#detail_id');
		var records = [];
		for(var i = 0; i < ids.length; i++){
			var id = ids[i].getValue();
			var detailId = detailIds[i].getValue();
			var value = values[i].getValue();
			var record = {
				detail_id: detailId,
				detail_type_id: id,
				detail_value: value
			};
			if(value.length){
				records.push(record);
			}
		}
		
		return records;
	},
	
	getCount: function(){
		return this.items.items.length;
	},
	
	createRow: function() {
		var p = Ext.create('Ext.panel.Panel', {
			layout:'hbox',
			border:false,
			defaults:{
				border:false
			},
			items:[{
				flex:1,
				xtype:'realcombobox',
				valueField:'detail_type_id',
				displayField:'detail_type_name',
				store: this.detailStore,
				queryMode: 'local',
				editable:false,
				margin:'2',
				itemId:'detail_type_id',
				name:'detail_type_id[]'
			},{
				flex:1,
				xtype: 'textfield',
				enforceMaxLength: true,
				maxLength: 100,
				name: 'detail_value[]',
				margin:'2',
				itemId:'detail_value',
				enableKeyEvents:true,
				listeners:{
					scope:this,
					keyup:function(textfield) {
						if (textfield.getValue().length) {
							var fields = this.query('#detail_value');
							var lastField = fields[fields.length-1];
							if (lastField.getValue().length) {
								// add another field
								var newRow = this.createRow();
								this.add(newRow);
								this.selectFirstUnused(newRow.down('realcombobox'));
							}
						}
					},
					blur:function(textfield) {
						if (!textfield.getValue().length) {
							var fields = this.query('#detail_value');
							var lastField = fields[fields.length-1];
							if (textfield != lastField) {
								textfield.ownerCt.destroy();
							}
						}
					}
				}
			},{
				xtype: 'hiddenfield',
				name: 'detail_id',
				itemId: 'detail_id',
				value: 0
			},{
				xtype: 'button',
				margin:'2',
				icon:'/resources/icons/delete-16.png',
				width:24,
				scope:this,
				handler:function(button) {
					// remove if not the last one
					button.ownerCt.destroy();
				}
			}]
		});
		return p;
	},
	
	itemAdded: function(panel, item, options) {
		var rows = this.query('> .panel');
		this.manageRemoveButtons(rows);
		//this.doLayout();
	},
	
	
	itemRemoved: function(panel, item, options) {
		// Get all rows
		var rows = this.query('> .panel');
		if (rows.length) {
			this.manageRemoveButtons(rows);
		}
	},
	
	manageRemoveButtons: function(rows) {
		for (var i = 0; i < rows.length-1; i++) {
			rows[i].down('.button').enable();
		}
		rows[rows.length-1].down('.button').disable();
	}
	
});
Ext.define('TMS.orders.forms.sections.Goods', {
	extend:'Ext.form.Panel',
	
	title:'Goods',
	baseTitle:'Goods',
	bodyStyle:{
		padding:'8px'
	},
	processingPage:'/at-ajax/modules/order/goods/',
	loadByKey:'order_id',
	order_id:0,
	autoSave: false,
	
	initComponent: function(){
		this.baseTitle = this.title;
		this.items = [];
		this.init();
		this.callParent(arguments);
		
	},
	
	init: function() {
		this.initWeight();
		this.initDescription();
		this.initListeners();
		this.loadData(this[this.loadByKey]);
	},
	
	initWeight: function(){
		this.weight = Ext.create('Ext.form.Text', {
			fieldLabel: 'Load Weight (in lbs)',
			labelAlign: 'top',
			name: 'load_weight',
			value:'0'
		});
		this.items.push(this.weight);
	},
	
	initDescription: function() {
		this.description = Ext.create('Ext.form.TextArea', {
			grow: true,
			name: 'goods_desc',
			fieldLabel: 'Load Description',
			labelAlign: 'top',
			anchor: '100%',
			value: '',
			width: 450,
			hidden: true
		});
		this.items.push(this.description);
	},
	
	initListeners: function() {
		
	},
	
	loadData: function(loadByValue) {
		this[this.loadByKey] = loadByValue;
		var params = {};
		params[this.loadByKey] = this[this.loadByKey];
		if (this[this.loadByKey]) {
			this.setLoading();
			Ext.Ajax.request({
				scope:this,
				method:'post',
				url:this.processingPage + 'get',
				params:params,
				success: function(r) {
					this.setLoading(false);
					var response = Ext.decode(r.responseText);
					this.record = response.record;
					this.setData(response.record);
				}
			});
		}
	},
	
	setData: function(data) {
		this.weight.setValue(data.weight);
		this.description.setValue(data.desc);
	}
	
});
Ext.define('TMS.orders.forms.sections.Invoice', {
	extend:'TMS.ActionWindow',
	
	//Requires
	requires:[
		'TMS.documents.view.Interface'
	],
	
	title:'Send Invoice',
	processingPage:'/at-ajax/modules/order/audit/',
	order_id:0,
	widthPercent:.9,
	heightPercent:.9,
	
	init: function() {
		this.initBillToDetails();
		this.initDocuments();
		this.initHidden();
		
		this.initButtons();
		
		this.initListeners();
	},
	
	initBillToDetails: function() {
		this.billToDetails = Ext.create('Ext.panel.Panel', {
			
		});
		this.items.push(this.billToDetails);
	},
	
	initDocuments: function() {
		this.documentsPanel = Ext.create('TMS.documents.view.Interface', {
			extraParams:{
				order_id:this.order_id
			},
			height:300,
			collapsible:false
		});
		this.items.push(this.documentsPanel);
	},
	
	initHidden: function() {
		this.orderIdField = Ext.create('Ext.form.field.Hidden', {
			name:'orderId',
			value:0
		});
		this.items.push(this.orderIdField);
	},
	
	initButtons: function() {
		this.approveButton = Ext.create('Ext.button.Button', {
			scope:this,
			text:'Mark as Complete',
			handler:this.complete,
			scale:'medium'
		});
		this.viewButton = Ext.create('Ext.button.Button', {
			scope:this,
			text:'View Full Order',
			handler:this.viewOrder,
			scale:'medium'
		});
		this.addTopButton([
			this.approveButton,
			this.viewButton
		]);
	},
	
	complete: function() {
		this.setLoading();
		Ext.Ajax.request({
			scope:this,
			method:'post',
			url:this.processingPage + 'complete-invoice',
			params:{
				order_id:this.order_id
			},
			success: function(r) {
				this.setLoading(false);
				var response = Ext.decode(r.responseText);
				this.fireEvent('taskcomplete');
				this.close();
			}
		});
	},
	
	viewOrder: function() {
		location.href = '/orders/?d=orders&a=show&id=' + this.order_id;
	},
	
	initListeners: function() {
		
	}
	
});
Ext.define('TMS.orders.forms.sections.Load', {
	extend:'Ext.panel.Panel',
	
	//Requires
	requires:[
		'TMS.carrier.lookup.Carrier'
	],
	
	layout: 'anchor',
	bodyPadding: 5,

	//Config
	origin: {
		index: 0,
		location_id: 0,
		location_name: '',
		city: '',
		state: '',
		address_1: '',
		zip: ''
	},
	destination: {
		index: 1,
		location_id: 0,
		location_name: '',
		city: '',
		state: '',
		address_1: '',
		zip: ''
	},
	
	initComponent: function(){
		this.items = [];
		this.init();
		this.callParent(arguments);
	},
	
	init: function() {
		this.initCarrier();
		this.on('afterrender', function(){
			this.updateTitle();
		}, this);
	},
	
	initCarrier: function(){
		this.carrier = Ext.create('TMS.carrier.lookup.Carrier', {
			hiddenName: 'carrier_id',
			fieldLabel: 'Carrier',
			value: 0
		});
		this.items.push(this.carrier);
	},
	
	setOrigin: function(origin){
		Ext.apply(this.origin, origin);
		this.updateTitle();
	},
	
	setDestination: function(destination){
		Ext.apply(this.destination, destination);
		this.updateTitle();
	},
	
	updateTitle: function(){
		var originName = this.origin.location_name_1;
		var destinationName = this.destination.location_name_1;
		if(!this.origin.location_id){
			originName = "No Location Selected";
		}
		if(!this.destination.location_id){
			destinationName = "No Location Selected";
		}
		this.setTitle(originName + ' &raquo; ' + destinationName);
	}
});
Ext.define('TMS.orders.forms.sections.Loads', {
	extend:'Ext.panel.Panel',
	
	//Requires
	requires:[
		'TMS.orders.forms.sections.Stops',
		'TMS.orders.forms.sections.Load'
	],
	
	//Config

	initComponent: function(){
		this.items = [];
		this.init();
		this.callParent(arguments);
	},
	
	init: function(){
		this.initStops();
		this.initLoadsPanel();
	},
	
	initStops: function(){
		this.stops = Ext.create('TMS.orders.forms.sections.Stops', {
			height: 300,
			order_id: 505
		});
		this.items.push(this.stops);
		
		this.stops.on('set', function(panel, stops){
			this.setValues(stops);
		}, this);
	},
	
	initLoadsPanel: function(){
		this.loadsPanel = new Ext.panel.Panel({
			scope: this,
			title: 'Loads'
		});
		this.items.push(this.loadsPanel);
		
		this.stops.on('addstop', function(){
			this.setValues(this.stops.getValues());
		}, this);
		this.stops.on('removestop', function(){
			this.setValues(this.stops.getValues());
		}, this);
		this.stops.on('reorder', function(stops, event){
			this.setValues(this.stops.getValues());
		}, this);
		this.stops.on('locationchange', function(stops, event){
			this.setValues(this.stops.getValues());
		}, this);
	},
	
	setValues: function(stops){
		if(stops.length <= 1){
			return;
		}
		
		var loads = this.getLoadPanels();
		
		//Add or update any lodas
		Ext.each(stops, function(stop, index){
			if(index == stops.length -1){
				return;
			}
			var load = loads[index];
			//Add this load if it doesnt exist
			if(load == null){
				this.addLoad(stop, stops[index+1]);
			}
			else{
				load.setOrigin(stop);
				load.setDestination(stops[index+1]);
			}
		}, this);
		
		//Remove any loads not needed
		Ext.each(loads, function(load, index){
			if(stops[index+1] == null){
				load.destroy();
			}
		}, this);
	},
	
	addLoad: function(origin, destination){
		var load = Ext.create('TMS.orders.forms.sections.Load', {
			scope: this,
			margin: 10,
			origin: origin,
			destination: destination
		});
		this.loadsPanel.add(load);
	},
	
	getLoadPanels: function(){
		return this.loadsPanel.items.items;
	}
});
Ext.define('TMS.orders.forms.sections.OrderDetailRow', {
	extend:'Ext.panel.Panel',
	
	//Config
	layout:'hbox',
	border:false,
	defaults:{
		border:false
	},
	store:false,
	readOnly: false,
	
	initComponent: function() {
		this.items = this.items || [];
		this.init();
		this.callParent(arguments);
	},
	
	init: function() {
		this.initDetailType();
		this.initDetailValue();
		this.initButton();
	},
	
	initDetailType: function(){
		var config = {};
		if(this.readOnly){
			Ext.apply(config, {
				hideTrigger: true,
				readOnly: true
			});
		}
		
		this.detailType = Ext.create('Ext.ux.form.field.RealComboBox', Ext.apply({
			scope: this,
			flex:1,
			valueField:'detail_type_id',
			displayField:'detail_type_name',
			store: this.store,
			queryMode: 'local',
			editable:false,
			margin:'2',
			hiddenName:'order_detail_type_id[]'
		}, config));
		this.items.push(this.detailType);
	},
	
	initDetailValue: function(){
		var config = {};
		if(this.readOnly){
			Ext.apply(config, {
				readOnly: true
			});
		}
		
		this.detailValue = Ext.create('Ext.form.field.Text', Ext.apply({
			scope: this,
			itemId: 'detail_value',
			flex:1,
			margin:'2',
			enableKeyEvents:true,
			name: 'order_detail_value[]'
		}, config));
		this.items.push(this.detailValue);
	},
	
	initButton: function(){
		var config = {};
		if(this.readOnly){
			Ext.apply(config, {
				hidden: true
			});
		}
		this.button = Ext.create('Ext.button.Button', Ext.apply({
			scope: this,
			margin:'2',
			icon:'/resources/icons/delete-16.png',
			width:24,
			handler:function(button) {
				
			}
		}, config));
		this.items.push(this.button);
	}
});
Ext.define('TMS.orders.forms.sections.OrderDetails', {
	extend:'TMS.form.Abstract',
	
	//Requires
	requires:[
		'Ext.ux.form.field.RealComboBox',
		'TMS.orders.forms.sections.OrderDetailRow'
	],
	
	//Config
	title:'Order Details',
	baseTitle:'Order Details',
	bodyStyle:{
		padding:'8px'
	},
	processingPage:'/at-ajax/modules/order/process/',
	url:'/at-ajax/modules/order/process/save-contact-methods',
	loadByKey:'order_id',
	order_id:0,
	autoSave:false,
	readOnly: false,
	
	initComponent: function(){
		this.items = this.items || [];
		this.addEvents('dataload');
		this.init();
		this.callParent(arguments);
	},
	
	init: function() {
		this.initListeners();
		this.initStore();
		this.loadData();
	},
	
	initListeners: function() {
		this.on('add', this.itemAdded, this);
		this.on('remove', this.itemRemoved, this);
		this.on('beforesubmit', function(form){
			if(!this.rendered){
				return;
			}
			var rows = this.getRows();
			var numRows = rows.length;
			var types = [];
			var data = [];
			
			for (var i = 0; i < numRows; i++) {
				types.push(rows[i].detailType.getValue());
				data.push(rows[i].detailValue.getValue());
				
				rows[i].detailType.name = 'order_detail_type_id_' + i;
				rows[i].detailValue.name =  'order_detail_value_' + i;
			}
			
			form.setParam('order_detail_type_id', Ext.encode(types));
			form.setParam('order_detail_value', Ext.encode(data));
		}, this);
	},
	
	initStore: function() {
		this.store = Ext.create('Ext.data.Store', {
			fields: [
				'detail_type_id',
				'detail_type_name'
			],
			proxy: {
				type: 'ajax',
				url: this.processingPage + 'get-order-details-list',
				reader: {
					type: 'json',
					root: 'records'
				}
			}
		});
		
		this.store.load();
	},
	
	getRows: function() {
		return this.query('> .panel');
	},
	
	selectFirst: function(combobox) {
		if (combobox && combobox.store) {
			var record = combobox.store.getAt(0);
			if (record) {
				combobox.setValue(record.get('detail_type_id'));
			}
		}
	},
	
	getFirstUnusedIndex: function(combobox) {
		var indexToSelect = 0;
		
		// Loop through existing selections and store the currently used ids
		var existingIds = [];
		var items = this.getRows();
		for (var i = 0; i < items.length - 1; i++) {
			var subItem = items[i].items.items[0];
			var typeId = subItem.getValue();
			existingIds.push(typeId);
		}

		// Loop through records and find the first one that isnt in use
		var records = combobox.store.data.items;
		var numRecords = records.length;
		for (var i = 0; i < numRecords; i++) {
			if (existingIds.indexOf(records[i].data.detail_type_id) == -1) {
				indexToSelect = i;
				break;
			}
		}
		
		return indexToSelect;
	},
	
	selectFirstUnused: function(combobox) {
		if (combobox && combobox.store) {
			var record = combobox.store.getAt(this.getFirstUnusedIndex(combobox));
			combobox.setValue(record.get('detail_type_id'));
		}
	},
	
	addContactMethod: function() {
		
	},
	
	setValues: function() {
		
	},
	
	getValues: function() {
		var types = [];
		var data = [];
		var rows = this.getRows();
		for (var i = 0; i < rows.length; i++) {
			types.push(rows[i].detailType.getValue());
			data.push(rows[i].detailValue.getValue());
		}
		var params = {
			'order_detail_type_id[]':types,
			'order_detail_value[]':data
		};
		params[this.loadByKey] = this[this.loadByKey];
		return params;
	},
	
	createRow: function() {
		var row = Ext.create('TMS.orders.forms.sections.OrderDetailRow', {
			scope: this,
			store: this.store,
			readOnly: this.readOnly
		});
		
		//Listeners
		row.detailValue.on('keyup', function(textfield) {
			if (textfield.getValue().length) {
				var fields = this.query('#detail_value');
				var lastField = fields[fields.length-1];
				if (lastField.getValue().length) {
					// add another field
					var newRow = this.createRow();
					this.add(newRow);
					this.selectFirstUnused(newRow.detailType);
				}
			}
		}, this);
		
		row.detailValue.on('change', function(textfield) {
			if (!textfield.getValue().length) {
				var fields = this.query('#detail_value');
				var lastField = fields[fields.length-1];
				if (textfield != lastField) {
					textfield.ownerCt.destroy();
				}
			}
			this.save();
		}, this, {buffer:500});
		
		return row;
	},
	
	destroyRows: function() {
		Ext.each(this.query('> .panel'), function(el){
			el.destroy();
		});
	},
	
	loadData: function(loadByValue, name) {
		this[this.loadByKey] = loadByValue || this[this.loadByKey];
		var newTitle = this.baseTitle;
		if (name != null) {
			newTitle = this.baseTitle + ' - ' + name;
		}
		
		if (this.rendered) {
			this.setTitle(newTitle);
		}
		else {
			this.title = newTitle;
		}
		
		if (this.store.isLoading()) {
			this.store.on('load', function() {
				this.loadData();
			}, this);
		}
		else {
			if (this[this.loadByKey]) {
				this.setLoading(true);
				var params = {};
				params[this.loadByKey] = this[this.loadByKey];
				Ext.Ajax.request({
					scope:this,
					method:'post',
					url:this.processingPage + 'get-order-details-data',
					params:params,
					success: function(r) {
						this.setLoading(false);
						var response = Ext.decode(r.responseText);
						var records = response.records;
						
						// remove old rows - need to suspend events so this remove doesn't trigger for a previous contact
						this.suspendEvents();
						this.destroyRows();
						this.resumeEvents();
						
						// loop through all contact method records and make a row for each
						for (var i = 0; i < records.length; i++) {
							var panel = this.createRow();
							panel.on('afterrender', function(panel, options) {
								var combobox = panel.detailType;
								var textfield = panel.detailValue;
								combobox.setValue(options.record.detail_type_id);
								textfield.setRawValue(options.record.detail_value);
							}, this, {record: records[i]});
							this.add(panel);
						}
						// add another field
						if(!this.readOnly){
							var newRow = this.createRow();
							this.add(newRow);
							this.selectFirst(newRow.detailType);
						}
						this.fireEvent('dataload', this);
					}
				});
			}
			else {
				if(!this.readOnly){
					var newRow = this.createRow();
					this.add(newRow);
					this.selectFirst(newRow.detailType);
				}
			}
		}
	},
	
	itemAdded: function(panel, item, options) {
		var rows = this.query('> .panel');
		this.manageRemoveButtons(rows);
	},
	
	
	itemRemoved: function(panel, item, options) {
		// Get all rows
		var rows = this.query('> .panel');
		if (rows.length) {
			this.manageRemoveButtons(rows);
			this.save();
		}
	},
	
	manageRemoveButtons: function(rows) {
		if (rows.length) {
			for (var i = 0; i < rows.length-1; i++) {
				rows[i].down('.button').enable();
			}
			rows[rows.length-1].down('.button').disable();
		}
	},
	
	save: function() {
		if (this.autoSave && this[this.loadByKey]) {
			this.submit();
			var params = this.getValues();
			
			/*
			
			Ext.Ajax.request({
				scope:this,
				method:'post',
				url:this.processingPage + 'save-contact-methods',
				params:params,
				success:function(r) {
					var response = Ext.decode(r.responseText);
					
				}
			});
			*/
		}
	}
	
});
Ext.define('TMS.orders.forms.sections.Revenue', {
	extend:'Ext.form.Panel',
	
	//Requires
	requires:[
		'Ext.ux.form.field.RealComboBox',
		'TMS.orders.forms.sections.Charge'
	],
	
	title:'Revenue',
	baseTitle:'Revenue',
	
	processingPage:'/at-ajax/modules/order/revenue/',
	order_id:0,
	
	layout:{
		type: 'hbox',
		align: 'stretch'
	},
	
	initComponent: function(){
		this.items = [];
		this.init();
		this.callParent(arguments);
	},
	
	init: function() {
		this.initCharge();
		this.initCost();
		this.initProfit();
		this.initListeners();
		this.loadData(this.order_id);
	},
	
	initCharge: function(){
		this.charge = Ext.create('TMS.orders.forms.sections.Charge', {
			title:'Charge',
			flex:1
		});
		this.items.push(this.charge);
	},
	
	initCost: function(){
		this.cost = Ext.create('TMS.orders.forms.sections.Charge', {
			title:'Cost',
			flex:1
		});
		this.items.push(this.cost);
	},
	
	initProfit: function(){
		
	},
	
	initListeners: function() {
		this.charge.on('updatetotal', this.updateTitle, this);
		this.cost.on('updatetotal', this.updateTitle, this);
	},
	
	loadData: function(order_id) {
		this.order_id = order_id;
		if (this.order_id) {
			this.setLoading();
			Ext.Ajax.request({
				scope:this,
				method:'post',
				url:this.processingPage + 'get-revenue-information',
				params:{
					order_id:this.order_id
				},
				success: function(r) {
					this.setLoading(false);
					var response = Ext.decode(r.responseText);
					this.record = response.record;
					if (this.record) {
						this.setData();
					}
				}
			});
		}
	},
	
	setData: function() {
		this.charge.linehaul.setValue(this.record.linehaul_charge);
		this.charge.fuel.setValue(this.record.fuel_charge);
		this.cost.linehaul.setValue(this.record.linehaul_cost);
		this.cost.fuel.setValue(this.record.fuel_cost);
		
		if (this.record.accessorialCharges && this.record.accessorialCharges.length) {
			this.charge.accessorials.addAccessorial(this.record.accessorialCharges);
			this.charge.accessorials.updateTitle();
//			this.charge.accessorials.collapseAll();
		}
		
		if (this.record.accessorialCosts && this.record.accessorialCosts.length) {
			this.cost.accessorials.addAccessorial(this.record.accessorialCosts);
			this.charge.accessorials.updateTitle();
//			this.cost.accessorials.collapseAll();
		}
	},
	
	updateTitle: function() {
		var title = this.baseTitle;
		var total = this.getTotal();
		var chargeTotal = this.charge.getTotal();
		var color = 'green';
		var percent = 0;
		var percentDisplay = 'n/a';
		if (chargeTotal > 0) {
			percent = total / chargeTotal;
			percent *= 100;
			percent = percent.toFixed(2);
			percentDisplay = percent + '%';
		}
		if (total <= 0) {
			color = 'red';
		}
		title += ' <span style="color:' + color + ';"> $';
		title += total;
		title += ' (' + percentDisplay + ')';
		title += '</span>';
		this.setTitle(title);
		this.fireEvent('updatetotal');
	},
	
	getTotal: function() {
		var total = 0;
		total = this.charge.getTotal();
		total -= this.cost.getTotal();
		total = total.toFixed(2);
		return parseFloat(total);
	},
	
	getValues: function() {
		var values = {
			charges:this.charge.getValues(),
			costs:this.cost.getValues()
		};
		
		return values;
	}
	
});
Ext.define('TMS.orders.forms.sections.Stop', {
	extend: 'TMS.form.Abstract',
	
	//requires
	requires:[
		'TMS.location.lookup.Location',
		'TMS.contacts.lookup.Contact',
		'TMS.orders.forms.sections.Details',
		'TMS.ActionWindow',
		'TMS.orders.forms.sections.Details',
		'TMS.contacts.forms.sections.ContactMethods',
		'TMS.form.plugin.StatusBar',
		'TMS.location.forms.Form'
	],
	
	//Config
	layout: 'anchor',
	originalValues: false,
	type:'order',
	url: '',

	//Config
	initComponent: function(){
		this.items = [];
		this.dockedItems = this.dockedItems || [];
		this.originalValues = false;
		this.init();
		this.callParent(arguments);
	},
	
	init: function() {
		this.initFieldContainer();
		this.initZip();
		this.initLocation();
		this.initContact();
		this.initDateTimeStopType();
		this.initDetails();
		this.initHidden();
	},
	
	
	initFieldContainer: function(){
		this.fieldContainer = new Ext.panel.Panel({
			scope: true,
			unstyled: true,
			border: false,
			bodyPadding: 10,
			layout: 'anchor',
			anchor: '100%'
		});
		
		this.items.push(this.fieldContainer);
	},
	
	initZip: function() {
		var config = {};
		if (this.type != 'preorder') {
			Ext.apply(config, {
				hidden: true
			});
		}
		
		this.zip = Ext.create('Ext.form.field.Text', Ext.apply({
			fieldLabel:'Zip',
			name:'zip',
			anchor:'100%',
			enableKeyEvents:true
		}, config));

		this.zip.on('keypress', function(field, e) {
			// If user presses enter, fire an event, so a new stop can be added
			if (e.keyCode == 13) {
				this.fireEvent('pressedenter');
			}
		}, this);

		this.zip.on('change', function(field, e) {
			this.fireEvent('addresschange');
		}, this);

		this.fieldContainer.add(this.zip);
	},
	
	initLocation: function(){
		//Create the location selector
		this.location = Ext.create('TMS.location.lookup.Location', {
			name: 'location_id',
			value: '',
			flex: 1
		});
		
		//Create the add location button
		this.locationAddButton = new Ext.button.Button({
			scope: this,
			margin: '0 0 0 5',
			icon: '/resources/icons/add-16.png',
			text:'Add Location',
			handler:this.createLocationWindow
		});
		
		//Create the location container
		this.locationContainer = Ext.create('Ext.form.FieldContainer', {
			scope: this,
			fieldLabel: 'Location',
			combineErrors: true,
			layout: 'hbox',
			defaults: {
				hideLabel: true
			},
			items:[
				this.location,
				this.locationAddButton
			]
		});
		
		//Add container to the form
		this.fieldContainer.add(this.locationContainer);
		
		//Listeners
		this.on('set', function(panel, values){
			if(values.location_id == null || !values.location_id){
				return;
			}
			this.location.loadFromStore({
				location_id: values.location_id
			});
		}, this);
	},
	
	initContact: function(){
		
		//Create the contact field
		this.contact = Ext.create('TMS.contacts.lookup.Contact', {
			name: 'contact_id',
			value: 0,
			layout: 'anchor',
			flex: 1
		});
		
		//Create the add contact button
		this.contactAddButton = new Ext.button.Button({
			scope:this,
			margin: '0 0 0 5',
			icon: '/resources/icons/edit-16.png',
			text:'Manage Contact Methods',
			handler: this.manageContactMethods
		});
		
		//Create the contact container
		this.contactContainer = Ext.create('Ext.form.FieldContainer', {
			scope: this,
			disabled: true,
			fieldLabel: 'Contact',
			combineErrors: true,
			layout: 'hbox',
			defaults: {
				hideLabel: true
			},
			items:[
				this.contact,
				this.contactAddButton
			]
		});
		
		//Add container to the form
		this.fieldContainer.add(this.contactContainer);
		
		//Listeners
		this.location.on('change', function(field, value){
			this.contact.enable();
			this.contact.setParam('location_id', value);
		}, this);
		
		this.location.on('select', function(field, records, options){
			if(!records.length){
				return;
			}
			this.contact.setValue('');
			this.contact.setRawValue('');
			if(!records.length){
				this.contactContainer.disable();
				return;
			}
			//Set the contact location
			this.contactContainer.enable();
			var record = records[0];
			this.contact.setParam('location_id', record.get('location_id'));
			this.contact.store.loadPage(1);
			//this.contact.focus(true, 50);
			
			if (this.zip) {
				this.zip.setValue(record.get('zip'));
			}
			
			this.fireEvent('addresschange');
		}, this);
		
		this.on('set', function(panel, values){
			if(values.contact_id == null || !values.contact_id){
				return;
			}
			this.contact.loadFromStore({
				contact_id: values.contact_id
			});
		}, this);
	},
	
	initDateTimeStopType: function(){
		this.stopTypeHidden = new Ext.form.field.Hidden({
			name: 'stop_type',
			toggle: function(){
				if(this.getValue() == 'd'){
					this.setValue('p');
				}
				else{
					this.setValue('d');
				}
			},
			value: 'd'
		});
		this.stopTypeHidden.on('change', function(field, value, oldValue){
			this.stopType.updateImage();
		}, this);
		this.stopType = new Ext.panel.Panel({
			scope: this,
			width: 32,
			height: 32,
			unstyled: true,
			style:{
				cursor: 'pointer'
			},
			stopTypeHidden: this.stopTypeHidden,
			pickupDetails:{
				img: '/resources/silk_icons/lorry_add_32.png',
				title: 'Stop Type (Pickup)'
			},
			deliveryDetails: {
				img: '/resources/silk_icons/lorry_delete_32.png',
				title: 'Stop Type (Delivery)'
			},
			updateImage: function(){
				var value = this.stopTypeHidden.getValue();
				var displayObject;
				if(value == "d"){
					displayObject = this.deliveryDetails;
				}
				else{
					displayObject = this.pickupDetails;
				}
				this.update(Ext.String.format(
					'<img src="{0}" title="{1}" />',
					displayObject.img,
					displayObject.title
				));
			}
		});
		this.stopType.on('afterrender', function(){
			this.stopType.updateImage();
			this.stopType.getEl().on('click', function(){
				this.stopTypeHidden.toggle();
			}, this);
		}, this);
		
		this.fieldContainer.add({
			xtype: 'fieldcontainer',
			fieldLabel: 'Date and Time',
			labelWidth: 100,
			anchor: '100%',

			// The body area will contain three text fields, arranged
			// horizontally, separated by draggable splitters.
			layout: 'hbox',
			items: [{
				xtype: 'datefield',
				name: 'date',
				submitFormat: 'n/j/Y',
				flex: 1,
				margin: '0 5 0 0',
				value: ''
			},{
				xtype: 'timefield',
				name: 'time',
				flex: 1,
				margin: '0 5 0 0',
				value: '8:00 AM',
				allowBlank: false
			}, this.stopType]
		});
		
		this.fieldContainer.add(this.stopTypeHidden);
	},
	
	initDetails: function(){
		//Create the details field button
		this.detailsButton = new Ext.button.Button({
			scope: this,
			text: 'Edit Details',
			baseText: 'Edit Details',
			handler: function(){
				this.detailsWindow.show();
			}
		});
		
		//Create the field container to hold the button
		this.fieldContainer.add({
			xtype: 'fieldcontainer',
			fieldLabel: 'Details',
			combineErrors: true,
			layout: 'hbox',
			defaults: {
				hideLabel: true
			},
			items:[this.detailsButton]
		});
		
		//Create the details panel
		this.detailsPanel = Ext.create('TMS.orders.forms.sections.Details', {
		});
		
		this.detailsPanel.on('add', function(){
			this.detailsButton.setText(this.detailsButton.baseText + ' (' + (this.detailsPanel.getCount()-1) + ')');
		}, this);
		this.detailsPanel.on('remove', function(){
			this.detailsButton.setText(this.detailsButton.baseText + ' (' + (this.detailsPanel.getCount()-1) + ')');
		}, this);
		
		//Listeners
		this.on('set', function(panel, values){
			if(values.details == null){
				return;
			}
			this.detailsPanel.setValues(values.details);
			this.detailsButton.setText(this.detailsButton.baseText + ' (' + (values.details.length) + ')');
		}, this);
		
		//Create the details window
		this.detailsWindow = Ext.create('TMS.ActionWindow', {
			scope: this,
			autoShow: false,
			title: 'Stop Details',
			layout: 'fit',
			closeAction: 'hide',
			items:[this.detailsPanel],
			bottomItems: [{
				scope: this,
				text: 'Save & Close',
				cls: 'submit',
				handler: function(){
					this.detailsWindow.hide();
				}
			}]
		});
	},
	
	initDetailsPanel: function(){
		this.detailsPanel = Ext.create('TMS.orders.forms.sections.Details', {
			title: 'Details',
			baseTitle: 'Details'
		});
		this.detailsPanel.on('expand', function(){
			this.detailsPanel.setHeight(null);
			this.doLayout(true);
		}, this);
		this.detailsPanel.on('collapse', function(){
			this.doLayout(true);
		}, this);
		this.detailsPanel.on('add', function(){
			this.detailsPanel.setTitle(this.detailsPanel.baseTitle + ' (' + (this.detailsPanel.getCount()-1) + ')');
		}, this);
		this.detailsPanel.on('remove', function(){
			this.detailsPanel.setTitle(this.detailsPanel.baseTitle + ' (' + (this.detailsPanel.getCount()-1) + ')');
		}, this);
		
		this.on('set', function(panel, values){
			if(values.details == null){
				return;
			}
			this.detailsPanel.setValues(values.details);
		}, this);
		
		this.items.push(this.detailsPanel);
	},
	
	initHidden: function(){
		this.fieldContainer.add({
			xtype: 'hiddenfield',
			name: 'stop_id',
			value: 0
		});
	},
	
	setValues: function(values){
		this.callParent(arguments);
		
		if(this.originalValues == false){
			this.originalValues = values;
		}
		
		this.fireEvent('set', this, values);
	},
	
	getValues: function(){
		//Merge in location record
		var locationRecord = this.location.store.getAt(this.location.store.find('location_id', this.location.getValue()));
		if(locationRecord != null){
			this.setParams(locationRecord.data);
		}
		
		//Add details
		this.setParam('details', this.detailsPanel.getValues());
		
		//Return the values
		return this.callParent(arguments);
	},
	
	manageContactMethods: function() {
		var contactId = parseInt(this.contact.getValue());
		if (contactId) {
			var contactMethods = Ext.create('TMS.contacts.forms.sections.ContactMethods', {
				title: '',
				baseTitle: '',
				contact_id: contactId,
				autoSave: true,
				plugins: [Ext.create('TMS.form.plugin.StatusBar')]
			});

			var contactMethodsWindow = Ext.create('TMS.ActionWindow', {
				layout: 'fit',
				items:[contactMethods],
				title: this.contact.getRawValue() + ' - Contact Methods'
			});
			contactMethodsWindow.showCloseButton();
		}
		
	},
	
	createLocationWindow: function(){
		this.locationForm = Ext.create('TMS.location.forms.Form', {
			scope: this,
			plugins: [Ext.create('TMS.form.plugin.StatusBar')]
		});
		
		this.locationForm.on('success', function(form, action){
			this.locationWindow.destroy();
			var record = action.result.record;
			this.location.setValue(record.location_id);
			this.location.loadFromStore({
				location_id: record.location_id
			});
		}, this);
		
		//Create a hidden field for job site
		this.locationForm.add({
			xtype: 'checkboxfield',
			boxLabel: 'This location is a Job Site',
			name: 'job_site',
			inputValue: '1'
		});

		this.locationWindow = Ext.create('TMS.ActionWindow', {
			items:[this.locationForm],
			title:"Add shipping address",
			bottomItems: [{
				xtype: 'button',
				cls: 'submit',
				scope: this,
				text: 'Save',
				handler: function() {
					this.locationForm.submit();
				}
			},{
				xtype: 'button',
				cls: 'submit',
				scope: this,
				text: 'Cancel',
				handler: function() { 
					this.locationWindow.destroy(); 
				}
			}]
		});
	}
});
Ext.define('TMS.orders.forms.sections.Stops', {
	extend:'Ext.tab.Panel',
	
	//Requires
	requires:[
		'Ext.ux.GMapPanel',
		'TMS.portal.Column',
		'TMS.portal.Panel',
		'TMS.orders.forms.sections.Stop'
	],

	//Config
	activeItem: 0,
	autoScroll: false,
	orderProcessingPage: '/at-ajax/modules/order/order/',
	order_id: 0,
	pre_order_id: 0,
	type:'order',
	
	title:'Stops',
	baseTitle:'Stops',
	
	initComponent: function(){
		this.items = [];
		
		this.addEvents(
			'addstop',
			'removestop',
			'reorder',
			'locationchange',
			'set',
			'get'
		);
		
		this.init();
		this.callParent(arguments);
	},
	
	init: function() {
		this.initEastPanel();
		this.initMapPanel();
		this.initStopContainer();
		this.initMap();
		this.initListeners();
		this.initStops();
	},
	
	initStops: function(){
		if(!this.rendered){
			this.on('afterrender', function(){
				this.initStops();
			}, this, { delay: 100 });
			return;
		}
		
		if(this.order_id || this.pre_order_id){
			this.setLoading(true);
			Ext.Ajax.request({
				scope: this,
				url: this.orderProcessingPage + 'get-stops',
				params: {
					order_id: this.order_id,
					pre_order_id: this.pre_order_id,
					type:this.type
				},
				success: function(r){
					var response = Ext.decode(r.responseText);
					var stops = this.setValues(response.records);
					Ext.each(stops, function(stop){
						stop.collapse();
					}, this);
					this.setLoading(false);
				}
			});
		}
		else{
			this.addStop();
		}
	},
	
	initMapPanel: function(){
		this.mapPanel = Ext.create('Ext.ux.GMapPanel', {
			scope: this,
			title: 'Map',
			gmapType: 'map',
			mapConfig: {
				scrollwheel: false
				//navigationControl: false,
				//mapTypeControl: false,
				//scaleControl: false,
				//draggable: false
			}
		})
		this.items.push(this.mapPanel);
		
		this.mapPanel.on('show', function(){
			this.findMarkers();
		}, this);
	},
	
	initMap: function(){
		this.mapPanel.on('afterrender', function(){
		   this.map = this.mapPanel.gmap;
		}, this, {single: true});
	},
	
	initEastPanel: function(){
		this.eastToolbar = new Ext.toolbar.Toolbar({
			scope: this,
			items:[{
				scope: this,
				text: 'Add Stop',
				icon: '/resources/icons/add-16.png',
				handler: function(){
					var stop = this.addStop({
						collapsed: false
					});
					this.goToStop(stop);
					
				}
			},{
				scope: this,
				text: 'Collapse All',
				handler: function(){
					var stops = this.getStopPanels();
					Ext.each(stops, function(stop){
						stop.collapse();
					}, this);
					this.stopContainer.doLayout();
				}
			},{
				scope: this,
				text: 'Expand All',
				handler: function(){
					var stops = this.getStopPanels();
					Ext.each(stops, function(stop, index){
						setTimeout(Ext.bind(function(){
							stop.expand();
						}, stop), (index*0));
					}, this);
				}
			}]
		});
		
		this.eastPanel = new Ext.panel.Panel({
			scope: this,
			title: 'Stops',
			region: 'east',
			//columnWidth: 1,
			autoScroll: true,
			border: false,
			tbar: this.eastToolbar
		});
		
		this.items.push(this.eastPanel);
	},
	
	initStopContainer: function(){
		this.stopPortal = Ext.create('TMS.portal.Column', {
			border: false
		});
		this.stopContainer = Ext.create('TMS.portal.Panel', {
			scope: this,
			border: false,
			unstyled: true,
			bodyPadding: '10',
			autoScroll: false,
			items:[this.stopPortal]
		});
		
		this.stopContainer.on('drop', function(event){
			this.fireEvent('reorder', this, event);
		}, this);
		
		this.eastPanel.add(this.stopContainer);
	},
	
	setValues: function(stops){
		if(!this.rendered){
			this.on('afterrender', function(panel, options){
				this.setValues(options.stops);
			}, this, {stops: stops});
			return;
		}
		
		var createdStops = [];
		Ext.each(stops, function(record){
			var stop = this.addStop();
			this.setStopValues(stop, record);
			createdStops.push(stop);
		}, this);
		
		//Fire the set event
		this.fireEvent('set', this, stops);
		
		this.updateMileage();
		
		return createdStops;
	},
	
	getValues: function(){
		var stops = [];
		Ext.each(this.getStopPanels(), function(stop){
			stop.useDefaultNames();
			if(stop.getValues != null){
				var data = stop.getValues()
				data['street'] = data['address_1'];
				stops.push(data);
			}
			stop.usePrefixPostfixNames();
		}, this);
		
		//Fire the get event
		this.fireEvent('get', this, stops);
		
		return stops;
	},
	
	addStop: function(config){
		if(config == null){
			config = {};
		}
		
		//Create the stop panel
		var stop = Ext.create('TMS.orders.forms.sections.Stop', Ext.apply({
			scope: this,
			fieldPrefix: 'stop',
			fieldPostfix: this.getStopPanels().length,
			draggable: true,
			cls: 'x-portlet',
			title: 'No Location Selected',
			baseTitle: 'No Location Selected',
			frame: true,
			margin: '0 0 10 0',
			collapsible: true,
			type:this.type,
			//collapsed: true,
			titleCollapse: true,
			animCollapse: false,
			tools:[{
				scope: this,
				type:'close',
				tooltip: 'Remove',
				handler: function(event, toolEl, panel){
					//remove
					this.removeStop(panel.up('panel'));
				}
			}]
		}, config));
		
		stop.on('expand', function(panel){
			panel.doLayout();
		}, this);
		
		stop.on('pressedenter', function() {
			var stop = this.addStop({
				collapsed: false
			});
			this.goToStop(stop);
			stop.zip.focus();
		}, this);
		
		stop.on('addresschange', function(){
			this.updateMileage();
		}, this);
		
		
		//Set the stop type
		if(!this.getStopPanels().length){
			stop.on('afterrender', function(panel, options){
				panel.stopTypeHidden.setValue('p');
			}, this);
		}
		
		//Setup on destroy action
		stop.on('destroy', function(panel){
			if(panel.marker != null){
				panel.marker.setVisible(false);
			}
			this.findMarkers();
			this.stopContainer.doLayout();
			
			//Fire remove event
			this.fireEvent('removestop', this, stop);
			
			this.updateMileage();
			
		}, this, {stop: stop});
		
		
		//Listen for a location change
		stop.location.on('select', function(field, records, options){
			if(!records.length){
				return false;
			}
			var record = records[0];
			
			//Update the title
			var name = record.get('location_name_1');
			if(name.length > 50){
				name = name.substr(0, 50) + '...';
			}
			stop.setTitle(Ext.String.format(
				'<span>{0} ({1})</span>',
				name,
				record.get('zip')
			));
			stop.baseTitle = stop.title;
			
			//Add the marker to the map
			this.addMarker(options.stop, record.get('lat'), record.get('lng'), record.get('location_name_1'));
			
			//Fire location change event
			this.fireEvent('locationchange', this, options.stop);
			
		}, this, {stop: stop});
		
		//Add the stop to the container panel
		this.stopPortal.add(stop);
		this.doLayout();
		
		//Fire the event
		this.fireEvent('addstop', this, stop);
		
		//Return the stop
		return stop;
	},
	
	removeStop: function(stop){
		stop.getEl().fadeOut({
			callback: Ext.bind(function(stop){
				this.stopPortal.remove(stop);
				stop.destroy();
			}, this, [stop])
		});
	},
	
	getStopPanels: function(){
		return this.stopPortal.items.items;
	},
	
	addMarker: function(stop, lat, lng, title) {
		if(this.map == null){
			this.mapPanel.on('afterrender', function(panel, options){
				this.addMarker(options.stop, options.lat, options.lng, options.title);
			}, this, {stop: stop, lat: lat, lng: lng, title: title});
			return;
		}
		
		//Remove old marker if it exists
		if(stop.marker != null){
			stop.marker.setVisible(false);
		}
		
		//Create the new marker
		stop.marker = new google.maps.Marker({
		  map: this.map,
		  position: new google.maps.LatLng(lat, lng),
		  title: title
		});
		stop.marker.setVisible(false);
		
		//Make sure the map shows all markers
		this.findMarkers();
	},
	
	findMarkers: function(){
		if(this.map == null){
			this.on('afterrender', function(){
				this.findMarkers();
			}, this);
			return;
		}
		var stops = this.getStopPanels();
		var latLngList = [];
		Ext.each(stops, function(stop){
			if(stop.marker != null){
				latLngList.push(stop.marker.getPosition());
			}
		}, this);
		
		if(!latLngList.length){
			return;
		}
		
		var bounds = new google.maps.LatLngBounds();
		for (var i = 0; i < latLngList.length; i++) {
		  bounds.extend(latLngList[i]);
		}
		
		this.map.fitBounds(bounds);
		
		//Set the route
		if(latLngList.length > 1){
			if(this.directionsDisplay == null){
				this.directionsDisplay = new google.maps.DirectionsRenderer();
				this.directionsService = new google.maps.DirectionsService();
			}
			this.directionsDisplay.setMap(null);
			this.directionsDisplay.setMap(this.map);
			
			var origin = latLngList.shift();
			var destination = latLngList.pop();
			var wayPoints = [];
			Ext.each(latLngList, function(latLng){
				wayPoints.push({
					location: latLng
				});
			}, this);
			var request = {
				origin: origin,
				destination: destination,
				waypoints: wayPoints,
				travelMode: google.maps.TravelMode.DRIVING
			};
			this.directionsService.route(request, Ext.bind(function(result, status) {
				if (status == google.maps.DirectionsStatus.OK) {
					this.directionsDisplay.setDirections(result);
				}
			}, this));
		}
	},
	
	bounceMarker: function(marker, bounce){
		if(bounce == null){
			bounce = true;
		}
		
		if(bounce){
			marker.setAnimation(google.maps.Animation.BOUNCE);
		}
		else{
			marker.setAnimation();
		}
	},
	
	goToStop: function(stop){
		//Check if rendered
		if(!stop.rendered){
			stop.on('afterrender', function(panel, options){
				this.goToStop(options.stop);
			}, this, {stop: stop});
			return;
		}
		
		//Scroll into view
		setTimeout(Ext.bind(function(){
			Ext.get(this.stopContainer.body).scrollTo('top', stop.getBox().y, {
				scope: stop,
				duration: 300,
				callback: function(){
					stop.down('field').focus(true, 50);
				}
			});
		}, this), 50);
	},
	
	setStopValues: function(stop, values){
		//Check if rendered
		if(!stop.rendered){
			stop.on('afterrender', function(stop, options){
				this.setStopValues(stop, options.values);
			}, this, {values: values});
			return;
		}
		
		//Add the marker
		if(values.location_id){
			this.addMarker(stop, values.lat, values.lng, values.location_name_1);
		}

		//Set the title
		var name = values.location_name_1;
		if(name.length){
			if(name.length > 50){
				name = name.substr(0, 50) + '...';
			}
			stop.setTitle(Ext.String.format(
				'<span>{0} ({1})</span>',
				name,
				values.zip
			));
			stop.baseTitle = stop.title;
		}
		
		//Set the actual stop values
		stop.setValues(values);
	},
	
	updateMileage: function() {
		clearTimeout(this.updateMileageTimeout);
		this.updateMileageTimeout = setTimeout(Ext.bind(function(){
			this.doUpdateMileage();
		}, this), 500);
	},
	
	doUpdateMileage: function(){
		
		this.setTitle(this.baseTitle + ' (Calculating mileage...)');
		
		var stops = this.getValues();
		if (stops.length < 2) {
			this.setTitle(this.baseTitle + ' - Add 2 or more stops to calculate mileage');
		}
		// Only send request if we have at least 5 characters in the zip of all of them
		for (var i = 0; i < stops.length; i++) {
			if (!stops[i].zip || stops[i].zip && stops[i].zip.length < 5) {
				// Need to display an error to complete all zips/locations
				
				this.setTitle(this.baseTitle + ' - Complete stop locations to update mileage');
				return false;
			}
		}
		
		Ext.Ajax.request({
			scope:this,
			method:'post',
			url:'/at-ajax/modules/mileage/process/calculate-miles',
			params:{
				stops:Ext.encode(stops)
			},
			success: function(r) {
				var response = Ext.decode(r.responseText);
				if (response.success) {
					// Check google miles
					var data = false;
					var icon = '';
					if (response.results.google.distance) {
						data = response.results.google;
						icon = '<span><img src="/resources/icons/google-16.png" /></span>';
					}
					if (data) {
						if (data.distanceDisplay) {
							this.setTitle(this.baseTitle + ' - ' + icon + ' - ' + data.distanceDisplay);
						}
						else {
							this.setTitle(this.baseTitle);
						}

						// Update stop panel titles
						var stopPanels = this.getStopPanels();
						stopPanels[0].setTitle(stopPanels[0].baseTitle);
						for (var i = 1; i < stopPanels.length; i++) {
							if (data.movements[i-1] && data.movements[i-1]['distanceDisplay']) {
								stopPanels[i].setTitle(stopPanels[i].baseTitle + ' - ' + icon + ' - ' + data.movements[i-1]['distanceDisplay']);
							}
						}
					}
				}
			}
		});
	},
	
	initListeners: function() {
		this.on('reorder', this.onReorder, this);
		this.on('reorder', function() {
			this.updateMileage();
		}, this);
	},
	
	onReorder: function(){
		var stops = this.getStopPanels();
		Ext.each(stops, function(stop, index){
			stop.setFieldPostfix(index);
		}, this);
	}
});
Ext.define('TMS.orders.forms.Order', {
	extend:'TMS.form.Navigation',
	
	//Requires
	requires:[
		'TMS.orders.forms.sections.CustomerInformation',
		'TMS.orders.forms.sections.Stops',
		'TMS.orders.forms.sections.OrderDetails',
		'TMS.orders.forms.sections.Goods',
		'TMS.contacts.forms.sections.ModesEquipment',
		'TMS.orders.forms.sections.Carrier',
		'TMS.documents.view.Interface',
		'TMS.comment.forms.sections.Comments',
		'TMS.orders.forms.sections.Revenue',
		'TMS.orders.rateconfirmation.Preview'
	],
	
	//Config
	title: 'Order',
	url: '/at-ajax/modules/order/process/save-order',
	deferredRender: true,
	orderId: 0,
	
	initComponent: function(){
		this.items = this.items || [];
		this.dockedItems = this.dockedItems || [];
		this.orderId = parseInt(this.orderId);
		this.init();
		this.callParent(arguments);
	},
	
	init: function() {
		this.initTitle();
		this.initButtons();
		this.initCustomerInformation();
		this.initStops();
		this.initOrderDetails();
		this.initGoods();
		this.initModesEquipment();
		this.initCarrier();
		this.initDocuments();
		this.initComments();
		this.initRevenue();
	},
	
	initTitle: function(){
		this.baseTitle = this.title;
		if(this.orderId){
			this.title = 'Editing ' + this.baseTitle + ' - ' + this.orderId;
		}
		else{
			this.title = 'New ' + this.baseTitle;
		}
	},
	
	initButtons: function(){
		this.buttons = [{
			scope: this,
			text: 'Preview Rate Confirmation',
			icon: '/resources/icons/preview-16.png',
			cls: 'submit',
			handler: function() {
				this.on('submit', function(){
					this.previewRateConfirmation();
				}, this, {single: true });
				this.submit();
				
			}
		},{
			scope: this,
			text: 'Cancel',
			icon: '/resources/icons/delete-16.png',
			cls: 'submit',
			handler: function() {
				
			}
		},{
			scope: this,
			text: 'Save',
			icon: '/resources/icons/save-16.png',
			cls: 'submit',
			handler: function() {
				this.submit();
			}
		}];
	},
	
	initCustomerInformation: function(){
		this.customerInformation = Ext.create('TMS.orders.forms.sections.CustomerInformation', {
			order_id: this.orderId
		});
		this.items.push(this.customerInformation);
		
		this.items.push({
			xtype: 'hidden',
			name: 'order_id',
			value: this.orderId
		});
	},
	
	initStops: function(){
		this.stops = Ext.create('TMS.orders.forms.sections.Stops', {
			order_id: this.orderId
		});
		this.items.push(this.stops);
		
		this.stops.on('addstop', function(stops, stop){
			this.bindForm(stop);
		}, this);
		
		//Before submit listener
		this.on('beforesubmit', function(){
			if(this.stops.rendered){
				this.setParam('stops', Ext.encode(this.stops.getValues()));
			}
		}, this);
	},
	
	initOrderDetails: function(){
		this.orderDetails = Ext.create('TMS.orders.forms.sections.OrderDetails', {
			order_id: this.orderId
			//autoSave: true
		});
		this.items.push(this.orderDetails);
	},
	
	initGoods: function(){
		this.goods = Ext.create('TMS.orders.forms.sections.Goods', {
			order_id: this.orderId
		});
		this.items.push(this.goods);
	},
	
	initModesEquipment: function(){
		this.modesEquipment = Ext.create('TMS.contacts.forms.sections.ModesEquipment', {
		});
		this.items.push(this.modesEquipment);
		
		this.customerInformation.contactSelector.on('change', function(field, value) {
			if (isNaN(value)) {
				return;
			}
			else {
				this.modesEquipment.loadContact(value);
			}
		}, this);
	},
	
	initCarrier: function(){
		this.carrier = Ext.create('TMS.orders.forms.sections.Carrier', {
			title: 'Carrier',
			order_id: this.orderId
		});
		this.items.push(this.carrier);
		
		this.carrier.on('show', function(){
			if(this.stops.rendered){
				this.carrier.grid.fromSelect.store.loadData(this.stops.getValues());
			}
		}, this);
	},
	
	initDocuments: function(){
		this.documents = Ext.create('TMS.documents.view.Interface', {
			autoDestroy: false,
			extraParams:{
				order_id: this.orderId
			}
		});
		this.items.push(this.documents);
		
		this.documents.on('minimize', function(){
			this.setActiveItem(this.documents);
			this.documents.doLayout();
		}, this);
	},
	
	initComments: function(){
		this.comments = Ext.create('TMS.comment.forms.sections.Comments', {
			field_value: this.orderId,
			type:'order'
		});
		this.items.push(this.comments);
	},
	
	initRevenue: function(){
		this.revenue = Ext.create('TMS.orders.forms.sections.Revenue', {
			title: 'Revenue',
			order_id: this.orderId
		});
		this.items.push(this.revenue);
		
		//Before submit listener
		this.on('beforesubmit', function(){
			if(this.revenue.rendered){
				this.setParam('revenue', Ext.encode(this.revenue.getValues()));
			}
		}, this);
	},
	
	previewRateConfirmation: function(){
		if(this.rateConfirmation == null){
			this.rateConfirmation = Ext.create('TMS.orders.rateconfirmation.Preview', {
				order_id: this.orderId
			});
		}
		else {
			this.rateConfirmation.show();
			this.rateConfirmation.loadOrder(this.orderId);
		}
	}
});
Ext.define('TMS.orders.rateconfirmation.Email', {
	extend:'TMS.ActionWindow',
	
	//Requires
	requires:[
		'Ext.ux.form.field.RealComboBox',
		'TMS.contacts.forms.sections.ContactMethods',
		'TMS.ActionWindow'
	],
	
	order_id:0,
	contact_id:0,
	contactName:'',
	title:'Rate Confirmation Email',
	baseTitle:'Rate Confirmation Email',
	processingPage:'/at-ajax/modules/order/process/',
	layout:'hbox',
	
	init: function() {
		this.initEmailBox();
		this.initButtons();
	},
	
	initEmailBox: function() {
		this.emailStore = Ext.create('Ext.data.Store', {
			fields: [
				'email',
				'contact_id',
				'contactName'
			],
			proxy: {
				type: 'ajax',
				url : this.processingPage + 'get-carrier-contact-email-list',
				extraParams: {
					order_id:this.order_id
				},
				reader: {
					type: 'json',
					root: 'records'
				}
			}
		});
		this.emailBox = Ext.create('Ext.ux.form.field.RealComboBox', {
			store:this.emailStore,
			displayField:'email',
			valueField:'email',
			queryMode:'local',
			flex:1,
			emptyText: 'No emails for this contact',
			editable:false
		});
		this.items.push(this.emailBox);
		
		this.emailStore.on('load', function() {
			if (this.emailStore.data.length) {
				this.emailBox.setValue(this.emailStore.getAt(0).get('email'));
				this.contact_id = this.emailStore.getAt(0).get('contact_id');
				this.contactName = this.emailStore.getAt(0).get('contactName');
				this.updateData();
			}
			else {
				// ajax to get contact info
				this.setLoading(true);
				Ext.Ajax.request({
					scope:this,
					method:'post',
					url:this.processingPage + 'get-carrier-contact',
					params: {
						order_id:this.order_id
					},
					success: function(r) {
						this.setLoading(false);
						var response = Ext.decode(r.responseText);
						this.contact_id = response.contact_id;
						this.contactName = response.contactName;
						this.updateData();
					}
				});
			}
		}, this);
		this.emailStore.load();
	},
	
	updateData: function() {
		this.setTitle(this.baseTitle + ' - ' + this.contactName);
		if (this.contact_id) {
			this.manageContactMethodsButton.enable();
			if (this.emailStore.data.length) {
				this.sendEmailButton.enable();
			}
			else {
				this.sendEmailButton.disable();
			}
		}
		else {
			this.manageContactMethodsButton.disable();
			this.sendEmailButton.disable();
		}
	},
	
	initButtons: function() {
		this.sendEmailButton = Ext.create('Ext.button.Button', {
			scope:this,
			text:'Send Email',
			handler:this.sendEmail,
			itemId:'sendEmailButton',
			icon:'/resources/icons/email-16.png'
		});
		
		this.manageContactMethodsButton = Ext.create('Ext.button.Button', {
			scope:this,
			text:'Manage Contact Methods',
			handler:this.manageContactMethods,
			itemId:'manageContactMethodsButton'
		});
		
		this.addTopButton([this.sendEmailButton, this.manageContactMethodsButton]);
		this.showCloseButton();
	},
	
	sendEmail: function() {
		// send email should only be enabled if there is a contact and email selected
		var email = this.emailBox.getValue();
		this.setLoading('Sending email to ' + email);
		Ext.Ajax.request({
			scope:this,
			method:'post',
			url:this.processingPage + 'email-confirmation',
			params:{
				order_id:this.order_id,
				email:email
			},
			success: function(r) {
				this.setLoading(false);
				var response = Ext.decode(r.responseText);
				if (response.success) {
					this.update(response.msg[0]);
					this.topToolbar.hide();
				}
			}
		});
	},
	
	manageContactMethods: function() {
		var contactMethods = Ext.create('TMS.contacts.forms.sections.ContactMethods', {
			contact_id:this.contact_id
		});
		
		var contactMethodsWindow = Ext.create('TMS.ActionWindow', {
			title:this.contactName,
			width:400,
			height:300,
			items:[contactMethods]
		})
		contactMethodsWindow.showCloseButton();
		contactMethodsWindow.on('close', function() {
			this.emailBox.setValue('');
			this.emailStore.load();
		}, this);
	}
	
});
Ext.define('TMS.orders.rateconfirmation.Fax', {
	extend:'TMS.ActionWindow',
	
	//Requires
	requires:[
		'Ext.ux.form.field.RealComboBox',
		'TMS.contacts.forms.sections.ContactMethods',
		'TMS.ActionWindow'
	],
	
	order_id:0,
	contact_id:0,
	contactName:'',
	title:'Rate Confirmation Fax',
	baseTitle:'Rate Confirmation Fax',
	processingPage:'/at-ajax/modules/order/process/',
	layout:'hbox',
	
	init: function() {
		this.initFaxBox();
		this.initButtons();
	},
	
	initFaxBox: function() {
		this.faxStore = Ext.create('Ext.data.Store', {
			fields: [
				'fax',
				'contact_id',
				'contactName'
			],
			proxy: {
				type: 'ajax',
				url : this.processingPage + 'get-carrier-contact-fax-list',
				extraParams: {
					order_id:this.order_id
				},
				reader: {
					type: 'json',
					root: 'records'
				}
			}
		});
		this.faxBox = Ext.create('Ext.ux.form.field.RealComboBox', {
			store:this.faxStore,
			displayField:'fax',
			valueField:'fax',
			queryMode:'local',
			flex:1,
			emptyText: 'No faxes for this contact',
			editable:false
		});
		this.items.push(this.faxBox);
		
		this.faxStore.on('load', function() {
			if (this.faxStore.data.length) {
				this.faxBox.setValue(this.faxStore.getAt(0).get('fax'));
				this.contact_id = this.faxStore.getAt(0).get('contact_id');
				this.contactName = this.faxStore.getAt(0).get('contactName');
				this.updateData();
			}
			else {
				// ajax to get contact info
				this.setLoading(true);
				Ext.Ajax.request({
					scope:this,
					method:'post',
					url:this.processingPage + 'get-carrier-contact',
					params: {
						order_id:this.order_id
					},
					success: function(r) {
						this.setLoading(false);
						var response = Ext.decode(r.responseText);
						this.contact_id = response.contact_id;
						this.contactName = response.contactName;
						this.updateData();
					}
				});
			}
		}, this);
		this.faxStore.load();
	},
	
	updateData: function() {
		this.setTitle(this.baseTitle + ' - ' + this.contactName);
		if (this.contact_id) {
			this.manageContactMethodsButton.enable();
			if (this.faxStore.data.length) {
				console.log(this.faxStore);
				this.sendFaxButton.enable();
			}
			else {
				this.sendFaxButton.disable();
			}
		}
		else {
			this.manageContactMethodsButton.disable();
			this.sendFaxButton.disable();
		}
	},
	
	initButtons: function() {
		this.sendFaxButton = Ext.create('Ext.button.Button', {
			scope:this,
			text:'Send Fax',
			handler:this.sendFax,
			itemId:'sendFaxButton',
			icon:'/resources/icons/fax-16.png'
		});
		
		this.manageContactMethodsButton = Ext.create('Ext.button.Button', {
			scope:this,
			text:'Manage Contact Methods',
			handler:this.manageContactMethods,
			itemId:'manageContactMethodsButton'
		});
		
		this.addTopButton([this.sendFaxButton, this.manageContactMethodsButton]);
		this.showCloseButton();
	},
	
	sendFax: function() {
		// send fax should only be enabled if there is a contact and fax selected
		var fax = this.faxBox.getValue();
		this.setLoading('Sending fax to ' + fax);
		Ext.Ajax.request({
			scope:this,
			method:'post',
			url:this.processingPage + 'fax-confirmation',
			params:{
				order_id:this.order_id,
				fax:fax
			},
			success: function(r) {
				this.setLoading(false);
				var response = Ext.decode(r.responseText);
				if (response.success) {
					this.update(response.msg[0]);
					this.topToolbar.hide();
				}
			}
		});
	},
	
	manageContactMethods: function() {
		var contactMethods = Ext.create('TMS.contacts.forms.sections.ContactMethods', {
			contact_id:this.contact_id
		});
		
		var contactMethodsWindow = Ext.create('TMS.ActionWindow', {
			title:this.contactName,
			width:400,
			height:300,
			items:[contactMethods]
		})
		contactMethodsWindow.showCloseButton();
		contactMethodsWindow.on('close', function() {
			this.faxBox.setValue('');
			this.faxStore.load();
		}, this);
	}
	
});
Ext.define('TMS.orders.rateconfirmation.Preview', {
	extend:'TMS.ActionWindow',
	
	//Requires
	requires:[
		'TMS.ActionWindow',
		'TMS.orders.rateconfirmation.Email',
		'TMS.orders.rateconfirmation.Fax'
	],
	
	//Config
	order_id:0,
	iframe:false,
	iframeHtml:false,
	title:'Rate Confirmation Preview',
	url:'/at-ajax/modules/order/process/',
	
	closeAction:'hide',
	
	widthPercent: 0.9,
	heightPercent: 0.9,
	
	init: function() {
		this.initIframe();
		this.initButtons();
	},
	
	initIframe: function() {
		this.iframeHtml = Ext.core.DomHelper.markup({
			tag:'iframe',
			cls:'rate-confirmation-iframe',
			border:0,
			frameborder:0,
			width:'100%',
			height:'100%'
		});
		this.html = this.iframeHtml;
		this.on('afterrender', function(){
			this.iframe = this.getEl().down('iframe');
			
			if (this.order_id) {
				this.loadOrder(this.order_id);
			}
		}, this);
	},
	
	initButtons: function() {
		this.showCloseButton();
		this.addTopButton([{
			scope:this,
			text:'Download PDF',
			handler:this.download,
			icon:'/resources/icons/download-16.png'
		},{
			scope:this,
			text:'Send Email',
			handler:this.sendEmail,
			icon:'/resources/icons/email-16.png'
		},{
			scope:this,
			text:'Send Fax',
			handler:this.sendFax,
			icon:'/resources/icons/fax-16.png'
		},{
			scope:this,
			text:'Tweet This',
			handler:this.tweetThis,
			icon:'/resources/icons/twitter-16.png'
		}]);
	},
	
	loadOrder: function(order_id) {
		this.order_id = order_id || this.order_id;
		
		setTimeout(Ext.bind(function(){
			this.setLoading();
		}, this), 200);
		
		
		this.iframe.on('load', function() {
			this.setLoading(false);
		}, this);
		this.iframe.dom.src = this.url + 'output-confirmation?order_id=' + this.order_id;
	},
	
	download: function() {
		location.href = this.url + 'download-confirmation?order_id=' + this.order_id
	},
	
	sendEmail: function() {
		Ext.create('TMS.orders.rateconfirmation.Email', {
			order_id:this.order_id
		});
	},
	
	sendFax: function() {
		Ext.create('TMS.orders.rateconfirmation.Fax', {
			order_id:this.order_id
		});
	},
	
	tweetThis: function() {
		this.tweetThisWindow = Ext.create('TMS.ActionWindow', {
			html:'<img src="/resources/img/seriously.png" />',
			width:350,
			height:290
		});
	}
	
});
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
Ext.define('TMS.orders.view.PostGrid', {
	extend: 'Ext.grid.Panel',
	
	//Config
	processingPage: '/at-ajax/modules/order/posting/get',
	viewConfig: {
		stripeRows: true
	},
	features: [{
		id: 'group',
		ftype: 'groupingsummary',
		groupHeaderTpl: 'Quote #: {name}',
		hideGroupedHeader: true,
		showSummaryRow: false,
		remoteRoot: 'summaryData'
	}],
	
	initComponent: function(){
		this.init();
		this.callParent(arguments);
	},
	
	//Init Functions
	init: function(){
		this.initColumns();
		this.initStore();
		this.initPager();
		this.initListeners();
	},
	
	initListeners: function(){
		this.on('afterrender', function(){
			this.store.load();
		}, this);
		
		this.on('itemdblclick', function(view, record){
			this.setLoading(true);
			location.href = Ext.String.format('?d=quotes&a=show&id={0}', record.get('pre_order_id'));
		}, this);
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
			header: 'Pre Order',
			dataIndex: 'pre_order_id',
			flex: 1
		},{
			header: 'Service',
			dataIndex: 'posting_service_name',
			flex: 1,
			renderer: function(value, options, record){
				return Ext.String.format(
					'<a href="{0}" target="_blank">{1}</a>',
					record.get('url'),
					value
				);
			}
		},{
			header: 'Date',
			dataIndex: 'posting_created_at',
			flex: 1
		},{
			//?d=posts&a=cancel&id=17
			xtype:'templatecolumn',
			tpl:'<div class="button" style="width: 75px;">' +
				'<a href="?d=posts&a=cancel&id={pre_order_id}">' +
					'<img src="/resources/silk_icons/cross.png" /> ' +
							'Cancel' +
						'</a>' +
				'</div>'
		}];
	},
	
	initStore: function(){
		this.store = new Ext.data.Store({
			fields: [
				'pre_order_id',
				'posting_created_at',
				'posting_service_name',
				'url',
			],
			remoteSort: true,
			pageSize: 50,
			groupField: 'pre_order_id',
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
