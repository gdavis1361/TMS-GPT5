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