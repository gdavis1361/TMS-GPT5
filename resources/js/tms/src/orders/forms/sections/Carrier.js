Ext.define('TMS.orders.forms.sections.Carrier', {
	extend:'TMS.form.Abstract',
	
	//Requires
	requires:[
		'Ext.ux.form.field.RealComboBox',
		'TMS.carrier.lookup.Carrier',
		'TMS.contacts.lookup.Contact',
		'TMS.carrier.view.RadiusGrid'
	],
	
	//Config
	originalValues: false,
	
	order_id: 0,
	url:'/at-ajax/modules/order/process/set-carrier',
	processingPage: '/at-ajax/modules/carrier/process/',
	autoSave:false,
	layout: {
		type: 'vbox',
		align: 'stretch'
	},
	border: false,

	//Config
	initComponent: function(){
		this.items = [];
		this.originalValues = false;
		this.init();
		this.callParent(arguments);
	},
	
	init: function(){
		//Containers
		this.initFieldContainer();
		this.initGrid();
		
		//Fields
		this.initCarrierSearch();
		this.initContactLookup();
		this.initUsedEquip();
		this.initListeners();
		this.loadData();
	},
	
	initFieldContainer: function(){
		this.fieldContainer = new Ext.panel.Panel({
			scope: this,
			layout: 'anchor',
			bodyPadding: 10
		});
		this.items.push(this.fieldContainer);
	},
	
	initGrid: function(){
		this.grid = Ext.create('TMS.carrier.view.RadiusGrid', {
			scope: this,
			title: 'Radius Search',
			order_id: this.order_id,
			flex: 1
		});
		this.items.push(this.grid);
		
		this.grid.grid.on('itemclick', function(grid, record){
			this.carrier_search.loadFromStore({
				carrier_id: record.get('carrier_id')
			});
		}, this);
	},
	
	initCarrierSearch: function() {
		this.carrier_search = Ext.create('TMS.carrier.lookup.Carrier', {
			fieldLabel: 'Carrier Search',
			name:'carrier_id',
			hiddenName:'carrier_id'
		});
		
		this.carrier_search.on('select', function(field, records){
			if (records.length){
				var d = records[0].data;
				
				this.contactLookup.setParam('carrier_id', d.carrier_id);
				this.contactLookup.setReadOnly(false);
				this.contactLookup.enable();
				this.contactLookup.store.load();
				this.contactLookup.setRawValue('');
				this.contactLookup.setValue(0);
				this.contactLookup.focus(true, 50);
			}
			else {
				this.contactLookup.setReadOnly(true);
				this.contactLookup.disable();
			}
		}, this);
		this.fieldContainer.add(this.carrier_search);
	},
	
	initContactLookup: function(){
		this.contactLookup = Ext.create('TMS.contacts.lookup.Contact', { 
			type: 'carrier', 
			fieldLabel: 'Select Carrier Contact',
			name:'carrier_contact_id'
		});
		this.fieldContainer.add(this.contactLookup);
	},
	
	initUsedEquip: function(){
		var data = [];
		/*
		var equipId = modesEquipment.equipmentAllowed.getValue() ;

		Ext.each(equipId, function(r){
			var record = modesEquipment.equipmentAllowed.store.getAt( modesEquipment.equipmentAllowed.store.find('CarrEquipId', r) );
			data.push([record.get('CarrEquipId'), record.get('CarrEquipDesc')]);
		});
		*/

		this.availableEquipStore = Ext.create('Ext.data.ArrayStore', {
			fields: ['id', 'name'],
			data: data
		});

		this.usedEquip = Ext.create('Ext.ux.form.field.RealComboBox', {
			fieldLabel: "Select Equipment",
			store: this.availableEquipStore,
			displayField: 'name',
			valueField: 'id',
			readOnly: (data.length > 1 ? false : true),
			editable: false,
			name: 'used_equipment_id',
			hiddenName: 'used_equipment_id'
		});
		this.fieldContainer.add(this.usedEquip);
	},
	
	makeNewStore: function(data) {
		this.availableEquipStore = Ext.create('Ext.data.ArrayStore', {
			fields: ['id', 'name'],
			data: data
		});
		this.usedEquip.store = this.availableEquipStore;
		this.availableEquipStore.load();
		
		if (data.length == 1) {
			this.usedEquip.setValue(data[0][0]);
		}
	},
	
	initListeners: function() {
		this.carrier_search.on('select', this.save, this);
		this.contactLookup.on('select', this.save, this);
		this.usedEquip.on('select', this.save, this);
		this.on('beforesubmit', function(){
			this.setParam('order_id', this.order_id);
		}, this);
	},
	
	loadData: function(){
		if (this.order_id){
			this.setLoading(true);
			Ext.Ajax.request({
				scope:this,
				method:'post',
				url:this.processingPage + 'get-order-info',
				params:{
					order_id:this.order_id
				},
				success: function(r) {
					this.setLoading(false);
					var response = Ext.decode(r.responseText);
					//var records = response.records;
					
					var data = [];
					
					Ext.each(response.equipment_list, function(d){
						var o = [d.equipment_id, d.name];
						data.push(o);
					});
					this.makeNewStore(data);
					this.carrier_search.setValue(response.carrier_id);
					this.carrier_search.setRawValue(response.carrier_name);
					
					this.contactLookup.setValue(response.contact_id)
					this.contactLookup.setRawValue(response.contact_name);
					this.contactLookup.setParam('carrier_id', response.carrier_id);
					if (response.carrier_id > 0){
						this.contactLookup.store.load();
						this.contactLookup.setReadOnly(false);
						this.contactLookup.enable();
					}else{
						this.contactLookup.setReadOnly(true);
						this.contactLookup.disable();
						//this.contactLookup.store.removeAll();
					}
					
					if (response.equipment_id)
						this.usedEquip.setValue(response.equipment_id)
				}
			});
		}
	},
	
	save: function() {
		var params = this.getValues();
		params.order_id = this.order_id
		if (this.autoSave && params.order_id) {
			this.submit();
		}
	}
});