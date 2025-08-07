Ext.define('TMS.contacts.forms.sections.PreferredStates', {
	extend:'TMS.form.Abstract',
	
	//Requires
	requires:[
		'Ext.ux.form.field.RealComboBox',
		'Ext.ux.form.field.BoxSelect'
	],
	
	//Config
	title:'Preferred States',
	baseTitle:'Preferred States',
	contact_id:0,
	carrier_id:0,
	layout:'hbox',
	url: '/at-ajax/modules/contact/process/save-preferred-states',
	processingPage:'/at-ajax/modules/contact/process/',
	loaded: false,
	
	initComponent: function(){
		this.items = [];
		this.init();
		this.callParent(arguments);
	},
	
	init: function() {
		this.initLayoutPanels();
		this.initStore();
		this.initOriginStates();
		this.initDestinationStates();
		this.initListeners();
	},
	
	initLayoutPanels: function() {
		this.leftPanel = Ext.create('Ext.panel.Panel', {
			flex:1,
			autoHeight:true,
			border:0,
			layout:'anchor',
			defaults:{
				anchor: '98%'
			}
		});
		this.rightPanel = Ext.create('Ext.panel.Panel', {
			flex:1,
			autoHeight:true,
			border:0,
			layout:'anchor',
			defaults:{
				anchor: '98%'
			}
		});
		
		this.items.push(this.leftPanel, this.rightPanel);
	},
	
	initStore: function() {
		this.statesStore = Ext.create('Ext.data.Store', {
			fields: [
				'stateCode',
				'stateName'
			],
			proxy: {
				type: 'ajax',
				url: this.processingPage + 'get-state-list',
				reader: {
					type: 'json',
					root: 'records'
				}
			}
		});
		this.statesStore.load();
	},
	
	initOriginStates: function() {
		this.originStates = Ext.create('Ext.ux.form.field.BoxSelect', {
			store:this.statesStore,
			displayField:'stateName',
			valueField:'stateCode',
			queryMode:'local',
			multiSelect:true,
			padding:10,
			fieldLabel:'Origin',
			anchor:'100%'
		});
		this.leftPanel.add(this.originStates);
	},
	
	initDestinationStates: function() {
		this.destinationStates = Ext.create('Ext.ux.form.field.BoxSelect', {
			store:this.statesStore,
			displayField:'stateName',
			valueField:'stateCode',
			queryMode:'local',
			multiSelect:true,
			padding:10,
			fieldLabel:'Destination',
			anchor:'100%'
		});
		this.rightPanel.add(this.destinationStates);
	},
	
	loadContact: function(contact_id, carrier_id, name) {
		this.contact_id = contact_id || this.contact_id;
		this.carrier_id = carrier_id || this.carrier_id;
		var newTitle = this.baseTitle;
		if (name != null) {
			newTitle = this.baseTitle + ' - ' + name;
		}
		
		if (this.rendered) {
			this.setTitle(newTitle);
		}
		else {
			this.title = newTitle;
		}
		
		if (this.statesStore.isLoading()) {
			this.statesStore.on('load', function() {
				this.loadContact();
			}, this);
		}
		else {
			if (this.contact_id) {
				this.setLoading(true);
				Ext.Ajax.request({
					scope:this,
					method:'post',
					url:this.processingPage + 'get-preferred-states',
					params:{
						contact_id:this.contact_id,
						carrier_id:this.carrier_id
					},
					success: function(r) {
						this.setLoading(false);
						var response = Ext.decode(r.responseText);
						var records = response.records;
						var originStates = [];
						var destinationStates = [];
						for (var i = 0; i < records.length; i++) {
							if (parseInt(records[i].origin)) {
								originStates.push(records[i].state);
							}
							else {
								destinationStates.push(records[i].state);
							}
						}
						this.originStates.setValue(originStates);
						this.destinationStates.setValue(destinationStates);
						setTimeout(Ext.bind(function(){
							this.loaded = true;
						}, this), 800);
					}
				});
			}
		}
	},
	
	initListeners: function() {
		this.originStates.on('change', this.savePreferredStates, this, {buffer: 700});
		this.destinationStates.on('change', this.savePreferredStates, this, {buffer: 700});
		this.on('beforesubmit', function(form){
			if(!this.rendered){
				return;
			}
			//Add in the contact or customer
			if(form == this){
				this.setParams({
					contact_id: this.contact_id,
					carrier_id: this.carrier_id,
					originStates: Ext.encode(this.originStates.getValue()),
					destinationStates: Ext.encode(this.destinationStates.getValue())
				});
			}
		}, this);
	},
	
	savePreferredStates: function() {
		if(this.loaded){
			this.submit();
		}
		/*
		Ext.Ajax.request({
			scope:this,
			method:'post',
			url:this.processingPage + 'save-preferred-states',
			params:{
				contact_id:this.contact_id,
				carrier_id:this.carrier_id,
				'originStates[]':this.originStates.getValue(),
				'destinationStates[]':this.destinationStates.getValue()
			},
			success: function(r) {
				var response = Ext.decode(r.responseText);
				
			}
		});
		*/
	}
	
});