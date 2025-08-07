Ext.define('TMS.orders.forms.sections.Audit', {
	extend:'TMS.ActionWindow',
	
	//Requires
	requires:[
		'TMS.orders.forms.sections.OrderDetails',
		'TMS.documents.forms.sections.DocumentsRequired',
		'TMS.comment.forms.sections.Form',
		'TMS.documents.view.Grid',
		'TMS.comment.view.Grid'
	],
	
	//Config
	layout: 'border',
	title:'Audit Order',
	processingPage:'/at-ajax/modules/order/audit/',
	order_id:0,
	widthPercent: .9,
	heightPercent: .9,
	
	init: function() {
		this.initTitle();
		this.initOrderDetails();
		this.initDocumentsRequired();
		this.initColumns();
		this.initCenter();
		this.initDocuments();
		this.initComments();
		this.initHidden();
		
		this.initButtons();
		
		this.initListeners();
	},
	
	initTitle: function(){
		if(this.title == null || !this.title.length){
			return;
		}
		
		this.title += ' - #' + this.order_id;
	},
	
	initColumns: function() {
		this.columns = Ext.create('Ext.panel.Panel', {
			layout:{
				type: 'vbox',
				align: 'stretch'
			},
			region: 'west',
			width: 250,
			split: true,
			items:[
				this.orderDetails,
				this.documentsRequired
			],
			border:0,
			frame:false
		});
		this.items.push(this.columns);
	},
	
	initCenter: function() {
		this.centerPanel = Ext.create('Ext.panel.Panel', {
			layout:{
				type: 'vbox',
				align: 'stretch'
			},
			region: 'center',
			border:0,
			frame:false
		});
		this.items.push(this.centerPanel);
	},
	
	initOrderDetails: function() {
		this.orderDetails = Ext.create('TMS.orders.forms.sections.OrderDetails', {
			readOnly: true,
			order_id:this.order_id,
			flex:1,
			autoScroll: true
		})
	},
	
	initDocumentsRequired: function() {
		this.documentsRequired = Ext.create('TMS.documents.forms.sections.DocumentsRequired', {
			order_id:this.order_id,
			readOnly: true,
			flex:1,
			autoScroll: true
		});
	},
	
	initDocuments: function() {
		this.documentsPanel = Ext.create('TMS.documents.view.Grid', {
			title: 'Order Documents',
			extraParams:{
				order_id:this.order_id
			},
			flex:1
		});
		this.centerPanel.add(this.documentsPanel);
	},
	
	initComments: function() {
		this.commentsPanel = Ext.create('TMS.comment.view.Grid', {
			title: 'Order Comments',
			field_value: this.order_id,
			type:'order',
			flex:1
		});
		this.centerPanel.add(this.commentsPanel);
	},
	
	initHidden: function() {
		this.orderIdField = Ext.create('Ext.form.field.Hidden', {
			name:'orderId',
			value:0
		});
		this.items.push(this.orderIdField);
	},
	
	initButtons: function() {
		this.approveButton = Ext.create('Ext.button.Button', {
			scope:this,
			text:'Approve',
			handler:this.approve,
			scale:'medium',
			icon: '/resources/icons/check-24.gif'
		});
		this.denyButton = Ext.create('Ext.button.Button', {
			scope:this,
			text:'Deny',
			handler:this.deny,
			scale:'medium',
			icon: '/resources/icons/close-24.png'
		});
		this.addTopButton([
			this.approveButton,
			this.denyButton
		]);
	},
	
	approve: function() {
		this.setLoading();
		Ext.Ajax.request({
			scope:this,
			method:'post',
			url:this.processingPage + 'approve',
			params:{
				order_id:this.order_id
			},
			success: function(r) {
				this.setLoading(false);
				var response = Ext.decode(r.responseText);
				this.fireEvent('taskcomplete');
				this.close();
			}
		});
	},
	
	deny: function() {
		// Show a comment box that will be entered as an order comment
		this.formPanel = Ext.create('TMS.comment.forms.sections.Form', {
			field_value:this.order_id,
			commentType:'order'
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
				url:this.processingPage + 'deny',
				params:{
					order_id:this.order_id
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
		this.orderDetails.on('dataload', function() {
			this.center();
		} , this);
		
		this.documentsRequired.on('dataload', function() {
			this.center();
		} , this);
		
	}
	
});