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