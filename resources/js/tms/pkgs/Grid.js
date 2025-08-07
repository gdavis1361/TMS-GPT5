Ext.define('TMS.grid.Grid', {
	extend: 'Ext.grid.Panel',
	
	//Config
	viewConfig: {
		stripeRows: true
	},
	stateful: false,
	
	initComponent: function(){
		this.callParent(arguments);
		this.baseInit();
	},
	
	baseInit: function(){
		this.setListeners();
		this.setFilter(this.filter);
		
		this.on('statesave', function(){
			//console.log(arguments[1]);
		}, this);
	},
	
	setListeners: function(){
		this.store.on('load', function(){
			this.saveState();
		}, this);
	},
	
	setFilter: function(filter){
		if(filter == null){
			return false;
		}
		this.filter = filter;
		
		this.filter.on('filter', function(form, values){
			this.store.proxy.extraParams.filter = Ext.encode(values);
			this.store.loadPage(1);
			this.saveState();
		}, this, {buffer: 500});
		this.store.proxy.extraParams.filter = Ext.encode(this.filter.getValues());
	},
	
	applyState: function(state){
		this.callParent(arguments);
		
		//Apply filter
		if(state.filter != null && this.filter != null){
			this.filter.setValues(state.filter);
			this.store.proxy.extraParams.filter = Ext.encode(this.filter.getValues());
		}
		
		//Apply store
		if(state.store != null){
			Ext.apply(this.store, state.store);
		}
	},
	
	getState: function(){
		var state = this.callParent(arguments);
		
		//If there is a filter save it
		if(this.filter != null){
			state.filter = this.filter.getValues();
		}
		
		//Save the current page
		state.store = {
			currentPage: this.store.currentPage
		};
		
		return state;
	}
});
