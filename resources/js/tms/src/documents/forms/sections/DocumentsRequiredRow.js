Ext.define('TMS.documents.forms.sections.DocumentsRequiredRow', {
	extend:'Ext.panel.Panel',
	requires:['Ext.ux.form.field.RealComboBox'],
	
	autoHeight:true,
	layout:'hbox',
	border:false,
	defaults:{
		border:false
	},
	readOnly: false,
	
	initComponent: function() {
		this.items = this.items || [];
		this.init();
		this.callParent(arguments);
	},
	
	init: function() {
		this.initTypeSelector();
		this.initQuantityField();
		this.initButton();
		this.initListeners();
	},
	
	initTypeSelector: function() {
		var config = {};
		if(this.readOnly){
			Ext.apply(config, {
				readOnly: true
			});
		}
		
		this.typeSelector = Ext.create('Ext.ux.form.field.RealComboBox', Ext.apply({
			flex:1,
			valueField:'document_type_id',
			displayField:'document_type_name',
			store: this.store,
			queryMode: 'local',
			editable:false,
			margin:'2'
		}, config));
		this.items.push(this.typeSelector);
	},
	
	initQuantityField: function() {
		var config = {};
		if(this.readOnly){
			Ext.apply(config, {
				readOnly: true
			});
		}
		
		this.quantityField = Ext.create('Ext.form.field.Text', Ext.apply({
			flex:1,
			margin:'2',
			itemId:'document_type_quantity',
			enableKeyEvents:true,
			emptyText:'Quantity'
		}, config));
		this.items.push(this.quantityField);
	},
	
	initButton: function() {
		var config = {};
		if(this.readOnly){
			Ext.apply(config, {
				hidden: true
			});
		}
		this.button = Ext.create('Ext.button.Button', Ext.apply({
			margin:'2',
			icon:'/resources/icons/delete-16.png',
			width:24,
			scope:this,
			handler:function(button) {
				// remove if not the last one
				button.ownerCt.destroy();
			}
		}, config));
		this.items.push(this.button);
	},
	
	initListeners: function() {
		
	}
	
});