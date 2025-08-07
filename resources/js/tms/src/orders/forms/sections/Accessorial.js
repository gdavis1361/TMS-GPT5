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