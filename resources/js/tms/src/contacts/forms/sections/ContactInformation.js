Ext.define('TMS.contacts.forms.sections.ContactInformation', {
	extend:'Ext.panel.Panel',
	
	//Requires
	requires:[
		'TMS.contacts.forms.sections.ContactMethods',
		'TMS.contacts.forms.sections.ContactInterval'
	],
	
	//Config
	icon: '/resources/icons/contact-info-24.png',
	border: false,
	layout:{
		type: 'hbox',
		align: 'stretch'
	},
	autoSave: false,
	contact_id: 0,
	
	initComponent: function(){
		this.items = this.items || [];
		this.dockedItems = this.dockedItems || [];
		this.init();
		this.callParent(arguments);
	},
	
	init: function() {
		this.initContactMethods();
		this.initContactInterval();
	},
	
	initContactMethods: function(){
		this.contactMethods = Ext.create('TMS.contacts.forms.sections.ContactMethods', {
			scope: this,
			title: 'Methods',
			baseTitle: 'Methods',
			flex: 1,
			contact_id: this.contact_id,
			autoSave: this.autoSave
		});
		this.items.push(this.contactMethods);
	},
	
	initContactInterval: function(){
		this.contactInterval = Ext.create('TMS.contacts.forms.sections.ContactInterval', {
			title: 'Interval',
			flex: 1,
			call_interval:14,
			email_interval:14,
			disabled: true,
			contact_id: this.contact_id,
			autoSave: this.autoSave
		});
		this.items.push(this.contactInterval);
	}
});