Ext.define('TMS.preorders.forms.PreOrder', {
	extend:'TMS.form.Navigation',
	
	//Requires
	requires:[
		'TMS.preorders.forms.sections.CustomerInformation',
		'TMS.preorders.forms.sections.Expiration',
		'TMS.orders.forms.sections.Stops',
		'TMS.preorders.forms.sections.OrderDetails',
		'TMS.contacts.forms.sections.ModesEquipment',
		'TMS.preorders.forms.sections.Charge'
	],
	
	//Config
	title: 'Quote',
	url: '/at-ajax/modules/preorder/process/save',
	deferredRender: true,
	preOrderId: 0,
	
	initComponent: function(){
		this.items = this.items || [];
		this.dockedItems = this.dockedItems || [];
		this.preOrderId = parseInt(this.preOrderId);
		this.init();
		this.callParent(arguments);
	},
	
	init: function() {
		this.initTitle();
		this.initHidden();
		this.initButtons();
		this.initCustomerInformation();
		this.initQuoteExpiration();
		this.initStops();
		this.initOrderDetails();
		this.initModesEquipment();
		this.initCharges();
	},
	
	initTitle: function(){
		this.baseTitle = this.title;
		if(this.preOrderId){
			this.title = 'Editing ' + this.baseTitle + ' - ' + this.preOrderId;
		}
		else{
			this.title = 'New ' + this.baseTitle;
		}
	},
	
	initHidden: function(){
		
	},
	
	initButtons: function(){
		this.buttons = [{
			scope: this,
			text: 'Save and Convert',
			icon: '/resources/icons/save-16.png',
			cls: 'submit',
			handler: function(){
				this.setParam('doConvert', 1);
				this.submit();
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
		this.customerInformation = Ext.create('TMS.preorders.forms.sections.CustomerInformation', {
			pre_order_id: this.preOrderId,
			loadByKey:'pre_order_id'
		});
		this.items.push(this.customerInformation);
		
		this.items.push({
			xtype: 'hidden',
			name: 'pre_order_id',
			value: this.preOrderId
		});
	},
	
	initQuoteExpiration: function(){
		this.quoteExpiration = Ext.create('TMS.preorders.forms.sections.Expiration', {
			pre_order_id: this.preOrderId
		});
		this.items.push(this.quoteExpiration);
	},
	
	initStops: function(){
		this.stops = Ext.create('TMS.orders.forms.sections.Stops', {
			pre_order_id: this.preOrderId,
			type:'preorder'
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
		this.orderDetails = Ext.create('TMS.preorders.forms.sections.OrderDetails', {
			pre_order_id: this.preOrderId
		});
		this.items.push(this.orderDetails);
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
	
	initCharges: function(){
		this.charges = Ext.create('TMS.preorders.forms.sections.Charge', {
			pre_order_id: this.preOrderId,
			title:'Charges'
		});
		this.items.push(this.charges);
		
		//Before submit listener
		this.on('beforesubmit', function(){
			if(this.charges.rendered){
				this.setParam('charges', Ext.encode(this.charges.getValues()));
			}
		}, this);
	}
});