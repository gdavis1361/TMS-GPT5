Ext.define('TMS.location.lookup.Location', {
	extend: 'Ext.ux.form.field.RealComboBox',
	
	//Config
	type: 'contact',
	processingPage: '/at-ajax/modules/location/lookup/location',
	displayField: 'location_display',
	valueField: 'location_id',
	emptyText: 'Search for location...',
	typeAhead: false,
	hideTrigger:true,
	anchor: '100%',
	pageSize: 10,
	minChars: 0,
	width: 250,
	listConfig: {
		loadingText: 'Searching...',
		emptyText: 'No matching locations found.',

		// Custom rendering template for each item
		getInnerTpl: function() {
			return '<div class="location-name">{location_name_1}</div>' +
					'<div class="location-address">{address_1}</div>' +
					'<div class="location-city-state-zip">{city}, {state} {zip}</div>';
		}
	},
	
	initComponent: function(){
		this.init();
		this.callParent(arguments);
	},
	
	//Init Functions
	init: function(){
		this.initStore();
	},
	
	initStore: function(){
		this.store = new Ext.data.Store({
			fields: [
				'location_id',
				'location_display',
				'location_name_1',
				'address_1',
				'city',
				'state',
				'zip',
				'lat',
				'lng'
			],
			remoteSort: true,
			pageSize: 10,
			proxy: {
				type: 'ajax',
				url : this.processingPage,
				reader: {
					type: 'json',
					root: 'records',
					totalProperty: 'total'
				},
				extraParams:{
					type: this.type
				}
			}
		});
	}
});
            