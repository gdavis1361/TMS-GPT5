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