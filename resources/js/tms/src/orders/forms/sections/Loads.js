Ext.define('TMS.orders.forms.sections.Loads', {
	extend:'Ext.panel.Panel',
	
	//Requires
	requires:[
		'TMS.orders.forms.sections.Stops',
		'TMS.orders.forms.sections.Load'
	],
	
	//Config

	initComponent: function(){
		this.items = [];
		this.init();
		this.callParent(arguments);
	},
	
	init: function(){
		this.initStops();
		this.initLoadsPanel();
	},
	
	initStops: function(){
		this.stops = Ext.create('TMS.orders.forms.sections.Stops', {
			height: 300,
			order_id: 505
		});
		this.items.push(this.stops);
		
		this.stops.on('set', function(panel, stops){
			this.setValues(stops);
		}, this);
	},
	
	initLoadsPanel: function(){
		this.loadsPanel = new Ext.panel.Panel({
			scope: this,
			title: 'Loads'
		});
		this.items.push(this.loadsPanel);
		
		this.stops.on('addstop', function(){
			this.setValues(this.stops.getValues());
		}, this);
		this.stops.on('removestop', function(){
			this.setValues(this.stops.getValues());
		}, this);
		this.stops.on('reorder', function(stops, event){
			this.setValues(this.stops.getValues());
		}, this);
		this.stops.on('locationchange', function(stops, event){
			this.setValues(this.stops.getValues());
		}, this);
	},
	
	setValues: function(stops){
		if(stops.length <= 1){
			return;
		}
		
		var loads = this.getLoadPanels();
		
		//Add or update any lodas
		Ext.each(stops, function(stop, index){
			if(index == stops.length -1){
				return;
			}
			var load = loads[index];
			//Add this load if it doesnt exist
			if(load == null){
				this.addLoad(stop, stops[index+1]);
			}
			else{
				load.setOrigin(stop);
				load.setDestination(stops[index+1]);
			}
		}, this);
		
		//Remove any loads not needed
		Ext.each(loads, function(load, index){
			if(stops[index+1] == null){
				load.destroy();
			}
		}, this);
	},
	
	addLoad: function(origin, destination){
		var load = Ext.create('TMS.orders.forms.sections.Load', {
			scope: this,
			margin: 10,
			origin: origin,
			destination: destination
		});
		this.loadsPanel.add(load);
	},
	
	getLoadPanels: function(){
		return this.loadsPanel.items.items;
	}
});