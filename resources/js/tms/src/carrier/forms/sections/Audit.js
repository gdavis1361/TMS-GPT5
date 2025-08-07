Ext.define('TMS.carrier.forms.sections.Audit', {
	extend:'TMS.ActionWindow',
	requires:[
		'TMS.documents.view.Grid',
		'TMS.carrier.forms.sections.Authority',
		'TMS.comment.forms.sections.Form'
	],
	title:'Approve Carrier',
	processingPage:'/at-ajax/modules/carrier/audit/',
	
	carrier_id:0,
	widthPercent: 0.9,
	heightPercent: 0.9,
	layout:{
		type: 'hbox',
		align: 'stretch'
	},
	border: false,
	
	init: function() {
		this.initAuthority();
		this.initDocuments();
		
		this.initHidden();
		this.initButtons();
		this.initListeners();
	},
	
	initAuthority: function() {
		this.authorityPanel = Ext.create('TMS.carrier.forms.sections.Authority', {
			width: 300,
			carrier_id:this.carrier_id
		});
		this.items.push(this.authorityPanel);
	},
	
	initDocuments: function() {
		this.documentsPanel = Ext.create('TMS.documents.view.Grid', {
			title: 'Carrier Documents',
			extraParams:{
				carrier_id:this.carrier_id
			},
			flex: 1
		});
		this.items.push(this.documentsPanel);
	},
	
	initHidden: function() {
		this.carrierIdField = Ext.create('Ext.form.field.Hidden', {
			name:'carrierId',
			value:0
		});
		this.items.push(this.carrierIdField);
	},
	
	initButtons: function() {
		this.approveButton = Ext.create('Ext.button.Button', {
			scope:this,
			text:'Approve',
			handler:this.approve,
			scale:'medium',
			icon: '/resources/icons/check-24.gif'
		});
		
		this.declineButton = Ext.create('Ext.button.Button', {
			scope:this,
			text:'Decline',
			handler:this.decline,
			scale:'medium',
			icon: '/resources/icons/close-24.png'
		});
		
		
		this.addTopButton([
			this.approveButton,
			this.declineButton
		]);
	},
	
	approve: function() {
		this.setLoading();
		Ext.Ajax.request({
			scope:this,
			method:'post',
			url:this.processingPage + 'approve',
			params:{
				carrier_id:this.carrier_id
			},
			success: function(r) {
				this.setLoading(false);
				var response = Ext.decode(r.responseText);
				this.fireEvent('taskcomplete');
				this.close();
			}
		});
	},
	
	decline: function() {
		// Show a comment box that will be entered as an order comment
		this.formPanel = Ext.create('TMS.comment.forms.sections.Form', {
			field_value:this.carrier_id,
			commentType:'carrier'
		});
		
		this.formWindow = Ext.create('Ext.window.Window', {
			title:'Enter a reason',
			autoShow:true,
			modal:true,
			resizable:false,
			draggable:false,
			width:400,
			items:[
				this.formPanel
			]
		});
		
		this.formPanel.on('formsuccess', function() {
			this.formWindow.close();
			
			this.setLoading();
			Ext.Ajax.request({
				scope:this,
				method:'post',
				url:this.processingPage + 'decline',
				params:{
					carrier_id:this.carrier_id
				},
				success: function(r) {
					this.setLoading(false);
					var response = Ext.decode(r.responseText);
					this.fireEvent('taskcomplete');
					this.close();
				}
			});
			
		}, this);
			
	},
	
	initListeners: function() {
		
	}
	
});