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