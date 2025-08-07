Ext.define('TMS.filter.Abstract', {
	extend: 'Ext.form.Panel',
	
	//config
	frame: true,
	bodyPadding: 5,
	fieldDefaults: {
		labelWidth: 70,
		anchor: '100%'
	},
	config:{
		extraFilters: {}
	},
	registeredFilters: {},
	values: {},
	autoScroll: true,
	
	constructor: function(){
		this.extraFilters = {};
		this.values = {};
		return this.callParent(arguments);
	},

	initComponent: function(){
		this.items = [];
		this.registeredFilters = {};
		this._init();
		this.callParent(arguments);
	},
	
	_init: function(){
		this.initListeners();
		this.initDefaults();
		this.initButtons();
		this.init();
	},
	
	init: function(){},
	
	initListeners: function(){
		this.on('expand', function(){
			this.child("field").focus();
		}, this);
		
		this.on('add', function(panel, item){
			if(Ext.ComponentQuery.is(item, 'field')){
				this.onFilterAdd(item);
			}
		}, this);
	},
	
	initDefaults: function(){
		this.defaults = {
			xtype: 'textfield',
			enableKeyEvents: true,
			listeners: {
				scope: this,
				specialkey: function(field, e){
					// e.HOME, e.END, e.PAGE_UP, e.PAGE_DOWN,
					// e.TAB, e.ESC, arrow keys: e.LEFT, e.RIGHT, e.UP, e.DOWN
					if (e.getKey() == e.ENTER && field.xtype == 'textfield') {
						this.filter();
					}
				}
			}
		};
	},
	
	initButtons: function(){
		this.buttons = [{
			scope: this,
			text: 'Search',
			handler: function() {
				this.filter();
			}
		},{
			scope: this,
			text: 'Reset',
			handler: function(){
				this.getForm().reset();
				this.filter();
			}
		}];
	},
	
	initFields: function(){},
	
	registerFilter: function(filter){
		this.registeredFilters[filter.name] = filter;
		if(this.values[filter.name] != null){
			filter.setRawValue(this.values[filter.name]);
		}
		this.onFilterAdd(filter);
	},
	
	filter: function(){
		this.fireEvent('filter', this, this.getValues());
	},
	
	getValues: function(){
		var values = this.getForm().getValues();
		var registeredValues = {};
		var filter;
		var name;
		
		//Find all values that are not with this form
		for(name in this.values){
			if(values[name] == null){
				filter = {};
				registeredValues[name] = this.values[name];
			}
		}
		
		//Try to find any values that were registered but not in this form
		for(name in registeredValues){
			filter = this.registeredFilters[name];
			if(filter != null){
				values[name] = filter.getValue();
			}
			else{
				values[name] = registeredValues[name];
			}
		}
		
		//Add any registered filter values
		for(name in this.registeredFilters){
			filter = this.registeredFilters[name];
			values[name] = filter.getValue();
		}
		
		return Ext.apply({}, this.extraFilters, values);
	},
	
	setValues: function(values){
		//Set the default form values
		this.values = values;
		this.getForm().setValues(values);
		
		//Set any registered filter values
		for(var name in values){
			if(this.registeredFilters[name] != null){
				this.registeredFilters[name].setValue(values[name]);
			}
		}
	},
	
	onFilterAdd: function(field){
		field.on('change', function(field, newValue, oldValue){
			if(newValue != oldValue){
				this.filter();
			}
		}, this);
	}
	
});