Ext.define('TMS.contacts.view.Interface', {
	extend: 'Ext.tab.Panel',
	requires:[
		'TMS.contacts.view.FilteredGrid',
		'TMS.contacts.forms.Update'
	],
	
	//Config
	layout:'border',
	height:500,
	deferredRender:true,
	
	openTabs:{},
	
	initComponent: function(){
		this.items = this.items || [];
		this.plugins = this.plugins || [];
		this.init();
		this.callParent(arguments);
	},
	
	init: function() {
		this.initFilteredGrid();
		this.initListeners();
	},
	
	initFilteredGrid: function() {
		this.filteredGrid = Ext.create('TMS.contacts.view.FilteredGrid');
		this.items.push(this.filteredGrid);
	},
	
	initListeners: function() {
		this.filteredGrid.grid.on('editrecord', function(grid) {
			var selectedRecords = grid.selModel.getSelection();
			var numRecords = selectedRecords.length;
			if (numRecords) {
				var tabToShow = false;
				for (var i = 0; i < numRecords; i++) {
					if (this.openTabs[selectedRecords[i].data.contact_id]) {
						if (!tabToShow) {
							tabToShow = this.openTabs[selectedRecords[i].data.contact_id];
						}
					}
					else {
						var p = Ext.create('Ext.panel.Panel', {
							closable:true,
							title:selectedRecords[i].data.contact_name,
							layout:'fit'
						});
						p.on('afterrender', function(panel, options) {
							panel.setLoading();
							setTimeout(function(){
								panel.setLoading(false);
								panel.add(Ext.create('TMS.contacts.forms.Update', {
									contact_id:options.contact_id
								}));
							}, 100);
							this.openTabs[options.contact_id] = panel;
						}, this, {
							contact_id:selectedRecords[i].data.contact_id
						});
						p.on('close', function(panel, options) {
							this.openTabs[options.contact_id] = false;
						}, this, {
							contact_id:selectedRecords[i].data.contact_id
						});
						this.add(p);
						if (!tabToShow) {
							tabToShow = p;
						}
					}
				}
				tabToShow.show();
			}
		}, this);
	}
});