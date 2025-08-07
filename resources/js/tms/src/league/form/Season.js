Ext.define('TMS.league.form.Season', {
	extend:'Ext.form.Panel',
	
	//Requires
	requires:[
		'TMS.league.model.Season'
	],
	
	//Config
	bodyPadding: 10,
	showFooter: true,
	
	initComponent: function(){
		this.items = this.items || [];
		this.dockedItems = this.dockedItems || [];
		this.init();
		this.callParent(arguments);
	},
	
	init: function() {
		this.initTitle();
		this.initStartDate();
		this.initEndDate();
		this.initHidden();
		this.initFooter();
	},
	
	initTitle: function() {
		this.titleField = new Ext.form.field.Text({
			scope: this,
			name: 'title',
			fieldLabel: 'Title',
			allowBlank: false
		});
		this.items.push(this.titleField);
	},
	
	initStartDate: function(){
		this.startDate = new Ext.form.field.Date({
			scope: this,
			name: 'start_date',
			fieldLabel: 'Start Date',
			allowBlank: false
		});
		this.items.push(this.startDate);
	},
	
	initEndDate: function(){
		this.endDate = new Ext.form.field.Date({
			scope: this,
			name: 'end_date',
			fieldLabel: 'End Date',
			allowBlank: false
		});
		this.items.push(this.endDate);
	},
	
	initHidden: function() {
		this.seasonId = Ext.create('Ext.form.field.Hidden', {
			name:'season_id'
		});
		this.items.push(this.seasonId);
	},
	
	initFooter: function(){
		if(!this.showFooter){
			return false;
		}
		
		this.footer = new Ext.toolbar.Toolbar({
			dock: 'bottom',
			ui: 'footer',
			items: ['->', {
				scope: this,
				itemId: 'save',
				text: 'Save',
				formBind: true,
				handler: this.save
			},{
				text: 'Cancel',
				scope: this,
				handler: this.cancel
			}]
		});
		this.dockedItems.push(this.footer);
	},
	
	save: function(){
        var form = this.getForm();
		var record = form.getRecord();

		//If form is invalid return
		if(!form.isValid()){
			return;
		}
		
		//If there is not a record fire the create event, else update the record and fire the update event
        if (!record) {
			record = Ext.create('TMS.league.model.Season', form.getValues());
			this.setLoading('Saving...');
			record.save({
				scope: this,
				callback: function(records){
					this.setLoading(false);
					this.fireEvent('create', this, records);
				}
			});
        }
        else{
            form.updateRecord(record);
			this.fireEvent('update', this, record);
        }
    },
	
	cancel: function(){
		this.fireEvent('cancel', this);
	}
});