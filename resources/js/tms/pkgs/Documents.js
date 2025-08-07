Ext.define('TMS.documents.filter.Document', {
	extend: 'TMS.filter.Abstract',
	processingPage: '/at-ajax/modules/document/grid/',
	
	//Requires
	requires:[
		'Ext.ux.form.field.RealComboBox'
	],
	
	init: function(){
		this.initTaskTypes();
		this.initTaskOwners();
		this.initCreatedBy();
		this.initAssignedTo();
		this.initDueDateOn();
		this.initDueDateFrom();
		this.initDueDateTo();
	},
	
	initTaskTypes: function() {
		this.typeStore = Ext.create('Ext.data.Store', {
			fields: [
				'task_type_id',
				'task_name'
			],
			proxy: {
				type: 'ajax',
				url: this.processingPage + 'get-task-type-list',
				reader: {
					type: 'json',
					root: 'records'
				}
			}
		});
		this.typeStore.load();
		
		this.items.push({
			xtype:'realcombobox',
			queryMode:'local',
			name: 'status',
			displayField:'task_name',
			valueField:'task_type_id',
			fieldLabel: 'Task Type',
			store:this.typeStore
		});
	},
	
	initTaskOwners: function() {
		var data = {
			data:[{
				'value':'all',
				'display':'All'
			},{
				'value':'unclaimed',
				'display':'Unclaimed'
			},{
				'value':'me',
				'display':'Me'
			},{
				'value':'others',
				'display':'Others'
			}]
		};
		this.taskOwnerStore = Ext.create('Ext.data.Store', {
			autoLoad: true,
			fields:['value', 'display'],
			data:data,
			proxy: {
				type: 'memory',
				reader: {
					type: 'json',
					root: 'data'
				}
			}
		});
		this.items.push({
			xtype:'realcombobox',
			queryMode:'local',
			name: 'taskOwner',
			displayField:'display',
			valueField:'value',
			fieldLabel: 'Task Owners',
			store:this.taskOwnerStore
		});
	},
	
	initCreatedBy: function(){
		this.items.push({
			name: 'created_by',
			fieldLabel: 'Created By'
		});
	},
	
	initAssignedTo: function() {
		this.items.push({
			name: 'assigned_to',
			fieldLabel: 'Assigned To'
		});
	},
	
	initDueDateOn: function() {
		this.items.push({
			xtype:'datefield',
			name:'dueDateOn',
			fieldLabel:'Due Date On'
		});
	},
	
	initDueDateFrom: function() {
		this.items.push({
			xtype:'datefield',
			name:'dueDateFrom',
			fieldLabel:'Due Date From'
		});
	},
	
	initDueDateTo: function() {
		this.items.push({
			xtype:'datefield',
			name:'dueDateTo',
			fieldLabel:'Due Date To'
		});
	}
	
});
Ext.define('TMS.documents.forms.sections.DocumentsRequired', {
	extend:'TMS.form.Abstract',
	requires:[
		'Ext.ux.form.field.RealComboBox',
		'TMS.documents.forms.sections.DocumentsRequiredRow'
	],
	
	title:'Documents Required',
	baseTitle:'Documents Required',
	bodyStyle:{
		padding:'8px'
	},
	processingPage:'/at-ajax/modules/contact/process/',
	url:'/at-ajax/modules/contact/process/save-documents-required',
	contact_id:0,
	order_id:0,
	autoSave:false,
	readOnly: false,
	
	initComponent: function(){
		this.items = this.items || [];
		this.addEvents('dataload');
		this.init();
		this.callParent(arguments);
	},
	
	init: function() {
		this.initHidden();
		this.initListeners();
		this.initStore();
		
		if (this.contact_id) {
			this.loadContact(this.contact_id);
		}
		if (this.order_id) {
			this.loadData();
		}
	},
	
	initHidden: function() {
		this.contactIdField = Ext.create('Ext.form.field.Hidden', {
			name:'contact_id',
			value:this.contact_id
		});
		this.items.push(this.contactIdField);
		
		this.documentTypeIds = Ext.create('Ext.form.field.Hidden', {
			name:'document_type_ids'
		});
		this.items.push(this.documentTypeIds);
		
		this.documentTypeQuantities = Ext.create('Ext.form.field.Hidden', {
			name:'document_type_quantities'
		});
		this.items.push(this.documentTypeQuantities);
		
	},
	
	initListeners: function() {
		this.on('add', this.itemAdded, this, {buffer:500});
		this.on('remove', this.itemRemoved, this);
		this.on('beforesubmit', function(form){
			var rows = this.getRows();
			var numRows = rows.length;
			var types = [];
			var data = [];
			
			for (var i = 0; i < numRows; i++) {
				types.push(rows[i].typeSelector.getValue());
				data.push(rows[i].quantityField.getValue());
				
				rows[i].typeSelector.name = 'document_type_id_' + i;
				rows[i].quantityField.name =  'document_type_quantity_' + i;
			}
			
			this.documentTypeIds.setValue(Ext.encode(types));
			this.documentTypeQuantities.setValue(Ext.encode(data));
			this.contactIdField.setValue(this.contact_id);
		}, this);
	},
	
	initStore: function() {
		this.documentTypeStore = Ext.create('Ext.data.Store', {
			fields: [
				'document_type_id',
				'document_type_name'
			],
			proxy: {
				type: 'ajax',
				extraParams:{
					showAll:false
				},
				url: this.processingPage + 'get-document-types',
				reader: {
					type: 'json',
					root: 'records'
				}
			}
		});
		
		this.documentTypeStore.load();
	},
	
	selectFirst: function(combobox) {
		var record = combobox.store.getAt(0);
		if (record) {
			combobox.setValue(record.get('document_type_id'));
		}
		
	},
	
	getFirstUnusedIndex: function(combobox) {
		var indexToSelect = 0;
		
		// Loop through existing selections and store the currently used ids
		var existingIds = [];
		var items = this.getRows();
		for (var i = 0; i < items.length - 1; i++) {
			var subItem = items[i].items.items[0];
			var typeId = subItem.getValue();
			existingIds.push(typeId);
		}

		// Loop through records and find the first one that isnt in use
		var records = combobox.store.data.items;
		var numRecords = records.length;
		for (var i = 0; i < numRecords; i++) {
			if (existingIds.indexOf(records[i].data.document_type_id) == -1) {
				indexToSelect = i;
				break;
			}
		}
		
		return indexToSelect;
	},
	
	selectFirstUnused: function(combobox) {
		if (combobox && combobox.store) {
			var record = combobox.store.getAt(this.getFirstUnusedIndex(combobox));
			combobox.setValue(record.get('document_type_id'));
		}
	},
	
	createRow: function() {
		var rowPanel = Ext.create('TMS.documents.forms.sections.DocumentsRequiredRow', {
			store:this.documentTypeStore,
			readOnly: this.readOnly
		});
		rowPanel.quantityField.on('keyup', function(textfield) {
			if (textfield.getValue().length) {
				var fields = this.query('#document_type_quantity');
				var lastField = fields[fields.length-1];
				if (lastField.getValue().length) {
					// add another field
					var newRow = this.createRow();
					this.add(newRow);
					this.selectFirstUnused(newRow.typeSelector);
				}
			}
		}, this);
		
		rowPanel.quantityField.on('change', function(textfield) {
			if (!textfield.getValue().length) {
				var fields = this.query('#document_type_quantity');
				var lastField = fields[fields.length-1];
				if (textfield != lastField) {
					textfield.ownerCt.destroy();
				}
			}
			this.save();
		}, this, {buffer:500});
		
		return rowPanel;
	},
	
	loadData: function() {
		if (this.documentTypeStore.isLoading()) {
			this.documentTypeStore.on('load', function() {
				this.loadData();
			}, this);
			return;
		}
		
		if (this.order_id || this.contact_id) {
			this.setLoading(true);
			Ext.Ajax.request({
				scope:this,
				method:'post',
				url:this.processingPage + 'get-documents-required-data',
				params:{
					contact_id:this.contact_id,
					order_id:this.order_id
				},
				success: function(r) {
					this.setLoading(false);
					var response = Ext.decode(r.responseText);
					var records = response.records;

					// remove old rows - need to suspend events so this remove doesn't trigger for a previous contact
					this.suspendEvents();
					this.destroyRows();
					this.resumeEvents();

					// loop through all records and make a row for each
					for (var i = 0; i < records.length; i++) {
						var panel = this.createRow();
						panel.on('afterrender', function(panel, options) {
							var combobox = panel.typeSelector;
							var textfield = panel.quantityField;
							combobox.setValue(options.record.document_type_id);
							textfield.setRawValue(options.record.quantity);
						}, this, {
							record:records[i]
						});
						this.add(panel);
					}
					
					// add another field
					if(!this.readOnly){
						var newRow = this.createRow();
						this.add(newRow);
						this.selectFirst(newRow.typeSelector);
					}
					
					this.fireEvent('dataload', this);
				}
			});
		}
	},
	
	loadContact: function(contact_id, name) {
		this.contact_id = contact_id;
		var newTitle = this.title;
		if (name != null) {
			newTitle = this.baseTitle + ' for ' + name;
		}
		
		if (this.rendered) {
			this.setTitle(newTitle);
		}
		else {
			this.title = newTitle;
		}
		
		if (this.documentTypeStore.isLoading()) {
			this.documentTypeStore.on('load', function() {
				this.loadContact(this.contact_id);
			}, this);
		}
		else {
			if (this.contact_id) {
				this.loadData();
			}
			else {
				if(!this.readOnly){
					var newRow = this.createRow();
					this.add(newRow);
					this.selectFirst(newRow.typeSelector);
				}
			}
		}
	},
	
	destroyRows: function() {
		Ext.each(this.query('> .panel'), function(el){
			el.destroy();
		});
	},
	
	itemAdded: function(panel, item, options) {
		var rows = this.query('> .panel');
		this.manageRemoveButtons(rows);
	},
	
	
	itemRemoved: function(panel, item, options) {
		// Get all rows
		var rows = this.query('> .panel');
		if (rows.length) {
			this.manageRemoveButtons(rows);
			this.save();
		}
	},
	
	manageRemoveButtons: function(rows) {
		if (rows.length) {
			for (var i = 0; i < rows.length-1; i++) {
				rows[i].down('.button').enable();
			}
			rows[rows.length-1].down('.button').disable();
		}
	},
	
	getRows: function() {
		return this.query('> .panel');
	},
	
	save: function() {
		if (this.contact_id && this.autoSave) {
			this.submit();
		}
	}
	
});
Ext.define('TMS.documents.forms.sections.DocumentsRequiredRow', {
	extend:'Ext.panel.Panel',
	requires:['Ext.ux.form.field.RealComboBox'],
	
	autoHeight:true,
	layout:'hbox',
	border:false,
	defaults:{
		border:false
	},
	readOnly: false,
	
	initComponent: function() {
		this.items = this.items || [];
		this.init();
		this.callParent(arguments);
	},
	
	init: function() {
		this.initTypeSelector();
		this.initQuantityField();
		this.initButton();
		this.initListeners();
	},
	
	initTypeSelector: function() {
		var config = {};
		if(this.readOnly){
			Ext.apply(config, {
				readOnly: true
			});
		}
		
		this.typeSelector = Ext.create('Ext.ux.form.field.RealComboBox', Ext.apply({
			flex:1,
			valueField:'document_type_id',
			displayField:'document_type_name',
			store: this.store,
			queryMode: 'local',
			editable:false,
			margin:'2'
		}, config));
		this.items.push(this.typeSelector);
	},
	
	initQuantityField: function() {
		var config = {};
		if(this.readOnly){
			Ext.apply(config, {
				readOnly: true
			});
		}
		
		this.quantityField = Ext.create('Ext.form.field.Text', Ext.apply({
			flex:1,
			margin:'2',
			itemId:'document_type_quantity',
			enableKeyEvents:true,
			emptyText:'Quantity'
		}, config));
		this.items.push(this.quantityField);
	},
	
	initButton: function() {
		var config = {};
		if(this.readOnly){
			Ext.apply(config, {
				hidden: true
			});
		}
		this.button = Ext.create('Ext.button.Button', Ext.apply({
			margin:'2',
			icon:'/resources/icons/delete-16.png',
			width:24,
			scope:this,
			handler:function(button) {
				// remove if not the last one
				button.ownerCt.destroy();
			}
		}, config));
		this.items.push(this.button);
	},
	
	initListeners: function() {
		
	}
	
});
Ext.define('TMS.documents.forms.ScannerImport', {
	extend:'TMS.form.Abstract',
	url:'/at-ajax/modules/document/process/import-documents',
	
	initComponent: function() {
		this.items = this.items || [];
		this.init();
		this.callParent(arguments);
	},
	
	init: function() {
		this.initScannerStore();
		this.initScannerSelect();
		this.initButtons();
		this.initListeners();
	},
	
	initScannerStore: function() {
		this.scannerStore = Ext.create('Ext.data.Store', {
			fields: [
				'scannerName',
				'scannerDisplay'
			],
			proxy: {
				type: 'ajax',
				url: '/at-ajax/modules/document/process/get-scanner-list',
				reader: {
					type: 'json',
					root: 'records'
				}
			}
		});
		this.scannerStore.load();
	},
	
	initScannerSelect: function() {
		this.scannerSelector = Ext.create('Ext.form.field.ComboBox', {
			fieldLabel:'Scanner',
			name:'scannerName',
			store:this.scannerStore,
			
			triggerAction: 'all',
			queryMode:'local',
			valueField:'scannerName',
			displayField:'scannerDisplay',
			editable:false
		});
		this.items.push(this.scannerSelector);
	},
	
	initButtons: function() {
		this.buttons = [{
			scope:this,
			text:'Import 10',
			scale:'medium',
			icon:'/resources/icons/download-24.png',
			handler: function() {
				this.submitParams.limit = 10;
				this.submit();
			}
		},{
			scope:this,
			text:'Import 20',
			scale:'medium',
			icon:'/resources/icons/download-24.png',
			handler: function() {
				this.submitParams.limit = 20;
				this.submit();
			}
		},{
			scope:this,
			text:'Import All',
			scale:'medium',
			icon:'/resources/icons/download-24.png',
			handler: function() {
				this.submitParams.limit = -1;
				this.submit();
			}
		}]
	},
	
	initListeners: function() {
		this.on('beforesubmit', function() {
			this.setLoading();
		}, this);
		
		this.on('submit', function() {
			this.setLoading(false);
			
		}, this);
		
	}
	
});
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
