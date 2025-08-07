Ext.define('TMS.orders.forms.sections.Load', {
	extend:'Ext.panel.Panel',
	
	//Requires
	requires:[
		'TMS.carrier.lookup.Carrier'
	],
	
	layout: 'anchor',
	bodyPadding: 5,

	//Config
	origin: {
		index: 0,
		location_id: 0,
		location_name: '',
		city: '',
		state: '',
		address_1: '',
		zip: ''
	},
	destination: {
		index: 1,
		location_id: 0,
		location_name: '',
		city: '',
		state: '',
		address_1: '',
		zip: ''
	},
	
	initComponent: function(){
		this.items = [];
		this.init();
		this.callParent(arguments);
	},
	
	init: function() {
		this.initCarrier();
		this.on('afterrender', function(){
			this.updateTitle();
		}, this);
	},
	
	initCarrier: function(){
		this.carrier = Ext.create('TMS.carrier.lookup.Carrier', {
			hiddenName: 'carrier_id',
			fieldLabel: 'Carrier',
			value: 0
		});
		this.items.push(this.carrier);
	},
	
	setOrigin: function(origin){
		Ext.apply(this.origin, origin);
		this.updateTitle();
	},
	
	setDestination: function(destination){
		Ext.apply(this.destination, destination);
		this.updateTitle();
	},
	
	updateTitle: function(){
		var originName = this.origin.location_name_1;
		var destinationName = this.destination.location_name_1;
		if(!this.origin.location_id){
			originName = "No Location Selected";
		}
		if(!this.destination.location_id){
			destinationName = "No Location Selected";
		}
		this.setTitle(originName + ' &raquo; ' + destinationName);
	}
});