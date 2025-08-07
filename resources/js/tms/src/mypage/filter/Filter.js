Ext.define('TMS.mypage.filter.Filter', {
	extend: 'Ext.panel.Panel',
	
	//Config
	layout: 'hbox',
	defaults:{
		margin: 2,
		flex: 1
	},
	filter: {},
	
	initComponent: function(){
		this.items = [];
		this.filter = {};
		this.init();
		this.callParent(arguments);
	},
	
	//Init Functions
	init: function(){
		this.initStartDate();
		this.initStopDate();
	},
	
	initStartDate: function(){
		//Create the start date field
		this.startDate = new Ext.form.field.Date({
			fieldLabel: 'Start Date',
			labelWidth: 70,
			emptyText: 'Select start date...'
		});
		
		//Listen for when the date is changed
		this.startDate.on('select', function(field, value){
			//If the stop date value is null set it to one week ahead
			if(this.stopDate.getValue() == null){
				var date = new Date(value);
				date.setDate(date.getDate() + 7);
				this.stopDate.setValue(Ext.Date.format(date, 'n/j/Y'));
			}
			//or if the start date is after the stop date
			else{
				var startDate = new Date(value);
				var stopDate = new Date(this.stopDate.getValue());
				if(startDate >= stopDate){
					startDate.setDate(startDate.getDate() + 7);
					this.stopDate.setValue(Ext.Date.format(startDate, 'n/j/Y'));
				}
			}
			
			//Update the filter
			this.updateFilter({
				startDate: this.startDate.getValue(),
				stopDate: this.stopDate.getValue()
			});
			
		}, this);
		
		this.items.push(this.startDate);
	},
	
	initStopDate: function(){
		//Create the stop date
		this.stopDate = new Ext.form.field.Date({
			fieldLabel: 'End Date',
			labelWidth: 70,
			emptyText: 'Select stop date...'
		});
		
		//Listen for when the date is changed
		this.stopDate.on('select', function(field, value){
			//Check to see if the start date is null
			if(this.startDate.getValue() == null){
				var date = new Date(value);
				date.setDate(date.getDate() - 7);
				this.startDate.setValue(Ext.Date.format(date, 'n/j/Y'));
			}
			//or if the stop date is before the start date
			else{
				var startDate = new Date(this.startDate.getValue());
				var stopDate = new Date(value);
				if(stopDate <= startDate){
					stopDate.setDate(stopDate.getDate() - 7);
					this.startDate.setValue(Ext.Date.format(stopDate, 'n/j/Y'));
				}
			}
			
			//Update the filter
			this.updateFilter({
				startDate: this.startDate.getValue(),
				stopDate: this.stopDate.getValue()
			});
			
		}, this);
		
		this.items.push(this.stopDate);
	},
	
	updateFilter: function(filter){
		Ext.apply(this.filter, filter);
		this.fireEvent('filter', this, this.filter);
	}
});