Ext.define('TMS.customer.forms.Form', {
	extend: 'TMS.form.Abstract',
	
	//Config
	url: '/at-ajax/modules/customer/process/add',
	bodyPadding: 10,
	isPayTo:false,
	
	initComponent: function(){
		this.items = [];
		this.init();
		this.callParent(arguments);
	},
	
	init: function(){
		this.initCustomerName();
		
		if (this.isPayTo) {
			this.items.push({
				xtype:'hidden',
				name:'isPayTo',
				value:1
			});
		}
	},
	
	initCustomerName: function() {
		this.customerName = Ext.create('Ext.form.field.Text', {
			fieldLabel:'Company Name',
			anchor:'100%',
			name:'customerName',
			enableKeyEvents:true
		});
		this.customerName.on('keypress', function(field, e) {
			if (e.keyCode == 13) {
				this.fireEvent('pressedenter');
			}
		}, this);
		this.items.push(this.customerName);
	}
	
});