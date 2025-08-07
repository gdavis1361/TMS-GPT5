Ext.define('TMS.location.forms.sections.BillTo', {
	extend:'Ext.form.Panel',
	requires:[
		'TMS.customer.lookup.Customer',
		'TMS.location.lookup.Location'
	],
	
	//Config
    layout: 'anchor',
    defaults: {
        anchor: '100%',
		xtype: 'textfield'
    },
	
	processingPage:'/at-ajax/modules/location/process/',
	autoSave:false,
	
	border:false,
//	frame:true,
	
//	title:'Bill To',
	
	initComponent: function(){
		this.items = [];
		this.init();
		this.callParent(arguments);
	},
	
	init: function(){
//		this.initCustomerSelector();
		this.initLocationSelector();
		this.initListeners();
	},
	
	initCustomerSelector: function() {
		this.customerSelector = Ext.create('TMS.customer.lookup.Customer', {
			fieldLabel:'Customer',
			name:'bill_to_customer_id'
		});
		this.items.push(this.customerSelector);
	},
	
	initLocationSelector: function() {
		this.locationSelector = Ext.create('TMS.location.lookup.Location', {
			fieldLabel:'Billing Location',
			disabled:true,
			type:'customer',
			name:'bill_to_location_id'
		});
		this.items.push(this.locationSelector);
	},
	
	filterByCustomer: function(customerId) {
		this.locationSelector.setRawValue('');
		this.locationSelector.setValue(0);
		this.locationSelector.store.proxy.extraParams.to_id = customerId;
		this.locationSelector.store.proxy.extraParams.locationType = 'Bill To';
	},
	
	initListeners: function() {
		return;
		
		this.customerSelector.on('select', function(field, records) {
			if(!records.length){
				this.locationSelector.disable();
				return false;
			}
			
			//Enable the contact selector
			this.locationSelector.enable();
			
			//Load all the hot contacts for this customer
			var record = records[0];
			this.locationSelector.setRawValue('');
			this.locationSelector.setValue(0);
			this.locationSelector.store.proxy.extraParams.to_id = record.get('customer_id');
			this.locationSelector.store.loadPage(1);
			this.locationSelector.focus(true, 50);
			this.locationSelector.expand();
		}, this);
		
		this.customerSelector.on('change', function(field, value) {
			if (value == null) {
				this.locationSelector.setRawValue('');
				this.locationSelector.setValue(0);
				this.locationSelector.store.proxy.extraParams.to_id = 0;
			}
		}, this);
	},
	
	getValue: function() {
		return this.locationSelector.getValue();
	},
	
	getValues: function() {
		var params = {
			bill_to_id:this.locationSelector.getValue(),
			bill_to_location_id:this.locationSelector.getValue()
//			bill_to_customer_id:this.customerSelector.getValue()
		};
		return params;
	},
	
	loadLocation: function(locationId) {
		
	},
	
	setRecord: function(record) {
//		var records = this.customerSelector.store.add({
//			customer_id: record.bill_to_customer_id,
//			customer_name: record.bill_to_customer_name
//		});
//		this.customerSelector.select(records[0]);
		
		this.locationSelector.enable();
		records = this.locationSelector.store.add({
			location_id: record.bill_to_location_id,
			location_display: record.bill_to_location_name
		});
		this.locationSelector.select(records[0]);
	},
	
	lookupCustomer: function(customerId) {
		this.locationSelector.store.proxy.extraParams.to_id = customerId;
		this.locationSelector.store.proxy.extraParams.locationType = 'Billing';
		Ext.Ajax.request({
			scope:this,
			method:'post',
			url:this.processingPage + 'lookup-customer',
			params:{
				customerId:customerId,
				locationType:'Billing'
			},
			success: function(r) {
				var response = Ext.decode(r.responseText);
				if (response.success) {
					this.setRecord(response.record);
				}
			}
		});
	},
	
	lookupContact: function(contactId) {
		Ext.Ajax.request({
			scope:this,
			method:'post',
			url:this.processingPage + 'lookup-contact',
			params:{
				contactId:contactId
			},
			success: function(r) {
				var response = Ext.decode(r.responseText);
				if (response.success) {
					this.setRecord(response.record);
				}
			}
		});
	}
	
});
Ext.define('TMS.location.forms.sections.Location', {
	extend:'TMS.form.Abstract',
	requires:[
		'Ext.ux.form.field.RealComboBox'
	],
	
	//Config
	utilPage: '/at-ajax/modules/util/',
    layout: 'anchor',
    defaults: {
        anchor: '100%',
		xtype: 'textfield'
    },
	
	processingPage:'/at-ajax/modules/location/process/',
	autoSave:false,
	location_id: 0,
	customer_id: 0,
	carrier_id: 0,
	
	initComponent: function(){
		this.items = [];
		this.init();
		this.callParent(arguments);
	},
	
	init: function(){
		//Name
		this.initName1();
		this.initName2();
		
		//Address
		this.initAddress1();
		this.initAddress2();
		this.initAddress3();
		
		//City, state zip
		this.initZip();
		this.initCity();
		this.initStateField();
		
		this.initType();
		
		//Hidden
		this.initHidden();
	},
	
	initName1: function(){
		this.name1Field = Ext.create('Ext.form.field.Text', {
			name: 'name1',
			fieldLabel: 'Location Name'
		});
		
		this.name1Field.on('blur', function(d){
			var name = d.getValue();
			if( name.length ){
				this.checkLocationName(name);
			}
		}, this);
		this.items.push(this.name1Field);
	},
	
	initName2: function(){
		this.name2Field = Ext.create('Ext.form.field.Text', {
			name: 'name2',
			fieldLabel: '&nbsp;',
			labelSeparator: ''
		});
		this.items.push(this.name2Field);
	},
	
	initAddress1: function(){
		this.address1Field = Ext.create('Ext.form.field.Text', {
			name: 'address1',
			fieldLabel: 'Address'
		});
		this.items.push(this.address1Field);
	},
	
	initAddress2: function(){
		this.address2Field = Ext.create('Ext.form.field.Text', {
			name: 'address2',
			fieldLabel: '&nbsp;',
			labelSeparator: ''
		});
		this.address2Field.on('blur', function(d){
			if (d.getValue().length) {
				this.address3Field.show();
				this.address3Field.focus();
			}
		}, this);
		this.items.push(this.address2Field);
	},
	
	initAddress3: function(){
		this.address3Field = Ext.create('Ext.form.field.Text', {
			name: 'address3',
			fieldLabel: '&nbsp;',
			labelSeparator: '',
			hidden: true
		});
		this.items.push(this.address3Field);
	},
	
	initCity: function(){
		this.cityField = Ext.create('Ext.form.field.Text', {
			name: 'city',
			fieldLabel: 'City'
		});
		this.items.push(this.cityField);
	},
	
	initStateField: function(){
		this.stateField = Ext.create('Ext.form.field.ComboBox', {
			name: 'state',
			fieldLabel: 'State',
			valueField: 'value',
			displayField: 'display',
			queryMode: 'local',
			store: new Ext.data.Store({
				fields: [
					'value',
					'display'
				],
				autoLoad: true,
				proxy: {
					type: 'ajax',
					url : '/at-ajax/modules/util/data/states',
					reader: {
						type: 'json',
						root: 'records'
					}
				}
			})
		});
		this.items.push(this.stateField);
	},
	
	initZip: function(){
		this.zipField = new Ext.form.field.Text({
			scope: this,
			name: 'zip',
			fieldLabel: 'Zip',
			enableKeyEvents: true
		});
		this.zipField.on('keyup', this.getZipDetails, this, { buffer: 300});
		this.zipField.on('change', this.getZipDetails, this, { buffer: 300});
		this.items.push(this.zipField);
	},
	
	initType: function() {
		this.typeStore = Ext.create('Ext.data.Store', {
			fields: [
				'location_type_id',
				'name'
			],
			proxy: {
				type: 'ajax',
				url: this.processingPage + 'get-location-types',
				reader: {
					type: 'json',
					root: 'records'
				}
			},
			autoLoad:true
		});
		this.typeSelector = Ext.create('Ext.ux.form.field.RealComboBox', {
			flex:1,
			valueField:'location_type_id',
			displayField:'name',
			store: this.typeStore,
			queryMode: 'local',
			editable:false,
			margin:'2',
			fieldLabel:'Type',
			name:'locationTypeId'
		});
		this.items.push(this.typeSelector);
	},
	
	initHidden: function(){
		this.locationId = new Ext.form.field.Hidden({
			scope: this,
			name: 'location_id',
			value: this.location_id
		});
		this.customerId = new Ext.form.field.Hidden({
			scope: this,
			name: 'customer_id',
			value: this.customer_id
		});
		this.carrierId = new Ext.form.field.Hidden({
			scope: this,
			name: 'carrier_id',
			value: this.carrier_id
		});
		
		this.items.push(this.locationId);
		this.items.push(this.customerId);
		this.items.push(this.carrierId);
	},
	
	getZipDetails: function(){
		if (this.zipField.getValue().length > 4){
			Ext.Ajax.request({
				scope: this,
				url: this.utilPage + 'data/zip/',
				params: {
					zip: this.zipField.getValue()
				},
				success: function(r){
					var response = Ext.JSON.decode(r.responseText);
					if(response.record != null){
						this.down('textfield[name=city]').setValue(response.record.city);
						this.down('textfield[name=state]').setValue(response.record.state);
					}
				}
			});
		}
	},
	
	checkLocationName: function(name){
		Ext.Ajax.request({
			scope:this,
			method:'post',
			url:this.processingPage + 'check-name',
			params:{
				name: name
			},
			success: function(r) {
				var response = Ext.decode(r.responseText);
				var nameExists = response.record.exists;
				
			}
		});
	},
	
	loadLocation: function(location_id, name) {
		this.location_id = location_id;
		if (this.location_id) {
			this.setLoading(true);
			Ext.Ajax.request({
				scope:this,
				method:'post',
				url:this.processingPage + 'get-location-data',
				params:{
					location_id:this.location_id
				},
				success: function(r) {
					this.setLoading(false);
					var response = Ext.decode(r.responseText);
					if (response.success) {
						this.setFieldValues(response.record);
					}
				}
			});
		}
	},
	
	setFieldValues: function(record) {
		this.name1Field.setValue(record.location_name_1);
		this.name2Field.setValue(record.location_name_2);
		this.address1Field.setValue(record.address_1);
		this.address2Field.setValue(record.address_2);
		this.address3Field.setValue(record.address_3);
		this.zipField.setValue(record.zip);
		this.locationId.setValue(record.location_id);
		this.typeSelector.setValue(record.type);
	},
	
	clearFieldValues: function() {
		var record = {};
		record.location_name_1 = '';
		record.location_name_2 = '';
		record.address_1 = '';
		record.address_2 = '';
		record.address_3 = '';
		record.zip = '';
		record.location_id = '';
		record.type = 0;
		this.setFieldValues(record);
	}
});
Ext.define('TMS.location.forms.Form', {
	extend:'TMS.form.Abstract',
	requires:[
		'TMS.location.forms.sections.Location'
	],
	
	//Config
	url: '/at-ajax/modules/location/process/process',
	bodyPadding: 10,
	location_id: 0,
	customer_id: 0,
	carrier_id: 0,
	
	initComponent: function(){
		this.items = [];
		this.init();
		this.callParent(arguments);
	},
	
	init: function(){
		this.initLocationSection();
	},
	
	initLocationSection: function(){
		this.locationSection = Ext.create('TMS.location.forms.sections.Location', {
			border: false,
			location_id: this.location_id,
			customer_id: this.customer_id,
			carrier_id: this.carrier_id
		});
		this.items.push(this.locationSection);
	}
});
Ext.define('TMS.location.lookup.Location', {
	extend: 'Ext.ux.form.field.RealComboBox',
	
	//Config
	type: 'contact',
	processingPage: '/at-ajax/modules/location/lookup/location',
	displayField: 'location_display',
	valueField: 'location_id',
	emptyText: 'Search for location...',
	typeAhead: false,
	hideTrigger:true,
	anchor: '100%',
	pageSize: 10,
	minChars: 0,
	width: 250,
	listConfig: {
		loadingText: 'Searching...',
		emptyText: 'No matching locations found.',

		// Custom rendering template for each item
		getInnerTpl: function() {
			return '<div class="location-name">{location_name_1}</div>' +
					'<div class="location-address">{address_1}</div>' +
					'<div class="location-city-state-zip">{city}, {state} {zip}</div>';
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
				'location_id',
				'location_display',
				'location_name_1',
				'address_1',
				'city',
				'state',
				'zip',
				'lat',
				'lng'
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
				},
				extraParams:{
					type: this.type
				}
			}
		});
	}
});
            
