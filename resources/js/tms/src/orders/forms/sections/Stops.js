Ext.define('TMS.orders.forms.sections.Stops', {
	extend:'Ext.tab.Panel',
	
	//Requires
	requires:[
		'Ext.ux.GMapPanel',
		'TMS.portal.Column',
		'TMS.portal.Panel',
		'TMS.orders.forms.sections.Stop'
	],

	//Config
	activeItem: 0,
	autoScroll: false,
	orderProcessingPage: '/at-ajax/modules/order/order/',
	order_id: 0,
	pre_order_id: 0,
	type:'order',
	
	title:'Stops',
	baseTitle:'Stops',
	
	initComponent: function(){
		this.items = [];
		
		this.addEvents(
			'addstop',
			'removestop',
			'reorder',
			'locationchange',
			'set',
			'get'
		);
		
		this.init();
		this.callParent(arguments);
	},
	
	init: function() {
		this.initEastPanel();
		this.initMapPanel();
		this.initStopContainer();
		this.initMap();
		this.initListeners();
		this.initStops();
	},
	
	initStops: function(){
		if(!this.rendered){
			this.on('afterrender', function(){
				this.initStops();
			}, this, { delay: 100 });
			return;
		}
		
		if(this.order_id || this.pre_order_id){
			this.setLoading(true);
			Ext.Ajax.request({
				scope: this,
				url: this.orderProcessingPage + 'get-stops',
				params: {
					order_id: this.order_id,
					pre_order_id: this.pre_order_id,
					type:this.type
				},
				success: function(r){
					var response = Ext.decode(r.responseText);
					var stops = this.setValues(response.records);
					Ext.each(stops, function(stop){
						stop.collapse();
					}, this);
					this.setLoading(false);
				}
			});
		}
		else{
			this.addStop();
		}
	},
	
	initMapPanel: function(){
		this.mapPanel = Ext.create('Ext.ux.GMapPanel', {
			scope: this,
			title: 'Map',
			gmapType: 'map',
			mapConfig: {
				scrollwheel: false
				//navigationControl: false,
				//mapTypeControl: false,
				//scaleControl: false,
				//draggable: false
			}
		})
		this.items.push(this.mapPanel);
		
		this.mapPanel.on('show', function(){
			this.findMarkers();
		}, this);
	},
	
	initMap: function(){
		this.mapPanel.on('afterrender', function(){
		   this.map = this.mapPanel.gmap;
		}, this, {single: true});
	},
	
	initEastPanel: function(){
		this.eastToolbar = new Ext.toolbar.Toolbar({
			scope: this,
			items:[{
				scope: this,
				text: 'Add Stop',
				icon: '/resources/icons/add-16.png',
				handler: function(){
					var stop = this.addStop({
						collapsed: false
					});
					this.goToStop(stop);
					
				}
			},{
				scope: this,
				text: 'Collapse All',
				handler: function(){
					var stops = this.getStopPanels();
					Ext.each(stops, function(stop){
						stop.collapse();
					}, this);
					this.stopContainer.doLayout();
				}
			},{
				scope: this,
				text: 'Expand All',
				handler: function(){
					var stops = this.getStopPanels();
					Ext.each(stops, function(stop, index){
						setTimeout(Ext.bind(function(){
							stop.expand();
						}, stop), (index*0));
					}, this);
				}
			}]
		});
		
		this.eastPanel = new Ext.panel.Panel({
			scope: this,
			title: 'Stops',
			region: 'east',
			//columnWidth: 1,
			autoScroll: true,
			border: false,
			tbar: this.eastToolbar
		});
		
		this.items.push(this.eastPanel);
	},
	
	initStopContainer: function(){
		this.stopPortal = Ext.create('TMS.portal.Column', {
			border: false
		});
		this.stopContainer = Ext.create('TMS.portal.Panel', {
			scope: this,
			border: false,
			unstyled: true,
			bodyPadding: '10',
			autoScroll: false,
			items:[this.stopPortal]
		});
		
		this.stopContainer.on('drop', function(event){
			this.fireEvent('reorder', this, event);
		}, this);
		
		this.eastPanel.add(this.stopContainer);
	},
	
	setValues: function(stops){
		if(!this.rendered){
			this.on('afterrender', function(panel, options){
				this.setValues(options.stops);
			}, this, {stops: stops});
			return;
		}
		
		var createdStops = [];
		Ext.each(stops, function(record){
			var stop = this.addStop();
			this.setStopValues(stop, record);
			createdStops.push(stop);
		}, this);
		
		//Fire the set event
		this.fireEvent('set', this, stops);
		
		this.updateMileage();
		
		return createdStops;
	},
	
	getValues: function(){
		var stops = [];
		Ext.each(this.getStopPanels(), function(stop){
			stop.useDefaultNames();
			if(stop.getValues != null){
				var data = stop.getValues()
				data['street'] = data['address_1'];
				stops.push(data);
			}
			stop.usePrefixPostfixNames();
		}, this);
		
		//Fire the get event
		this.fireEvent('get', this, stops);
		
		return stops;
	},
	
	addStop: function(config){
		if(config == null){
			config = {};
		}
		
		//Create the stop panel
		var stop = Ext.create('TMS.orders.forms.sections.Stop', Ext.apply({
			scope: this,
			fieldPrefix: 'stop',
			fieldPostfix: this.getStopPanels().length,
			draggable: true,
			cls: 'x-portlet',
			title: 'No Location Selected',
			baseTitle: 'No Location Selected',
			frame: true,
			margin: '0 0 10 0',
			collapsible: true,
			type:this.type,
			//collapsed: true,
			titleCollapse: true,
			animCollapse: false,
			tools:[{
				scope: this,
				type:'close',
				tooltip: 'Remove',
				handler: function(event, toolEl, panel){
					//remove
					this.removeStop(panel.up('panel'));
				}
			}]
		}, config));
		
		stop.on('expand', function(panel){
			panel.doLayout();
		}, this);
		
		stop.on('pressedenter', function() {
			var stop = this.addStop({
				collapsed: false
			});
			this.goToStop(stop);
			stop.zip.focus();
		}, this);
		
		stop.on('addresschange', function(){
			this.updateMileage();
		}, this);
		
		
		//Set the stop type
		if(!this.getStopPanels().length){
			stop.on('afterrender', function(panel, options){
				panel.stopTypeHidden.setValue('p');
			}, this);
		}
		
		//Setup on destroy action
		stop.on('destroy', function(panel){
			if(panel.marker != null){
				panel.marker.setVisible(false);
			}
			this.findMarkers();
			this.stopContainer.doLayout();
			
			//Fire remove event
			this.fireEvent('removestop', this, stop);
			
			this.updateMileage();
			
		}, this, {stop: stop});
		
		
		//Listen for a location change
		stop.location.on('select', function(field, records, options){
			if(!records.length){
				return false;
			}
			var record = records[0];
			
			//Update the title
			var name = record.get('location_name_1');
			if(name.length > 50){
				name = name.substr(0, 50) + '...';
			}
			stop.setTitle(Ext.String.format(
				'<span>{0} ({1})</span>',
				name,
				record.get('zip')
			));
			stop.baseTitle = stop.title;
			
			//Add the marker to the map
			this.addMarker(options.stop, record.get('lat'), record.get('lng'), record.get('location_name_1'));
			
			//Fire location change event
			this.fireEvent('locationchange', this, options.stop);
			
		}, this, {stop: stop});
		
		//Add the stop to the container panel
		this.stopPortal.add(stop);
		this.doLayout();
		
		//Fire the event
		this.fireEvent('addstop', this, stop);
		
		//Return the stop
		return stop;
	},
	
	removeStop: function(stop){
		stop.getEl().fadeOut({
			callback: Ext.bind(function(stop){
				this.stopPortal.remove(stop);
				stop.destroy();
			}, this, [stop])
		});
	},
	
	getStopPanels: function(){
		return this.stopPortal.items.items;
	},
	
	addMarker: function(stop, lat, lng, title) {
		if(this.map == null){
			this.mapPanel.on('afterrender', function(panel, options){
				this.addMarker(options.stop, options.lat, options.lng, options.title);
			}, this, {stop: stop, lat: lat, lng: lng, title: title});
			return;
		}
		
		//Remove old marker if it exists
		if(stop.marker != null){
			stop.marker.setVisible(false);
		}
		
		//Create the new marker
		stop.marker = new google.maps.Marker({
		  map: this.map,
		  position: new google.maps.LatLng(lat, lng),
		  title: title
		});
		stop.marker.setVisible(false);
		
		//Make sure the map shows all markers
		this.findMarkers();
	},
	
	findMarkers: function(){
		if(this.map == null){
			this.on('afterrender', function(){
				this.findMarkers();
			}, this);
			return;
		}
		var stops = this.getStopPanels();
		var latLngList = [];
		Ext.each(stops, function(stop){
			if(stop.marker != null){
				latLngList.push(stop.marker.getPosition());
			}
		}, this);
		
		if(!latLngList.length){
			return;
		}
		
		var bounds = new google.maps.LatLngBounds();
		for (var i = 0; i < latLngList.length; i++) {
		  bounds.extend(latLngList[i]);
		}
		
		this.map.fitBounds(bounds);
		
		//Set the route
		if(latLngList.length > 1){
			if(this.directionsDisplay == null){
				this.directionsDisplay = new google.maps.DirectionsRenderer();
				this.directionsService = new google.maps.DirectionsService();
			}
			this.directionsDisplay.setMap(null);
			this.directionsDisplay.setMap(this.map);
			
			var origin = latLngList.shift();
			var destination = latLngList.pop();
			var wayPoints = [];
			Ext.each(latLngList, function(latLng){
				wayPoints.push({
					location: latLng
				});
			}, this);
			var request = {
				origin: origin,
				destination: destination,
				waypoints: wayPoints,
				travelMode: google.maps.TravelMode.DRIVING
			};
			this.directionsService.route(request, Ext.bind(function(result, status) {
				if (status == google.maps.DirectionsStatus.OK) {
					this.directionsDisplay.setDirections(result);
				}
			}, this));
		}
	},
	
	bounceMarker: function(marker, bounce){
		if(bounce == null){
			bounce = true;
		}
		
		if(bounce){
			marker.setAnimation(google.maps.Animation.BOUNCE);
		}
		else{
			marker.setAnimation();
		}
	},
	
	goToStop: function(stop){
		//Check if rendered
		if(!stop.rendered){
			stop.on('afterrender', function(panel, options){
				this.goToStop(options.stop);
			}, this, {stop: stop});
			return;
		}
		
		//Scroll into view
		setTimeout(Ext.bind(function(){
			Ext.get(this.stopContainer.body).scrollTo('top', stop.getBox().y, {
				scope: stop,
				duration: 300,
				callback: function(){
					stop.down('field').focus(true, 50);
				}
			});
		}, this), 50);
	},
	
	setStopValues: function(stop, values){
		//Check if rendered
		if(!stop.rendered){
			stop.on('afterrender', function(stop, options){
				this.setStopValues(stop, options.values);
			}, this, {values: values});
			return;
		}
		
		//Add the marker
		if(values.location_id){
			this.addMarker(stop, values.lat, values.lng, values.location_name_1);
		}

		//Set the title
		var name = values.location_name_1;
		if(name.length){
			if(name.length > 50){
				name = name.substr(0, 50) + '...';
			}
			stop.setTitle(Ext.String.format(
				'<span>{0} ({1})</span>',
				name,
				values.zip
			));
			stop.baseTitle = stop.title;
		}
		
		//Set the actual stop values
		stop.setValues(values);
	},
	
	updateMileage: function() {
		clearTimeout(this.updateMileageTimeout);
		this.updateMileageTimeout = setTimeout(Ext.bind(function(){
			this.doUpdateMileage();
		}, this), 500);
	},
	
	doUpdateMileage: function(){
		
		this.setTitle(this.baseTitle + ' (Calculating mileage...)');
		
		var stops = this.getValues();
		if (stops.length < 2) {
			this.setTitle(this.baseTitle + ' - Add 2 or more stops to calculate mileage');
		}
		// Only send request if we have at least 5 characters in the zip of all of them
		for (var i = 0; i < stops.length; i++) {
			if (!stops[i].zip || stops[i].zip && stops[i].zip.length < 5) {
				// Need to display an error to complete all zips/locations
				
				this.setTitle(this.baseTitle + ' - Complete stop locations to update mileage');
				return false;
			}
		}
		
		Ext.Ajax.request({
			scope:this,
			method:'post',
			url:'/at-ajax/modules/mileage/process/calculate-miles',
			params:{
				stops:Ext.encode(stops)
			},
			success: function(r) {
				var response = Ext.decode(r.responseText);
				if (response.success) {
					// Check google miles
					var data = false;
					var icon = '';
					if (response.results.google.distance) {
						data = response.results.google;
						icon = '<span><img src="/resources/icons/google-16.png" /></span>';
					}
					if (data) {
						if (data.distanceDisplay) {
							this.setTitle(this.baseTitle + ' - ' + icon + ' - ' + data.distanceDisplay);
						}
						else {
							this.setTitle(this.baseTitle);
						}

						// Update stop panel titles
						var stopPanels = this.getStopPanels();
						stopPanels[0].setTitle(stopPanels[0].baseTitle);
						for (var i = 1; i < stopPanels.length; i++) {
							if (data.movements[i-1] && data.movements[i-1]['distanceDisplay']) {
								stopPanels[i].setTitle(stopPanels[i].baseTitle + ' - ' + icon + ' - ' + data.movements[i-1]['distanceDisplay']);
							}
						}
					}
				}
			}
		});
	},
	
	initListeners: function() {
		this.on('reorder', this.onReorder, this);
		this.on('reorder', function() {
			this.updateMileage();
		}, this);
	},
	
	onReorder: function(){
		var stops = this.getStopPanels();
		Ext.each(stops, function(stop, index){
			stop.setFieldPostfix(index);
		}, this);
	}
});