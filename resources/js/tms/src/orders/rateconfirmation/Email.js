Ext.define('TMS.orders.rateconfirmation.Email', {
	extend:'TMS.ActionWindow',
	
	//Requires
	requires:[
		'Ext.ux.form.field.RealComboBox',
		'TMS.contacts.forms.sections.ContactMethods',
		'TMS.ActionWindow'
	],
	
	order_id:0,
	contact_id:0,
	contactName:'',
	title:'Rate Confirmation Email',
	baseTitle:'Rate Confirmation Email',
	processingPage:'/at-ajax/modules/order/process/',
	layout:'hbox',
	
	init: function() {
		this.initEmailBox();
		this.initButtons();
	},
	
	initEmailBox: function() {
		this.emailStore = Ext.create('Ext.data.Store', {
			fields: [
				'email',
				'contact_id',
				'contactName'
			],
			proxy: {
				type: 'ajax',
				url : this.processingPage + 'get-carrier-contact-email-list',
				extraParams: {
					order_id:this.order_id
				},
				reader: {
					type: 'json',
					root: 'records'
				}
			}
		});
		this.emailBox = Ext.create('Ext.ux.form.field.RealComboBox', {
			store:this.emailStore,
			displayField:'email',
			valueField:'email',
			queryMode:'local',
			flex:1,
			emptyText: 'No emails for this contact',
			editable:false
		});
		this.items.push(this.emailBox);
		
		this.emailStore.on('load', function() {
			if (this.emailStore.data.length) {
				this.emailBox.setValue(this.emailStore.getAt(0).get('email'));
				this.contact_id = this.emailStore.getAt(0).get('contact_id');
				this.contactName = this.emailStore.getAt(0).get('contactName');
				this.updateData();
			}
			else {
				// ajax to get contact info
				this.setLoading(true);
				Ext.Ajax.request({
					scope:this,
					method:'post',
					url:this.processingPage + 'get-carrier-contact',
					params: {
						order_id:this.order_id
					},
					success: function(r) {
						this.setLoading(false);
						var response = Ext.decode(r.responseText);
						this.contact_id = response.contact_id;
						this.contactName = response.contactName;
						this.updateData();
					}
				});
			}
		}, this);
		this.emailStore.load();
	},
	
	updateData: function() {
		this.setTitle(this.baseTitle + ' - ' + this.contactName);
		if (this.contact_id) {
			this.manageContactMethodsButton.enable();
			if (this.emailStore.data.length) {
				this.sendEmailButton.enable();
			}
			else {
				this.sendEmailButton.disable();
			}
		}
		else {
			this.manageContactMethodsButton.disable();
			this.sendEmailButton.disable();
		}
	},
	
	initButtons: function() {
		this.sendEmailButton = Ext.create('Ext.button.Button', {
			scope:this,
			text:'Send Email',
			handler:this.sendEmail,
			itemId:'sendEmailButton',
			icon:'/resources/icons/email-16.png'
		});
		
		this.manageContactMethodsButton = Ext.create('Ext.button.Button', {
			scope:this,
			text:'Manage Contact Methods',
			handler:this.manageContactMethods,
			itemId:'manageContactMethodsButton'
		});
		
		this.addTopButton([this.sendEmailButton, this.manageContactMethodsButton]);
		this.showCloseButton();
	},
	
	sendEmail: function() {
		// send email should only be enabled if there is a contact and email selected
		var email = this.emailBox.getValue();
		this.setLoading('Sending email to ' + email);
		Ext.Ajax.request({
			scope:this,
			method:'post',
			url:this.processingPage + 'email-confirmation',
			params:{
				order_id:this.order_id,
				email:email
			},
			success: function(r) {
				this.setLoading(false);
				var response = Ext.decode(r.responseText);
				if (response.success) {
					this.update(response.msg[0]);
					this.topToolbar.hide();
				}
			}
		});
	},
	
	manageContactMethods: function() {
		var contactMethods = Ext.create('TMS.contacts.forms.sections.ContactMethods', {
			contact_id:this.contact_id
		});
		
		var contactMethodsWindow = Ext.create('TMS.ActionWindow', {
			title:this.contactName,
			width:400,
			height:300,
			items:[contactMethods]
		})
		contactMethodsWindow.showCloseButton();
		contactMethodsWindow.on('close', function() {
			this.emailBox.setValue('');
			this.emailStore.load();
		}, this);
	}
	
});