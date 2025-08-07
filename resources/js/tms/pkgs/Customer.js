Ext.define('TMS.customer.filter.Customer', {
	extend: 'TMS.filter.Abstract',
	
	init: function(){
		this.initName();
	},
	
	initName: function(){
		this.items.push({
			name: 'name',
			fieldLabel: 'Name'
		});
	}
});
Ext.define('TMS.customer.forms.sections.CustomerContacts', {
	extend:'Ext.panel.Panel',
	
	//Requires
	requires:[
		'Ext.ux.form.field.RealComboBox',
		'Ext.ux.form.field.BoxSelect',
		'TMS.contacts.forms.sections.ContactMethods',
		'TMS.contacts.forms.sections.BillTo',
		'TMS.documents.forms.sections.DocumentsRequired'
	],
	
	//config
	customer_id:0,
	layout:{
		type: 'border',
	},
	processingPage:'/at-ajax/modules/customer/process/',
	title:'Customer Contacts',
	
	initComponent: function(){
		this.items = this.items || [];
		this.dockedItems = this.dockedItems || [];
		this.init();
		this.callParent(arguments);
	},
	
	init: function() {
		this.initToolbar();
		this.initLayoutPanels();
		this.initContactMethods();
		this.initBillTo();
		this.initDocumentsRequired();
		this.initContactStore();
		this.initContactSelectorView();
		this.initListeners();
	},
	
	initToolbar: function() {
		this.toolbar = Ext.create('Ext.toolbar.Toolbar', {
			dock:'top',
			items:[{
				scope:this,
				text:'Add New Contact',
				icon:'/resources/icons/add-16.png',
				handler:this.addNewContact
			}]
		});
		this.dockedItems.push(this.toolbar);
	},
	
	addNewContact: function() {
		var url = '/contacts/?d=contacts&a=add&customer_id=' + this.customer_id;
		window.open(url, '_blank');
	},
	
	initLayoutPanels: function() {
		this.leftPanel = Ext.create('Ext.panel.Panel', {
			title:'Contacts',
			region: 'west',
			collapsible: true,
			titleCollapse: true,
			floatable: false,
			split: true,
			width: 200,
			autoScroll: true
		});
		
		this.viewContactPageButton = Ext.create('Ext.button.Button', {
			scope:this,
			text:'View Contact Page',
			handler:this.viewContactPageClick,
			icon:'/resources/icons/preview-16.png'
		});
		this.rightPanel = Ext.create('Ext.tab.Panel', {
			flex: 1,
			region: 'center',
			tbar:[
				this.viewContactPageButton
			]
		});
		
		this.items.push(this.leftPanel, this.rightPanel);
	},
	
	viewContactPageClick: function() {
		var records = this.contactSelectorView.getSelectionModel().getSelection();
		if (records && records.length) {
			var record = records[0];
			var url = '/contacts/?d=contacts&a=view&id=' + record.data.contact_id;
			window.open(url, '_blank');
		}
	},
	
	initContactMethods: function() {
		this.contactMethods = Ext.create('TMS.contacts.forms.sections.ContactMethods', {
			title: 'Contact Methods',
			autoSave:true
		});
		this.rightPanel.add(this.contactMethods);
		
		this.rightPanel.setActiveTab(this.contactMethods);
	},
	
	initBillTo: function() {
		this.billTo = Ext.create('TMS.contacts.forms.sections.BillTo', {
			title: 'Bill To',
			autoSave:true
		});
		
		this.rightPanel.add(this.billTo);
	},
	
	initDocumentsRequired: function() {
		this.documentsRequired = Ext.create('TMS.documents.forms.sections.DocumentsRequired', {
			title: 'Documents Required',
			autoSave:true
		});
		this.rightPanel.add(this.documentsRequired);
	},
	
	initContactStore: function() {
		this.contactStore = Ext.create('Ext.data.Store', {
			fields: [
				'contact_id',
				'first_name',
				'last_name',
				'owner_name'
			],
			proxy: {
				type: 'ajax',
				url: this.processingPage + 'get-contacts',
				extraParams:{
					customer_id:this.customer_id
				},
				reader: {
					type: 'json',
					root: 'records'
				}
			}
		});
		this.contactStore.on('load', this.selectFirst, this);
		this.on('afterrender', function(){
			this.contactStore.load();
		}, this);
	},
	
	initContactSelectorView: function() {
		this.contactSelectorView = Ext.create('Ext.view.View', {
			title:'Contacts',
			store:this.contactStore,
			tpl:[
				'<tpl for=".">',
					'<div class="carrier-contact-row">{first_name} {last_name}</div>',
				'</tpl>',
				'<div class="x-clear"></div>',
			],
			trackOver: true,
			overItemCls:'carrier-contact-row-hover',
			selectedItemCls:'carrier-contact-row-selected',
			itemSelector:'.carrier-contact-row',
			emptyText: 'No contacts',
			deferEmptyText:false,
			listeners: {
				scope:this,
				selectionchange: function(dv, nodes) {
					if (nodes.length) {
						this.selectRecord(nodes[0].index);
					}
				}
			}
		});
		this.leftPanel.add(this.contactSelectorView);
	},
	
	selectFirst: function() {
		if (this.contactStore.count()) {
			this.leftPanel.doComponentLayout();
			this.contactSelectorView.suspendEvents();
			this.selectRecord(0);
			this.contactSelectorView.resumeEvents();
		}
		else {
			this.rightPanel.hide();
		}
	},
	
	selectRecord: function(index) {
		// Get the record based on the index
		this.contactSelectorView.select(index);
		var record = this.contactStore.getAt(index);
		var contact_id = record.data.contact_id;
		
		// Update the right side panel's title
		var name = record.data.first_name + ' ' + record.data.last_name;
		name += ' owned by ' + record.data.owner_name;
		this.rightPanel.setTitle(name);
		
		// Load the information panels for this contact
		this.contactMethods.loadRecord(contact_id);
		this.billTo.load(contact_id);
		this.documentsRequired.loadContact(contact_id);
	},
	
	initListeners: function() {
		
	}
	
});
Ext.define('TMS.customer.forms.sections.CustomerDuplicates', {
	extend:'Ext.panel.Panel',
	requires:[
		'TMS.customer.lookup.Customer',
		'TMS.customer.view.DuplicatesGrid'
	],
	
	//Config
	customer_id: 0,
	processingPage:'/at-ajax/modules/customer/process/',
	title:'Duplicate Customers',
	baseTitle:'Duplicate Customers',
	layout: 'anchor',
	defaults:{
		anchor: '100%'
	},
	
	initComponent: function(){
		this.items = [];
		this.init();
		this.callParent(arguments);
	},
	
	init: function() {
		this.initGrid();
		this.initCustomerSearch();
		this.initListeners();
	},
	
	initCustomerSearch: function(){
		this.searchBox = Ext.create('TMS.customer.lookup.Customer', {
			flex: 5
		});
		this.search = Ext.create('Ext.form.FieldContainer', {
			layout: 'hbox',
			items: [
				this.searchBox,{
				flex: 1,
				xtype: 'button',
				scope: this,
				text: 'Add',
				handler: function() {
					this.saveDuplicate();
				}
			}]
		});
		//this.items.push(this.search);
	},
	
	initGrid: function() {
		this.grid = Ext.create('TMS.customer.view.DuplicatesGrid', {
			customer_id: this.customer_id
		});
		this.items.push(this.grid);
	},
	
	initListeners: function() {
		if (this.collapsed) {
			this.collapsed = false;
			this.on('afterrender', function() {
				this.collapse();
			}, this);
		}
		this.on('expand', function() {
			this.grid.doLayout();
			this.scrollIntoView();
		}, this);
	},
	
	save: function() {
	},
	
	load: function(carrier_id) {
	},
	
	saveDuplicate: function() {
		this.setLoading(true);
		Ext.Ajax.request({
			scope: this,
			url: this.processingPage + 'add-duplicate',
			params: {
				customer_id: this.customer_id,
				duplicate_id: this.searchBox.getValue()
			},
			success: function(response){
				this.grid.store.load();
				this.searchBox.store.load();
				console.log(response);
				this.searchBox.setValue('');
				this.setLoading(false);
			}
		});
	}
});
Ext.define('TMS.customer.forms.sections.CustomerLocations', {
	extend:'Ext.panel.Panel',
	
	//Requires
	requires:[
		'Ext.ux.form.field.RealComboBox',
		'Ext.ux.form.field.BoxSelect',
		'TMS.location.forms.sections.Location'
	],
	
	//Config
	customer_id:0,
	layout: {
		type: 'hbox',
		align: 'stretch'
	},
	processingPage:'/at-ajax/modules/customer/process/',
	locationProcessingPage:'/at-ajax/modules/location/process/',
	
	initComponent: function(){
		this.items = this.items || [];
		this.dockedItems = this.dockedItems || [];
		this.init();
		this.callParent(arguments);
	},
	
	init: function() {
		this.initTopBar();
		this.initButtons();
		this.initLayoutPanels();
		this.initLocationStore();
		this.initLocationSelectorView();
		this.initLocationEditor();
	},
	
	initTopBar: function() {
		this.topToolbar = Ext.create('Ext.toolbar.Toolbar', {
			dock:'top'
		});
		this.dockedItems.push(this.topToolbar);
	},
	
	initButtons: function() {
		this.topToolbar.add({
			scope:this,
			text:'Add New Location',
			icon: '/resources/icons/add-16.png',
			handler:this.addNewLocation
		})
	},
	
	initLayoutPanels: function() {
		this.leftPanel = Ext.create('Ext.panel.Panel', {
			title:'Locations',
			width: 200,
			autoScroll: true
		});
		this.rightPanel = Ext.create('Ext.panel.Panel', {
			layout: 'fit',
			flex: 1,
			border:false
		});
		
		this.items.push(this.leftPanel, this.rightPanel);
	},
	
	initLocationStore: function() {
		this.locationStore = Ext.create('Ext.data.Store', {
			fields: [
				'location_id',
				'location_name_1',
				'location_name_2'
			],
			proxy: {
				type: 'ajax',
				url: this.processingPage + 'get-locations',
				extraParams:{
					customer_id:this.customer_id
				},
				reader: {
					type: 'json',
					root: 'records'
				}
			}
		});
		this.locationStore.on('load', this.selectFirst, this);
		this.locationStore.load();
	},
	
	initLocationSelectorView: function() {
		this.locationSelectorView = Ext.create('Ext.view.View', {
			title:'Locations',
			store:this.locationStore,
			tpl:[
				'<tpl for=".">',
					'<div class="carrier-contact-row">{location_name_1} {location_name_2}</div>',
				'</tpl>',
				'<div class="x-clear"></div>'
			],
			autoHeight:true,
			trackOver: true,
			overItemCls:'carrier-contact-row-hover',
			selectedItemCls:'carrier-contact-row-selected',
			itemSelector:'.carrier-contact-row',
			emptyText: 'No Locations',
			deferEmptyText:false,
			listeners: {
				scope:this,
				selectionchange: function(dv, nodes) {
					if (nodes.length) {
						this.selectRecord(nodes[0].index);
					}
				}
			}
		});
		this.leftPanel.add(this.locationSelectorView);
	},
	
	initLocationEditor: function() {
		this.locationEditor = Ext.create('TMS.location.forms.sections.Location', {
			title:'Location Information',
			bodyPadding:10,
			disabled:true,
			url:this.locationProcessingPage + 'process',
			buttons:[{
				scope:this,
				text:'Save',
				cls: 'submit',
				handler: function() {
					this.locationEditor.submit();
				}
			}]
		});
		
		this.locationEditor.on('success', function(form, action){
			var record = action.result.record;
			this.locationEditor.getForm().setValues(record);
			this.locationStore.un('load', this.selectFirst, this);
			this.locationStore.on('load', this.selectCurrent, this);
			this.locationStore.load();
		}, this);
		
		this.locationEditor.setValues({
			customer_id: this.customer_id
		});
		this.rightPanel.add(this.locationEditor);
	},
	
	selectFirst: function() {
		if (this.locationStore.count()) {
			this.leftPanel.doComponentLayout();
			this.locationSelectorView.suspendEvents();
			this.selectRecord(0);
			this.locationSelectorView.resumeEvents();
		}
	},
	
	selectCurrent: function() {
		var locationId = this.locationEditor.getForm().getValues()['location_id'];
		if (locationId) {
			var record = this.locationStore.findRecord('location_id', locationId);
			if (record) {
				this.leftPanel.doComponentLayout();
				this.locationSelectorView.suspendEvents();
				this.selectRecord(record.index);
				this.locationSelectorView.resumeEvents();
			}
			else {
				this.selectRecord(0);
			}
		}
	},
	
	selectRecord: function(index) {
		this.locationSelectorView.select(index);
		var record = this.locationStore.getAt(index);
		var location_id = record.data.location_id;
		var name = record.data.location_name_1;
		
		this.locationEditor.enable();
		this.locationEditor.loadLocation(location_id);
		this.locationEditor.setTitle('Location Information - ' + name);
		
	},
	
	addNewLocation: function() {
		// clear the form
		this.locationEditor.show();
		this.locationEditor.enable();
		this.locationEditor.setTitle('New Location');
		this.locationEditor.getForm().reset();
		this.locationEditor.setValues({
			customer_id: this.customer_id
		});
	},
	
	saveLocationData: function() {
		
	}
	
});
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
Ext.define('TMS.customer.forms.Form', {
	extend: 'TMS.form.Abstract',
	
	//Config
	url: '/at-ajax/modules/customer/process/add',
	bodyPadding: 10,
	isPayTo:false,
	
	initComponent: function(){
		this.items = [];
		this.init();
		this.callParent(arguments);
	},
	
	init: function(){
		this.initCustomerName();
		
		if (this.isPayTo) {
			this.items.push({
				xtype:'hidden',
				name:'isPayTo',
				value:1
			});
		}
	},
	
	initCustomerName: function() {
		this.customerName = Ext.create('Ext.form.field.Text', {
			fieldLabel:'Company Name',
			anchor:'100%',
			name:'customerName',
			enableKeyEvents:true
		});
		this.customerName.on('keypress', function(field, e) {
			if (e.keyCode == 13) {
				this.fireEvent('pressedenter');
			}
		}, this);
		this.items.push(this.customerName);
	}
	
});
Ext.define('TMS.customer.lookup.Customer', {
	extend: 'Ext.ux.form.field.RealComboBox',
	
	//Config
	lastQueryValue: '',
	processingPage: '/at-ajax/modules/customer/lookup/customer',
	displayField: 'customer_name',
	valueField: 'customer_id',
	emptyText: 'Search by name...',
	cls: 'customer-lookup',
	typeAhead: false,
	hideTrigger:true,
	anchor: '100%',
	pageSize: 10,
	minChars: 0,
	width: 250,
	listConfig: {
		loadingText: 'Searching...',
		cls: 'customer-lookup-list',
		emptyText: 'No matching customers found.',

		// Custom rendering template for each item
		getInnerTpl: function() {
			return '<div class="customer-name">{customer_name}</div>';
		}
	},
	proxyParams:{},
	
	initComponent: function(){
		this.init();
		this.callParent(arguments);
	},
	
	//Init Functions
	init: function(){
		this.initStore();
		this.initListeners();
	},
	
	initListeners: function(){
	},
	
	initStore: function(){
		this.store = new Ext.data.Store({
			fields: [
				'customer_id',
				'customer_name'
			],
			remoteSort: true,
			pageSize: 10,
			proxy: {
				type: 'ajax',
				url : this.processingPage,
				extraParams:this.proxyParams,
				reader: {
					type: 'json',
					root: 'records',
					totalProperty: 'total'
				}
			}
		});
	}
});
            
Ext.define('TMS.customer.view.DuplicatesGrid', {
	extend: 'Ext.grid.Panel',
	
	//Config
	processingPage: '/at-ajax/modules/customer/process/get-duplicate-records',
	viewConfig: {
		stripeRows: true
	},
	
	customer_id: 0,
	
	initComponent: function(){
		this.init();
		this.callParent(arguments);
	},
	
	//Init Functions
	init: function(){
		this.initColumns();
		this.initStore();
		this.initPager();
		this.initListeners();
	},
	
	initColumns: function(){
		this.columns = [{
			header: 'Duplicate Name',
			dataIndex: 'customer_name',
			flex: 9,
			renderer: function(value, options, record){
				return value;
				return Ext.String.format(
					'<a href="/customers/?d=customers&a=view&id={0}">{1}</a>',
					record.get('customer_id'),
					value
				);
			}
		}];
	},
	
	initStore: function(){
		this.store = new Ext.data.Store({
			fields: [
				'customer_id',
				'customer_name'
			],
			remoteSort: true,
			pageSize: 20,
			proxy: {
				type: 'ajax',
				url : this.processingPage,
				reader: {
					type: 'json',
					root: 'records',
					totalProperty: 'total'
				},
				extraParams: {
					customer_id: this.customer_id
				}
			}
		});
	},
	
	initPager: function(){
		this.pager = new Ext.toolbar.Paging({
			store: this.store,
			displayInfo: true
		});
		this.tbar = this.pager;
	},
	
	initListeners: function(){
		this.on('afterrender', function(){
			this.store.load();
		}, this);
		
		this.on('itemdblclick', function(view, record){
			//this.setLoading(true);
			//location.href = Ext.String.format('/customers/?d=customers&a=view&id={0}', record.get('customer_id'));
		}, this);
	},
	
	initFilters: function(){
	}
	
});
Ext.define('TMS.customer.view.Grid', {
	extend: 'Ext.grid.Panel',
	
	//Config
	processingPage: '/at-ajax/modules/customer/process/get-grid-records',
	viewConfig: {
		stripeRows: true
	},
	
	initComponent: function(){
		this.init();
		this.callParent(arguments);
	},
	
	//Init Functions
	init: function(){
		this.initColumns();
		this.initStore();
		this.initPager();
		this.initListeners();
	},
	
	initColumns: function(){
		this.columns = [{
			header: 'Name',
			dataIndex: 'customer_name',
			flex: 5,
			renderer: function(value, options, record){
				return Ext.String.format(
					'<a href="/customers/?d=customers&a=view&id={0}">{1}</a>',
					record.get('customer_id'),
					value
				);
			}
		},{
			header: 'Locations',
			flex: 1,
			dataIndex: 'location_count'
		}];
	},
	
	initStore: function(){
		this.store = new Ext.data.Store({
			fields: [
				'customer_id',
				'customer_name',
				'location_count'
			],
			remoteSort: true,
			pageSize: 20,
			proxy: {
				type: 'ajax',
				url : this.processingPage,
				reader: {
					type: 'json',
					root: 'records',
					totalProperty: 'total'
				}
			}
		});
	},
	
	initPager: function(){
		this.pager = new Ext.toolbar.Paging({
			store: this.store,
			displayInfo: true
		});
		this.tbar = this.pager;
	},
	
	initListeners: function(){
		this.on('afterrender', function(){
			this.store.load();
		}, this);
		
		this.on('itemdblclick', function(view, record){
			this.setLoading(true);
			location.href = Ext.String.format('/customers/?d=customers&a=view&id={0}', record.get('customer_id'));
		}, this);
	},
	
	initFilters: function(){
		this.filterPanel.add(new Ext.form.field.Text({ fieldLabel: 'Name'}));
	}
	
});
