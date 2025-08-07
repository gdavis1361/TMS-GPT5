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