Ext.define('TMS.carrier.view.RadiusGrid', {
	extend: 'TMS.carrier.view.FilteredGrid',
	
	//Config
	order_id: 0,
	
	//Init Functions
	init: function() {
		this.gridConfig = {
			autoLoadStore: false
		};
		this.callParent(arguments);
		this.initToolbar();
		this.initRadius();
		this.initFrom();
		//this.initSearchButton();
	},
	
	initToolbar: function(){
		this.toolbar = new Ext.toolbar.Toolbar({
			scope: this,
			docked: 'top'
		});
		this.dockedItems.push(this.toolbar);
	},
	
	initRadius: function(){
		this.radiusStore = Ext.create('Ext.data.Store', {
			fields:['display', 'value'],
			data:[{
				display: '50 Miles',
				value: 50
			},{
				display: '100 Miles',
				value: 100
			},{
				display: '150 Miles',
				value: 150
			},{
				display: '200 Miles',
				value: 200
			},{
				display: '250 Miles',
				value: 250
			}],
			proxy: {
				type: 'memory',
				reader: {
					type: 'json'
				}
			}
		});
		this.radiusSelect = new Ext.form.field.ComboBox({
			scope: this,
			name: 'radiusDistance',
			fieldLabel: 'Radius',
			labelWidth: 50,
			queryMode:'local',
			displayField:'display',
			valueField:'value',
			store:this.radiusStore
		});
		
		this.radiusSelect.on('afterrender', function(){
			this.filter.suspendEvents(false);
			this.radiusSelect.select(this.radiusStore.getAt(1));
			this.filter.resumeEvents();
		}, this);
		
		this.filter.registerFilter(this.radiusSelect);
		
		this.toolbar.add(this.radiusSelect);
	},
	
	initFrom: function(){
		this.fromStore = Ext.create('Ext.data.Store', {
			fields:[
				'location_name_1',
				'address_1',
				'city',
				'state',
				'zip'
			],
			proxy: {
				type: 'ajax',
				url: '/at-ajax/modules/order/order/get-stops',
				extraParams: {
					order_id: this.order_id
				},
				reader: {
					type: 'json',
					root: 'records'
				}
			}
		});
		
		this.on('afterrender', function(){
			this.fromStore.load();
		}, this);
		
		this.fromSelect = new Ext.form.field.ComboBox({
			scope: this,
			name: 'radiusZip',
			fieldLabel: 'From',
			labelWidth: 40,
			queryMode:'local',
			displayField: 'location_name_1',
			valueField:'zip',
			store:this.fromStore,
			listConfig: {
				// Custom rendering template for each item
				getInnerTpl: function() {
					return '<div><b>{location_name_1}</b></div>' +
							'<div style="font-size: 10px; font-style: italic;">{address_1} {city}, {state} {zip}</div>';
				}
			}
		});
		
		this.filter.registerFilter(this.fromSelect);
		
		this.toolbar.add(this.fromSelect);
	},
	
	initSearchButton: function(){
		this.searchButton = new Ext.button.Button({
			scope: this,
			text: 'Search',
			handler: function(){
				
			}
		});
		
		this.toolbar.add(this.searchButton);
	}
	
});