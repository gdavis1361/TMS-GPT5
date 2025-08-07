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