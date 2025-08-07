Ext.define('TMS.carrier.filter.Carrier', {
	extend: 'TMS.filter.Abstract',
	
	//Requires
	requires:[
		'Ext.ux.form.field.RealComboBox'
	],
	
	init: function(){
		this.initName();
		this.initMc();
		this.initScac();
		this.initCity();
		this.initStateField();
		this.initZip();
	},
	
	initName: function(){
		this.name = new Ext.form.field.Text(Ext.apply({
			scope: this,
			name: 'name',
			fieldLabel: 'Name'
		}, this.defaults));
		this.items.push(this.name);
	},
	
	initMc: function(){
		this.mc = new Ext.form.field.Text(Ext.apply({
			scope: this,
			name: 'mc',
			fieldLabel: 'MC#'
		}, this.defaults));
		this.items.push(this.mc);
	},
	
	initScac: function(){
		this.scac = new Ext.form.field.Text(Ext.apply({
			scope: this,
			name: 'scac',
			fieldLabel: 'SCAC'
		}, this.defaults));
		this.items.push(this.scac);
	},
	
	initCity: function(){
		this.city = new Ext.form.field.Text(Ext.apply({
			scope: this,
			name: 'city',
			fieldLabel: 'City'
		}, this.defaults));
		this.items.push(this.city);
	},
	
	initStateField: function(){
		this.stateStore = Ext.create('Ext.data.Store', {
			autoLoad: true,
			fields:['display', 'value'],
			proxy: {
				type: 'ajax',
				url: '/at-ajax/modules/util/data/states',
				reader: {
					type: 'json',
					root: 'records'
				}
			}
		});
		this.stateField = new Ext.form.field.ComboBox(Ext.apply({
			scope: this,
			queryMode:'local',
			name: 'state',
			displayField:'display',
			valueField:'value',
			fieldLabel: 'State',
			store:this.stateStore
		}, this.defaults));
		
		this.items.push(this.stateField);
	},
	
	initZip: function(){
		this.zip = new Ext.form.field.Text(Ext.apply({
			scope: this,
			name: 'zip',
			fieldLabel: 'Zip'
		}, this.defaults));
		this.items.push(this.zip);
	}
	
});
Ext.define('TMS.carrier.forms.sections.Audit', {
	extend:'TMS.ActionWindow',
	requires:[
		'TMS.documents.view.Grid',
		'TMS.carrier.forms.sections.Authority',
		'TMS.comment.forms.sections.Form'
	],
	title:'Approve Carrier',
	processingPage:'/at-ajax/modules/carrier/audit/',
	
	carrier_id:0,
	widthPercent: 0.9,
	heightPercent: 0.9,
	layout:{
		type: 'hbox',
		align: 'stretch'
	},
	border: false,
	
	init: function() {
		this.initAuthority();
		this.initDocuments();
		
		this.initHidden();
		this.initButtons();
		this.initListeners();
	},
	
	initAuthority: function() {
		this.authorityPanel = Ext.create('TMS.carrier.forms.sections.Authority', {
			width: 300,
			carrier_id:this.carrier_id
		});
		this.items.push(this.authorityPanel);
	},
	
	initDocuments: function() {
		this.documentsPanel = Ext.create('TMS.documents.view.Grid', {
			title: 'Carrier Documents',
			extraParams:{
				carrier_id:this.carrier_id
			},
			flex: 1
		});
		this.items.push(this.documentsPanel);
	},
	
	initHidden: function() {
		this.carrierIdField = Ext.create('Ext.form.field.Hidden', {
			name:'carrierId',
			value:0
		});
		this.items.push(this.carrierIdField);
	},
	
	initButtons: function() {
		this.approveButton = Ext.create('Ext.button.Button', {
			scope:this,
			text:'Approve',
			handler:this.approve,
			scale:'medium',
			icon: '/resources/icons/check-24.gif'
		});
		
		this.declineButton = Ext.create('Ext.button.Button', {
			scope:this,
			text:'Decline',
			handler:this.decline,
			scale:'medium',
			icon: '/resources/icons/close-24.png'
		});
		
		
		this.addTopButton([
			this.approveButton,
			this.declineButton
		]);
	},
	
	approve: function() {
		this.setLoading();
		Ext.Ajax.request({
			scope:this,
			method:'post',
			url:this.processingPage + 'approve',
			params:{
				carrier_id:this.carrier_id
			},
			success: function(r) {
				this.setLoading(false);
				var response = Ext.decode(r.responseText);
				this.fireEvent('taskcomplete');
				this.close();
			}
		});
	},
	
	decline: function() {
		// Show a comment box that will be entered as an order comment
		this.formPanel = Ext.create('TMS.comment.forms.sections.Form', {
			field_value:this.carrier_id,
			commentType:'carrier'
		});
		
		this.formWindow = Ext.create('Ext.window.Window', {
			title:'Enter a reason',
			autoShow:true,
			modal:true,
			resizable:false,
			draggable:false,
			width:400,
			items:[
				this.formPanel
			]
		});
		
		this.formPanel.on('formsuccess', function() {
			this.formWindow.close();
			
			this.setLoading();
			Ext.Ajax.request({
				scope:this,
				method:'post',
				url:this.processingPage + 'decline',
				params:{
					carrier_id:this.carrier_id
				},
				success: function(r) {
					this.setLoading(false);
					var response = Ext.decode(r.responseText);
					this.fireEvent('taskcomplete');
					this.close();
				}
			});
			
		}, this);
			
	},
	
	initListeners: function() {
		
	}
	
});
Ext.define('TMS.carrier.forms.sections.Authority', {
	extend:'TMS.form.Abstract',
	
	title:'Carrier Authority',
	processingPage:'/at-ajax/modules/carrier/authority/',
	url:'/at-ajax/modules/carrier/authority/save/',
	
	carrier_id:0,
	bodyPadding:8,
	
	initComponent: function() {
		this.items = this.items || [];
		
		this.initCommon();
		this.initContract();
		this.initBroker();
		
		this.initHidden();
		this.initListeners();
		
		if (this.carrier_id) {
			this.loadData(this.carrier_id);
		}
		
		this.callParent(arguments);
	},
	
	initCommon: function() {
		this.commonField = Ext.create('Ext.form.field.Text', {
			fieldLabel:'Common Authority',
			name:'common_authority',
			readOnly:true
		});
		this.items.push(this.commonField);
	},
	
	initContract: function() {
		this.contractField = Ext.create('Ext.form.field.Text', {
			fieldLabel:'Contract Authority',
			name:'contract_authority',
			readOnly:true
		});
		this.items.push(this.contractField);
	},
	
	initBroker: function() {
		this.brokerField = Ext.create('Ext.form.field.Text', {
			fieldLabel:'Broker Authority',
			name:'broker_authority',
			readOnly:true
		});
		this.items.push(this.brokerField);
	},
	
	initHidden: function() {
		this.carrierIdField = Ext.create('Ext.form.field.Hidden', {
			name:'carrier_id',
			value:this.carrier_id
		});
		this.items.push(this.carrierIdField);
	},
	
	initListeners: function() {
		
	},
	
	loadData: function(carrier_id) {
		this.carrier_id = carrier_id || this.carrier_id;
		if (this.carrier_id) {
			Ext.Ajax.request({
				scope:this,
				method:'post',
				url:this.processingPage + 'load',
				params:{
					carrier_id:this.carrier_id
				},
				success: function(r) {
					var response = Ext.decode(r.responseText);
					if (response.success) {
						this.setValues(response.record);
					}
				}
			});
		}
	},
	
	setValues: function(record) {
		this.commonField.setValue(this.getDisplay(record.common_authority));
		this.contractField.setValue(this.getDisplay(record.contract_authority));
		this.brokerField.setValue(this.getDisplay(record.broker_authority));
	},
	
	getDisplay: function(value) {
		if (value) {
			return 'Yes';
		}
		else {
			return 'No';
		}
	}
	
});
Ext.define('TMS.carrier.forms.sections.CarrierLocations', {
	extend:'Ext.panel.Panel',
	
	//Requires
	requires:[
		'Ext.ux.form.field.RealComboBox',
		'Ext.ux.form.field.BoxSelect',
		'TMS.location.forms.sections.Location'
	],
	
	//Config
	carrier_id:0,
	layout: {
		type: 'hbox',
		align: 'stretch'
	},
	processingPage:'/at-ajax/modules/carrier/process/',
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
			width: 200
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
					carrier_id:this.carrier_id
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
			carrier_id: this.carrier_id
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
			carrier_id: this.carrier_id
		});
	},
	
	saveLocationData: function() {
		
	}
	
});
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
Ext.define('TMS.carrier.lookup.Carrier', {
	extend: 'Ext.ux.form.field.RealComboBox',
	
	//Config
	processingPage: '/at-ajax/modules/carrier/lookup/carrier',
	displayField: 'carrier_name',
	valueField: 'carrier_id',
	emptyText: 'Search by name or mc number...',
	cls: 'carrier-lookup',
	typeAhead: false,
	hideTrigger:true,
	anchor: '100%',
	pageSize: 10,
	minChars: 0,
	listConfig: {
		loadingText: 'Searching...',
		cls: 'carrier-lookup-list',
		emptyText: 'No matching carriers found.',

		// Custom rendering template for each item
		getInnerTpl: function() {
			return '<div class="carrier-name">{carrier_name}</div>' +
					'<div class="carrier-number">{carrier_mc_no}</div>';
		}
	},
	
	initComponent: function(){
		this.init();
		this.callParent(arguments);
	},
	
	//Init Functions
	init: function(){
		this.initStore();
	},
	
	initStore: function(){
		this.store = new Ext.data.Store({
			fields: [
				'carrier_id',
				'carrier_name',
				'carrier_mc_no'
			],
			remoteSort: true,
			pageSize: 10,
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
	}
});
            
Ext.define('TMS.carrier.view.FilteredGrid', {
	extend: 'Ext.panel.Panel',
	requires:[
		'TMS.carrier.filter.Carrier',
		'TMS.carrier.view.Grid'
	],
	layout:'border',
	gridConfig: {},
	
	constructor: function(){
		this.gridConfig = {};
		return this.callParent(arguments);
	},
	
	initComponent: function(){
		this.dockedItems = this.dockedItems || [];
		this.items = this.items || [];
		this.init();
		this.callParent(arguments);
	},
	
	//Init Functions
	init: function() {
		this.initFilter();
		this.initGrid();
	},
	
	initFilter: function(){
		this.filter = Ext.create('TMS.carrier.filter.Carrier', {
			title: 'Search',
			region: 'east',
			width: 250,
			collapsible: true,
			collapsed: true,
			titleCollapse: true,
			split: true,
			floatable: false
		});
		this.items.push(this.filter);
	},
	
	initGrid: function() {
		this.grid = Ext.create('TMS.carrier.view.Grid', Ext.apply({
			region: 'center',
			filter: this.filter
		}, this.gridConfig));
		this.items.push(this.grid);
	}
	
});
Ext.define('TMS.carrier.view.Grid', {
	extend: 'TMS.grid.Grid',
	
	//Config
	processingPage: '/at-ajax/modules/carrier/lookup/carrier',
	viewConfig: {
		stripeRows: true
	},
	autoLoadStore: true,
	
	initComponent: function(){
		this.dockedItems = this.dockedItems || [];
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
	
	initPager: function(){
		this.pager = new Ext.toolbar.Paging({
			store: this.store,
			displayInfo: true,
			dock:'top'
		});
		this.dockedItems.push(this.pager);
	},
	
	initListeners: function(){
		this.on('afterrender', function(){
			if(this.autoLoadStore){
				this.store.load();
			}
		}, this);
	},
	
	initColumns: function(){
		this.columns = [{
			header: 'Name',
			dataIndex: 'carrier_name',
			flex: 2,
			renderer: function(value, options, record){
				return Ext.String.format(
					'<a href="/carriers/?d=carriers&action=view&id={0}">{1}</a>',
					record.get('carrier_id'),
					value
				);
			}
		},{
			header: 'MC#',
			dataIndex: 'carrier_mc_no',
			flex: 1
		},{
			header: 'SCAC',
			dataIndex: 'carrier_scac',
			flex: 1
		},{
			header: 'City',
			dataIndex: 'location_city',
			flex: 1
		},{
			header: 'State',
			dataIndex: 'location_state',
			flex: 1
		},{
			header: 'Zip',
			dataIndex: 'location_zip',
			flex: 1
		}];
	},
	
	initStore: function(){
		this.store = new Ext.data.Store({
			fields: [
				'carrier_id',
				'carrier_scac',
				'carrier_name',
				'carrier_mc_no',
				'location_city',
				'location_state',
				'location_zip'
			],
			remoteSort: true,
			autoLoad: false,
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
	}
});
Ext.define('TMS.carrier.view.RadiusGrid', {
	extend: 'TMS.carrier.view.FilteredGrid',
	
	//Config
	order_id: 0,
	
	//Init Functions
	init: function() {
		this.gridConfig = {
			autoLoadStore: false
		};
		this.callParent(arguments);
		this.initToolbar();
		this.initRadius();
		this.initFrom();
		//this.initSearchButton();
	},
	
	initToolbar: function(){
		this.toolbar = new Ext.toolbar.Toolbar({
			scope: this,
			docked: 'top'
		});
		this.dockedItems.push(this.toolbar);
	},
	
	initRadius: function(){
		this.radiusStore = Ext.create('Ext.data.Store', {
			fields:['display', 'value'],
			data:[{
				display: '50 Miles',
				value: 50
			},{
				display: '100 Miles',
				value: 100
			},{
				display: '150 Miles',
				value: 150
			},{
				display: '200 Miles',
				value: 200
			},{
				display: '250 Miles',
				value: 250
			}],
			proxy: {
				type: 'memory',
				reader: {
					type: 'json'
				}
			}
		});
		this.radiusSelect = new Ext.form.field.ComboBox({
			scope: this,
			name: 'radiusDistance',
			fieldLabel: 'Radius',
			labelWidth: 50,
			queryMode:'local',
			displayField:'display',
			valueField:'value',
			store:this.radiusStore
		});
		
		this.radiusSelect.on('afterrender', function(){
			this.filter.suspendEvents(false);
			this.radiusSelect.select(this.radiusStore.getAt(1));
			this.filter.resumeEvents();
		}, this);
		
		this.filter.registerFilter(this.radiusSelect);
		
		this.toolbar.add(this.radiusSelect);
	},
	
	initFrom: function(){
		this.fromStore = Ext.create('Ext.data.Store', {
			fields:[
				'location_name_1',
				'address_1',
				'city',
				'state',
				'zip'
			],
			proxy: {
				type: 'ajax',
				url: '/at-ajax/modules/order/order/get-stops',
				extraParams: {
					order_id: this.order_id
				},
				reader: {
					type: 'json',
					root: 'records'
				}
			}
		});
		
		this.on('afterrender', function(){
			this.fromStore.load();
		}, this);
		
		this.fromSelect = new Ext.form.field.ComboBox({
			scope: this,
			name: 'radiusZip',
			fieldLabel: 'From',
			labelWidth: 40,
			queryMode:'local',
			displayField: 'location_name_1',
			valueField:'zip',
			store:this.fromStore,
			listConfig: {
				// Custom rendering template for each item
				getInnerTpl: function() {
					return '<div><b>{location_name_1}</b></div>' +
							'<div style="font-size: 10px; font-style: italic;">{address_1} {city}, {state} {zip}</div>';
				}
			}
		});
		
		this.filter.registerFilter(this.fromSelect);
		
		this.toolbar.add(this.fromSelect);
	},
	
	initSearchButton: function(){
		this.searchButton = new Ext.button.Button({
			scope: this,
			text: 'Search',
			handler: function(){
				
			}
		});
		
		this.toolbar.add(this.searchButton);
	}
	
});
