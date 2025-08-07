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