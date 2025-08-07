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