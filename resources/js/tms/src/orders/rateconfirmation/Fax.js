Ext.define('TMS.orders.rateconfirmation.Fax', {
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
	title:'Rate Confirmation Fax',
	baseTitle:'Rate Confirmation Fax',
	processingPage:'/at-ajax/modules/order/process/',
	layout:'hbox',
	
	init: function() {
		this.initFaxBox();
		this.initButtons();
	},
	
	initFaxBox: function() {
		this.faxStore = Ext.create('Ext.data.Store', {
			fields: [
				'fax',
				'contact_id',
				'contactName'
			],
			proxy: {
				type: 'ajax',
				url : this.processingPage + 'get-carrier-contact-fax-list',
				extraParams: {
					order_id:this.order_id
				},
				reader: {
					type: 'json',
					root: 'records'
				}
			}
		});
		this.faxBox = Ext.create('Ext.ux.form.field.RealComboBox', {
			store:this.faxStore,
			displayField:'fax',
			valueField:'fax',
			queryMode:'local',
			flex:1,
			emptyText: 'No faxes for this contact',
			editable:false
		});
		this.items.push(this.faxBox);
		
		this.faxStore.on('load', function() {
			if (this.faxStore.data.length) {
				this.faxBox.setValue(this.faxStore.getAt(0).get('fax'));
				this.contact_id = this.faxStore.getAt(0).get('contact_id');
				this.contactName = this.faxStore.getAt(0).get('contactName');
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
		this.faxStore.load();
	},
	
	updateData: function() {
		this.setTitle(this.baseTitle + ' - ' + this.contactName);
		if (this.contact_id) {
			this.manageContactMethodsButton.enable();
			if (this.faxStore.data.length) {
				console.log(this.faxStore);
				this.sendFaxButton.enable();
			}
			else {
				this.sendFaxButton.disable();
			}
		}
		else {
			this.manageContactMethodsButton.disable();
			this.sendFaxButton.disable();
		}
	},
	
	initButtons: function() {
		this.sendFaxButton = Ext.create('Ext.button.Button', {
			scope:this,
			text:'Send Fax',
			handler:this.sendFax,
			itemId:'sendFaxButton',
			icon:'/resources/icons/fax-16.png'
		});
		
		this.manageContactMethodsButton = Ext.create('Ext.button.Button', {
			scope:this,
			text:'Manage Contact Methods',
			handler:this.manageContactMethods,
			itemId:'manageContactMethodsButton'
		});
		
		this.addTopButton([this.sendFaxButton, this.manageContactMethodsButton]);
		this.showCloseButton();
	},
	
	sendFax: function() {
		// send fax should only be enabled if there is a contact and fax selected
		var fax = this.faxBox.getValue();
		this.setLoading('Sending fax to ' + fax);
		Ext.Ajax.request({
			scope:this,
			method:'post',
			url:this.processingPage + 'fax-confirmation',
			params:{
				order_id:this.order_id,
				fax:fax
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
			this.faxBox.setValue('');
			this.faxStore.load();
		}, this);
	}
	
});