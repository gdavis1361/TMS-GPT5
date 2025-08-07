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