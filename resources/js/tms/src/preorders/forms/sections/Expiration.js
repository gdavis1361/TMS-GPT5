Ext.define('TMS.preorders.forms.sections.Expiration', {
	extend:'TMS.form.Abstract',
	
	//Config
	title:'Quote Expiration',
	baseTitle:'Quote Expiration',
	bodyStyle:{
		padding:'8px'
	},
	processingPage:'/at-ajax/modules/order/expiration/',
	url:'/at-ajax/modules/order/expiration/',
	loadByKey:'pre_order_id',
	pre_order_id:0,
	autoSave: false,
	
	initComponent: function(){
		this.baseTitle = this.title;
		this.items = [];
		this.init();
		this.callParent(arguments);
		
	},
	
	init: function() {
		this.initCreatedAt();
		this.initExpiration();
		this.initListeners();
		this.loadData(this[this.loadByKey]);
	},
	
	initCreatedAt: function(){
		this.createdAt = Ext.create('Ext.form.Display', {
			fieldLabel: 'Created',
			name: 'created_at',
			value:'Now'
		});
		this.items.push(this.createdAt);
	},
	
	initExpiration: function() {
		this.expiration = Ext.create('Ext.form.Date', {
			name: 'expiration_date',
			fieldLabel: 'Expires',
			value: Ext.Date.format(Ext.Date.add(new Date(), Ext.Date.DAY, 60), 'm/d/Y')
		});
		this.items.push(this.expiration);
	},
	
	initListeners: function() {
		
	},
	
	loadData: function(loadByValue) {
		this[this.loadByKey] = loadByValue;
		var params = {};
		params[this.loadByKey] = this[this.loadByKey];
		if (this[this.loadByKey] > 0) {
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
		var dCreated = new Date(data.createdAt);
		this.createdAt.setValue(data.createdAt);
		this.expiration.setValue(data.expiration);
	}
	
});