Ext.define('TMS.location.forms.Form', {
	extend:'TMS.form.Abstract',
	requires:[
		'TMS.location.forms.sections.Location'
	],
	
	//Config
	url: '/at-ajax/modules/location/process/process',
	bodyPadding: 10,
	location_id: 0,
	customer_id: 0,
	carrier_id: 0,
	
	initComponent: function(){
		this.items = [];
		this.init();
		this.callParent(arguments);
	},
	
	init: function(){
		this.initLocationSection();
	},
	
	initLocationSection: function(){
		this.locationSection = Ext.create('TMS.location.forms.sections.Location', {
			border: false,
			location_id: this.location_id,
			customer_id: this.customer_id,
			carrier_id: this.carrier_id
		});
		this.items.push(this.locationSection);
	}
});