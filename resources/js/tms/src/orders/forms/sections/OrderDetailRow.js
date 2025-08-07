Ext.define('TMS.orders.forms.sections.OrderDetailRow', {
	extend:'Ext.panel.Panel',
	
	//Config
	layout:'hbox',
	border:false,
	defaults:{
		border:false
	},
	store:false,
	readOnly: false,
	
	initComponent: function() {
		this.items = this.items || [];
		this.init();
		this.callParent(arguments);
	},
	
	init: function() {
		this.initDetailType();
		this.initDetailValue();
		this.initButton();
	},
	
	initDetailType: function(){
		var config = {};
		if(this.readOnly){
			Ext.apply(config, {
				hideTrigger: true,
				readOnly: true
			});
		}
		
		this.detailType = Ext.create('Ext.ux.form.field.RealComboBox', Ext.apply({
			scope: this,
			flex:1,
			valueField:'detail_type_id',
			displayField:'detail_type_name',
			store: this.store,
			queryMode: 'local',
			editable:false,
			margin:'2',
			hiddenName:'order_detail_type_id[]'
		}, config));
		this.items.push(this.detailType);
	},
	
	initDetailValue: function(){
		var config = {};
		if(this.readOnly){
			Ext.apply(config, {
				readOnly: true
			});
		}
		
		this.detailValue = Ext.create('Ext.form.field.Text', Ext.apply({
			scope: this,
			itemId: 'detail_value',
			flex:1,
			margin:'2',
			enableKeyEvents:true,
			name: 'order_detail_value[]'
		}, config));
		this.items.push(this.detailValue);
	},
	
	initButton: function(){
		var config = {};
		if(this.readOnly){
			Ext.apply(config, {
				hidden: true
			});
		}
		this.button = Ext.create('Ext.button.Button', Ext.apply({
			scope: this,
			margin:'2',
			icon:'/resources/icons/delete-16.png',
			width:24,
			handler:function(button) {
				
			}
		}, config));
		this.items.push(this.button);
	}
});