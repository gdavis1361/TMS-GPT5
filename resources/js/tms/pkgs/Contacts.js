Ext.define('TMS.contacts.filter.Contact', {
	extend: 'TMS.filter.Abstract',
	
	//Requires
	requires:[
		'Ext.ux.form.field.RealComboBox'
	],
	
	init: function(){
		this.initName();
		this.initCompany();
		this.initOwner();
		this.initUpToDate();
		this.initStatus();
	},
	
	initName: function(){
		this.items.push({
			name: 'name',
			fieldLabel: 'Name'
		});
	},
	
	initCompany: function(){
		this.items.push({
			name: 'company',
			fieldLabel: 'Company'
		});
	},
	
	initOwner: function() {
		this.items.push({
			name: 'owner',
			fieldLabel: 'Owner'
		});
	},
	
	initUpToDate: function() {
		var data = {
			data:[{
				'upToDate':-1,
				'display':'All'
			},{
				'upToDate':0,
				'display':'No'
			},{
				'upToDate':1,
				'display':'Yes'
			}]
		};
		this.upToDateStore = Ext.create('Ext.data.Store', {
			autoLoad: true,
			fields:['upToDate', 'display'],
			data:data,
			proxy: {
				type: 'memory',
				reader: {
					type: 'json',
					root: 'data'
				}
			}
		});
		this.items.push({
			xtype:'realcombobox',
			queryMode:'local',
			name: 'upToDate',
			displayField:'display',
			valueField:'upToDate',
			fieldLabel: 'Up To Date',
			store:this.upToDateStore
		});
	},
	
	initStatus: function() {
		var data = {
			data:[{
				'status_id':-1,
				'status_name':'All'
			},{
				'status_id':9,
				'status_name':'Cold'
			},{
				'status_id':10,
				'status_name':'Warm'
			},{
				'status_id':11,
				'status_name':'Hot'
			}]
		};
		this.statusStore = Ext.create('Ext.data.Store', {
			autoLoad: true,
			fields:['status_id', 'status_name'],
			data:data,
			proxy: {
				type: 'memory',
				reader: {
					type: 'json',
					root: 'data'
				}
			}
		});
		this.items.push({
			xtype:'realcombobox',
			queryMode:'local',
			name: 'status',
			displayField:'status_name',
			valueField:'status_id',
			fieldLabel: 'Status',
			store:this.statusStore
		});
	}
	
});
Ext.define('TMS.contacts.forms.sections.BillTo', {
	extend:'TMS.form.Abstract',
	
	//requires
	requires:[
		'Ext.ux.form.field.RealComboBox',
		'TMS.customer.lookup.Customer',
		'TMS.location.lookup.Location'
	],
	
	
	//Config
	contact_id:0,
	location_id:0,
	bodyStyle:{
		padding:'8px'
	},
	processingPage:'/at-ajax/modules/contact/process/',
	url:'/at-ajax/modules/contact/process/save-bill-to',
	title:'Bill To',
	baseTitle:'Bill To',
	autoSave:false,
	
	layout: 'anchor',
	defaults:{
		anchor: '100%'
	},
	
	recordLoaded:false,
	
	initComponent: function(){
		this.items = this.items || [];
		this.dockedItems = this.dockedItems || [];
		this.addEvents('recordload');
		this.init();
		this.callParent(arguments);
	},
	
	init: function() {
		this.initToolbar();
		this.initCompanySelector();
		this.initLocationSelector();
		this.initHidden();
		this.initListeners();
		this.load(this.contact_id);
	},
	
	initToolbar: function() {
		this.removeBillToButton = Ext.create('Ext.button.Button', {
			scope:this,
			text:'Remove Bill To',
			handler:this.removeBillTo
		})
		this.topBar = Ext.create('Ext.toolbar.Toolbar', {
			dock:'top',
			items:[
				this.removeBillToButton
			]
		});
		this.dockedItems.push(this.topBar);
	},
	
	initCompanySelector: function() {
		this.companySelector = Ext.create('TMS.customer.lookup.Customer', {
			fieldLabel:'Company',
			name:'bill_to_customer_id'
		});
		this.items.push(this.companySelector);
	},
	
	initLocationSelector: function() {
		this.locationSelector = Ext.create('TMS.location.lookup.Location', {
			fieldLabel:'Location',
			type: 'customer',
			name:'bill_to_location_id'
		});
		this.items.push(this.locationSelector);
	},
	
	initHidden: function() {
		this.contactIdField = Ext.create('Ext.form.field.Hidden', {
			name:'contact_id',
			value: this.contact_id
		});
		this.items.push(this.contactIdField);
	},
	
	initListeners: function() {
		this.companySelector.on('select', function(field, records) {
			if(!records.length){
				this.locationSelector.disable();
				return false;
			}
			this.locationSelector.enable();
			var record = records[0];
			this.locationSelector.setRawValue('');
			this.locationSelector.setValue(0);
			this.locationSelector.store.proxy.extraParams.to_id = record.get('customer_id');
			this.locationSelector.store.proxy.extraParams.locationType = 'Billing';
			this.locationSelector.store.load();
			this.locationSelector.focus(true, 50);
		}, this);
		
		this.locationSelector.on('select', function(field, records) {
			var record = records[0];
			this.location_id = record.get('location_id');
			this.save();
		}, this);
		
		this.on('beforesubmit', function(){
			this.contactIdField.setValue(this.contact_id);
		}, this);
	},
	
	removeBillTo: function() {
		this.locationSelector.setValue('');
		this.location_id = 0;
		
		if (this.autoSave && this.contact_id) {
			this.submit();
		}
	},
	
	save: function() {
		if (this.autoSave && this.contact_id && this.location_id) {
			this.submit();
		}
	},
	
	load: function(contact_id) {
		this.contact_id = contact_id;
		
		if (this.contact_id) {
			this.setLoading(true);
			Ext.Ajax.request({
				scope:this,
				method:'post',
				url:this.processingPage + 'get-bill-to-data',
				params:{
					contact_id:this.contact_id
				},
				success: function(r) {
					this.setLoading(false);
					var response = Ext.decode(r.responseText);
					this.fireEvent('recordload', this, response);
					this.recordLoaded = true;
					if (response.success) {
						this.companySelector.setValue(response.record.customer_id);
						this.companySelector.setRawValue(response.record.customer_name);
						this.locationSelector.setValue(response.record.location_id);
						this.locationSelector.setRawValue(response.record.location_name_1 + ' ' + response.record.location_name_2);
						this.locationSelector.store.proxy.extraParams.to_id = response.record.customer_id;
//						this.setTitle(this.baseTitle + ' for ' + response.record.contact_name);
					}
					else {
						this.companySelector.setValue(0);
						this.companySelector.setRawValue('');
						this.locationSelector.setValue(0);
						this.locationSelector.setRawValue('');
					}
				}
			});
		}
	}
	
});
Ext.define('TMS.contacts.forms.sections.CarrierContacts', {
	extend:'Ext.panel.Panel',
	requires:[
		'Ext.ux.form.field.RealComboBox',
		'Ext.ux.form.field.BoxSelect',
		'TMS.contacts.forms.sections.ContactMethods',
		'TMS.contacts.forms.sections.PreferredStates'
	],
	carrier_id:0,
	layout: {
		type: 'hbox',
		align: 'stretch'
	},
	processingPage:'/at-ajax/modules/carrier/process/',
	
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
		this.initPreferredStates();
		this.initContactStore();
		this.initContactSelectorView();
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
		var url = '/contacts/?d=contacts&a=add&carrier_id=' + this.carrier_id;
		window.open(url, '_blank');
	},
	
	initLayoutPanels: function() {
		this.leftPanel = Ext.create('Ext.panel.Panel', {
			title:'Contacts',
			width: 200
		});
		
		this.viewContactPageButton = Ext.create('Ext.button.Button', {
			scope:this,
			text:'View Contact Page',
			handler:this.viewContactPageClick,
			icon:'/resources/icons/preview-16.png'
		});
		
		this.rightPanel = Ext.create('Ext.panel.Panel', {
			flex: 1,
			layout:{
				type: 'vbox',
				align: 'stretch'
			},
			defaults:{
				autoScroll: true,
				flex: 1
			},
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
			autoSave: true
		});
		this.rightPanel.add(this.contactMethods);
	},
	
	initPreferredStates: function() {
		this.preferredStates = Ext.create('TMS.contacts.forms.sections.PreferredStates');
		this.rightPanel.add(this.preferredStates);
	},
	
	initContactStore: function() {
		this.contactStore = Ext.create('Ext.data.Store', {
			fields: [
				'contact_id',
				'first_name',
				'last_name'
			],
			proxy: {
				type: 'ajax',
				url: this.processingPage + 'get-contacts',
				extraParams:{
					carrier_id:this.carrier_id
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
			autoHeight:true,
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
			this.leftPanel.doLayout();
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
		this.rightPanel.setTitle(name);
		
		// Load the information panels for this contact
		this.contactMethods.loadRecord(contact_id);
		this.preferredStates.loadContact(contact_id, this.carrier_id);
	}
	
});
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

Ext.define('TMS.contacts.forms.sections.Claim', {
	extend:'TMS.ActionWindow',
	
	title:'Claim Contact',
	processingPage:'/at-ajax/modules/contact/process/',
	
	contact_id:0,
	defaultText:'',
	
	init: function() {
		this.on('afterrender', this.claimContact, this);
		this.initButtons();
	},
	
	claimContact: function() {
		this.setLoading(true);
		Ext.Ajax.request({
			scope:this,
			method:'post',
			url:this.processingPage + 'claim-contact',
			params:{
				contact_id:this.contact_id
			},
			success: function(r) {
				this.setLoading(false);
				var response = Ext.decode(r.responseText);
				if (response.success) {
					this.update(response.msg[0]);
					this.showCloseButton();
				}
				else {
					this.update(response.errorStr);
				}
			}
		});
	},
	
	initButtons: function() {
		this.addBottomButton([{
			scope:this,
			text:'Close',
			handler: function() {
				this.close();
			}
		}]);
	}
	
});
Ext.define('TMS.contacts.forms.sections.CompanyInformation', {
	extend:'Ext.panel.Panel',
	requires:[
		'TMS.customer.lookup.Customer',
		'TMS.location.lookup.Location',
		'TMS.customer.forms.Form',
		'TMS.form.plugin.StatusBar',
		'TMS.ActionWindow',
		'TMS.location.forms.Form'
	],
	
	//Config
	bodyStyle:{
		padding:'10px'
	},
	title:'Company Information',
	processingPage:'/at-ajax/modules/contact/process/',
	customerProcessingPage: '/at-ajax/modules/customer/process/',
	contact_id:0,
	fieldValues:{},
	layout: 'anchor',
	defaults:{
		anchor: '100%'
	},
	
	isPayTo:false, // we are going to be adding pay to companies and locations as customers for now and marking the status as a different number
	
	initComponent: function(){
		this.items = [];
		this.init();
		this.callParent(arguments);
	},
	
	init: function() {
		
		//Init Containers
		this.initCustomerPanel();
		this.initLocationPanel();
		
		//Init items
		this.initCustomerLookup();
		this.initLocationLookup();
		
		//Init any listeners
		this.initListeners();
	},
	
	initListeners: function(){
		this.on('expand', function() {
			this.scrollIntoView();
		}, this);
		
		if(this.contact_id){
			this.on('afterrender', function(){
				
				//Pass the contact id to the customer lookup
				this.customerLookup.store.on('load', function(store, records){
					if(records && records.length){
						this.customerLookup.select(records[0]);
					}
				}, this, {single: true});
				this.customerLookup.store.load({
					params:{
						contact_id: this.contact_id
					}
				});
				
				//Pass the cntact id to the location lookup
				this.locationLookup.store.on('load', function(store, records){
					if(records && records.length){
						this.locationLookup.enable();
						this.locationLookup.select(records[0]);
					}
				}, this, {single: true});
				this.locationLookup.store.load({
					params:{
						contact_id: this.contact_id
					}
				});
				
			});
			
			this.locationLookup.on('select', function(field, records){
				if (records && records.length) {
					var record = records[0];
					var location_id = record.data.location_id;
					Ext.Ajax.request({
						scope:this,
						method:'post',
						url:this.processingPage + 'save-location',
						params:{
							contact_id:this.contact_id,
							location_id:location_id
						}
					});
				}
			}, this);
		}
	},
	
	
	initCustomerPanel: function(){
		this.customerPanel = new Ext.panel.Panel({
			scope: this,
			layout: 'hbox',
			border: false,
			unstyled: true,
			defaults:{
				margin: 2
			}
		});
		this.items.push(this.customerPanel);
	},
	
	initLocationPanel: function(){
		this.locationPanel = new Ext.panel.Panel({
			scope: this,
			layout: 'hbox',
			border: false,
			unstyled: true,
			defaults:{
				margin: 2
			}
		});
		this.items.push(this.locationPanel);
	},
	
	initCustomerLookup: function(){
		this.customerLookup = Ext.create('TMS.customer.lookup.Customer', {
			fieldLabel: 'Company',
			flex: 1,
			proxyParams:{
				isPayTo:this.isPayTo
			}
		});
		
		this.customerAddButton = new Ext.button.Button({
			scope: this,
			width: 150,
			text: 'Add New Company',
			handler: function(){
				var win = this.createCustomerWindow({
					title: 'Add New Company'
				});
				
				//On window show
				win.form.down('textfield[name=customerName]').focus(true, 50);
				
				//on form success
				win.form.on('success', function(form, action){
					var result = action.result;
					if (result.success) {
						// Set the company selector values
						var record = result.record;
						this.locationLookup.enable();
						this.locationLookup.store.proxy.extraParams.to_id = record['customer_id'];
						
						this.customerLookup.loadFromStore({
							customer_id:record.customer_id
						}, false);
						
						win.destroy();
						var locationAddWindow = this.locationAddButtonClick();
						locationAddWindow.down('textfield[name=name1]').setValue(record['customer_name']);
						locationAddWindow.down('*[name=customer_id]').setValue(record['customer_id']);
					}
				}, this);
				
				//Show the window
				win.show();
			}
		});
		
		this.customerPanel.add(this.customerLookup, this.customerAddButton);
	},
	
	initLocationLookup: function(){
		this.locationLookup = Ext.create('TMS.location.lookup.Location', {
			type: 'customer',
			fieldLabel: 'Location',
			flex: 1,
			disabled: true,
			hiddenName: 'location_id',
			name:'location_id'
		});
		
		this.customerLookup.on('select', function(field, records){
			if(!records.length){
				this.locationLookup.disable();
				return false;
			}
			this.locationLookup.enable();
			var record = records[0];
			this.locationLookup.setRawValue('');
			this.locationLookup.setValue('');
			this.locationLookup.store.proxy.extraParams.to_id = record.get('customer_id');
			this.locationLookup.store.loadPage(1);
			this.locationLookup.focus(true, 50);
			this.locationLookup.expand();
		}, this);
		
		this.locationAddButton = new Ext.button.Button({
			scope: this,
			width: 150,
			text: 'Add New Location',
			disabled: true,
			handler: this.locationAddButtonClick
		});
		
		this.locationLookup.on('disable', function(){
			this.locationAddButton.disable();
		}, this);
		this.locationLookup.on('enable', function(){
			this.locationAddButton.enable();
		}, this);
		
		this.locationPanel.add(this.locationLookup, this.locationAddButton);
	},
	
	locationAddButtonClick: function() {
		var win = this.createLocationWindow({
			title: 'Add New Location'
		});
		
		//On window show
		win.form.down('*[name=customer_id]').setValue(this.customerLookup.getRealValue());
		win.form.down('textfield[name=name1]').setValue(this.locationLookup.getRawValue());
		win.form.down('textfield[name=name1]').focus(true, 50);
		
		//On success
		win.form.on('success', function(form, action){
			var result = action.result;
			var record = result.record;
			win.destroy();
			
			//Set the location and auto select the correct record
			this.locationLookup.enable();

			this.locationLookup.loadFromStore({
				location_id: record.location_id
			});

			this.locationLookup.store.proxy.extraParams.to_id = this.customerLookup.getValue();
		}, this);
		
		//return the window
		return win;
	},
	
	createCustomerWindow: function(config){
		var customerForm = Ext.create('TMS.customer.forms.Form', {
			scope: this,
			isPayTo:this.isPayTo,
			plugins:[Ext.create('TMS.form.plugin.StatusBar')]
		});
		
		customerForm.customerName.setValue(this.customerLookup.getRawValue());
		
		var win = Ext.create('TMS.ActionWindow', Ext.apply({
			scope: this,
			modal: true,
			layout: 'fit',
			form: customerForm,
			items:[customerForm],
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
	},
	
	createLocationWindow: function(config){
		var locationForm = Ext.create('TMS.location.forms.Form', {
			scope: this,
			plugins: [Ext.create('TMS.form.plugin.StatusBar')],
			customer_id: this.customerLookup.getValue()
		});
		var win = Ext.create('TMS.ActionWindow', Ext.apply({
			scope: this,
			modal: true,
			minHeight:400,
			layout: 'fit',
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
Ext.define('TMS.contacts.forms.sections.ContactInformation', {
	extend:'Ext.panel.Panel',
	
	//Requires
	requires:[
		'TMS.contacts.forms.sections.ContactMethods',
		'TMS.contacts.forms.sections.ContactInterval'
	],
	
	//Config
	icon: '/resources/icons/contact-info-24.png',
	border: false,
	layout:{
		type: 'hbox',
		align: 'stretch'
	},
	autoSave: false,
	contact_id: 0,
	
	initComponent: function(){
		this.items = this.items || [];
		this.dockedItems = this.dockedItems || [];
		this.init();
		this.callParent(arguments);
	},
	
	init: function() {
		this.initContactMethods();
		this.initContactInterval();
	},
	
	initContactMethods: function(){
		this.contactMethods = Ext.create('TMS.contacts.forms.sections.ContactMethods', {
			scope: this,
			title: 'Methods',
			baseTitle: 'Methods',
			flex: 1,
			contact_id: this.contact_id,
			autoSave: this.autoSave
		});
		this.items.push(this.contactMethods);
	},
	
	initContactInterval: function(){
		this.contactInterval = Ext.create('TMS.contacts.forms.sections.ContactInterval', {
			title: 'Interval',
			flex: 1,
			call_interval:14,
			email_interval:14,
			disabled: true,
			contact_id: this.contact_id,
			autoSave: this.autoSave
		});
		this.items.push(this.contactInterval);
	}
});
Ext.define('TMS.contacts.forms.sections.ContactInterval', {
	extend:'TMS.form.Abstract',
	requires:[
		'TMS.ActionWindow'
	],
	
	bodyStyle:{
		padding:'10px'
	},
	title:'Contact Intervals (in days)',
	processingPage:'/at-ajax/modules/contact/process/',
	url:'/at-ajax/modules/contact/process/save-contact-interval',
	contact_id:0,
	autoSave:false,
	isLoaded:false,
	
	initComponent: function(){
		this.items = [];
		this.addEvents('recordload');
		this.init();
		this.callParent(arguments);
	},
	
	init: function() {
		this.initCall();
		this.initEmail();
		this.initVisit();
		this.initHidden();
		
		if (!this.contact_id) {
			this.nextCallField.disable();
			this.nextEmailField.disable();
			this.nextVisitField.disable();
		}
		
		this.initListeners();
		this.getContactData(this.contact_id);
	},
	
	initCall: function() {
		
		this.callInterval = Ext.create('Ext.form.field.Text', {
			border:false,
			fieldLabel:'Call',
			labelWidth:60,
			width:100,
			name:'call_interval',
			value:this.call_interval || 0
		});
		
		this.nextCallField = Ext.create('Ext.form.field.Date', {
			fieldLabel:'Next Action',
			name:'next_call',
			margin:'0 0 0 10',
			minValue:new Date()
		});
		
		this.callPanel = Ext.create('Ext.panel.Panel', {
			layout:'hbox',
			items:[
				this.callInterval,
				this.nextCallField
			],
			border:false
		});
		
		this.items.push(this.callPanel);
	},
	
	initEmail: function() {
		
		this.emailInterval = Ext.create('Ext.form.field.Text', {
			border:false,
			fieldLabel:'Email',
			labelWidth:60,
			width:100,
			name:'email_interval',
			value:this.email_interval || 0
		});
		
		this.nextEmailField = Ext.create('Ext.form.field.Date', {
			fieldLabel:'Next Action',
			name:'next_email',
			margin:'0 0 0 10',
			minValue:new Date()
		});
		
		this.emailPanel = Ext.create('Ext.panel.Panel', {
			layout:'hbox',
			items:[
				this.emailInterval,
				this.nextEmailField
			],
			border:false
		});
		
		this.items.push(this.emailPanel);
	},
	
	initVisit: function() {
		
		this.visitInterval = Ext.create('Ext.form.field.Text', {
			border:false,
			fieldLabel:'Visit',
			labelWidth:60,
			width:100,
			name:'visit_interval',
			value:this.visit_interval || 0
		});
		
		this.nextVisitField = Ext.create('Ext.form.field.Date', {
			fieldLabel:'Next Action',
			name:'next_visit',
			margin:'0 0 0 10',
			minValue:new Date()
		});
		
		this.visitPanel = Ext.create('Ext.panel.Panel', {
			layout:'hbox',
			items:[
				this.visitInterval,
				this.nextVisitField
			],
			border:false
		});
		
		this.items.push(this.visitPanel);
	},
	
	initHidden: function() {
		this.contactIdField = Ext.create('Ext.form.field.Hidden', {
			name:'contact_id',
			value:this.contact_id
		});
		this.items.push(this.contactIdField);
	},
	
	initListeners: function() {
		this.callInterval.on('change', this.save, this, {
			buffer:500
		});
		this.emailInterval.on('change', this.save, this, {
			buffer:500
		});
		this.visitInterval.on('change', this.save, this, {
			buffer:500
		});
		
		this.nextCallField.on('select', function(field, value) {
			this.save();
		}, this);
		this.nextEmailField.on('select', function(field, value) {
			this.save();
		}, this);
		this.nextVisitField.on('select', function(field, value) {
			this.save();
		}, this);
		
	},
	
	getContactData: function(contact_id) {
		this.contact_id = contact_id;
		if (this.contact_id) {
			Ext.Ajax.request({
				scope:this,
				method:'post',
				url:this.processingPage + 'get-contact-interval-data',
				params:{
					contact_id:this.contact_id
				},
				success: function(r) {
					var response = Ext.decode(r.responseText);
					var record = response.record;
					this.fireEvent('recordload', this, record);
					this.getForm().setValues(record);
					
					if (record.now > record.next_call_ts) {
						this.nextCallField.disable();
					}
					if (record.now > record.next_email_ts) {
						this.nextEmailField.disable();
					}
					if (record.now > record.next_visit_ts) {
						this.nextVisitField.disable();
					}
					
					
					setTimeout(Ext.bind(function() {
						this.isLoaded = true;
					}, this), 500);
				}
			});
		}
	},
	
	save: function() {
		if (this.autoSave && this.contact_id && this.isLoaded) {
			this.submit();
		}
	},
	
	setDueDate: function() {
		this.dateWindow = Ext.create('TMS.ActionWindow', {
			title:'Select a new due date',
			width:null,
			height:null,
			items: [{
				scope:this,
				xtype:'datepicker',
				minDate: new Date(),
				handler: function(picker, date) {
					Ext.Ajax.request({
						scope:this,
						method:'post',
						url:this.processingPage + 'set-due-date',
						params:{
							contact_id:this.contact_id,
							field:field,
							date:date
						},
						success: function(r) {
							var response = Ext.decode(r.responseText);
							this.fireEvent('setdate');
						}
					});
					this.dateWindow.destroy();
				}
			}]
		});
	}
	
});
Ext.define('TMS.contacts.forms.sections.ContactMethodRow', {
	extend:'Ext.panel.Panel',
	
	autoHeight:true,
	layout:'hbox',
	border:false,
	defaults:{
		border:false
	},
	store:false,
	
	initComponent: function() {
		this.items = this.items || [];
		this.init();
		this.callParent(arguments);
	},
	
	init: function() {
		this.initContactMethodSelector();
		this.initMethodField();
		this.initButton();
		this.initListeners();
	},
	
	initContactMethodSelector: function() {
		this.contactMethodSelector = Ext.create('Ext.ux.form.field.RealComboBox', {
			flex:1,
			valueField:'method_id',
			displayField:'method_type',
			store: this.store,
			queryMode: 'local',
			editable:false,
			margin:'2'
		});
		this.items.push(this.contactMethodSelector);
	},
	
	initMethodField: function() {
		this.contactMethodField = Ext.create('Ext.form.field.Text', {
			flex:1,
			xtype: 'textfield',
			margin:'2',
			itemId:'method_data',
			enableKeyEvents:true
		});
		this.items.push(this.contactMethodField);
	},
	
	initButton: function() {
		this.button = Ext.create('Ext.button.Button', {
			margin:'2',
			icon:'/resources/icons/delete-16.png',
			width:24,
			scope:this,
			handler:function(button) {
				// remove if not the last one
				button.ownerCt.destroy();
			}
		});
		this.items.push(this.button);
	},
	
	initListeners: function() {
		
	}
	
});
Ext.define('TMS.contacts.forms.sections.ContactMethods', {
	extend:'TMS.form.Abstract',
	requires:[
		'Ext.ux.form.field.RealComboBox',
		'TMS.contacts.forms.sections.ContactMethodRow'
	],
	
	title:'Contact Methods',
	baseTitle:'Contact Methods',
	bodyStyle:{
		padding:'8px'
	},
	processingPage:'/at-ajax/modules/contact/process/',
	url:'/at-ajax/modules/contact/process/save-contact-methods',
	contact_id:0,
	
	autoSave:false,
	
	initComponent: function(){
		this.items = [];
		this.addEvents('save', 'recordload');
		this.init();
		this.callParent(arguments);
	},
	
	init: function() {
		this.initHidden();
		this.initListeners();
		this.initStore();
		this.loadRecord();
	},
	
	initHidden: function() {
		this.contactIdField = Ext.create('Ext.form.field.Hidden', {
			name:'contact_id',
			value:this.contact_id
		});
		this.items.push(this.contactIdField);
	},
	
	initListeners: function() {
		this.on('add', this.itemAdded, this, {buffer:500});
		this.on('remove', this.itemRemoved, this, {buffer: 1000});
		this.on('beforesubmit', function(form){
			if(!this.rendered){
				return;
			}
			
			var rows = this.getRows();
			var numRows = rows.length;
			var types = [];
			var data = [];
			
			for (var i = 0; i < numRows; i++) {
				types.push(rows[i].contactMethodSelector.getValue());
				data.push(rows[i].contactMethodField.getValue());
				
				rows[i].contactMethodSelector.name = 'contact_method_type_' + i;
				rows[i].contactMethodField.name =  'contact_method_data_' + i;
			}
			
			this.contactIdField.setValue(this.contact_id);
			form.setParam('contact_method_types', Ext.encode(types));
			form.setParam('contact_method_data', Ext.encode(data));
		}, this);
	},
	
	getEmail: function() {
		var email = false;
		var rows = this.getRows();
		var numRows = rows.length;
		for (var i = 0; i < numRows; i++) {
			if (rows[i].contactMethodSelector.getRawValue() == 'Email') {
				return rows[i].contactMethodField.getValue();
			}
		}
	},
	
	initStore: function() {
		this.contactMethodStore = Ext.create('Ext.data.Store', {
			fields: [
				'method_id',
				'method_type',
				'method_group_id'
			],
			proxy: {
				type: 'ajax',
				url: this.processingPage + 'get-contact-method-types',
				reader: {
					type: 'json',
					root: 'records'
				}
			}
		});
		
		this.contactMethodStore.load();
	},
	
	selectFirst: function(combobox) {
		if (combobox && combobox.store) {
			var record = combobox.store.getAt(0);
			if (record) {
				combobox.setValue(record.get('method_id'));
			}
		}
	},
	
	getFirstUnusedIndex: function(combobox) {
		var indexToSelect = 0;
		
		// Loop through existing selections and store the currently used ids
		var existingIds = [];
		var items = this.getRows();
		for (var i = 0; i < items.length - 1; i++) {
			var subItem = items[i].items.items[0];
			var typeId = subItem.getValue();
			existingIds.push(typeId);
		}

		// Loop through records and find the first one that isnt in use
		var records = combobox.store.data.items;
		var numRecords = records.length;
		for (var i = 0; i < numRecords; i++) {
			if (existingIds.indexOf(records[i].data.method_id) == -1) {
				indexToSelect = i;
				break;
			}
		}
		
		return indexToSelect;
	},
	
	selectFirstUnused: function(combobox) {
		if (combobox && combobox.store) {
			var record = combobox.store.getAt(this.getFirstUnusedIndex(combobox));
			combobox.setValue(record.get('method_id'));
		}
	},
	
	addContactMethod: function() {
		
	},
	
	createRow: function() {
		var rowPanel = Ext.create('TMS.contacts.forms.sections.ContactMethodRow', {
			store:this.contactMethodStore
		});
		
		rowPanel.contactMethodField.on('keyup', function(textfield) {
			if (textfield.getValue().length) {
				var fields = this.query('#method_data');
				var lastField = fields[fields.length-1];
				if (lastField.getValue().length) {
					// add another field
					var newRow = this.createRow();
					this.add(newRow);
					this.selectFirstUnused(newRow.contactMethodSelector);
				}
			}
		}, this);
		
		rowPanel.contactMethodField.on('change', function(textfield) {
			if (!textfield.getValue().length) {
				var fields = this.query('#method_data');
				var lastField = fields[fields.length-1];
				if (textfield != lastField) {
					textfield.ownerCt.destroy();
				}
			}
			this.save();
		}, this, {buffer: 700 });
		
		return rowPanel;
	},
	
	loadRecord: function(contact_id, name) {
		this.contact_id = contact_id || this.contact_id;
		var newTitle = this.baseTitle;
		if (name != null && this.baseTitle.length) {
			newTitle = this.baseTitle + ' - ' + name;
		}
		
		if (this.rendered) {
			this.setTitle(newTitle);
		}
		else {
			this.title = newTitle;
		}
		
		if (this.contactMethodStore.isLoading()) {
			this.contactMethodStore.on('load', function() {
				this.loadRecord();
			}, this);
		}
		else {
			if (this.contact_id) {
				this.setLoading(true);
				Ext.Ajax.request({
					scope:this,
					method:'post',
					url:this.processingPage + 'get-contact-method-data',
					params:{
						contact_id:this.contact_id
					},
					success: function(r) {
						this.setLoading(false);
						var response = Ext.decode(r.responseText);
						var records = response.records;
						this.fireEvent('recordload', this, records);
						
						// remove old rows - need to suspend events so this remove doesn't trigger for a previous contact
						this.suspendEvents();
						this.destroyRows();
						this.resumeEvents();
						
						// loop through all contact method records and make a row for each
						for (var i = 0; i < records.length; i++) {
							var panel = this.createRow();
							panel.contactMethodSelector.setValue(records[i].method_id);
							panel.contactMethodField.setRawValue(records[i].contact_value_1);
							this.add(panel);
						}
						// add another field
						var newRow = this.createRow();
						this.add(newRow);
						this.selectFirst(newRow.contactMethodSelector);
					}
				});
			}
			else {
				var newRow = this.createRow();
				this.add(newRow);
				this.selectFirst(newRow.contactMethodSelector);
			}
		}
	},
	
	destroyRows: function() {
		Ext.each(this.query('> .panel'), function(el){
			el.destroy();
		});
	},
	
	itemAdded: function(panel, item, options) {
		var rows = this.query('> .panel');
		this.manageRemoveButtons(rows);
	},
	
	
	itemRemoved: function(panel, item, options) {
		// Get all rows
		var rows = this.query('> .panel');
		if (rows.length) {
			this.manageRemoveButtons(rows);
			this.save();
		}
	},
	
	manageRemoveButtons: function(rows) {
		if (rows.length) {
			for (var i = 0; i < rows.length-1; i++) {
				rows[i].down('.button').enable();
			}
			rows[rows.length-1].down('.button').disable();
		}
	},
	
	getRows: function() {
		return this.query('> .panel');
	},
	
	save: function() {
		if (this.contact_id && this.autoSave) {
			this.submit();
		}
	}
	
});
Ext.define('TMS.contacts.forms.sections.Email', {
	extend:'TMS.form.Abstract',
	
	//Requires
	requires:[
	],
	
	//Config
	bodyStyle:{
		padding:'8px'
	},
	url:'/at-ajax/modules/contact/process/send-email',
	layout: {
		type: 'vbox',
		align: 'stretch'
	},
	contact_id: 0,
	contactMethodsUrl: '/at-ajax/modules/contact/process/get-contact-method-data',

	
	initComponent: function(){
		this.items = [];
		this.init();
		this.callParent(arguments);
	},
	
	init: function() {
		this.initHidden();
		this.initEmail();
		this.initSubject();
		this.initMessage();
		this.loadData();
	},
	
	loadData: function(){
		if(this.contact_id){
			Ext.Ajax.request({
				scope:this,
				method:'post',
				url: this.contactMethodsUrl,
				params:{
					contact_id: this.contact_id
				},
				success: function(r) {
					var response = Ext.decode(r.responseText);
					var records = response.records;
					var emails = [];
					Ext.each(records, function(record){
						if(record.method_type == "Email"){
							emails.push({
								email: record.contact_value_1
							});
						}
					}, this);
					this.emailStore.loadData(emails);
					if(emails.length){
						this.emailSelect.select(this.emailStore.getAt(0));
					}
					else{
						this.emailSelect.setValue('');
					}
				}
			});
		}
	},
	
	initHidden: function(){
		this.items.push({
			xtype: 'hidden',
			name: 'contact_id',
			value: this.contact_id
		});
	},
	
	initEmail: function(){
		this.emailStore = Ext.create('Ext.data.Store', {
			fields:[
				'email'
			],
			proxy: {
				type: 'memory',
				reader: {
					type: 'json',
					root: 'records'
				}
			}
		});
		this.emailSelect = new Ext.form.field.ComboBox({
			scope: this,
			flex: 1,
			name: 'email',
			queryMode:'local',
			displayField: 'email',
			valueField:'email',
			store:this.emailStore
		});
		
		this.emailAdd = new Ext.button.Button({
			scope: this,
			text: 'Add Email',
			icon: '/resources/icons/add-16.png',
			margin: '0 0 0 4',
			handler: function(){
				var contactMethods = Ext.create('TMS.contacts.forms.sections.ContactMethods', {
					contact_id:this.contact_id,
					title: '',
					baseTitle: '',
					plugins: [
						Ext.create('TMS.form.plugin.StatusBar', {
							scope: this,
							items:[{
								text: 'Save',
								cls: 'submit',
								icon: '/resources/icons/save-16.png',
								handler: function(){
									contactMethods.submit();
								}
							}]
						})
					]
				});
				
				//Listeners
				contactMethods.on('success', function(){
					this.loadData();
				}, this);
				
				Ext.create('TMS.ActionWindow', {
					title: 'Contact Methods',
					layout: 'fit',
					items:[contactMethods]
				});
			}
		});
		
		//Create the email container
		this.emailContainer = Ext.create('Ext.form.FieldContainer', {
			scope: this,
			fieldLabel: 'Email',
			combineErrors: true,
			layout: 'hbox',
			defaults: {
				hideLabel: true
			},
			items:[
				this.emailSelect,
				this.emailAdd
			]
		});
		
		this.items.push(this.emailContainer);
	},
	
	initSubject: function(){
		this.subject = new Ext.form.field.Text({
			scope: this,
			name: 'subject',
			fieldLabel: 'Subject'
		});
		this.items.push(this.subject);
	},
	
	initMessage: function(){
		this.message = Ext.create('Ext.form.HtmlEditor', {
			name: 'message',
			flex: 1,
			allowBlank: false,
			value: '&nbsp;'
		});
		this.items.push(this.message);
	}
});
Ext.define('TMS.contacts.forms.sections.GeneralInformation', {
	extend:'TMS.form.Abstract',
	requires:[
		'Ext.ux.form.field.RealComboBox',
		'TMS.contacts.lookup.Contact'
	],
	title:'General Information',
	icon: '/resources/icons/general-info-24.png',
	processingPage:'/at-ajax/modules/contact/process/',
	url:'/at-ajax/modules/contact/process/save-contact',
	contact_id:0,
	
	fieldValues:{},
	layout:{
		type: 'hbox',
		align: 'stretch'
	},
	
	autoSave:false,
	
	initComponent: function(){
		this.items = [];
		this.addEvents('recordload');
		this.init();
		this.callParent(arguments);
	},
	
	init: function() {
		this.initListeners();
		this.loadRecord();
		
		this.initLeftContainer();
		this.initRightContainer();
		
		if (this.contact_id) {
			this.initOtherContactsPanel();
		}
		else {
			this.initSimilarPanel();
		}
		this.initFields();
	},
	
	initListeners: function() {
		
	},
	
	loadRecord: function(contact_id) {
		this.contact_id = contact_id || this.contact_id;
		if (this.contact_id) {
			Ext.Ajax.request({
				scope:this,
				method:'post',
				url:this.processingPage + 'get-contact-data',
				params:{
					contact_id:this.contact_id
				},
				success: function(r) {
					var response = Ext.decode(r.responseText);
					this.record = response.record;
					this.fireEvent('recordload', this, this.record);
					this.setData();
				}
			});
		}
	},
	
	setData: function(data) {
		if (this.typeStore.isLoading()) {
			this.typeStore.on('load', function() {
				this.setData();
			}, this);
		}
		else {
			this.down('#contact_type_id').setValue(this.record.contact_type_id);
			this.down('#contact_type_id').disable();
			this.down('#contact_name').setValue(this.record.contact_name);
			this.down('#contact_title').setValue(this.record.contact_title);
			// if customer, show the status
			if (this.record.contact_type_id == 2) {
				this.down('#status_id').show();
				if (this.statusTypeStore.isLoading()) {
					this.statusTypeStore.on('load', function() {
						this.down('#status_id').suspendEvents();
						this.down('#status_id').setValue(this.record.status_id);
						this.down('#status_id').resumeEvents();
					}, this);
				}
				else {
					this.down('#status_id').suspendEvents();
					this.down('#status_id').setValue(this.record.status_id);
					this.down('#status_id').resumeEvents();
				}
			}
		}
	},
	
	focusField: function(el) {
		this.fieldValues[el.id] = el.getValue();
	},
	
	blurField: function(el) {
		if (this.fieldValues[el.id] != null) {
			if (this.fieldValues[el.id] != el.getValue()) {
				this.save();
			}
		}
	},
	
	initLeftContainer: function(){
		this.leftContainer = new Ext.panel.Panel({
			scope: this,
			layout: 'anchor',
			autoHeight: true,
			flex: 1,
			border: false,
			bodyPadding: 10,
			defaults: {
				anchor: '98%'
			}
		});
		this.items.push(this.leftContainer);
	},
	
	initRightContainer: function(){
		this.rightContainer = new Ext.panel.Panel({
			cls: 'similar-contacts-panel',
			layout: 'anchor',
			bodyPadding: 5,
			scope: this,
			frame: false,
			flex: 1,
			autoScroll: true,
			height: 200,
			bodyStyle:{
				'border-right': '0px',
				'border-top': '0px',
				'border-bottom': '0px'
			},
			defaults:{
				anchor: '98%'
			}
		});
		this.items.push(this.rightContainer);
	},
	
	initFields: function() {
		this.typeStore = Ext.create('Ext.data.Store', {
			fields: [
				'type_id',
				'type_name'
			],
			proxy: {
				type: 'ajax',
				url: this.processingPage + 'get-contact-types',
				reader: {
					type: 'json',
					root: 'records'
				}
			}
		});
		
		this.typeStore.on('load', function(store, records){
			if(records.length == 1){
				this.typeSelector.select(records[0]);
			}
		}, this);
		
		this.typeStore.load();
		
		this.typeSelector = Ext.create('Ext.ux.form.field.RealComboBox', {
			store:this.typeStore,
			displayField:'type_name',
			valueField:'type_id',
			hiddenName:'contact_type_id',
			fieldLabel:'Contact Type',
			queryMode:'local',
			editable:false,
			itemId:'contact_type_id',
			id:'contact_type_id',
			name:'contact_type_id',
			allowBlank: false,
			listeners:{
				scope:this,
				change:function(el, value) {
					if (value == 2) {
						this.down('#status_id').show();
					}
					else {
						this.down('#status_id').hide();
					}
				}
			}
		});
		this.leftContainer.add(this.typeSelector);
		
		this.typeSelector.on('change', function(){
			this.nameField.enable();
			this.titleField.enable();
		}, this, { single: true });
		
		this.nameField = this.leftContainer.add({
			xtype:'textfield',
			plugins:[
				Ext.create('TMS.form.plugin.Help',
					'This is the first name, and last name of the contact.'
				)
			],
			border:false,
			fieldLabel:'Name',
			name:'contact_name',
			itemId:'contact_name',
			enableKeyEvents: true,
			allowBlank: false,
			listeners:{
				scope:this,
				focus:this.focusField,
				blur:this.blurField
			},
			disabled: true
		});
		
		this.titleField = this.leftContainer.add({
			xtype:'textfield',
			border:false,
			fieldLabel:'Title',
			name:'contact_title',
			itemId:'contact_title',
			listeners:{
				scope:this,
				focus:this.focusField,
				blur:this.blurField
			},
			disabled: true
		});
		
		this.statusTypeStore = Ext.create('Ext.data.Store', {
			fields: [
				'status_id',
				'status_name'
			],
			proxy: {
				type: 'ajax',
				url: this.processingPage + 'get-contact-status-types',
				reader: {
					type: 'json',
					root: 'records'
				}
			}
		});
		this.statusTypeStore.load();
		this.leftContainer.add({
			xtype:'realcombobox',
			plugins:[
				Ext.create('TMS.form.plugin.Help',
					'<ul>' +
						'<li><b>Cold: </b>Location is unknown, new contact.' +
						'<li><b>Warm: </b> May pssibly do business with this person.' +
						'<li><b>Hot: </b> Required to do business with this person, ready to book a load.' +
					'</ul>'
				)
			],
			store:this.statusTypeStore,
			displayField:'status_name',
			valueField:'status_id',
			hiddenName:'status_id',
			fieldLabel:'Status',
			queryMode:'local',
			editable:false,
			itemId:'status_id',
			name:'status_id',
			hidden:true,
			listeners:{
				scope:this,
				change:function(combobox, newValue, oldValue) {
					if (newValue != null) {
						this.save();
					}
				}
			}
		});
		
		this.contactIdField = Ext.create('Ext.form.field.Hidden', {
			name:'contact_id',
			value:this.contact_id
		});
		this.items.push(this.contactIdField);
	},
	
	initSimilarPanel: function(){
		this.similarStore = new Ext.data.Store({
			fields: [
				'name',
				'location',
				'owner'
			],
			proxy: {
				type: 'ajax',
				url: this.processingPage + 'get-similar',
				reader: {
					type: 'json',
					root: 'records'
				}
			}
		});
		
		this.similarTemplate = new Ext.XTemplate(
			'<div class="similar-contacts-container">',
				'<tpl for=".">',
					'<div class="similar-contact">',
						'<div class="name-location">',
							'<span class="name">{name}</span>',
							'<tpl if="location.length">',
								'<span class="at"> at</span> <span class="location">{location}</span>',
							'</tpl>',
						'</div>',
						'<tpl if="owner.length">',
							'<div class="owner">owned by {owner}</div>',
						'</tpl>',
					'</div>',
				'</tpl>',
			'</div>'
		);
		
		this.similarView = new Ext.view.View({
			scope: this,
			store: this.similarStore,
			tpl: this.similarTemplate,
			autoHeight: true,
			multiSelect: false,
            trackOver: true,
			deferEmptyText:false,
            overItemCls: 'similar-contact-over',
            itemSelector: '.similar-contact',
            emptyText: 'No similar contacts...'
		});
		
		this.similarView.on('refresh', function(store, records){
			this.doLayout();
		}, this);
		
		this.on('afterrender', function(){
			var nameField = this.down('#contact_name');
			var contactTypeField = this.typeSelector;
			
			//Setup listeners for the contact type
			contactTypeField.on('change', function(field, value, oldValue){
				if(value == oldValue){
					return false;
				}
				this.similarStore.proxy.extraParams.contactTypeId = value;
				if(this.similarStore.proxy.extraParams.query != null && this.similarStore.proxy.extraParams.query.length){
					this.similarStore.load();
				}
				
			}, this);
			
			//Set up listeners for the name field
			nameField.on('keyup', function(field, event, options){
				this.similarStore.proxy.extraParams.query = field.getValue();
				this.similarStore.load();
			}, this, {buffer: 250});
		}, this);
		
		
		this.rightContainer.setTitle('Similar Contacts');
		this.rightContainer.add(this.similarView);
	},
	
	initOtherContactsPanel: function() {
		this.otherContactSelector = Ext.create('TMS.contacts.lookup.Contact', {
			anchor: '98%',
			hideTrigger:false
		});
		this.otherContactSelector.on('select', function(field, records) {
			if (records && records.length) {
				var record = records[0];
				var contactId = record.data.contact_id;
				var url = '/contacts/?d=contacts&a=view&id=' + contactId;
				this.otherContactSelector.setRawValue('');
				window.open(url, '_blank');
			}
		}, this);
		
		this.otherContactSelector.store.proxy.url = '/at-ajax/modules/contact/lookup/other-contacts';
		this.otherContactSelector.store.proxy.extraParams.contact_id = this.contact_id;
		this.otherContactSelector.store.load();
		
		this.rightContainer.setTitle('Other Customer Contacts');
		this.rightContainer.add(this.otherContactSelector);
	},
	
	save: function() {
		if (this.contact_id && this.autoSave) {
			this.submit();
		}
	}
	
});
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
Ext.define('TMS.contacts.forms.sections.PayTo', {
	extend:'TMS.form.Abstract',
	
	//Requires
	requires:[
		'Ext.ux.form.field.RealComboBox',
		'TMS.customer.lookup.Customer',
		'TMS.location.lookup.Location'
	],
	
	//Config
	carrier_id:0,
	loadedCarrierId:0,
	pay_to_location_id:0,
	bodyStyle:{
		padding:'8px'
	},
	url: '/at-ajax/modules/carrier/process/save-pay-to',
	processingPage:'/at-ajax/modules/carrier/process/',
	title:'Pay To',
	baseTitle:'Pay To',
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
		this.initCustomerSelector();
		this.initLocationSelector();
		this.initListeners();
		this.load(this.carrier_id);
	},
	
	initCustomerSelector: function() {
		this.customerSelector = Ext.create('TMS.customer.lookup.Customer', {
			fieldLabel:'Company',
			proxyParams:{
				isPayTo:1
			}
		});
		this.items.push(this.customerSelector);
	},
	
	initLocationSelector: function() {
		this.locationSelector = Ext.create('TMS.location.lookup.Location', {
			fieldLabel:'Location',
			type:'customer'
		});
		this.items.push(this.locationSelector);
	},
	
	initListeners: function() {
		this.customerSelector.on('select', function(field, records) {
			if(!records.length){
				this.locationSelector.disable();
				return false;
			}
			this.locationSelector.enable();
			var record = records[0];
			this.locationSelector.setRawValue('');
			this.locationSelector.setValue(0);
			this.locationSelector.store.proxy.extraParams.to_id = record.get('customer_id');
			this.locationSelector.store.load();
			this.locationSelector.focus(true, 50);
		}, this);
		
		this.locationSelector.on('select', function(field, records) {
			var record = records[0];
			this.pay_to_location_id = record.get('location_id');
			this.save();
		}, this);
		
		this.on('beforesubmit', function(form){
			form.setParams({
				carrier_id:this.carrier_id,
				pay_to_location_id:this.pay_to_location_id
			});
		}, this);
	},
	
	save: function() {
		if (this.carrier_id && this.pay_to_location_id) {
			this.submit();
		}
	},
	
	load: function(carrier_id) {
		this.carrier_id = carrier_id;
		
		if (this.carrier_id && this.carrier_id != this.loadedCarrierId) {

			Ext.Ajax.request({
				scope:this,
				method:'post',
				url:this.processingPage + 'get-pay-to-data',
				params:{
					carrier_id:this.carrier_id
				},
				success: function(r) {
					var response = Ext.decode(r.responseText);
					if (response.success) {
						this.loadedCarrierId = this.carrier_id;
						var addedRecords = this.customerSelector.store.add({
							customer_id: response.data.customer_id,
							customer_name: response.data.customer_name
						});
						
						//Select customer record
						this.customerSelector.suspendEvents(false);
						this.customerSelector.select(addedRecords[0]);
						this.customerSelector.resumeEvents();
						
						
						//Select location record
						addedRecords = this.locationSelector.store.add({
							location_id: response.data.location_id,
							location_display: response.data.location_name
						});
						this.locationSelector.select(addedRecords[0]);
						
						//Set the title
						this.setTitle(this.baseTitle + ' for ' + response.data.forCarrierName);
					}
					else {
						this.customerSelector.setValue(0);
						this.customerSelector.setRawValue('');
						this.locationSelector.setValue(0);
						this.locationSelector.setRawValue('');
					}
				}
			});
		}
	}
	
});
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
Ext.define('TMS.contacts.forms.sections.Release', {
	extend:'TMS.ActionWindow',
	
	//Requires
	requires:[
		'TMS.contacts.forms.sections.Transfer'
	],
	
	//Config
	title:'Confirm Release',
	processingPage:'/at-ajax/modules/contact/process/',
	contact_id:0,
	defaultText:'',
	bodyPadding: 10,
	sizePercent: 0.2,
	minSize: 200,
	
	init: function() {
		this.on('afterrender', this.getContactInfo, this);
		this.initButtons();
	},
	
	getContactInfo: function() {
		setTimeout(Ext.bind(function(){
			this.setLoading(true);
		}, this), 200);
		
		Ext.Ajax.request({
			scope:this,
			method:'post',
			url:this.processingPage + 'get-contact-data',
			params:{
				contact_id:this.contact_id
			},
			success: function(r) {
				this.setLoading(false);
				var response = Ext.decode(r.responseText);
				this.response = response;
				this.defaultText = '<p>Are you sure you want to release ' + response.record.contact_name + '?</p>';
				this.update(this.defaultText);
			}
		});
	},
	
	initButtons: function() {
		this.addBottomButton([{
			scope:this,
			text:'Cancel',
			scale: 'medium',
			icon: '/resources/icons/close-24.png',
			handler: function() {
				this.close();
			}
		},{
			scope:this,
			text:'Transfer Contact',
			scale: 'medium',
			icon: '/resources/icons/release-24.png',
			handler:this.transfer
		},{
			scope:this,
			text:'Release Restricted',
			scale: 'medium',
			icon: '/resources/icons/release-restricted-24.png',
			handler:function() {
				this.release(1)
			}
		},{
			scope:this,
			text:'Release Unrestricted',
			scale: 'medium',
			icon: '/resources/icons/release-unrestricted-24.png',
			handler:function() {
				this.release(0)
			}
		}]);
	},
	
	release: function(restricted) {
		this.setLoading(true);
		Ext.Ajax.request({
			scope:this,
			method:'post',
			url:this.processingPage + 'release',
			params:{
				contact_id:this.contact_id,
				restricted:restricted
			},
			success: function(r) {
				this.setLoading(false);
				var response = Ext.decode(r.responseText);
				if (response.success) {
					this.update(response.msg[0]);
					this.showCloseButton();
				}
				else {
					this.update(response.errorStr + this.defaultText);
				}
			}
		});
	},
	
	transfer: function() {
		Ext.create('TMS.contacts.forms.sections.Transfer', {
			contact_id:this.contact_id,
			title:'Confirm Transfer of ' + this.response.record.contact_name
		});
		this.close();
	}
	
});
Ext.define('TMS.contacts.forms.sections.Transfer', {
	extend:'TMS.ActionWindow',
	
	//Requires
	requires:[
		'TMS.user.lookup.User'
	],
	
	//Config
	title:'Confirm Transfer',
	processingPage:'/at-ajax/modules/contact/process/',
	contact_id:0,
	requested_by_id:0,
	defaultText:'',
	layout:'anchor',
	
	init: function() {
		if (this.requested_by_id) {
			this.on('afterrender', this.getContactInfo, this);
		}
		else {
			this.initUserSelector();
		}
		this.initButtons();
	},
	
	getContactInfo: function() {
		this.setLoading(true);
		Ext.Ajax.request({
			scope:this,
			method:'post',
			url:this.processingPage + 'get-transfer-data',
			params:{
				contact_id:this.contact_id,
				requested_by_id:this.requested_by_id
			},
			success: function(r) {
				this.setLoading(false);
				var response = Ext.decode(r.responseText);
				if (response.success) {
					this.defaultText = '<p>' + response.msg[0] + '</p>';
					this.update(this.defaultText);
				}
			}
		});
	},
	
	initUserSelector: function() {
		this.userSelector = Ext.create('TMS.user.lookup.User');
		this.userSelector.on('select', function(combobox, records) {
			var data = records[0].data;
			this.requested_by_id = data.user_id;
		}, this);
		
		this.items.push(this.userSelector);
	},
	
	initButtons: function() {
		this.addBottomButton({
			scope:this,
			text:'Cancel',
			handler: function() {
				this.close();
			}
		});
		
		if (this.requested_by_id) {
			this.addBottomButton({
				scope:this,
				text:'Deny Transfer',
				handler: this.deny
			});
		}
		
		this.addBottomButton({
			scope:this,
			text:'Transfer Contact',
			handler:this.transfer
		});
	},
	
	transfer: function() {
		this.setLoading(true);
		Ext.Ajax.request({
			scope:this,
			method:'post',
			url:this.processingPage + 'transfer-contact',
			params:{
				contact_id:this.contact_id,
				requested_by_id:this.requested_by_id
			},
			success: function(r) {
				this.setLoading(false);
				var response = Ext.decode(r.responseText);
				if (response.success) {
					this.fireEvent('taskcomplete');
					this.removeAll();
					this.update(response.msg[0]);
					this.showCloseButton();
				}
				else {
					this.update(response.errorStr);
				}
			}
		});
	},
	
	deny: function() {
		this.setLoading(true);
		Ext.Ajax.request({
			scope:this,
			method:'post',
			url:this.processingPage + 'deny-transfer-contact',
			params:{
				contact_id:this.contact_id,
				requested_by_id:this.requested_by_id
			},
			success: function(r) {
				this.setLoading(false);
				var response = Ext.decode(r.responseText);
				if (response.success) {
					this.fireEvent('taskcomplete');
					this.update(response.msg[0]);
					this.showCloseButton();
				}
				else {
					this.update(response.errorStr);
				}
			}
		});
	}
	
});
Ext.define('TMS.contacts.forms.Contact', {
	extend:'TMS.form.Navigation',
	
	requires:[
		'Ext.ux.form.field.RealComboBox',
		'TMS.contacts.forms.sections.GeneralInformation',
		'TMS.contacts.forms.sections.CompanyInformation',
		'TMS.contacts.forms.sections.CarrierInformation',
		'TMS.contacts.forms.sections.ContactInformation'
	],
	
	//Config
	title: 'Contacts',
	url: '/at-ajax/modules/contact/process/add',
	preloadCustomerId: 0,
	preloadCarrierId: 0,
	
	initComponent: function(){
		this.items = this.items || [];
		this.dockedItems = this.dockedItems || [];
		this.init();
		this.callParent(arguments);
	},
	
	init: function() {
		this.initButtons();
		this.initGeneralInformation();
		this.initContactInformation();
	},
	
	initButtons: function(){
		this.buttons = [{
			scope: this,
			text: 'Submit',
			icon: '/resources/icons/save-16.png',
			cls: 'submit',
			handler: function() {
				this.submit();
			}
		}];
	},
	
	initGeneralInformation: function() {
		this.generalInformation = Ext.create('TMS.contacts.forms.sections.GeneralInformation', {
			title:'General Information',
			border: true
		});
		this.items.push(this.generalInformation);
		
		// See if we need to preload a customer or carrier
		this.generalInformation.typeStore.on('load', function() {
			if (this.preloadCustomerId > 0) {
				this.generalInformation.typeSelector.setValue(2);
			}
			if (this.preloadCarrierId > 0) {
				this.generalInformation.typeSelector.setValue(3);
			}
		});
		
		//Determine which panel to show
		this.generalInformation.down('#contact_type_id').on('change', function(el, value) {
			var customerType = 2;
			var carrierType = 3;
			var billToType = 4;
			var payToType = 5;
			
			if(this.locationInformation != null){
				this.locationInformation.destroy();
			}
			if (value == customerType || value == billToType || value == payToType) {
				this.locationInformation = Ext.create('TMS.contacts.forms.sections.CompanyInformation', {
					scope: this,
					isPayTo:(value == payToType) ? 1 : 0
				});
				this.center.add(this.locationInformation);
				
				// Select the customer record if we need to preload one
				if (this.preloadCustomerId > 0) {
					this.locationInformation.customerLookup.store.on('load', function() {
						this.locationInformation.customerLookup.setValue(this.preloadCustomerId);
					}, this, {single:true});
					this.locationInformation.customerLookup.store.load({
						params:{
							customer_id: this.preloadCustomerId
						}
					});
				}
			}
			
			if (value == carrierType) {
				this.contactInterval.disable();
				this.locationInformation = Ext.create('TMS.contacts.forms.sections.CarrierInformation', {
					title:'Carrier Information'
				});
				this.center.add(this.locationInformation);
				
				if (this.preloadCarrierId > 0) {
					this.locationInformation.carrierLookup.store.on('load', function() {
						this.locationInformation.carrierLookup.setValue(this.preloadCarrierId);
					}, this, {single:true});
					this.locationInformation.carrierLookup.store.load({
						params:{
							carrier_id: this.preloadCarrierId
						}
					});
				}
			}
			if (value == customerType) {
				this.contactInterval.enable();
			}
			else {
				this.contactInterval.disable();
			}
			
		}, this);
	},
	
	initContactInformation: function(){
		this.contactInformation = Ext.create('TMS.contacts.forms.sections.ContactInformation', {
			scope: this,
			title: 'Contact Information'
		});
		this.items.push(this.contactInformation);
		
		//Backwards compatibility
		this.contactMethods = this.contactInformation.contactMethods;
		this.contactInterval = this.contactInformation.contactInterval;
		
		//Bind the forms
		this.bindForm(this.contactMethods);
		this.bindForm(this.contactInterval);
	}
});
Ext.define('TMS.contacts.forms.Update', {
	extend:'TMS.form.Navigation',
	
	//Requires
	requires:[
		'Ext.ux.form.field.RealComboBox',
		'TMS.contacts.forms.sections.Release',
		'TMS.contacts.forms.sections.GeneralInformation',
		'TMS.contacts.forms.sections.ContactInformation',
		'TMS.calendar.view.Small',
		'TMS.contacts.forms.sections.ModesEquipment',
		'TMS.contacts.forms.sections.BillTo',
		'TMS.documents.forms.sections.DocumentsRequired',
		'TMS.comment.forms.sections.Comments',
		'TMS.contacts.forms.sections.CompanyInformation',
		'TMS.documents.view.Interface',
		'TMS.orders.view.PreOrderFilteredGrid',
		'TMS.orders.view.FilteredGrid'
	],
	
	contact_id:0,
	
	//Config
	url: '/at-ajax/modules/contact/process/',
	
	initComponent: function(){
		this.items = this.items || [];
		this.dockedItems = this.dockedItems || [];
		this.init();
		
		this.callParent(arguments);
	},
	
	init: function() {
		this.initToolbar();
		this.initGeneralInformation();
		this.initContactInformation();
		this.initCalendar();
		
		this.initModesEquipmentPanel();
		this.initBillToPanel();
		this.initDocumentsRequiredPanel();
		
		this.initCommentsPanel();
		this.initCompanyInformation();
		this.initDocuments();
		this.initPreOrderGrid();
		this.initOrderGrid();
	},
	
	initToolbar: function() {
		this.releaseButton = Ext.create('Ext.button.Button', {
			scope:this,
			text:'Release',
			scale:'medium',
			icon:'/resources/icons/release-24.png',
			handler: function() {
				Ext.create('TMS.contacts.forms.sections.Release', {
					contact_id: this.contact_id
				});
			}
		});
		
		this.callButton = Ext.create('Ext.button.Button', {
			scope:this,
			text:'Call',
			scale:'medium',
			icon:'/resources/icons/phone-24.png',
			handler: function() {
				
			}
		});
		
		this.emailButton = Ext.create('Ext.button.Button', {
			scope:this,
			text:'Email',
			scale:'medium',
			icon:'/resources/icons/email-24.png',
			handler: function() {
				var email = this.contactMethodsPanel.getEmail();
				var form = Ext.create('TMS.contacts.forms.sections.Email', {
					contact_id: this.contact_id,
					plugins: [
						Ext.create('TMS.form.plugin.StatusBar', {
							scope: this,
							items:[{
								text: 'Send',
								cls: 'submit',
								icon: '/resources/icons/save-16.png',
								handler: function(){
									form.submit();
								}
							}]
						})
					]
				});
				Ext.create('TMS.ActionWindow', {
					title: 'Email',
					layout: 'fit',
					items:[form],
					form: form
				});
			}
		});
		
		this.topBar = Ext.create('Ext.toolbar.Toolbar', {
			dock:'top',
			items:[
				this.releaseButton,
				'-',
				this.callButton,
				'-',
				this.emailButton
			]
		});
		this.dockedItems.push(this.topBar);
	},
	
	initGeneralInformation: function() {
		
		this.generalInformation = Ext.create('TMS.contacts.forms.sections.GeneralInformation', {
			contact_id:this.contact_id,
			autoSave:true
		});
		
		this.generalInformation.on('recordload', function(panel, record) {
			this.setTitle(record.contact_name);
			
			if (record.contact_type_id == 2) {
				this.contactIntervalPanel.enable();
				this.modesEquipmentPanel.enable();
				
//				if ($roleId == UserRoles::Admin || $roleId == UserRoles::CreditAndCollections) {
				
				this.billToPanel.enable();
				this.documentsRequiredPanel.enable();
			}
		}, this);
		this.items.push(this.generalInformation);
	},
	
	initContactInformation: function(){
		this.contactInformation = Ext.create('TMS.contacts.forms.sections.ContactInformation', {
			scope: this,
			contact_id: this.contact_id,
			autoSave: true,
			title: 'Contact Information'
		});
		this.items.push(this.contactInformation);
		
		//Backwards compatibility
		this.contactMethodsPanel = this.contactInformation.contactMethods;
		this.contactIntervalPanel = this.contactInformation.contactInterval;
		
		//Bind the forms
		this.bindForm(this.contactMethodsPanel);
		this.bindForm(this.contactIntervalPanel);
	},
	
	initCalendar: function() {
		this.contactCalendarPanel = Ext.create('TMS.calendar.view.Small', {
			title: 'Contact Calendar',
			calendarConfig:{
				extraParams: {
					contact_id: this.contact_id
				}
			}
		});
		this.items.push(this.contactCalendarPanel);
	},
	
	initModesEquipmentPanel: function() {
		this.modesEquipmentPanel = Ext.create('TMS.contacts.forms.sections.ModesEquipment', {
			contact_id:this.contact_id,
			disabled:true
		});
		
		this.items.push(this.modesEquipmentPanel);
	},
	
	initBillToPanel: function() {
		this.billToPanel = Ext.create('TMS.contacts.forms.sections.BillTo', {
			contact_id:this.contact_id,
			autoSave:true,
			disabled:true
		});
		
		this.items.push(this.billToPanel);
				
	},
	
	initDocumentsRequiredPanel: function() {
		this.documentsRequiredPanel = Ext.create('TMS.documents.forms.sections.DocumentsRequired', {
			contact_id:this.contact_id,
			autoSave:true,
			disabled:true
		});
		
		this.items.push(this.documentsRequiredPanel);
	},
	
	initCommentsPanel: function() {
		this.commentsPanel = Ext.create('TMS.comment.forms.sections.Comments', {
			field_value: this.contact_id,
			type:'contact',
			cls: ''
		});
		
		this.items.push(this.commentsPanel);
	},
	
	initCompanyInformation: function() {
//		this.contactTypeId = Ext.get('contact_type_id').dom.value;
		this.contactTypeId = 2;
		this.companyInformation = Ext.create('TMS.contacts.forms.sections.CompanyInformation', {
			title: 'Company',
			contact_id: this.contact_id,
			isPayTo:(this.contactTypeId == 5) ? 1 : 0
		});
		
		this.companyInformation.customerLookup.on('change', function(field, value) {
			value = parseInt(value);
			if (isNaN(value)) {
				
			}
			else {
				
				this.customerDocumentsGrid.setExtraParams({
					customer_id:value
				});
				this.customerDocumentsGrid.setTitle(this.customerDocumentsGrid.baseTitle + ' for ' + field.getRawValue());
				this.customerDocumentsGrid.store.load();
			}
		}, this);
		
		this.items.push(this.companyInformation);
	},
	
	initDocuments: function(){
		this.documents = Ext.create('TMS.documents.view.Interface', {
			title: 'Documents'
		});
		this.items.push(this.documents);
		
		this.documents.on('minimize', function(){
			this.setActiveItem(this.documents);
			this.documents.doLayout();
		}, this);
	},
	
	initPreOrderGrid: function() {
		this.preOrderGrid = Ext.create('TMS.orders.view.PreOrderFilteredGrid', {
			title:'Quotes',
			gridConfig:{
				stateful: false,
				stateId: null
			},
			extraFilters:{
				ordered_by_id: this.contact_id
			}
		});
		this.items.push(this.preOrderGrid);
	},
	
	initOrderGrid: function() {
		this.orderGrid = Ext.create('TMS.orders.view.FilteredGrid', {
			gridConfig:{
				stateful: false,
				stateId: null
			},
			extraFilters:{
				ordered_by_id: this.contact_id
			}
		});
		this.items.push(this.orderGrid);
	}
	
});
Ext.ns('TMS.contacts.lookup.ContactTypes');
TMS.contacts.lookup.ContactTypes = {
	Contact: 'contact',
    Customer: 'customer',
    Carrier: 'carrier'
};

Ext.define('TMS.contacts.lookup.Contact', {
	extend: 'Ext.ux.form.field.RealComboBox',
	
	//Config
	type: TMS.contacts.lookup.ContactTypes.Contact,
	processingPage: '/at-ajax/modules/contact/lookup/contact',
	displayField: 'name',
	valueField: 'contact_id',
	emptyText: 'Search for contact...',
	typeAhead: false,
	hideTrigger:true,
	anchor: '100%',
	pageSize: 10,
	minChars: 0,
	listConfig: {
		loadingText: 'Searching...',
		emptyText: 'No matching contacts found.',

		// Custom rendering template for each item
		getInnerTpl: function() {
			return '{name}';
		}
	},
	params: {},
	
	constructor: function(){
		this.params = {};
		this.callParent(arguments);
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
				'contact_id',
				'first_name',
				'last_name',
				'name',
				'location_id'
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
				extraParams: Ext.apply(this.params, {
					type: this.type
				})
			}
		});
	},
	
	setParam: function(param, value){
		this.store.proxy.extraParams[param] = value;
	}
});
            
Ext.define('TMS.contacts.model.Status', {
    extend: 'Ext.data.Model',
    fields: [
        {name: 'status_id', type: 'int'},
        {name: 'status_name',  type: 'string'}
    ]
});
Ext.define('TMS.contacts.view.FilteredGrid', {
	extend: 'Ext.panel.Panel',
	requires:[
		'TMS.contacts.filter.Contact',
		'TMS.contacts.view.Grid'
	],
	
	layout:'border',
	height:500,
	title:'Contacts',
	
	initComponent: function(){
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
		this.filter = Ext.create('TMS.contacts.filter.Contact', {
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
		this.grid = Ext.create('TMS.contacts.view.Grid', {
			region: 'center',
			filter: this.filter
		});
		this.items.push(this.grid);
	}
	
});
Ext.define('TMS.contacts.view.FreeAgentsGrid', {
	extend: 'Ext.grid.Panel',
	requires:[
		'TMS.contacts.forms.sections.Claim'
	],
	
	//Config
	processingPage: '/at-ajax/modules/contact/process/get-free-agents-records',
	viewConfig: {
		stripeRows: true
	},
	title:'Free Agents',
	
	initComponent: function(){
		this.init();
		this.callParent(arguments);
	},
	
	//Init Functions
	init: function(){
		this.initListeners();
		this.initColumns();
		this.initStore();
		this.initPager();
	},
	
	initListeners: function(){
		this.on('afterrender', function(){
			this.store.load();
		}, this);
		
		this.on('itemdblclick', function(view, record){
			this.setLoading(true);
			location.href = Ext.String.format('/contacts/?d=contacts&a=view&id={0}', record.get('contact_id'));
		}, this);
	},
	
	initPager: function(){
		this.pager = new Ext.toolbar.Paging({
			store: this.store,
			displayInfo: true
		});
		this.tbar = this.pager;
	},
	
	initColumns: function(){
		this.columns = [{
			header: 'Contact Name',
			dataIndex: 'contact_name',
			flex: 1
		},{
			header: 'Title',
			dataIndex: 'title',
			flex: 1
		},{
			header: 'Customer',
			dataIndex: 'customer_name',
			flex: 1
		},{
			header: 'Restriction',
			dataIndex: 'restrictionDisplay',
			flex: 1
		},{
			header: 'Date',
			dataIndex: 'updated_at',
			flex: 1,
			xtype:'templatecolumn',
			tpl:'{dateDisplay}'
		},{
			header: 'Claim',
			dataIndex: 'contact_id',
			flex: 1,
			xtype:'templatecolumn',
			tpl:'<div class="rounded5 button box-right">' +
					'<a href="#" class="claim-button" id="claim-{contact_id}">Claim</a>' +
				'</div>'
		}];
	},
	
	initStore: function(){
		this.store = new Ext.data.Store({
			fields: [
				'contact_id',
				'contact_name',
				'title',
				'updated_at',
				'dateDisplay',
				
				'owner_name',
				
				'customer_id',
				'customer_name',
				
				'restrictionDisplay'
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
		
		this.store.on('load', function() {
			Ext.select('.claim-button').on('click', function(e, el) {
				e.preventDefault();
				var contact_id = el.id.split('-')[1];
				var claimWindow = Ext.create('TMS.contacts.forms.sections.Claim', {
					contact_id:contact_id
				});
				claimWindow.on('close', function() {
					this.store.load();
				}, this);
			}, this);
		}, this);
	}
	
});
Ext.define('TMS.contacts.view.Grid', {
	extend: 'TMS.grid.Grid',
	
	//Config
	processingPage: '/at-ajax/modules/contact/process/get',
	viewConfig: {
		stripeRows: true
	},
	
	initComponent: function(){
		this.dockedItems = this.dockedItems || [];
		this.init();
		this.callParent(arguments);
	},
	
	//Init Functions
	init: function(){
		this.addEvents('editrecord');
		
		this.initSelectionModel();
		this.initColumns();
		this.initStore();
		
		this.initActionBar();
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
	
	initActionBar: function() {
		this.topBar = Ext.create('Ext.toolbar.Toolbar', {
			dock:'top',
			items:[{
				scope:this,
				text:'Edit',
				icon:'/resources/icons/edit-24.png',
				scale:'medium',
				handler: function() {
					this.fireEvent('editrecord', this);
				}
			}]
		});
		this.dockedItems.push(this.topBar);
	},
	
	initSelectionModel: function() {
		this.selModel = Ext.create('Ext.selection.CheckboxModel');
	},
	
	initListeners: function(){
		this.on('afterrender', function(){
			this.store.load();
		}, this);
		
		this.on('itemdblclick', function(view, record){
			this.setLoading(true);
			location.href = Ext.String.format('/contacts/?d=contacts&a=view&id={0}', record.get('contact_id'));
		}, this);
	},
	
	initColumns: function(){
		this.columns = [{
			header: 'Name',
			dataIndex: 'contact_name',
			flex: 1,
			renderer: function(value, options, record){
				return Ext.String.format(
					'<a href="/contacts/?d=contacts&a=view&id={0}">{1}</a>',
					record.get('contact_id'),
					value
				);
			}
		},{
			header: 'Company',
			dataIndex: 'customer_name',
			flex: 1,
			xtype:'templatecolumn',
			tpl:'<a href="/customers/?d=customers&a=view&id={customer_id}">{customer_name}</a>'
		},{
			header: 'Status',
			dataIndex: 'status',
			flex: 1
		},{
			header: 'Next Action',
			dataIndex: 'next_action_date',
			flex: 1,
			xtype:'templatecolumn',
			tpl:'<tpl if="upToDate">' +
					'<span style="color:green;">{next_action_date_display}</span>' +
				'</tpl>' + 
				'<tpl if="!upToDate">' +
					'<span style="color:red;">{next_action_date_display}</span>' +
				'</tpl>'
		},{
			header: 'Owner',
			dataIndex: 'owner_name',
			flex: 1
		}];
	},
	
	initStore: function(){
		this.store = new Ext.data.Store({
			fields: [
				'contact_id',
				'contact_name',
				
				'customer_id',
				'customer_name',
				
				'status',
				'up_to_date',
				'next_action',
				'owner_name',
				'next_action_date',
				'next_action_date_display',
				'nextActionTs',
				'nowTs',
				'upToDate'
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
	}
});
Ext.define('TMS.contacts.view.Interface', {
	extend: 'Ext.tab.Panel',
	requires:[
		'TMS.contacts.view.FilteredGrid',
		'TMS.contacts.forms.Update'
	],
	
	//Config
	layout:'border',
	height:500,
	deferredRender:true,
	
	openTabs:{},
	
	initComponent: function(){
		this.items = this.items || [];
		this.plugins = this.plugins || [];
		this.init();
		this.callParent(arguments);
	},
	
	init: function() {
		this.initFilteredGrid();
		this.initListeners();
	},
	
	initFilteredGrid: function() {
		this.filteredGrid = Ext.create('TMS.contacts.view.FilteredGrid');
		this.items.push(this.filteredGrid);
	},
	
	initListeners: function() {
		this.filteredGrid.grid.on('editrecord', function(grid) {
			var selectedRecords = grid.selModel.getSelection();
			var numRecords = selectedRecords.length;
			if (numRecords) {
				var tabToShow = false;
				for (var i = 0; i < numRecords; i++) {
					if (this.openTabs[selectedRecords[i].data.contact_id]) {
						if (!tabToShow) {
							tabToShow = this.openTabs[selectedRecords[i].data.contact_id];
						}
					}
					else {
						var p = Ext.create('Ext.panel.Panel', {
							closable:true,
							title:selectedRecords[i].data.contact_name,
							layout:'fit'
						});
						p.on('afterrender', function(panel, options) {
							panel.setLoading();
							setTimeout(function(){
								panel.setLoading(false);
								panel.add(Ext.create('TMS.contacts.forms.Update', {
									contact_id:options.contact_id
								}));
							}, 100);
							this.openTabs[options.contact_id] = panel;
						}, this, {
							contact_id:selectedRecords[i].data.contact_id
						});
						p.on('close', function(panel, options) {
							this.openTabs[options.contact_id] = false;
						}, this, {
							contact_id:selectedRecords[i].data.contact_id
						});
						this.add(p);
						if (!tabToShow) {
							tabToShow = p;
						}
					}
				}
				tabToShow.show();
			}
		}, this);
	}
});
