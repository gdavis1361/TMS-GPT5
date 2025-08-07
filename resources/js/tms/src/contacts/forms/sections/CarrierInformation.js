Ext.define('TMS.contacts.forms.sections.CarrierInformation', {
	extend:'Ext.panel.Panel',
	requires:[
		'TMS.carrier.lookup.Carrier',
		'TMS.location.lookup.Location',
		'TMS.location.forms.Form',
		'TMS.form.plugin.StatusBar',
		'TMS.ActionWindow'
	],
	
	//Config
	bodyStyle:{
		padding:'10px'
	},
	border: false,
	processingPage:'/at-ajax/modules/carrier/process/',
	carrierProcessingPage: '/at-ajax/modules/carrier/process/',
	carrierLookupPage: '/at-ajax/modules/carrier/lookup/',
	contact_id:0,
	fieldValues:{},
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
		
		//Init Containers
		this.initCarrierPanel();
		this.initLocationPanel();
		
		//Init items
		this.initCarrierLookup();
		this.initLocationLookup();
		
		this.initListeners();
	},
	
	initListeners: function() {
		if(this.carrier_id){
			this.on('afterrender', function(){
				
				//Pass the contact id to the customer lookup
				this.carrierLookup.loadFromStore({
					carrier_id: this.carrier_id
				}, false);
				
				//Pass the carrier id to the location lookup
				this.locationLookup.store.on('load', function(store, records){
					if(records.length){
						this.locationLookup.enable();
						this.locationLookup.select(records[0]);
					}
				}, this, {single: true});
				this.locationLookup.store.load({
					params:{
						to_id: this.carrier_id
					}
				});
				
			});
		}
	},
	
	initCarrierPanel: function(){
		this.carrierPanel = new Ext.panel.Panel({
			scope: this,
			layout: 'hbox',
			border: false,
			unstyled: true,
			autoHeight: true,
			defaults:{
				margin: 2
			}
		});
		this.items.push(this.carrierPanel);
	},
	
	initLocationPanel: function(){
		this.locationPanel = new Ext.panel.Panel({
			scope: this,
			layout: 'hbox',
			border: false,
			unstyled: true,
			autoHeight: true,
			defaults:{
				margin: 2
			}
		});
		this.items.push(this.locationPanel);
	},
	
	initCarrierLookup: function(){
		this.carrierLookup = Ext.create('TMS.carrier.lookup.Carrier', {
			fieldLabel: 'Carrier',
			flex: 1
		});
		
		this.carrierAddButton = new Ext.button.Button({
			scope: this,
			width: 150,
			text: 'Add New Carrier',
			handler: function(){
				var win = this.createLocationWindow({
					title: 'Add New Carrier'
				});
				var mcNumberField = new Ext.form.field.Text({
					xtype: 'textfield',
					name: 'mc_no',
					fieldLabel: 'MC Number',
					enableKeyEvents: true,
					msgTarget: 'under'
				});
				
				this.carrierApproval = Ext.create('Ext.Img', {
					src: '/resources/silk_icons/thumbs_down_red.png',
					width: 24,
					height: 24
				});
				
				this.carrierInsurance = Ext.create('Ext.form.FieldSet', {
					items: [],
					title: 'Insurance Information',
					getFieldValues: function(){
						var a = [];
						Ext.each(this.items.items, function(item){
							a.push( item.getForm().getValues() );
						}, this);
						return a;
					}
				});
				
				carrierApprovalPanel = new Ext.Container({
					items: [ this.carrierApproval, this.carrierInsurance ],
					hidden: true
				});
				
				
				//Run when the mcnumber is changed
				mcNumberField.on('change', function(field, value, oldValue){
					if(value == oldValue){
						return;
					}
					
					var mcNum = field.getValue();
					if (mcNum.length != 6) return;
					
					win.setLoading(true);
					win.form.locationSection.clearFieldValues();
					
					
					//Send a request to get the carrier411 info
					Ext.Ajax.request({
						scope: this,
						url: this.carrierLookupPage + 'carrier411',
						params: {
							mc: field.getValue()
						},
						success: function(r, request){
							var response = Ext.JSON.decode(r.responseText);
							if(response.record != null){
								thumbsUp = false; //guilty until proven innocent.
								
								//Auth check
								if (response.record.FMCSACOMMON == 'A' || response.record.FMCSACONTRACT == 'A'){
									//Safety check
									if (response.record.SAFETYRATING != 'N'){
										//Insurance check.
										if (response.record.insurance.length)
											thumbsUp = true;
									}
								}
								
								if (thumbsUp) this.carrierApproval.setSrc('/resources/silk_icons/thumbs_up_green.png');
								else this.carrierApproval.setSrc('/resources/silk_icons/thumbs_down_red.png');
								
								this.carrierInsurance.removeAll(true);
								
								Ext.each(response.record.insurance, function(ins, i){
									this.carrierInsurance.add(
										new Ext.form.Panel({
											items: [{
												xtype: 'displayfield',
												name: 'type',
												fieldLabel: 'Type',
												value: ins.INSURTYPE
											},{
												xtype: 'displayfield',
												name: 'effective',
												fieldLabel: 'Effective Date',
												value: ins.INSUREFFECTIVE
											},{
												xtype: 'hidden',
												name: 'insurance_type_name',
												fieldLabel: 'Type',
												value: ins.INSURTYPE
											},{
												xtype: 'hidden',
												name: 'effective_date',
												fieldLabel: 'Effective Date',
												value: ins.INSUREFFECTIVE
											},{
												xtype: 'hidden',
												name: 'agency_name',
												value: ins.INSURCOMPANY
											},{
												xtype: 'hidden',
												name: 'policy_number',
												value: ins.INSURPOLICYNUM
											},{
												xtype: 'hidden',
												name: 'insurance_value',
												value: (ins.INSURBIPDTO ? ins.INSURBIPDTO : '')
											}],
											bodyStyle: {
												background: (i % 2 ? '#eaeaea' : ''),
												border: 0
											}
										})
									);
								}, this);
								
								var carrierObject = {
									name1: response.record.FMCSALEGALNAME,
									name2: response.record.FMCSADBANAME,
									address1: response.record.FMCSABUSADDRESS,
									zip: response.record.FMCSABUSZIP.split('-',1),
									phone: response.record.FMCSABUSPHONE,
									safety_rating_date: response.record.SAFETYRATEDATE,
									safety_rating: response.record.SAFETYRATING,
									insurance: thumbsUp //insTypes,
								};
								win.form.getForm().setValues(carrierObject);
								carrierApprovalPanel.show();
							}else{
								//carrierInfo.hide();
								carrierApprovalPanel.hide();
								mcNumberField.markInvalid( response.errors );
							}
							win.setLoading(false);
							win.doLayout();
						}
					});
				}, this, {buffer: 250});
				Ext.each(win.form.locationSection.items.items, function(d,i){
					d.setReadOnly(true);
				});
				win.form.locationSection.insert(0, mcNumberField);
				win.form.locationSection.insert(0, carrierApprovalPanel);
				
				win.form.on('success', function(form, action){
					var result = action.result;
										
					//Create and link the carrier
					Ext.Ajax.request({
						scope: this,
						url: this.carrierProcessingPage + 'process',
						locationResult: result,
						params: Ext.apply({
							location_id: result.record.location_id,
							insurance_info: Ext.encode(this.carrierInsurance.getFieldValues())
						}, form.getValues()),
						success: function(r, request){
							var response = Ext.JSON.decode(r.responseText);
							var locationRecord = request.locationResult.record;
							
							if(response.success){
								win.setLoading(false);
								win.destroy();

								//Set the carrier lookup value and auto select the correct record
								this.carrierLookup.store.on('load', function(store, records, successful, options){
									if(records.length){
										this.carrierLookup.select(records[0]);
									}
								}, this, {single: true});

								this.carrierLookup.store.load({
									params:{
										carrier_id: response.record.carrier_id
									}
								});

								//Set the location and auto select the correct record
								this.locationLookup.enable();

								this.locationLookup.store.on('load', function(store, records, successful, options){
									if(records.length){
										this.locationLookup.select(records[0]);
									}
								}, this, {single: true});

								this.locationLookup.store.proxy.extraParams.to_id = response.record.customer_id;
								this.locationLookup.store.load({
									params:{
										location_id: locationRecord.location_id
									}
								});
							}
						}
					});
				}, this);
				
			}
		});
		
		this.carrierPanel.add(this.carrierLookup, this.carrierAddButton);
	},
	
	initLocationLookup: function(){
		this.locationLookup = Ext.create('TMS.location.lookup.Location', {
			type: 'carrier',
			fieldLabel: 'Location',
			flex: 1,
			disabled: true,
			hiddenName: 'location_id'
		});
		
		this.carrierLookup.on('select', function(field, records){
			if(!records.length){
				this.locationLookup.disable();
				return false;
			}
			this.locationLookup.enable();
			var record = records[0];
			this.locationLookup.setValue('');
			this.locationLookup.setRawValue('');
			this.locationLookup.store.proxy.extraParams.to_id = record.get('carrier_id');
			this.locationLookup.store.loadPage(1);
			this.locationLookup.focus(true, 50);
			this.locationLookup.expand();
		}, this);
		
		this.locationAddButton = new Ext.button.Button({
			scope: this,
			width: 150,
			text: 'Add New Location',
			disabled: true,
			handler: function(){
				var win = this.createLocationWindow({
					title: 'Add New Location'
				});
				win.on('show', function(panel){
					panel.down('textfield[name=name1]').setValue(this.locationLookup.getRawValue());
					panel.down('textfield[name=name1]').focus(true, 50);
				}, this);
				win.on('failure', function(form, action){
					var html = action.result.errors.join(', ');
					
					Ext.MessageBox.alert('Errors', html, Ext.bind(function(){
						this.setLoading(false);
					}, win));
				}, win);
				win.on('success', function(form, action){
					var result = action.result;
					//Create and link the customer
					Ext.Ajax.request({
						scope: this,
						url: this.carrierProcessingPage + 'add-location',
						locationResult: result,
						params: {
							carrier_id: this.carrierLookup.getValue(),
							location_id: result.record.location_id
						},
						success: function(r, request){
							var response = Ext.JSON.decode(r.responseText);
							var locationRecord = request.locationResult.record;
							win.setLoading(false);
							win.destroy();

							//Set the location and auto select the correct record
							this.locationLookup.enable();

							this.locationLookup.store.on('load', function(store, records, successful, options){
								if(records.length){
									this.locationLookup.select(records[0]);
								}
							}, this, {single: true});

							this.locationLookup.store.proxy.extraParams.to_id = this.carrierLookup.getValue();
							this.locationLookup.store.load({
								params:{
									location_id: locationRecord.location_id
								}
							});

						}
					});
				}, this);
				win.show();
			}
		});
		
		this.locationLookup.on('disable', function(){
			this.locationAddButton.disable();
		}, this);
		this.locationLookup.on('enable', function(){
			this.locationAddButton.enable();
		}, this);
		
		this.locationPanel.add(this.locationLookup, this.locationAddButton);
	},
	
	createLocationWindow: function(config){
		var locationForm = Ext.create('TMS.location.forms.Form', {
			scope: this,
			autoScroll: true,
			plugins:[Ext.create('TMS.form.plugin.StatusBar')],
			carrier_id:this.carrierLookup.getValue()
		});
		var win = Ext.create('TMS.ActionWindow', Ext.apply({
			scope: this,
			layout: 'fit',
			modal: true,
			form: locationForm,
			items:[locationForm],
			dockedItems: [{
				xtype: 'toolbar',
				dock: 'bottom',
				ui: 'footer',
				layout:{
					pack: 'center'
				},
				items: [{
					scope: this,
					type: 'button',
					text: 'Save',
					handler: function(){
						win.form.submit();
					}
				},{
					scope: this,
					type: 'button',
					text: 'Cancel',
					handler: function(){
						win.destroy();
					}
				}]
			}]
		}, config));
		return win;
	}
});
