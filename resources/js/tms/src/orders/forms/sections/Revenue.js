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