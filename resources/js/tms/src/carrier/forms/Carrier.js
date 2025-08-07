Ext.define('TMS.carrier.forms.Carrier', {
	extend:'TMS.form.Navigation',
	
	requires:[
		'Ext.ux.form.field.RealComboBox',
		'TMS.contacts.forms.sections.CarrierInformation',
		'TMS.contacts.forms.sections.ModesEquipment',
		'TMS.contacts.forms.sections.CarrierContacts',
		'TMS.contacts.forms.sections.PayTo',
		'TMS.comment.forms.sections.Comments',
		'TMS.orders.view.FilteredGrid',
		'TMS.documents.view.Interface'
	],
	
	//Config
	title: 'Carrier',
	url: '/at-ajax/modules/contact/process/add',
	carrier_id: 0,
	record: null,
	
	initComponent: function(){
		this.items = this.items || [];
		this.dockedItems = this.dockedItems || [];
		this.init();
		this.callParent(arguments);
	},
	
	init: function() {
		this.initTitle();
		this.initLocations();
		
		this.initGeneralInformationPanel();
		this.initCarrierInformation();
		this.initPayTo();
		this.initGeneralInformation();
		
		this.initModesEquipment();
		this.initContacts();
		this.initComments();
		this.initOrders();
		this.initDocuments();
	},
	
	initTitle: function(){
		if(this.record != null){
			this.title = this.record.CarrName;
		}
	},
	
	initLocations: function(){
		this.locations = Ext.create('TMS.carrier.forms.sections.CarrierLocations', {
			title:'Carrier Locations',
			carrier_id: this.carrier_id
		});
		this.items.push(this.locations);
		
		this.bindForm(this.locations.locationEditor);
	},
	
	initGeneralInformationPanel: function(){
		Ext.get('carrier-general-information').show();
		this.generalInformationPanel = new Ext.panel.Panel({
			scope: this,
			border: false,
			contentEl: 'carrier-general-information'
		});
	},
	
	initCarrierInformation: function(){
		this.carrierInformation = Ext.create('TMS.contacts.forms.sections.CarrierInformation', {
			title: 'Carrier Information',
			border: true,
			carrier_id: this.carrier_id
		});
	},
	
	initGeneralInformation: function(){
		this.generalInformation = new Ext.panel.Panel({
			title: 'General Information',
			bodyPadding: 10,
			defaults:{
				margin: '0 0 10 0'
			},
			items: [
				this.generalInformationPanel,
				this.carrierInformation,
				this.payTo
			]
		});
		this.items.push(this.generalInformation);
	},
	
	initPayTo: function(){
		this.payTo = Ext.create('TMS.contacts.forms.sections.PayTo', {
			title: 'Pay To Information',
			carrier_id: this.carrier_id
		});
		
		this.bindForm(this.payTo);
	},
	
	initModesEquipment: function(){
		this.modesEquipment = Ext.create('TMS.contacts.forms.sections.ModesEquipment', {
			title: 'Allowed Modes & Equipment',
			carrier_id: this.carrier_id
		});
		this.items.push(this.modesEquipment);
	},
	
	initContacts: function(){
		this.contacts = Ext.create('TMS.contacts.forms.sections.CarrierContacts', {
			title: 'Contacts',
			carrier_id: this.carrier_id
		});
		this.items.push(this.contacts);
		
		this.bindForm(this.contacts.contactMethods);
		this.bindForm(this.contacts.preferredStates);
	},
	
	initComments: function(){
		this.comments = Ext.create('TMS.comment.forms.sections.Comments', {
			title: 'Comments',
			field_value: this.carrier_id,
			type:'carrier'
		});
		this.items.push(this.comments);
	},
	
	initOrders: function(){
		this.orders = Ext.create('TMS.orders.view.FilteredGrid', {
			title:'Orders',
			extraFilters:{
				carrier_id: this.carrier_id
			}
		});
		this.items.push(this.orders);
	},
	
	initDocuments: function(){
		this.documents = Ext.create('TMS.documents.view.Interface', {
			title: 'Documents',
			extraParams:{
				carrier_id: this.carrier_id
			}
		});
		this.items.push(this.documents);
	}
});