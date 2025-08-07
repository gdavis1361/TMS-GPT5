Ext.define('TMS.documents.view.Interface', {
	extend: 'Ext.panel.Panel',
	
	//requires
	requires:[
		'TMS.panel.plugin.FullScreen',
		'TMS.documents.view.Grid',
		'TMS.panel.plugin.FullScreen',
		'TMS.documents.view.Grid'
	],
	
	layout:'border',
	title: 'Documents',
	
	extraFilters:{},
	extraParams:{},
	lastRecordId:false,
	
	initComponent: function(){
		this.items = this.items || [];
		this.plugins = this.plugins || [];
		
		//Add Events
		this.addEvents(
			'maximize',
			'minimize'
		);
		
		this.init();
		this.callParent(arguments);
	},
	
	//Init Functions
	init: function() {
		this.initTools();
		this.initGrid();
		this.initDocumentPreview();
	},
	
	initTools: function() {
		this.tools = [{
			itemId:'plus',
			type: 'plus',
			scope:this,
			handler: function(){
				this.onMaximize();
			}
		}, {
			itemId:'minus',
			type: 'minus',
			scope:this,
			hidden: true,
			handler: function(){
				this.onMinimize();
			}
		}];
	
		this.fullScreenPlugin = Ext.create('TMS.panel.plugin.FullScreen');
		this.plugins.push(this.fullScreenPlugin);
	},
	
	initGrid: function() {
		this.gridPanel = Ext.create('TMS.documents.view.Grid', {
			region: 'center',
			border: false,
			filter: this.filterPanel,
			extraParams:this.extraParams
		});
		this.gridPanel.on('itemclick', function(grid, record) {
			if (record.data.document_id != this.lastRecordId) {
				this.lastRecordId = record.data.document_id;
				this.iframe.dom.src = record.data.downloadUrl;
			}
		}, this);
		
		this.items.push(this.gridPanel);
	},
	
	initDocumentPreview: function() {
		this.documentPreview = Ext.create('Ext.panel.Panel', {
			title:'Document Preview',
			region: 'east',
			width: 250,
			html:'<iframe></iframe>'
		});
		this.documentPreview.on('afterrender', function() {
			this.iframe = this.documentPreview.getEl().down('iframe');
			this.iframe.set({
				width:'100%',
				height:'100%',
				frameborder:0
			});
		}, this);
		
		this.items.push(this.documentPreview);
	},

	onMaximize: function(){
		this.query('#plus')[0].hide();
		this.query('#minus')[0].show();
		this.fullScreenPlugin.maximize(this);
		this.fireEvent('maximize', this);
	},
	
	onMinimize: function(){
		
		this.query('#minus')[0].hide();
		this.query('#plus')[0].show();
		this.fullScreenPlugin.minimize(this);
		this.fireEvent('minimize', this);
	}
	
});