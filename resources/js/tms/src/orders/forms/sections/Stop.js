Ext.define('TMS.orders.forms.sections.Stop', {
	extend: 'TMS.form.Abstract',
	
	//requires
	requires:[
		'TMS.location.lookup.Location',
		'TMS.contacts.lookup.Contact',
		'TMS.orders.forms.sections.Details',
		'TMS.ActionWindow',
		'TMS.orders.forms.sections.Details',
		'TMS.contacts.forms.sections.ContactMethods',
		'TMS.form.plugin.StatusBar',
		'TMS.location.forms.Form'
	],
	
	//Config
	layout: 'anchor',
	originalValues: false,
	type:'order',
	url: '',

	//Config
	initComponent: function(){
		this.items = [];
		this.dockedItems = this.dockedItems || [];
		this.originalValues = false;
		this.init();
		this.callParent(arguments);
	},
	
	init: function() {
		this.initFieldContainer();
		this.initZip();
		this.initLocation();
		this.initContact();
		this.initDateTimeStopType();
		this.initDetails();
		this.initHidden();
	},
	
	
	initFieldContainer: function(){
		this.fieldContainer = new Ext.panel.Panel({
			scope: true,
			unstyled: true,
			border: false,
			bodyPadding: 10,
			layout: 'anchor',
			anchor: '100%'
		});
		
		this.items.push(this.fieldContainer);
	},
	
	initZip: function() {
		var config = {};
		if (this.type != 'preorder') {
			Ext.apply(config, {
				hidden: true
			});
		}
		
		this.zip = Ext.create('Ext.form.field.Text', Ext.apply({
			fieldLabel:'Zip',
			name:'zip',
			anchor:'100%',
			enableKeyEvents:true
		}, config));

		this.zip.on('keypress', function(field, e) {
			// If user presses enter, fire an event, so a new stop can be added
			if (e.keyCode == 13) {
				this.fireEvent('pressedenter');
			}
		}, this);

		this.zip.on('change', function(field, e) {
			this.fireEvent('addresschange');
		}, this);

		this.fieldContainer.add(this.zip);
	},
	
	initLocation: function(){
		//Create the location selector
		this.location = Ext.create('TMS.location.lookup.Location', {
			name: 'location_id',
			value: '',
			flex: 1
		});
		
		//Create the add location button
		this.locationAddButton = new Ext.button.Button({
			scope: this,
			margin: '0 0 0 5',
			icon: '/resources/icons/add-16.png',
			text:'Add Location',
			handler:this.createLocationWindow
		});
		
		//Create the location container
		this.locationContainer = Ext.create('Ext.form.FieldContainer', {
			scope: this,
			fieldLabel: 'Location',
			combineErrors: true,
			layout: 'hbox',
			defaults: {
				hideLabel: true
			},
			items:[
				this.location,
				this.locationAddButton
			]
		});
		
		//Add container to the form
		this.fieldContainer.add(this.locationContainer);
		
		//Listeners
		this.on('set', function(panel, values){
			if(values.location_id == null || !values.location_id){
				return;
			}
			this.location.loadFromStore({
				location_id: values.location_id
			});
		}, this);
	},
	
	initContact: function(){
		
		//Create the contact field
		this.contact = Ext.create('TMS.contacts.lookup.Contact', {
			name: 'contact_id',
			value: 0,
			layout: 'anchor',
			flex: 1
		});
		
		//Create the add contact button
		this.contactAddButton = new Ext.button.Button({
			scope:this,
			margin: '0 0 0 5',
			icon: '/resources/icons/edit-16.png',
			text:'Manage Contact Methods',
			handler: this.manageContactMethods
		});
		
		//Create the contact container
		this.contactContainer = Ext.create('Ext.form.FieldContainer', {
			scope: this,
			disabled: true,
			fieldLabel: 'Contact',
			combineErrors: true,
			layout: 'hbox',
			defaults: {
				hideLabel: true
			},
			items:[
				this.contact,
				this.contactAddButton
			]
		});
		
		//Add container to the form
		this.fieldContainer.add(this.contactContainer);
		
		//Listeners
		this.location.on('change', function(field, value){
			this.contact.enable();
			this.contact.setParam('location_id', value);
		}, this);
		
		this.location.on('select', function(field, records, options){
			if(!records.length){
				return;
			}
			this.contact.setValue('');
			this.contact.setRawValue('');
			if(!records.length){
				this.contactContainer.disable();
				return;
			}
			//Set the contact location
			this.contactContainer.enable();
			var record = records[0];
			this.contact.setParam('location_id', record.get('location_id'));
			this.contact.store.loadPage(1);
			//this.contact.focus(true, 50);
			
			if (this.zip) {
				this.zip.setValue(record.get('zip'));
			}
			
			this.fireEvent('addresschange');
		}, this);
		
		this.on('set', function(panel, values){
			if(values.contact_id == null || !values.contact_id){
				return;
			}
			this.contact.loadFromStore({
				contact_id: values.contact_id
			});
		}, this);
	},
	
	initDateTimeStopType: function(){
		this.stopTypeHidden = new Ext.form.field.Hidden({
			name: 'stop_type',
			toggle: function(){
				if(this.getValue() == 'd'){
					this.setValue('p');
				}
				else{
					this.setValue('d');
				}
			},
			value: 'd'
		});
		this.stopTypeHidden.on('change', function(field, value, oldValue){
			this.stopType.updateImage();
		}, this);
		this.stopType = new Ext.panel.Panel({
			scope: this,
			width: 32,
			height: 32,
			unstyled: true,
			style:{
				cursor: 'pointer'
			},
			stopTypeHidden: this.stopTypeHidden,
			pickupDetails:{
				img: '/resources/silk_icons/lorry_add_32.png',
				title: 'Stop Type (Pickup)'
			},
			deliveryDetails: {
				img: '/resources/silk_icons/lorry_delete_32.png',
				title: 'Stop Type (Delivery)'
			},
			updateImage: function(){
				var value = this.stopTypeHidden.getValue();
				var displayObject;
				if(value == "d"){
					displayObject = this.deliveryDetails;
				}
				else{
					displayObject = this.pickupDetails;
				}
				this.update(Ext.String.format(
					'<img src="{0}" title="{1}" />',
					displayObject.img,
					displayObject.title
				));
			}
		});
		this.stopType.on('afterrender', function(){
			this.stopType.updateImage();
			this.stopType.getEl().on('click', function(){
				this.stopTypeHidden.toggle();
			}, this);
		}, this);
		
		this.fieldContainer.add({
			xtype: 'fieldcontainer',
			fieldLabel: 'Date and Time',
			labelWidth: 100,
			anchor: '100%',

			// The body area will contain three text fields, arranged
			// horizontally, separated by draggable splitters.
			layout: 'hbox',
			items: [{
				xtype: 'datefield',
				name: 'date',
				submitFormat: 'n/j/Y',
				flex: 1,
				margin: '0 5 0 0',
				value: ''
			},{
				xtype: 'timefield',
				name: 'time',
				flex: 1,
				margin: '0 5 0 0',
				value: '8:00 AM',
				allowBlank: false
			}, this.stopType]
		});
		
		this.fieldContainer.add(this.stopTypeHidden);
	},
	
	initDetails: function(){
		//Create the details field button
		this.detailsButton = new Ext.button.Button({
			scope: this,
			text: 'Edit Details',
			baseText: 'Edit Details',
			handler: function(){
				this.detailsWindow.show();
			}
		});
		
		//Create the field container to hold the button
		this.fieldContainer.add({
			xtype: 'fieldcontainer',
			fieldLabel: 'Details',
			combineErrors: true,
			layout: 'hbox',
			defaults: {
				hideLabel: true
			},
			items:[this.detailsButton]
		});
		
		//Create the details panel
		this.detailsPanel = Ext.create('TMS.orders.forms.sections.Details', {
		});
		
		this.detailsPanel.on('add', function(){
			this.detailsButton.setText(this.detailsButton.baseText + ' (' + (this.detailsPanel.getCount()-1) + ')');
		}, this);
		this.detailsPanel.on('remove', function(){
			this.detailsButton.setText(this.detailsButton.baseText + ' (' + (this.detailsPanel.getCount()-1) + ')');
		}, this);
		
		//Listeners
		this.on('set', function(panel, values){
			if(values.details == null){
				return;
			}
			this.detailsPanel.setValues(values.details);
			this.detailsButton.setText(this.detailsButton.baseText + ' (' + (values.details.length) + ')');
		}, this);
		
		//Create the details window
		this.detailsWindow = Ext.create('TMS.ActionWindow', {
			scope: this,
			autoShow: false,
			title: 'Stop Details',
			layout: 'fit',
			closeAction: 'hide',
			items:[this.detailsPanel],
			bottomItems: [{
				scope: this,
				text: 'Save & Close',
				cls: 'submit',
				handler: function(){
					this.detailsWindow.hide();
				}
			}]
		});
	},
	
	initDetailsPanel: function(){
		this.detailsPanel = Ext.create('TMS.orders.forms.sections.Details', {
			title: 'Details',
			baseTitle: 'Details'
		});
		this.detailsPanel.on('expand', function(){
			this.detailsPanel.setHeight(null);
			this.doLayout(true);
		}, this);
		this.detailsPanel.on('collapse', function(){
			this.doLayout(true);
		}, this);
		this.detailsPanel.on('add', function(){
			this.detailsPanel.setTitle(this.detailsPanel.baseTitle + ' (' + (this.detailsPanel.getCount()-1) + ')');
		}, this);
		this.detailsPanel.on('remove', function(){
			this.detailsPanel.setTitle(this.detailsPanel.baseTitle + ' (' + (this.detailsPanel.getCount()-1) + ')');
		}, this);
		
		this.on('set', function(panel, values){
			if(values.details == null){
				return;
			}
			this.detailsPanel.setValues(values.details);
		}, this);
		
		this.items.push(this.detailsPanel);
	},
	
	initHidden: function(){
		this.fieldContainer.add({
			xtype: 'hiddenfield',
			name: 'stop_id',
			value: 0
		});
	},
	
	setValues: function(values){
		this.callParent(arguments);
		
		if(this.originalValues == false){
			this.originalValues = values;
		}
		
		this.fireEvent('set', this, values);
	},
	
	getValues: function(){
		//Merge in location record
		var locationRecord = this.location.store.getAt(this.location.store.find('location_id', this.location.getValue()));
		if(locationRecord != null){
			this.setParams(locationRecord.data);
		}
		
		//Add details
		this.setParam('details', this.detailsPanel.getValues());
		
		//Return the values
		return this.callParent(arguments);
	},
	
	manageContactMethods: function() {
		var contactId = parseInt(this.contact.getValue());
		if (contactId) {
			var contactMethods = Ext.create('TMS.contacts.forms.sections.ContactMethods', {
				title: '',
				baseTitle: '',
				contact_id: contactId,
				autoSave: true,
				plugins: [Ext.create('TMS.form.plugin.StatusBar')]
			});

			var contactMethodsWindow = Ext.create('TMS.ActionWindow', {
				layout: 'fit',
				items:[contactMethods],
				title: this.contact.getRawValue() + ' - Contact Methods'
			});
			contactMethodsWindow.showCloseButton();
		}
		
	},
	
	createLocationWindow: function(){
		this.locationForm = Ext.create('TMS.location.forms.Form', {
			scope: this,
			plugins: [Ext.create('TMS.form.plugin.StatusBar')]
		});
		
		this.locationForm.on('success', function(form, action){
			this.locationWindow.destroy();
			var record = action.result.record;
			this.location.setValue(record.location_id);
			this.location.loadFromStore({
				location_id: record.location_id
			});
		}, this);
		
		//Create a hidden field for job site
		this.locationForm.add({
			xtype: 'checkboxfield',
			boxLabel: 'This location is a Job Site',
			name: 'job_site',
			inputValue: '1'
		});

		this.locationWindow = Ext.create('TMS.ActionWindow', {
			items:[this.locationForm],
			title:"Add shipping address",
			bottomItems: [{
				xtype: 'button',
				cls: 'submit',
				scope: this,
				text: 'Save',
				handler: function() {
					this.locationForm.submit();
				}
			},{
				xtype: 'button',
				cls: 'submit',
				scope: this,
				text: 'Cancel',
				handler: function() { 
					this.locationWindow.destroy(); 
				}
			}]
		});
	}
});