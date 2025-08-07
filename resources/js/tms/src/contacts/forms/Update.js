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