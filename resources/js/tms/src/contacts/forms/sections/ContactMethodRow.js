Ext.define('TMS.contacts.forms.sections.ContactMethodRow', {
	extend:'Ext.panel.Panel',
	
	autoHeight:true,
	layout:'hbox',
	border:false,
	defaults:{
		border:false
	},
	store:false,
	
	initComponent: function() {
		this.items = this.items || [];
		this.init();
		this.callParent(arguments);
	},
	
	init: function() {
		this.initContactMethodSelector();
		this.initMethodField();
		this.initButton();
		this.initListeners();
	},
	
	initContactMethodSelector: function() {
		this.contactMethodSelector = Ext.create('Ext.ux.form.field.RealComboBox', {
			flex:1,
			valueField:'method_id',
			displayField:'method_type',
			store: this.store,
			queryMode: 'local',
			editable:false,
			margin:'2'
		});
		this.items.push(this.contactMethodSelector);
	},
	
	initMethodField: function() {
		this.contactMethodField = Ext.create('Ext.form.field.Text', {
			flex:1,
			xtype: 'textfield',
			margin:'2',
			itemId:'method_data',
			enableKeyEvents:true
		});
		this.items.push(this.contactMethodField);
	},
	
	initButton: function() {
		this.button = Ext.create('Ext.button.Button', {
			margin:'2',
			icon:'/resources/icons/delete-16.png',
			width:24,
			scope:this,
			handler:function(button) {
				// remove if not the last one
				button.ownerCt.destroy();
			}
		});
		this.items.push(this.button);
	},
	
	initListeners: function() {
		
	}
	
});