Ext.define('TMS.customer.forms.sections.CustomerLocations', {
	extend:'Ext.panel.Panel',
	
	//Requires
	requires:[
		'Ext.ux.form.field.RealComboBox',
		'Ext.ux.form.field.BoxSelect',
		'TMS.location.forms.sections.Location'
	],
	
	//Config
	customer_id:0,
	layout: {
		type: 'hbox',
		align: 'stretch'
	},
	processingPage:'/at-ajax/modules/customer/process/',
	locationProcessingPage:'/at-ajax/modules/location/process/',
	
	initComponent: function(){
		this.items = this.items || [];
		this.dockedItems = this.dockedItems || [];
		this.init();
		this.callParent(arguments);
	},
	
	init: function() {
		this.initTopBar();
		this.initButtons();
		this.initLayoutPanels();
		this.initLocationStore();
		this.initLocationSelectorView();
		this.initLocationEditor();
	},
	
	initTopBar: function() {
		this.topToolbar = Ext.create('Ext.toolbar.Toolbar', {
			dock:'top'
		});
		this.dockedItems.push(this.topToolbar);
	},
	
	initButtons: function() {
		this.topToolbar.add({
			scope:this,
			text:'Add New Location',
			icon: '/resources/icons/add-16.png',
			handler:this.addNewLocation
		})
	},
	
	initLayoutPanels: function() {
		this.leftPanel = Ext.create('Ext.panel.Panel', {
			title:'Locations',
			width: 200,
			autoScroll: true
		});
		this.rightPanel = Ext.create('Ext.panel.Panel', {
			layout: 'fit',
			flex: 1,
			border:false
		});
		
		this.items.push(this.leftPanel, this.rightPanel);
	},
	
	initLocationStore: function() {
		this.locationStore = Ext.create('Ext.data.Store', {
			fields: [
				'location_id',
				'location_name_1',
				'location_name_2'
			],
			proxy: {
				type: 'ajax',
				url: this.processingPage + 'get-locations',
				extraParams:{
					customer_id:this.customer_id
				},
				reader: {
					type: 'json',
					root: 'records'
				}
			}
		});
		this.locationStore.on('load', this.selectFirst, this);
		this.locationStore.load();
	},
	
	initLocationSelectorView: function() {
		this.locationSelectorView = Ext.create('Ext.view.View', {
			title:'Locations',
			store:this.locationStore,
			tpl:[
				'<tpl for=".">',
					'<div class="carrier-contact-row">{location_name_1} {location_name_2}</div>',
				'</tpl>',
				'<div class="x-clear"></div>'
			],
			autoHeight:true,
			trackOver: true,
			overItemCls:'carrier-contact-row-hover',
			selectedItemCls:'carrier-contact-row-selected',
			itemSelector:'.carrier-contact-row',
			emptyText: 'No Locations',
			deferEmptyText:false,
			listeners: {
				scope:this,
				selectionchange: function(dv, nodes) {
					if (nodes.length) {
						this.selectRecord(nodes[0].index);
					}
				}
			}
		});
		this.leftPanel.add(this.locationSelectorView);
	},
	
	initLocationEditor: function() {
		this.locationEditor = Ext.create('TMS.location.forms.sections.Location', {
			title:'Location Information',
			bodyPadding:10,
			disabled:true,
			url:this.locationProcessingPage + 'process',
			buttons:[{
				scope:this,
				text:'Save',
				cls: 'submit',
				handler: function() {
					this.locationEditor.submit();
				}
			}]
		});
		
		this.locationEditor.on('success', function(form, action){
			var record = action.result.record;
			this.locationEditor.getForm().setValues(record);
			this.locationStore.un('load', this.selectFirst, this);
			this.locationStore.on('load', this.selectCurrent, this);
			this.locationStore.load();
		}, this);
		
		this.locationEditor.setValues({
			customer_id: this.customer_id
		});
		this.rightPanel.add(this.locationEditor);
	},
	
	selectFirst: function() {
		if (this.locationStore.count()) {
			this.leftPanel.doComponentLayout();
			this.locationSelectorView.suspendEvents();
			this.selectRecord(0);
			this.locationSelectorView.resumeEvents();
		}
	},
	
	selectCurrent: function() {
		var locationId = this.locationEditor.getForm().getValues()['location_id'];
		if (locationId) {
			var record = this.locationStore.findRecord('location_id', locationId);
			if (record) {
				this.leftPanel.doComponentLayout();
				this.locationSelectorView.suspendEvents();
				this.selectRecord(record.index);
				this.locationSelectorView.resumeEvents();
			}
			else {
				this.selectRecord(0);
			}
		}
	},
	
	selectRecord: function(index) {
		this.locationSelectorView.select(index);
		var record = this.locationStore.getAt(index);
		var location_id = record.data.location_id;
		var name = record.data.location_name_1;
		
		this.locationEditor.enable();
		this.locationEditor.loadLocation(location_id);
		this.locationEditor.setTitle('Location Information - ' + name);
		
	},
	
	addNewLocation: function() {
		// clear the form
		this.locationEditor.show();
		this.locationEditor.enable();
		this.locationEditor.setTitle('New Location');
		this.locationEditor.getForm().reset();
		this.locationEditor.setValues({
			customer_id: this.customer_id
		});
	},
	
	saveLocationData: function() {
		
	}
	
});