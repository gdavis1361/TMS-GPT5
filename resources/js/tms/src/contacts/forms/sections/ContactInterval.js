Ext.define('TMS.contacts.forms.sections.ContactInterval', {
	extend:'TMS.form.Abstract',
	requires:[
		'TMS.ActionWindow'
	],
	
	bodyStyle:{
		padding:'10px'
	},
	title:'Contact Intervals (in days)',
	processingPage:'/at-ajax/modules/contact/process/',
	url:'/at-ajax/modules/contact/process/save-contact-interval',
	contact_id:0,
	autoSave:false,
	isLoaded:false,
	
	initComponent: function(){
		this.items = [];
		this.addEvents('recordload');
		this.init();
		this.callParent(arguments);
	},
	
	init: function() {
		this.initCall();
		this.initEmail();
		this.initVisit();
		this.initHidden();
		
		if (!this.contact_id) {
			this.nextCallField.disable();
			this.nextEmailField.disable();
			this.nextVisitField.disable();
		}
		
		this.initListeners();
		this.getContactData(this.contact_id);
	},
	
	initCall: function() {
		
		this.callInterval = Ext.create('Ext.form.field.Text', {
			border:false,
			fieldLabel:'Call',
			labelWidth:60,
			width:100,
			name:'call_interval',
			value:this.call_interval || 0
		});
		
		this.nextCallField = Ext.create('Ext.form.field.Date', {
			fieldLabel:'Next Action',
			name:'next_call',
			margin:'0 0 0 10',
			minValue:new Date()
		});
		
		this.callPanel = Ext.create('Ext.panel.Panel', {
			layout:'hbox',
			items:[
				this.callInterval,
				this.nextCallField
			],
			border:false
		});
		
		this.items.push(this.callPanel);
	},
	
	initEmail: function() {
		
		this.emailInterval = Ext.create('Ext.form.field.Text', {
			border:false,
			fieldLabel:'Email',
			labelWidth:60,
			width:100,
			name:'email_interval',
			value:this.email_interval || 0
		});
		
		this.nextEmailField = Ext.create('Ext.form.field.Date', {
			fieldLabel:'Next Action',
			name:'next_email',
			margin:'0 0 0 10',
			minValue:new Date()
		});
		
		this.emailPanel = Ext.create('Ext.panel.Panel', {
			layout:'hbox',
			items:[
				this.emailInterval,
				this.nextEmailField
			],
			border:false
		});
		
		this.items.push(this.emailPanel);
	},
	
	initVisit: function() {
		
		this.visitInterval = Ext.create('Ext.form.field.Text', {
			border:false,
			fieldLabel:'Visit',
			labelWidth:60,
			width:100,
			name:'visit_interval',
			value:this.visit_interval || 0
		});
		
		this.nextVisitField = Ext.create('Ext.form.field.Date', {
			fieldLabel:'Next Action',
			name:'next_visit',
			margin:'0 0 0 10',
			minValue:new Date()
		});
		
		this.visitPanel = Ext.create('Ext.panel.Panel', {
			layout:'hbox',
			items:[
				this.visitInterval,
				this.nextVisitField
			],
			border:false
		});
		
		this.items.push(this.visitPanel);
	},
	
	initHidden: function() {
		this.contactIdField = Ext.create('Ext.form.field.Hidden', {
			name:'contact_id',
			value:this.contact_id
		});
		this.items.push(this.contactIdField);
	},
	
	initListeners: function() {
		this.callInterval.on('change', this.save, this, {
			buffer:500
		});
		this.emailInterval.on('change', this.save, this, {
			buffer:500
		});
		this.visitInterval.on('change', this.save, this, {
			buffer:500
		});
		
		this.nextCallField.on('select', function(field, value) {
			this.save();
		}, this);
		this.nextEmailField.on('select', function(field, value) {
			this.save();
		}, this);
		this.nextVisitField.on('select', function(field, value) {
			this.save();
		}, this);
		
	},
	
	getContactData: function(contact_id) {
		this.contact_id = contact_id;
		if (this.contact_id) {
			Ext.Ajax.request({
				scope:this,
				method:'post',
				url:this.processingPage + 'get-contact-interval-data',
				params:{
					contact_id:this.contact_id
				},
				success: function(r) {
					var response = Ext.decode(r.responseText);
					var record = response.record;
					this.fireEvent('recordload', this, record);
					this.getForm().setValues(record);
					
					if (record.now > record.next_call_ts) {
						this.nextCallField.disable();
					}
					if (record.now > record.next_email_ts) {
						this.nextEmailField.disable();
					}
					if (record.now > record.next_visit_ts) {
						this.nextVisitField.disable();
					}
					
					
					setTimeout(Ext.bind(function() {
						this.isLoaded = true;
					}, this), 500);
				}
			});
		}
	},
	
	save: function() {
		if (this.autoSave && this.contact_id && this.isLoaded) {
			this.submit();
		}
	},
	
	setDueDate: function() {
		this.dateWindow = Ext.create('TMS.ActionWindow', {
			title:'Select a new due date',
			width:null,
			height:null,
			items: [{
				scope:this,
				xtype:'datepicker',
				minDate: new Date(),
				handler: function(picker, date) {
					Ext.Ajax.request({
						scope:this,
						method:'post',
						url:this.processingPage + 'set-due-date',
						params:{
							contact_id:this.contact_id,
							field:field,
							date:date
						},
						success: function(r) {
							var response = Ext.decode(r.responseText);
							this.fireEvent('setdate');
						}
					});
					this.dateWindow.destroy();
				}
			}]
		});
	}
	
});