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