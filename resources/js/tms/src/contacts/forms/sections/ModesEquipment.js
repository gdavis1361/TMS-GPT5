Ext.define('TMS.contacts.forms.sections.ModesEquipment', {
	extend:'TMS.form.Abstract',
	requires:[
		'Ext.ux.form.field.RealComboBox',
		'Ext.ux.form.field.BoxSelect'
	],
	bodyStyle:{
		padding:'10px'
	},
	title:'Allowed Modes and Equipment',
	autoHeight:true,
	processingPage:'/at-ajax/modules/contact/process/',
	url:'/at-ajax/modules/contact/process/save-modes-equipment',
	
	autoSave: true,
	layout:'hbox',
	
	contact_id:0,
	carrier_id:0,
	
	modeIds:[],
	equipmentIds:[],
	
	modesLoaded:false,
	equipmentLoaded:false,
	loaded: false,
	
	initComponent: function(){
		this.items = [];
		this.addEvents('recordload');
		this.init();
		this.callParent(arguments);
	},
	
	init: function() {
		this.initListeners();
		this.initStore();
		
		this.initHidden();
		this.initFields();
		
		this.loadData();
	},
	
	initListeners: function() {
		this.on('afterrender', function() {
			if (this.contact_id || this.carrier_id) {
			}
		}, this);
		
		this.on('beforesubmit', function(form){
			if(!this.rendered){
				return;
			}
			
			this.modes.setValue(Ext.encode(this.modesAllowed.getValue()));
			this.equipment.setValue(Ext.encode(this.equipmentAllowed.getValue()));
			
			//Add in the contact or customer
			if(form == this){
				this.setParams({
					contact_id: this.contact_id,
					carrier_id: this.carrier_id
				});
			}
		}, this);
	},
	
	initStore: function() {
		this.modesStore = Ext.create('Ext.data.Store', {
			fields: [
				'mode_id',
				'mode_name'
			],
			proxy: {
				type: 'ajax',
				url: this.processingPage + 'get-modes-list',
				reader: {
					type: 'json',
					root: 'modeList'
				}
			}
		});
		
		this.equipmentStore = Ext.create('Ext.data.Store', {
			fields: [
				'CarrEquipId',
				'CarrEquipDesc'
			],
			proxy: {
				type: 'ajax',
				url: this.processingPage + 'get-equipment-list',
				reader: {
					type: 'json',
					root: 'equipmentList'
				}
			}
		});
		
		this.modesStore.load();
		this.equipmentStore.load();
	},
	
	initHidden: function(){
		this.modes = Ext.create('Ext.form.field.Hidden', {
			name:'modesAllowed'
		});
		this.items.push(this.modes);
		
		this.equipment = Ext.create('Ext.form.field.Hidden', {
			name:'equipmentAllowed'
		});
		this.items.push(this.equipment);
	},
	
	initFields: function() {
		this.modesAllowed = Ext.create('Ext.ux.form.field.BoxSelect', {
			store:this.modesStore,
			multiSelect:true,
			labelAlign: 'top',
			fieldLabel: 'Modes Allowed',
			displayField:'mode_name',
			valueField:'mode_id',
			//hiddenName:'modesAllowed',
			//name:'modesAllowed',
			itemId:'modesAllowed',
			flex: 1,
			margin: 2,
			queryMode:'local'
		});
		
		this.modesAllowed.on('afterrender', function(){
			this.modesAllowed.on('change', function(){
				this.save();
			}, this, {buffer: 1000 });
		}, this);
		
		if(this.modeIds.length){
			this.modesAllowed.store.on('load', function(){
				var records = [];
				Ext.each(this.modeIds, function(modeId){
					var record = this.modesAllowed.store.getAt(this.modesAllowed.store.find('mode_id', modeId));
					records.push(record);
				}, this);
				this.modesAllowed.select(records);
			}, this);
		}
		
		this.items.push(this.modesAllowed);
		
		this.equipmentAllowed = Ext.create('Ext.ux.form.field.BoxSelect', {
			store:this.equipmentStore,
			multiSelect:true,
			labelAlign: 'top',
			fieldLabel: 'Equipment Allowed',
			displayField:'CarrEquipDesc',
			valueField:'CarrEquipId',
			//hiddenName:'equipmentAllowed',
			//name:'equipmentAllowed',
			itemId:'equipmentAllowed',
			flex: 1,
			margin: 2,
			queryMode:'local'
		});
		
		this.equipmentAllowed.on('afterrender', function(){
			this.equipmentAllowed.on('change', function(){
				this.save();
			}, this, {buffer: 1000 });
		}, this);
		
		if(this.equipmentIds.length){
			this.equipmentAllowed.store.on('load', function(){
				var records = [];
				Ext.each(this.equipmentIds, function(equipmentId){
					var record = this.equipmentAllowed.store.getAt(this.equipmentAllowed.store.find('CarrEquipId', equipmentId));
					records.push(record);
				}, this);
				this.equipmentAllowed.select(records);
			}, this);
		}
		
		this.items.push(this.equipmentAllowed);
		
	},
	
	loadData: function() {
		if(!this.rendered){
			this.on('afterrender', function(){
				this.loadData();
			}, this);
			return;
		}
		if (this.contact_id || this.carrier_id) {
			Ext.Ajax.request({
				scope:this,
				method:'post',
				url:this.processingPage + 'get-modes-equipment',
				params:{
					contact_id:this.contact_id,
					carrier_id:this.carrier_id
				},
				success: function(r) {
					this.setLoading(false);
					var response = Ext.decode(r.responseText);
					this.fireEvent('recordload', this, response);
					this.modeIds = response.modeIds;
					this.equipmentIds = response.equipmentIds;
					if (this.modesStore.isLoading()) {
						this.modesStore.on('load', function() {
							this.modesAllowed.setValue(this.modeIds);
							this.modesLoaded = true;
							this.checkLoaded();
						}, this);
					}
					else {
						this.modesAllowed.setValue(this.modeIds);
						this.modesLoaded = true;
						this.checkLoaded();
					}
					
					if (this.equipmentStore.isLoading()) {
						this.equipmentStore.on('load', function() {
							this.equipmentAllowed.setValue(this.equipmentIds);
							this.equipmentLoaded = true;
							this.checkLoaded();
						}, this);
					}
					else {
						this.equipmentAllowed.setValue(this.equipmentIds);
						this.equipmentLoaded = true;
						this.checkLoaded();
					}
				}
			});
		}
		else {
			this.modesLoaded = true;
			this.equipmentLoaded = true;
			this.checkLoaded();
		}
	},
	
	checkLoaded: function(){
		if(this.loaded){
			return;
		}
		if(this.equipmentLoaded && this.modesLoaded){
			setTimeout(Ext.bind(function(){
				this.loaded = true;
			}, this), 1100);
		}
	},
	
	loadContact: function(contact_id) {
		this.contact_id = contact_id;
		this.carrier_id = 0;
		this.loadData();
	},
	
	loadCarrier: function(carrier_id) {
		this.carrier_id = carrier_id;
		this.contact_id = 0;
		this.loadData();
	},
	
	save: function() {
		if ((this.contact_id || this.carrier_id) && this.autoSave && this.loaded) {
			this.submit();
		}
	}
	
});