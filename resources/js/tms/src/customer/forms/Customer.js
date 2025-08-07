Ext.define('TMS.customer.forms.Customer', {
	extend:'TMS.form.Navigation',
	
	requires:[
		'Ext.ux.form.field.RealComboBox',
		'TMS.customer.forms.sections.CustomerLocations',
		'TMS.customer.forms.sections.CustomerDuplicates',
		'TMS.customer.forms.sections.CustomerContacts',
		'TMS.documents.view.Interface',
		'TMS.comment.forms.sections.Comments',
		'TMS.orders.view.FilteredGrid',
		'TMS.orders.view.PreOrderFilteredGrid'
	],
	
	//Config
	title: 'Customer',
	url: '',
	customer_id: 0,
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
		this.initDuplicates();
		this.initContacts();
		this.initDocuments();
		this.initComments();
		this.initOrders();
		this.initQuotes();
	},
	
	initTitle: function(){
		if(this.record != null){
			this.title = this.record.customer_name;
		}
	},
	
	initLocations: function(){
		this.locations = Ext.create('TMS.customer.forms.sections.CustomerLocations', {
			title:'Customer Locations',
			customer_id: this.customer_id
		});
		this.items.push(this.locations);
		
		this.bindForm(this.locations.locationEditor);
	},
	
	initDuplicates: function(){
		this.duplicates = Ext.create('TMS.customer.forms.sections.CustomerDuplicates', {
			customer_id: this.customer_id
		});
		this.items.push(this.duplicates);
	},
	
	initContacts: function(){
		this.contacts = Ext.create('TMS.customer.forms.sections.CustomerContacts', {
			customer_id: this.customer_id
		});
		this.items.push(this.contacts);
		
		this.bindForm(this.contacts.contactMethods);
		this.bindForm(this.contacts.documentsRequired);
		this.bindForm(this.contacts.billTo);
	},
	
	initDocuments: function(){
		this.documents = Ext.create('TMS.documents.view.Interface', {
			extraParams:{
				customer_id: this.customer_id
			}
		});
		this.items.push(this.documents);
		
		this.documents.on('minimize', function(){
			this.setActiveItem(this.documents);
			this.documents.doLayout();
		}, this);
	},
	
	initComments: function(){
		this.comments = Ext.create('TMS.comment.forms.sections.Comments', {
			field_value: this.customer_id,
			type:'customer',
			border: false
		});
		this.items.push(this.comments);
	},
	
	initOrders: function(){
		this.orders = Ext.create('TMS.orders.view.FilteredGrid', {
			title:'Orders',
			extraFilters:{
				customer_id: this.customer_id
			},
			border: false
		});
		this.items.push(this.orders);
	},
	
	initQuotes: function(){
		this.quotes = Ext.create('TMS.orders.view.PreOrderFilteredGrid', {
			title:'Quotes',
			extraFilters:{
				customer_id: this.customer_id
			},
			border: false
		});
		this.items.push(this.quotes);
	}
	
});