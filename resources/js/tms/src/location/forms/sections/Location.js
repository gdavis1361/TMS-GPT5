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