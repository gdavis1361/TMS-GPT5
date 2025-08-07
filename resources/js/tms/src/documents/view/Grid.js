Ext.define('TMS.documents.view.Grid', {
	extend: 'Ext.grid.Panel',
	requires:[
		'TMS.documents.forms.ScannerImport',
		'TMS.ActionWindow',
		'TMS.IframeWindow'
	],
	
	//Config
	processingPage: '/at-ajax/modules/document/process/',
	viewConfig: {
		stripeRows: true
	},
	
	baseTitle:'Documents',
	
	extraParams:false,
	
//	verticalScrollerType: 'paginggridscroller',
//	loadMask: true,
//	disableSelection: true,
//	invalidateScrollerOnRefresh: false,
//	viewConfig: {
//		trackOver: false
//	},
	
	initComponent: function(){
		this.extraParams = this.extraParams || {};
		this.dockedItems = this.dockedItems || [];
		this.init();
		this.callParent(arguments);
	},
	
	//Init Functions
	init: function(){
		this.initPlugins();
		this.initTopBar();
		this.initDocumentTypeStore();
		this.initRelationTypeStore();
		this.initColumns();
		this.initStore();
		this.initUploader();
		if (this.extraParams !== false) {
			this.initImportButton();
		}
		this.initPager();
		this.initListeners();
	},
	
	setExtraParams: function(extraParams) {
		Ext.apply(this.extraParams, extraParams);
		this.store.proxy.extraParams.filter = Ext.encode(this.extraParams);
		this.initUploader();
	},
	
	initPlugins: function() {
		this.cellEditing = Ext.create('Ext.grid.plugin.CellEditing', {
			clicksToEdit: 1
		});
		this.plugins = [
			this.cellEditing
		];
	},
	
	initTopBar: function() {
		this.topBar = Ext.create('Ext.toolbar.Toolbar', {
			dock:'top'
		});
		this.dockedItems.push(this.topBar);
	},
	
	initDocumentTypeStore: function() {
		this.documentTypeStore = Ext.create('Ext.data.Store', {
			fields: [
				'document_type_id',
				'document_type_name'
			],
			proxy: {
				type: 'ajax',
				url: '/at-ajax/modules/contact/process/get-document-types',
				reader: {
					type: 'json',
					root: 'records'
				}
			}
		});
		
		this.documentTypeStore.load();
		
	},
	
	initRelationTypeStore: function() {
		this.relationTypeStore = Ext.create('Ext.data.Store', {
			fields: [
				'relation_table_name',
				'relation_table_display'
			],
			proxy: {
				type: 'ajax',
				url: '/at-ajax/modules/document/process/get-relation-types',
				reader: {
					type: 'json',
					root: 'records'
				}
			}
		});
		
		this.relationTypeStore.load();
	},
	
	initColumns: function(){
		this.columns = [{
			header: 'ID',
			dataIndex: 'document_id',
			hidden:true
		},{
			header: 'Document Type',
			dataIndex: 'document_type_name',
			sortable:false,
			field: {
				xtype: 'combobox',
				triggerAction: 'all',
				selectOnTab: true,
				queryMode:'local',
				store: this.documentTypeStore,
				valueField:'document_type_name',
				displayField:'document_type_name',
				editable:false
			}
		},{
			header: 'Description',
			dataIndex: 'description',
			sortable:false,
			flex:1,
			field: {
				type:'textarea'
			}
		},{
			header: 'File Type',
			dataIndex: 'file_type',
			sortable:false,
			hidden:true
		},{
			header:'Relation',
			width:90,
			dataIndex:'relation_table_display',
			sortable:false,
			field: {
				xtype: 'combobox',
				triggerAction: 'all',
				selectOnTab: true,
				queryMode:'local',
				store: this.relationTypeStore,
				valueField:'relation_table_display',
				displayField:'relation_table_display',
				editable:false,
				triggerAction:'all'
			}
		},{
			header:'Relation ID',
			width:60,
			dataIndex:'relation_table_key',
			sortable:false,
			field: {
				type:'textarea'
			}
		},{
			header: 'Created',
			dataIndex: 'created_at',
			renderer: function(value) {
				var dt = new Date(value*1000);
				return Ext.Date.format(dt, 'n/j/Y');
			}
		},{
			header: '',
			sortable:false,
			dataIndex: 'downloadUrl',
			width: 70,
			xtype:'templatecolumn',
			tpl:'<a href="{downloadUrl}">' +
		'<img src="/resources/icons/download-16.png" alt="Download" title="Download" />' +
		'</a>&nbsp;&nbsp;' + 
		'<a href="{downloadUrl}" class="preview-link">' +
		'<img src="/resources/icons/preview-16.png" alt="Preview" title="Preview" id="preview-{document_id}" />' +
		'</a>'
		}];
	},
	
	initStore: function(){
		this.store = new Ext.data.Store({
			fields: [
			'document_id',
			'file_type',
			'description',
			'document_type_name',
			'relation_table_display',
			'relation_table_name',
			'relation_table_key',
			'created_at',
			'downloadUrl'
			],
			
			pageSize:25,
//			buffered:true,
			
			remoteSort: true,
			proxy: {
				type: 'ajax',
				url : this.processingPage + 'get-grid-records',
				reader: {
					type: 'json',
					root: 'records',
					totalProperty: 'total'
				},
				extraParams:{
					filter:Ext.encode(this.extraParams)
				}
			}
		});
//		this.store.guaranteeRange(0, 14);
	},
	
	initPager: function(){
		this.pager = new Ext.toolbar.Paging({
			store: this.store,
			displayInfo: true,
			dock:'top'
		});
		this.dockedItems.push(this.pager);
//		this.tbar = this.pager;
	},
	
	initUploader: function() {
		if (this.uploader) {
			this.uploader.destroy();
		}
		var hasProperties = false;
		for (var i in this.extraParams) {
			hasProperties = true;
			break;
		}
		if (!hasProperties) {
			return false;
		}
		
		this.uploader = Ext.create('Ext.ux.Uploader', {
			url:this.processingPage + 'upload-file',
			autoUpload:true,
			useSmallDisplay:true,
			extraParams:this.extraParams,
			scale:'medium',
			icon:'/resources/icons/upload-24.png',
			border: false,
			config:{
				filters : [{
					title:"PDFs",
					extensions:"pdf"
				},{
					title:"TIFs",
					extensions:"tif"
				},{
					title:"Zip files",
					extensions:"zip"
				}]
			}
		});
		this.uploader.on('uploadcomplete', function() {
			this.store.load();
		}, this);
		
		this.topBar.add(this.uploader);
	},
	
	initImportButton: function() {
		this.importButton = Ext.create('Ext.button.Button', {
			text:'Import',
			scale:'medium',
			icon:'/resources/icons/download-24.png',
			scope:this,
			handler: function() {
				var importPanel = Ext.create('TMS.documents.forms.ScannerImport', {
					
				});
				
				this.actionWindow = Ext.create('TMS.ActionWindow', {
					title:'Import From Scanners',
					items:[
						importPanel
					]
				});
				importPanel.on('submit', function() {
					this.actionWindow.destroy();
				}, this);
			}
		})
		this.topBar.add(this.importButton);
	},
	
	initListeners: function(){
		this.cellEditing.on('edit', function(editor, e, options) {
			if (e.record.dirty) {
				Ext.Ajax.request({
					scope:this,
					method:'post',
					url:this.processingPage + 'update-record',
					params:{
						field:e.field,
						value:e.record.data[e.field],
						documentId:e.record.data.document_id
					},
					success: function(r) {
						var response = Ext.decode(r.responseText);
						e.record.commit();
					}
				});
			}
		}, this);
		
		if (this.collapsed) {
			this.on('expand', function() {
				if (!this.store.getTotalCount()) {
					this.store.load();
				}
			}, this);
		}
		else {
			this.store.load();
		}
		
		this.on('expand', function() {
			this.setHeight(null);
			this.pager.doLayout();
			this.scrollIntoView();
		}, this);
		
		this.on('itemclick', function(view, record, el, index, event, options) {
			if (event.getTarget('.preview-link')) {
				Ext.create('TMS.IframeWindow', {
					title:'Document Preview',
					url:record.data.downloadUrl,
					widthPercent: 0.9,
					heightPercent: 0.9
				});
			}
		}, this);
		
		this.on('afterrender', function() {
			this.store.on('load', function() {
				var links = this.getEl().select('.preview-link');
				var numLinks = links.elements.length;
				for (var i = 0; i < numLinks; i++) {
					Ext.get(links.elements[i]).on('click', function(e, el) {
						e.preventDefault();
						var parts = el.id.split('-');
						var documentId = parts[parts.length-1];

					}, this);
				}
			}, this);
		}, this);
		
		
		setInterval(Ext.bind(function() {
			//this.topBar.doLayout();
		}, this), 1000);
	}
	
});