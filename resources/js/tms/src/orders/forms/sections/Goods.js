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