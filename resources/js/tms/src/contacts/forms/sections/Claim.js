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